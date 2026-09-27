# For agents

This is a backend. Read https://github.com/Cooperation-org/baobab/blob/main/AGENTS.md first.

Its web components are in `api/static/embed/` and read only this backend. Every view decides
who may see what from the signed-in person. It does not call other backends, and never
caches sensitive data.
