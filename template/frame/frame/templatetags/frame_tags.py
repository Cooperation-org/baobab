from django import template
from django.utils.html import format_html

register = template.Library()


@register.simple_tag(takes_context=True)
def element_card(context, card, org):
    """A custom element card: the frame's own (data-up is this frame) or a peer's.
    The tag name was checked against a pattern in the view."""
    if card.get("own"):
        request = context["request"]
        up = f"{request.scheme}://{request.get_host()}"
        return format_html('<{0} data-up="{1}" data-org="{2}"></{0}>', card["tag"], up, org.slug)
    return format_html(
        '<{0} data-up="{1}" data-org="{2}" data-app="{3}"></{0}>',
        card["tag"], card["peer"].api_url, org.slug, card["peer"].app_url,
    )
