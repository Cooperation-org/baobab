# Principles

## Above everything

1. **User intention is king.** Do what the person meant.
2. **User experience is king.** Judge every change by what the person experiences first.
3. **An architecture with clear boundaries and separation of concerns, that is malleable
   and extensible.**

## The architecture elements that keep those safe

| Element | Keeps safe |
|---|---|
| **One home per fact.** The dashboard app owns people, orgs, the nav and layouts. A backend or an existing system owns its data. A frontend owns only its screens. | boundaries |
| **Nothing points up.** A frontend does not know which dashboard shows it; a backend does not know which frontend reads it. | separation, extensible |
| **Standards between pieces, not shared code.** OIDC, HTTP + JSON, CORS, custom elements, server-sent events. | extensible, a good citizen |
| **Existing systems stay the record.** We connect; we do not copy or replace. | a good citizen, boundaries |
| **Every cross-piece address is a setting. Unset means off, never broken.** | malleable |
| **One sign-in.** Moving between pieces never asks the person to log in again. | experience |
| **One account per person.** A sign-in joins the existing account with the same email. Ease for existing users comes first. | experience |
| **A card with nothing to show hides.** No placeholders, no errors on someone else's page. | experience |
| **A person's layout is theirs.** What they arrange stays arranged. | intention |
| **Published links never change.** | experience, boundaries |
| **One question at the top; everything else has a default.** | experience, for developers |

## In the project owner's words (spoken, lightly transcribed)

- "Be a good citizen of the world. Don't assume we're the center of the universe, but have
  a robust and clear architecture."
- "We don't want to own the whole universe. We want to be a beautiful, malleable,
  integrated layer that talks to the universe, maybe over API connectors, and when
  possible uses single sign-on to connect things together without having to re-log in."
- "Be careful giving developers too many choices. It has to be super clear from the top.
  But we do want the choices."
- "Configurable things with conventions, so they're simple to install but they are
  configurable."
- "Absolutely do email matching, things need to be easy and keep single user account.
  Convenience and ease for existing users is the number one most important thing."

For anything a person looks at: [UX principles](https://github.com/Cooperation-org/govkit/blob/main/UX_PRINCIPLES.md).
