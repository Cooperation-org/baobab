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

→ 2026-09-26, answers to the volkit entries above (template changed in the same commit):
- Frame's own cards: supported. `static/embed/kit.js` now ships in the frame template, and a
  dashboard card `{"tag": "...", "script": "embed/<file>.js"}` mounts the frame's own element
  with `data-up` = the frame. No self-peer row needed.
- Connector code in a frame: OK when it adds no tables, checks membership per request, and
  caches for a stated time (CONTRACT.md Open decision A now says so). A root is for new data.
- `"requires": "<SETTING>"` on a dashboard card: adopted as written.
- Nav at 400px: the places now scroll sideways; the site name and the account stay visible.
- Dashboard `title` is now the page's h1.
- `LIVE`: CONTRACT.md now says `true`.
- Taiga "to do next": not built. The working pattern is GovKit's (`govkit/apps/tasksources/
  adapters.py`: server-side, Taiga application token, cached). "Assigned to me" needs the
  person matched to their Taiga user; ask the project owner before choosing how.

→ 2026-09-27, project owner: "my tasks" in Taiga matches the person to their Taiga user by
email, read with a Taiga application token (GovKit's way). Recorded in CONTRACT.md, Open decision A.

## 2026-09-27 · content planner · frond + root

**A root that is itself a vine client has no name in the contract.** The planner's root
holds credentials for Postiz and listmonk and calls them server-side. The contract has
frond→vine (the browser talks to the system, section 2 "Where a card reads from") and
root as "new data that no existing system holds". This is both: our data is the plan,
and delivery belongs to a system we run but do not own. Open decision A covers only the
token case for cards. Asking for: a sentence in section "The three kinds" saying a root
may hold a vine, and that the credentials live there, never in the browser.

**Open decision C invents an endpoint GovKit already has in another shape.** The
templates call `GET /api/s2s/membership/?sub=&org=`. GovKit answers the same question at
`GET /api/v1/accounts/s2s/identity/<provider>/<subject>/` (`govkit/apps/accounts/api.py:207`),
bearer `GOVKIT_S2S_TOKEN`, returning `memberships[]` with `org_slug` and `role`, and `404`
for a stranger, `pool: true` for someone in no org. Two shapes for one question. Doing:
writing the root's membership lookup as a named adapter with the URL in a setting, so
pointing it at a frame later is config. Asking for: pick one shape, or say in the contract
that roots carry an adapter and the frame's shape is only the default.

**Section 11 decided hosting before capacity did.** Cards send cookies, so the frame, the
fronds and their backends sit under one registrable domain. That ruled out placing this
app anywhere that does not answer on the frame's domain, before anyone looked at memory.
Asking for: say that in section 11 as a deployment constraint, not a footnote.

**Section 4 promises link shapes we do not own.** A card expands into the full app. When
the full app for one step is a third-party system we run (Postiz's own composer), its URL
shapes are not ours to keep stable. Doing: expand links point at our frond only. Asking
for: a line saying a piece lists only its own shapes.
