# Work Order Execution Checklist: WO-__WORK_ORDER_NUMBER__

**Work Order Number:** WO-__WORK_ORDER_NUMBER__
**Work Order Title:** __WORK_ORDER_TITLE__
**Initialized At (UTC):** __INITIALIZED_AT__

## Linked Documents
- Requirements docs reviewed:
  - [ ] `read_requirement` completed for all linked requirements
  - Notes:
- Blueprint docs reviewed:
  - [ ] `read_blueprint` completed for all linked blueprints
  - [ ] All `@BlueprintName` mentions followed and referenced blueprints read
  - Notes:

## Phase 1: Start / Context Gathering

### Required Steps
- [ ] Review work order description provided by MCP tool output
- [ ] Identify linked requirements and blueprints
- [ ] Follow all `@BlueprintName` mentions to read referenced Component Blueprints
- [ ] Extract acceptance criteria from requirements
- [ ] Identify architecture path from blueprints (components, contracts, composition)
- [ ] `context.md` is filled in with work order metadata, a 1-2 sentence user request summary, and requirement/blueprint document ID + title
- [ ] Ask user clarifying questions for ambiguous scope

- [ ] **Certification: Phase 1 complete — all items above are done. Proceeding to Phase 2.**

## Phase 2: Planning & Implementation

### Implementation Plan
- [ ] Implementation plan written to `implementation-plan.md` in this directory (see `.cursor/skills/software-factory/writing-implementation-plans.md`)
- [ ] Plan reviewed with user (if scope warrants it)

### Implementation
- [ ] Implement only in-scope changes
- [ ] Run `code-simplifier` subagent on changed files
- [ ] Record key implementation decisions below as they are made

### Notes
- Files changed:
- Implementation decisions:

- [ ] **Certification: Phase 2 complete — all items above are done. Proceeding to Phase 3.**

## Phase 3: Verification

Use the `review` skill (`.cursor/skills/review/SKILL.md`) to run all three review dimensions. Results should be written to the review log (`review-log.md` in this directory).

### Quality Gates
- [ ] **Linting & type checking** — run via the review skill's linting-and-type-checking.md guide
- [ ] **Blueprint alignment** — run via the review skill's blueprint-alignment.md guide
- [ ] **Architecture & conventions** — run via the review skill's architecture-and-conventions.md guide
- [ ] No NEW linting/type errors introduced (pre-existing errors are acceptable)
- [ ] Review log round written to `review-log.md` with verdict (REVIEW AGENT APPROVED ✅ or REVIEW AGENT REQUESTED CHANGES ❌)

### Testing
Execute the test plan using the `testing` agent skill. Use non-LLM tests only. If failures are unrelated main-branch regressions, document them and do not fix unrelated tests.
- [ ] Backend unit tests run/passing
- [ ] Backend integration tests run/passing
- [ ] Frontend unit tests run/passing
- [ ] E2E tests run/passing

### Requirements and Blueprint Validation
- [ ] All acceptance criteria from the work order and linked requirements are satisfied
- [ ] Architecture is aligned with linked blueprints
- [ ] Any drift is documented and reviewed with user

### Test Results Summary
- Unit:
- Integration:
- E2E:
- Other:

- [ ] **Certification: Phase 3 complete — all items above are done. Proceeding to Phase 4.**

## Phase 4: Delivery Readiness

### Required Steps
- [ ] All intended changes are committed
- [ ] Pull request exists
- [ ] PR title/body mentions work order number and work order name
- [ ] PR includes concise summary + verification notes
- [ ] `context.md` is updated with the pull request URL

### PR Info
- PR URL:
- PR title:

- [ ] **Certification: Phase 4 complete — all items above are done. Proceeding to Final Completion.**

## Final Completion Check

- [ ] All phase certifications above are complete
- [ ] Checklist is fully filled out with evidence
- [ ] Review log is complete (`review-log.md`)
- [ ] Implementation plan was followed (`implementation-plan.md`)
- [ ] Ready to call `complete_work_order`

## Final Summary

- Outcome:
- Remaining risks:
- Follow-up tasks:
