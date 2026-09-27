from django.contrib import admin

from .models import Identity, Item

admin.site.register(Identity)


@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = ("title", "created_by", "created_at")
