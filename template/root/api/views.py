"""This root's JSON, under /api/. Every org-scoped route takes the org from the path
and checks it with the frame (CONTRACT.md section 5)."""

import logging

from asgiref.sync import sync_to_async
from django.conf import settings
from django.http import HttpResponse, StreamingHttpResponse
from rest_framework import generics, serializers
from rest_framework.response import Response
from rest_framework.views import APIView

from . import live
from .models import Item
from .security import IsOrgMember, member_role, orgs_for

log = logging.getLogger(__name__)


def site(request):
    return {"site_name": settings.SITE_NAME}


class MeView(APIView):
    def get(self, request):
        u = request.user
        return Response({"name": u.get_full_name() or u.email, "email": u.email, "orgs": orgs_for(u)})


class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ["id", "title", "created_at"]


class ItemsView(generics.ListCreateAPIView):
    serializer_class = ItemSerializer
    permission_classes = [IsOrgMember]

    def get_queryset(self):
        items = Item.objects.filter(org=self.kwargs["org"])
        limit = self.request.query_params.get("limit", "")
        return items[: min(int(limit), 100)] if limit.isdigit() and int(limit) > 0 else items

    def perform_create(self, serializer):
        item = serializer.save(org=self.kwargs["org"], created_by=self.request.user)
        live.publish(f"{item.org}/items", "created", item.id)


async def live_view(request):
    """GET /api/live/?topics=<org>/<thing>,... as server-sent events."""
    if not settings.LIVE:
        return HttpResponse(status=404)
    user = await request.auser()
    topics = [t for t in request.GET.get("topics", "").split(",") if "/" in t]
    if not user.is_authenticated or not topics:
        return HttpResponse(status=403)
    for org in {t.split("/", 1)[0] for t in topics}:
        if await sync_to_async(member_role)(user, org) is None:
            log.warning("live: user %s refused org %s", user.pk, org)
            return HttpResponse(status=403)
    response = StreamingHttpResponse(live.stream(set(topics)), content_type="text/event-stream")
    response["Cache-Control"] = "no-cache"
    response["X-Accel-Buffering"] = "no"
    return response
