"""This backend's JSON, under /api/. Each view decides who may see what (CONTRACT.md section 5)."""

from django.conf import settings
from rest_framework import generics, serializers
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Item


def site(request):
    return {"site_name": settings.SITE_NAME}


class MeView(APIView):
    def get(self, request):
        u = request.user
        return Response({"name": u.get_full_name() or u.email, "email": u.email})


class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ["id", "title", "created_at"]


class ItemsView(generics.ListCreateAPIView):
    """The signed-in person's own items. Replace with this backend's own rule."""

    serializer_class = ItemSerializer

    def get_queryset(self):
        items = Item.objects.filter(created_by=self.request.user)
        limit = self.request.query_params.get("limit", "")
        return items[: min(int(limit), 100)] if limit.isdigit() and int(limit) > 0 else items

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
