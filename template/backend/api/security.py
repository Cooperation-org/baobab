"""The checks between pieces (CONTRACT.md section 5)."""

import logging

from django.conf import settings
from rest_framework.authentication import SessionAuthentication
from rest_framework.exceptions import PermissionDenied

log = logging.getLogger(__name__)


class EmbedSessionAuthentication(SessionAuthentication):
    """Session auth that also accepts writes from this backend's web components on other origins.
    They send `X-Embed: 1`, which browsers send cross-origin only after a CORS
    preflight that only EMBED_ORIGINS pass."""

    def authenticate_header(self, request):
        # Signed out answers 401 (not 403), so a web component knows the person is not signed in.
        return 'Session realm="api"'

    def enforce_csrf(self, request):
        if request.headers.get("X-Embed") == "1":
            sent = request.headers.get("Origin", "")
            if sent in settings.EMBED_ORIGINS or sent == f"{request.scheme}://{request.get_host()}":
                return
            logging.getLogger(__name__).warning("refused: write from origin %r, %s %s", sent, request.method, request.path)
            raise PermissionDenied("origin not allowed")
        return super().enforce_csrf(request)
