# Start Work Order Phase

## Purpose
Gather enough context to implement correctly before writing code.

## Workflow

### 1. Resume or initialize the execution directory

First check whether `scratch/wo-execution/WO-<number>/` already exists.

- **If it exists:** resume from the existing execution files and continue from the current checklist phase.
- **If it does not exist:** initialize it:

```bash
bash .cursor/skills/software-factory/scripts/init-wo-execution.sh \
  --work-order-number "<number>" \
  --work-order-title "<title>"
```

Initialization creates:
- **`checklist.md`** — execution checklist
- **`context.md`** — work order metadata, linked docs, and delivery context
- **`implementation-plan.md`** — implementation plan
- **`review-log.md`** — review log

Do not re-run initialization for an existing work order directory unless the user explicitly approves replacing execution files.

### 2. Checklist protocol

Complete the checklist incrementally throughout execution. Check items off immediately after completing them, add notes in real time, and record file paths and decisions during implementation. Do not defer checklist updates to the end. Each phase ends with a single certification line — you must check it before proceeding to the next phase.

**Skip protocol:** If a checklist item does not apply to this work order, write `[SKIP]` in the checkbox and provide a skip reason on the line immediately below:
```
- [SKIP] E2E tests run/passing
  Skip reason: No UI changes in this work order — backend-only service refactor.
```

### 3. Context gathering

1. Use the work order details returned by `get_next_work_order` or `read_work_order` as execution scope.
2. Identify linked requirements and blueprints from work order content.
3. Read linked docs using:
   - `read_requirement` / `search_requirements`
   - `read_blueprint` / `search_blueprints`
   - **CRITICAL:** When reading blueprints, follow all `@BlueprintName` mentions to read referenced Component Blueprints. Feature Blueprints compose Component Blueprints, and you need both to understand the full component graph and contracts.
4. Build a brief execution context summary:
   - in-scope outcomes from requirements
   - acceptance criteria that must pass
   - architecture path from blueprints (components/contracts)
   - referenced Component Blueprints and their key components
5. Fill in `context.md` with work order identifiers, a 1-2 sentence user request summary, and requirement/blueprint document ID + title.
6. Confirm open questions with the user before implementation.

### 4. Write the implementation plan

Write the implementation plan to `scratch/wo-execution/WO-<number>/implementation-plan.md` (see [writing-implementation-plans.md](writing-implementation-plans.md) for structure and guidance).

## Guardrails

- Keep messages concise and operational.
- Always tie implementation and completion checks back to work order scope, requirements acceptance criteria, and blueprint architecture.
- Use `.cursor/skills/review/SKILL.md` for code review (linting, blueprint alignment, architecture & conventions).
- Use `.cursor/skills/testing/SKILL.md` for test execution order and command flags.

## Why This Matters

Requirements are the completion truth source (what must be true), while blueprints define the technical approach (how it should be implemented). Starting strong means capturing both explicitly so code and tests can be traced to acceptance criteria and architecture from the beginning.
