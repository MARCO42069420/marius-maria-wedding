---
name: wedding-workflows-index
description: Map of Content — project-specific workflows for the marius-maria.com wedding site. SOPs for every multi-step task on this project.
tags: [index, moc, wedding]
---

# Wedding Project Workflows — Map of Content

SOPs for multi-step tasks on the **Marius & Maria** wedding site. Read the relevant workflow before executing any task with more than 2 steps.

---

## Active Workflows

| Workflow | When to use |
|---|---|
| [[add-photo-gallery]] | Deploying/redeploying the guest photo-upload Apps Script, or changing the reveal time |

---

## How to Add a Workflow

When a task has a clear repeatable sequence:

1. Create `workflows/<task-name>.md` with:
   - **Objective** — what this workflow achieves
   - **Inputs required** — what the agent needs before starting
   - **Steps** — numbered, each referencing a tool or decision
   - **Expected output** — what done looks like
   - **Edge cases** — known failure modes and how to handle them
2. Add a one-line entry to this README
3. Cross-link to relevant skills and tools

---

## Candidates for Future Workflows

| Workflow | Trigger |
|---|---|
| `add-section.md` | Adding a new section to index.html — checklist for bilingual, responsive, reveal |
| `deploy-change.md` | Verifying and pushing a change to GitHub Pages |
| `read-rsvp-responses.md` | Pulling RSVP data from Google Sheets to produce a headcount report |
| `update-content.md` | Updating venue details, times, or recommendations in the live site |
| `post-wedding-transition.md` | What to do after 30 July — disable RSVP, thank-you message |

---

## Links

- [[AGENT.md]] — agent rules, current state, and pending features
- [[knowledge-base/wedding_spec.md]] — all wedding facts, source of truth
- [[skills/README.md]] — project-specific skills
- [[C:\New life\skills\README.md]] — shared skills
