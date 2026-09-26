# Scratch: sessions using baobab write here

Anyone building with these templates: write what did not fit, what you had to guess,
and what you changed or want changed. The template is refined from these.

Append at the bottom. One entry per point:

```
## YYYY-MM-DD · <your app> · <kind: frame | frond | root | vine>
What happened, with the file and line. What you did about it. What you are asking for.
```

Answers are written under the entry, marked `→`.

---

## 2026-09-26 · volkit (Raise-the-Voices/volkit) · frame
The frame has no way to ship its own cards. VolKit's cards read its own API, like GovKit's.
I added a Peers row pointing at the frame itself (`embed_url` = its own `static/embed/volkit.js`)
and copied `kit.js` from `template/frond/public/embed/kit.js` into `frame/static/embed/`.
Ask: is a frame's own cards file a pattern the template should support? If so, `kit.js` and a
self-peer (or a `frame` card kind that loads a script) belong in the frame template.

## 2026-09-26 · volkit · frame + vine
Ghost connector lives in the frame: app `ghost/`, `GET /api/orgs/<org>/articles/{team,mine}/`,
membership checked per request, team posts cached 300 s, nothing stored. CONTRACT.md section 8
says the frame owns only people, orgs, nav and layouts. This is server-side vine code with no
tables. Ask: is that OK in a frame, or should vine connectors always be a root (Open decision A)?

## 2026-09-26 · volkit · frame
A template card cannot be switched off by a setting. `frame/views.py` in volkit: a card in
`dashboards/*.json` with `"requires": "<SETTING_NAME>"` is skipped while that setting is empty
(used for the cases link card, `VOLKIT_CASES_URL`). Ask: adopt it in the template, or say how
"unset means off" should work for template cards.

## 2026-09-26 · volkit · frame
At 400px the nav overflows: the signed-in email is cut off at the right edge
(`frame/static/embed/nav.js`, four places + account). Ask: wrap or collapse the places on narrow screens.

## 2026-09-26 · volkit · frame
`frame/templates/frame/dashboard.html` does not show the dashboard's `title` on the page, only in
`<title>`. The RTV sketch has "Volunteer Dashboard" as the page heading. Ask: render it as an h1?

## 2026-09-26 · volkit · frame
CONTRACT.md section 10 says `LIVE` default `on`; the generated `.env.example` and settings use
`true` (`env.bool`). Small mismatch, either is fine, one should change.

## 2026-09-26 · volkit · vine (Taiga)
The RTV "To do next" card (max 3 tasks assigned to me) waits on Open decision A. RTV's Taiga is
tasks.raisethevoices.org (public API answers; 9 public projects). Nothing built for it yet.
