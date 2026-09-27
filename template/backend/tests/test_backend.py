import pytest
from django.contrib.auth import get_user_model

from api.models import Item

EMBED = {"HTTP_X_EMBED": "1", "HTTP_ORIGIN": "https://cards.example"}
URL = "/api/items/"


@pytest.fixture
def person(db):
    return get_user_model().objects.create_user(username="a@example.com", email="a@example.com")


@pytest.fixture
def other(db):
    return get_user_model().objects.create_user(username="b@example.com", email="b@example.com")


def test_a_person_lists_and_adds_their_items(client, person, other):
    client.force_login(person)
    assert client.get(URL).json() == []
    assert client.post(URL, {"title": "Call back"}, content_type="application/json", **EMBED).status_code == 201
    assert [i["title"] for i in client.get(URL).json()] == ["Call back"]
    client.force_login(other)
    assert client.get(URL).json() == []


def test_signed_out_is_told_to_sign_in(client, db):
    assert client.get(URL).status_code == 401


def test_limit_gives_the_latest(client, person):
    client.force_login(person)
    for n in range(7):
        Item.objects.create(title=f"t{n}", created_by=person)
    assert [i["title"] for i in client.get(URL + "?limit=5").json()] == ["t6", "t5", "t4", "t3", "t2"]


def test_web_components_are_served(client, db):
    from django.contrib.staticfiles import finders

    assert finders.find("embed/kit.js") and finders.find("embed/check.js")
