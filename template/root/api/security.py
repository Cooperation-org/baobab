"""The checks between pieces (CONTRACT.md section 5)."""

import json
import logging
import urllib.error
import urllib.parse
import urllib.request

from django.conf import settings
from django.core.cache import cache
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import BasePermission

from .models import Identity

log = logging.getLogger(__name__)


class EmbedSessionAuthentication(SessionAuthentication):
    """Session auth that also accepts writes from cards and fronds on other origins.
    They send `X-Baobab: 1`, which browsers send cross-origin only after a CORS
    preflight that only EMBED_ORIGINS pass."""

    def authenticate_header(self, request):
        # Signed out answers 401 (not 403), so a frond knows to send the person to sign in.
        return 'Session realm="api"'

    def enforce_csrf(self, request):
        if request.headers.get("X-Baobab") == "1":
            return
        return super().enforce_csrf(request)


def _sub(user):
    ident = Identity.objects.filter(user=user, issuer=settings.OIDC_ISSUER).first()
    return ident.sub if ident else None


def memberships(user):
    """The person's orgs and roles, asked of the frame, cached briefly:
    [{org_slug, org_name, role}]. The frame answers like GovKit does
    (`/api/v1/accounts/s2s/identity/<provider>/<subject>/`), so FRAME_URL may be either."""
    sub = _sub(user)
    if sub is None:
        return []
    key = f"memberships:{sub}"
    hit = cache.get(key)
    if hit is not None:
        return hit
    req = urllib.request.Request(
        f"{settings.FRAME_URL}/api/v1/accounts/s2s/identity/linkedtrust/{urllib.parse.quote(sub, safe='')}/",
        headers={"Authorization": f"Bearer {settings.S2S_TOKEN}"},
    )
    try:
        with urllib.request.urlopen(req, timeout=5) as r:
            found = json.load(r).get("memberships", [])
    except urllib.error.HTTPError as e:
        if e.code != 404:
            log.warning("membership check failed: %s", e)
            return []
        found = []
    except (OSError, ValueError) as e:
        log.warning("membership check failed: %s", e)
        return []
    cache.set(key, found, settings.MEMBERSHIP_CACHE_SECONDS)
    return found


def orgs_for(user):
    return [{"slug": m["org_slug"], "name": m.get("org_name", m["org_slug"]), "role": m.get("role")}
            for m in memberships(user)]


def member_role(user, org):
    """The person's role in `org`, or None."""
    for m in memberships(user):
        if m.get("org_slug") == org:
            return m.get("role") or "member"
    return None


class IsOrgMember(BasePermission):
    """The org in the URL path, checked with the frame, every request."""

    def has_permission(self, request, view):
        org = view.kwargs.get("org", "")
        ok = request.user.is_authenticated and member_role(request.user, org) is not None
        if not ok and request.user.is_authenticated:
            log.warning("refused: user %s, org %s, %s %s", request.user.pk, org, request.method, request.path)
        return ok
