# For agents

This is a baobab root. Before changing anything, read, in order:
https://github.com/Cooperation-org/baobab/blob/main/PRINCIPLES.md,
https://github.com/Cooperation-org/baobab/blob/main/AGENTS.md,
https://github.com/Cooperation-org/baobab/blob/main/CONTRACT.md.

Every org-scoped view uses `IsOrgMember` (the org comes from the URL path and is checked
with the frame). Never store who is in which org here, and never cache sensitive data.
