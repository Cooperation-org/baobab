# baobab

Templates for apps that compose into one dashboard, and work on their own.

**Read first: [PRINCIPLES.md](PRINCIPLES.md).** Agents: [AGENTS.md](AGENTS.md). Components that exist: [COMPONENTS.md](COMPONENTS.md). Problems and asks: [SCRATCH.md](SCRATCH.md). Keeping it right: [MAINTAINING.md](MAINTAINING.md).

Status: first version, 2026-09-26. Templates render, build and pass their tests; see "What is not done yet" in CONTRACT.md.

## Pick one

| You are building | Pick | You get |
|---|---|---|
| The place people land: sign-in, their orgs, the nav, the dashboard | **baobab** (frame) | Django app |
| A front end for one job (tasks, CRM, planning) that also gives the dashboard cards | **frond** | React app + a cards file |
| The backend a frond needs, when no existing system has the data | **root** | Django API |

A frond on a system that already exists (Taiga, Odoo, anything with OIDC and an API) needs
no new backend: pick **frond** and answer "existing system". That connection is a **vine**.
Its cards can read the system straight from the page only if the system accepts the
browser's session from the dashboard's site (Odoo on the same domain does). If it takes only
a token (Taiga), the cards read it through a small connector on the server, in the frame or
a root (CONTRACT.md section 2, "Where a card reads from").

**An app that already exists and has its own pages** (Chiku, Elm, a Django app with its own
users) is not generated. It joins by the steps in
[CONTRACT.md section 12](CONTRACT.md#12-bringing-an-existing-app-in).

```
uvx copier copy --trust gh:Cooperation-org/baobab my-app
```

The first question is which of the three. Everything after that has a default.

## How they fit

```
                 LinkedTrust (or any OIDC provider)
                          │  one sign-in
      ┌───────────────────┼───────────────────────┐
      │                   │                       │
 ┌────▼─────┐        ┌────▼─────┐           ┌─────▼──────┐
 │ baobab   │ mounts │ frond    │  reads    │ root       │  a new Django API
 │ (frame)  ├───────►│ cards    ├──────────►│   or       │
 │ nav,grid,│ links  │ frond app│  or       │ vine ──────┼─► Taiga, Odoo, ...
 │ layouts  ├───────►│          ├──────────►│            │  an existing system
 └──────────┘        └──────────┘           └────────────┘
```

Nothing points back up. A frond does not know which frame shows it. A root or an existing
system does not know which frond reads it.

The rules both sides follow: [CONTRACT.md](CONTRACT.md).

## Where this came from

The workers.vc composition: GovKit, Chiku (Taiga), Elm (Odoo), amebo and the workers.vc
shell. Its current contract is `govkit/docs/COMPOSITION.md`. baobab replaces that document
once the templates exist.
