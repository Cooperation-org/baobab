"""The checks between pieces (CONTRACT.md section 5)."""

import json
import logging
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


def _ask_frame(path, params):
    req = urllib.request.Request(
        f"{settings.FRAME_URL}/api/s2s/{path}/?{urllib.parse.urlencode(params)}",
        headers={"Authorization": f"Bearer {settings.S2S_TOKEN}"},
    )
    with urllib.request.urlopen(req, timeout=5) as r:
        return json.load(r)


def _sub(user):
    ident = Identity.objects.filter(user=user, issuer=settings.OIDC_ISSUER).first()
    return ident.sub if ident else None


def orgs_for(user):
    """The orgs the person is in, asked of the frame: [{slug, name, role}]."""
    sub = _sub(user)
    if sub is None:
        return []
    try:
        return _ask_frame("orgs", {"sub": sub}).get("orgs", [])
    except (OSError, ValueError) as e:
        log.warning("org list failed: %s", e)
        return []


def member_role(user, org):
    """The person's role in `org`, asked of the frame, or None. Cached briefly."""
    sub = _sub(user)
    if sub is None:
        return None
    key = f"member:{sub}:{org}"
    hit = cache.get(key)
    if hit is not None:
        return hit or None
    try:
        role = _ask_frame("membership", {"sub": sub, "org": org}).get("role")
    except (OSError, ValueError) as e:
        log.warning("membership check failed for org %s: %s", org, e)
        return None
    cache.set(key, role or "", settings.MEMBERSHIP_CACHE_SECONDS)
    return role


class IsOrgMember(BasePermission):
    """The org in the URL path, checked with the frame, every request."""

    def has_permission(self, request, view):
        org = view.kwargs.get("org", "")
        ok = request.user.is_authenticated and member_role(request.user, org) is not None
        if not ok and request.user.is_authenticated:
            log.warning("refused: user %s, org %s, %s %s", request.user.pk, org, request.method, request.path)
        return ok
