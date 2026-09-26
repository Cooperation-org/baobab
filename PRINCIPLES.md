# Principles

In the project owner's words (spoken, lightly transcribed):

1. "Be a good citizen of the world. Don't assume we're the center of the universe, but have
   a robust and clear architecture."

2. "We don't want to own the whole universe. We want to be a beautiful, malleable,
   integrated layer that talks to the universe, maybe over API connectors, and when
   possible uses single sign-on to connect things together without having to re-log in."

3. "We want to be friendly with the rest of the world": integrate with existing things
   like Taiga and Odoo rather than replace them.

4. "Be careful giving developers too many choices. It has to be super clear from the top.
   But we do want the choices."

5. Separation of concerns: a piece can stand alone. It does not have to live in one
   dashboard; it can live in another and look different there.

6. "Configurable things with conventions, so they're simple to install but they are
   configurable."

7. Quick. Cards are interactive and fast.

## What that means in the design

- Standards only between pieces: OIDC, HTTP + JSON, CORS, custom elements, server-sent
  events. No private glue that only our apps speak.
- The sign-in provider is configuration. LinkedTrust is the default; any OIDC provider works.
- Existing systems stay the record for their data. We connect to them (vine); we do not
  copy them.
- Every choice has a default. The first question is the only one you must answer.

For anything a person looks at: [UX principles](https://github.com/Cooperation-org/govkit/blob/main/UX_PRINCIPLES.md).
