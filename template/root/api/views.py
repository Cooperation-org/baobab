"""This root's JSON, under /api/. Every org-scoped route takes the org from the path
and checks it with the frame (CONTRACT.md section 5)."""

import logging

from django.conf import settings
from rest_framework import generics, serializers
from rest_framework.response import Response
from rest_framework.views import APIView

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
        serializer.save(org=self.kwargs["org"], created_by=self.request.user)

