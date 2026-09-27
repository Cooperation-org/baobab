# Scratch: sessions using baobab write here

Anyone building with these templates: write what did not fit, what you had to guess,
and what you changed or want changed. The template is refined from these.

Append at the bottom. One entry per point:

```
## YYYY-MM-DD · <your app> · <kind: frame | frond | root | vine>
What happened, with the file and line. What you did about it. What should change in the architecture.
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
  adapters.py`: server-side, Taiga application token, cached).

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

→ Open decision A, answered by the project owner 2026-09-27: **as the signed-in person.**
A root holding a vine exchanges the person's login for the system's own token; it never
acts as a shared service account. Two things that follow, from the systems we are using:
Postiz takes a generic OIDC provider (`POSTIZ_GENERIC_OAUTH` and the `POSTIZ_OAUTH_*`
settings) and issues per-person OAuth2 tokens to third-party apps, so this holds for it
without an exception. listmonk authenticates with one admin API user and cannot; it is
reached only as a channel inside Postiz, which holds that credential itself, so the
boundary stays clean and no exception is needed.

→ 2026-09-27, answers to the content planner's four notes (contract and templates changed in
the same commit):
- A root may hold a vine: now in CONTRACT.md "The three kinds"; credentials in the root,
  never the browser, acting as the signed-in person.
- Two shapes for one question: the templates now use GovKit's
  `/api/v1/accounts/s2s/identity/<provider>/<subject>/` and its answer, so a root's
  `FRAME_URL` can point at GovKit today. Your named adapter with the URL in a setting fits.
- Section 11 is now stated as a deployment constraint.
- Section 4 now says a piece lists only its own shapes; expand links go to our own frond.
→ 2026-09-27: the conflict is settled: act as the person where the system gives per-person
  tokens (Postiz does); where it does not (Taiga), the application token stays and the
  connector checks the person's rights itself. CONTRACT.md Open decision A says so.

## 2026-09-27 · volkit · frame: critical pass after one real build
Thanks for answering all seven; VolKit will move to the frame's own `script` cards and drop
its self-peer. What worked, keep it: the generator and tests ran first time; hide-on-empty,
CSP from peers and the `X-Baobab` write check needed no changes; the same-site rule settled
early that RTV is its own frame, not an org in workers.vc. Four problems from building it:

**1. Membership makes a third roster.** The frame owns orgs and members, but RTV's volunteer
list already lives in two systems: the cases app (group `Volunteer`, `PreApprovedEmail`,
`testimonies-world backend/cases/adapters.py`) and Taiga project memberships. Nothing in the
contract says how a person becomes a frame member except an admin adding them by hand. A new
volunteer who signs in lands on an empty page. This goes against "existing systems stay the
record". Ask: say where membership comes from. Either a vine (e.g. "members of Taiga project
X are members of org Y"), an invite link, or Open decision C's `trust` claim, and which one
is the default.

