"""This backend's data. `Item` is the example: replace it with what this backend owns.
Who may see what is decided here, on this backend's own data."""

from django.conf import settings
from django.db import models


class Identity(models.Model):
    """The sign-in provider's stable id for a person (the OIDC `sub`)."""

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="identities")
    issuer = models.URLField()
    sub = models.CharField(max_length=255)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["issuer", "sub"], name="uniq_identity")]


class Item(models.Model):
    title = models.CharField(max_length=300)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
