# baobab

Templates and rules for building on a single sign-on, in the project owner's words:

- "The top level thing is a single sign-on."
- "Different backends, including existing open source, making it easy to start a new project
  that either fits in an existing dashboard system or a new project that has its own
  dashboard and multiple components."
- "Web components that are tightly tied to their back end but are malleable in terms of what
  the user sees."
- "The configurable nav bar so that a human can have a single view into everything that they
  want to interact with that might include existing other systems."
- "An AI agent that has the context of all the different systems." That is amebo.
- "We're trying to help people work together better."

GovKit (`dash.workers.vc`) is the dashboard for workers.vc. It does not change to fit this repo.

Read [CONTRACT.md](CONTRACT.md). Agents: [AGENTS.md](AGENTS.md). Web components that exist:
[COMPONENTS.md](COMPONENTS.md), running at https://demos.linkedtrust.us/baobab/components/.

## Pick one

| You are building | Pick |
|---|---|
| A system with its own data and web components (tasks, planning, money) | **backend** |
| A dashboard and nav bar for a community outside workers.vc | **dashboard** |

```
uvx copier copy --trust gh:Cooperation-org/baobab my-app
```

An existing system (Odoo, Taiga, an app not made from these templates) joins by
[CONTRACT.md section 12](CONTRACT.md#12-bringing-an-existing-system-in).

## How they fit

```
                LinkedTrust sign-in
                        │
     ┌──────────────────┼───────────────────┐
     ▼                  ▼                   ▼
 dashboard app      backend A            existing system
 nav bar, layouts   + its web            (CRM, Taiga)
 arranges ─────────► components          + its web components
 components ──────────────────────────────►
                                   amebo: tools across all of them
```

A web component talks only to its own backend. Backends do not call each other; records
refer to each other by URL, and amebo does work across systems.

## Status

`scripts/check.sh` generates both templates and runs their tests; it passes. VolKit
(Raise-the-Voices/volkit) is made from the dashboard template.

Keeping the templates right: [MAINTAINING.md](MAINTAINING.md).
