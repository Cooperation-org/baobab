from unittest.mock import patch

import pytest
from django.contrib.auth import get_user_model

from api.models import Identity, Item

EMBED = {"HTTP_X_BAOBAB": "1"}
URL = "/api/orgs/acme/items/"


@pytest.fixture
def person(db):
    u = get_user_model().objects.create_user(username="a@example.com", email="a@example.com")
    Identity.objects.create(user=u, issuer="https://live.linkedtrust.us", sub="42")
    return u


def test_members_list_and_add_items(client, person):
    client.force_login(person)
    with patch("api.security.member_role", return_value="member"):
        assert client.get(URL).json() == []
        r = client.post(URL, {"title": "Call back"}, content_type="application/json", **EMBED)
        assert r.status_code == 201
        assert [i["title"] for i in client.get(URL).json()] == ["Call back"]
    assert Item.objects.get().org == "acme"


def test_non_members_are_refused(client, person):
    client.force_login(person)
    with patch("api.security.member_role", return_value=None):
        assert client.get(URL).status_code == 403


def test_signed_out_is_refused(client, db):
    assert client.get(URL).status_code == 403


def test_membership_is_asked_of_the_frame(person):
    from api.security import member_role

    class Answer:
        def __enter__(self):
            return self

        def __exit__(self, *a):
            return False

        def read(self):
            return b'{"member": true, "role": "admin"}'

    with patch("urllib.request.urlopen", return_value=Answer()) as call:
        assert member_role(person, "acme") == "admin"
        assert member_role(person, "acme") == "admin"
    req = call.call_args[0][0]
    assert req.full_url == "https://frame.example/api/s2s/membership/?sub=42&org=acme"
    assert req.headers["Authorization"] == "Bearer t0k"
    assert call.call_count == 1