**2. The vine sign-in rule fits none of RTV's three systems.** CONTRACT.md section 1 says a
vine signs in through the system's own OIDC. Ghost staff login has no OIDC; the cases app is
Google via allauth; Taiga needs the application token (decision A's exception). So for RTV
the exception is the only path. Ghost's Admin API key is site-wide, so "My articles" is a
shared service credential filtered by email in our code, which decision A says never to do.
Ask: write the service-credential path as a first-class rule set, not an exception: the
narrowest credential the system offers, person matched by verified email, the connector
filters to the person and logs refusals, read-only unless the owner says otherwise.

**3. Email as the join key fails silently.** Taiga and Ghost users are matched by email. A
volunteer whose Taiga or Ghost email differs from their LinkedTrust email gets a card that
hides, which looks the same as "nothing to do". Section 13 helps a developer, not the
volunteer. Ask: one home for "this person is user N in system S" (the frame's `identities`
table, or abra per amebo `docs/BOUNDARIES.md`), and a page for the person listing which
systems are linked, so a mismatch is visible to them.

**4. No deploy recipe, and live updates are easy to break.** Each app writes its own. VolKit's
is `deploy/ansible/` (systemd with gunicorn plus uvicorn workers, nginx with
`proxy_buffering off` and a long `proxy_read_timeout` on `/api/live/`). Without those two
nginx lines SSE stalls behind the proxy with no error. Ask: a `deploy/` in the frame and
root templates with at least the nginx `location /api/live/` block, or the lines in the
README.

Small: to see a dashboard locally with no OIDC client I signed in at `/admin/` as a
superuser, then opened `/o/<org>/`. Worth a line in the frame README.

→ 2026-09-27: VolKit updated to baobab `ab4b138` with `copier update` (volkit `d78696b`); its own
  `dashboards/home.json` kept, its tests pass. Project owner: login buttons default LinkedTrust,
  configurable (Open decision B); signing out of LinkedTrust not required.

→ 2026-09-27, answers to the volkit critical pass:
- 4, deploy: the frame and root READMEs now carry the nginx `location /api/live/` block
  (`proxy_buffering off`, `proxy_read_timeout 1h`). A full `deploy/` in the templates is not added.
- Small: the frame README now says how to see a dashboard locally via `/admin/` and a membership.

## 2026-09-27 · projectkit (money on projects, designed not built) · vine
A frond on Odoo is the shape `copier.yml:29-33` offers and `CONTRACT.md` §2 names, but the
generated code stops at the door: `template/frond/src/api.ts.jinja:11-13` makes `signIn()`
throw for `backend == "vine"`, so the one thing a vine must do on a 401 is the one thing the
template leaves as a placeholder. Odoo's answer is concrete and the same for every Odoo
install: send the person to `/web/login?redirect=<current>` on the vine's own host, which
then runs whatever OIDC that Odoo has (on `crm.linkedtrust.us`, `auth_oauth` with a
LinkedTrust provider row, already installed). I wrote the redirect into the projectkit design
rather than the template. Ask: ship a documented vine sign-in for a system that logs in with
a session cookie — either that redirect as the default, or a `VITE_SIGNIN_URL` setting with
the redirect as its convention — so every vine after this one does not re-invent it.

## 2026-09-27 · projectkit · vine
Nothing says where a vine's cards come from. `CONTRACT.md` §2 (:49-102) has cards shipped by a frond
at `embed/<slug>.js` with `kit.js` copied in by the generator, and `COMPONENTS.md:63,72`
describes an Odoo addon serving a card over Odoo's own session cookie — so the working
precedent puts the cards inside the existing system, where the session already is, not in the
frond's `public/`. For projectkit the cards have to be served by the Odoo addon for the same
reason: that host is where the cookie is. Ask: say which of the two is the supported shape for
a vine, and if it is "the vine serves the cards", say where `kit.js` comes from when there is
no frond build to copy it in.

## 2026-09-27 · projectkit · vine
`CONTRACT.md` §11 (:205-210), same site, is a hard constraint on a vine and it is invisible at
generation time. The frond, its cards and the vine must share one registrable domain or the
session does not carry, and no CORS setting fixes it: a projectkit frond has to sit on
`*.linkedtrust.us` next to `crm.linkedtrust.us`, and on `*.workers.vc` next to
`crm-<slug>.workers.vc`. I put it in the projectkit design as a deployment constraint. Ask:
have `copier` print it after generating a frond with `backend=vine`, and put it in the
generated README's Links section, so the hostname decision is made before the app is built
rather than after it does not work.

## 2026-09-27 · projectkit · vine
Second case for the open ask already sitting in this file ("one home for 'person is user N in
system S'"). Money from Slack cannot be controlled without it: amebo passes
`author_info=f"slack:{user_id}"` (`amebo/backend/src/slack_commands.py:385`) and that string
is only prepended to the message text (`conversation_manager.py:180,195`); `Principal` is
built for `transport="cli"` and `transport="web"` only, so `trust_gate` never runs on the
Slack path (`amebo/backend/src/tools/registry.py:229-231`). The only identity map that exists
is keyed by amebo login email (`viewer_identity.py`). Not asking baobab to hold it — abra is
where `amebo/docs/BOUNDARIES.md:15` puts it — though it holds no typed binding for it today:
`taiga:username/<name>` is prose in notes and one docstring
(`amebo/backend/src/services/viewer_identity.py:10`), and Ask: when the standing question is answered, state the answer as a contract line that
a root or a vine connector can rely on, because "who is acting" is now blocking a second app,
not one.
