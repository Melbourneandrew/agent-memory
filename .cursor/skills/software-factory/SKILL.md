---
name: software-factory
description: General reference for the Software Factory platform — document types, modules, MCP tools, and work order execution workflow. Use when working with requirements, blueprints, work orders, or any Software Factory MCP tools.
---

# Software Factory

Software Factory connects product requirements to working code through a structured pipeline. The platform is organized into specialized modules, each designed for a specific persona and stage of the development process. This modular approach allows product managers, architects, project planners, and developers to work in their domain while maintaining clear handoffs between stages.

---

## Document Flow

The process starts with Feature Requirements Documents (FRDs) written by authors in Refinery. Each FRD describes the functional requirements for a specific feature — what the feature should do from a user's perspective. When an FRD is created, the system automatically creates a Feature Node (organizational backbone) and a corresponding Blueprint. Engineers then write Blueprints in Foundry, which are technical specifications defining how to implement each feature. Blueprints are broken down into Work Orders in Planner — these are the specific tasks that developers will implement. Finally, developers use the MCP Server to access project context while writing code. Artifacts (research documents, designs, API specs) can be attached at any stage to provide additional context.

---

## Modules and Personas

- **Refinery** — For product managers and stakeholders who define what to build. Authors write Feature Requirements Documents (FRDs) that describe functional requirements and user capabilities. The system creates Feature Nodes to organize these requirements hierarchically. Artifacts provide supporting context like market research or user interviews.
- **Foundry** — For technical architects who define how to build it. Each Feature Node has a corresponding Blueprint that specifies the technical implementation. Blueprints mirror the FRD hierarchy and link to code files, providing the bridge between product requirements and technical specifications.
- **Planner** — For project managers and tech leads who organize the work. Blueprints are decomposed into Work Orders (concrete development tasks) and organized into Phases for structured delivery. Work Orders specify which files to create or modify and include detailed implementation steps.
- **MCP Server** — For developers actively writing code. External coding tools retrieve project context — work orders, blueprints, and artifacts — to inform implementation decisions.

---

## Key Entities and Relationships

- **Feature Nodes** form a hierarchy where parent features contain child features
- **FRDs** link to their source Feature Node
- **Blueprints** link to their source Feature Node and to the code files they specify
- **Work Orders** connect to their source Blueprint and are grouped into Phases
- **Artifacts** can be attached at any stage to provide additional context

---

## Requirements

Requirements define *what* must be true from the user and business perspective. They are the foundation of all other work in Software Factory — Blueprints contain the technical specification that implements them, and work orders decompose that specification into implementable tasks.

There are two types of Requirements document:

- **Overview Requirements** — Narrative documents that establish product-wide context (Business Problem, Current State, Personas, Product Description). No structured IDs or acceptance criteria.
- **Feature Requirements Documents (FRDs)** — Structured documents specifying feature behavior through user stories (`REQ-{PREFIX}-{NNN}`) and acceptance criteria (`AC-{PREFIX}-{NNN}.{N}`). FRDs can be nested into hierarchies that mirror feature decomposition.

For execution, every implementation and completion check should reference requirement scope explicitly and verify that all linked acceptance criteria are satisfied.

**Full specification:** [sofa-rws.md](sofa-rws.md) (large document, only read this if you're writing requirements)

---

## Blueprints

Blueprints are technical specifications that describe *how* the system is structured and behaves to satisfy requirements. They define components, contracts, models, and relationships across runtime boundaries.

There are two types of Blueprint:

- **Component Blueprints** — Reusable system capabilities (feature-agnostic, often cross-container). Defined with `component` and `model` blocks; relationship paragraphs describe how components interact.
- **Feature Blueprints** — Composition of Component Blueprint capabilities plus feature-specific components to satisfy a set of product Requirements. Each Feature Blueprint corresponds to an FRD.

Blueprints use three mention types: `#ComponentName` for components, `ElementName` for data shapes/contracts, and `@SystemEntity` for documents and platform entities.

**CRITICAL during work order execution:** When a blueprint references another blueprint using `@OtherBlueprint`, you MUST read the referenced blueprint to understand the full component composition and contracts.

**Full specification:** [sofa-bws.md](sofa-bws.md) (large document, only read this if you're writing blueprints)

---

## Work Order Execution

Work orders are the concrete development tasks decomposed from Blueprints. When executing a work order, follow the phase-specific guide for your current stage.

### Phase Routing

- **Starting a work order** (after `get_next_work_order` or `start_work_order`): follow [start-work-order.md](start-work-order.md)
- **Completing a work order** (verification, `complete_work_order`, and handoff): follow [complete-work-order.md](complete-work-order.md)

The start phase ([start-work-order.md](start-work-order.md)) includes instructions for initializing the execution directory, the checklist protocol, and guardrails.

If `scratch/wo-execution/WO-<number>/` already exists, resume from it. Only initialize a new work order folder when one does not already exist.

---

## Skill File Index

| File | Purpose |
|------|---------|
| [sofa-rws.md](sofa-rws.md) | Requirements Writing Specification — full conventions for reading and writing Requirements documents |
| [sofa-bws.md](sofa-bws.md) | Blueprint Writing Specification — full conventions for reading and writing Blueprint documents |
| [start-work-order.md](start-work-order.md) | Start phase guide — context gathering workflow before implementation |
| [complete-work-order.md](complete-work-order.md) | Complete phase guide — verification, completion call, and handoff workflow |
| [writing-implementation-plans.md](writing-implementation-plans.md) | Guide for writing implementation plans — structure, parallel execution, and updating |
| [scripts/init-wo-execution.sh](scripts/init-wo-execution.sh) | Script to initialize a work order execution directory |
| [scripts/checklist-template.md](scripts/checklist-template.md) | Execution checklist template — tracks progress across all phases |
| [scripts/context-template.md](scripts/context-template.md) | Work order context template — IDs, user request summary, linked requirement/blueprint doc references, and PR URL |
| [scripts/implementation-plan-template.md](scripts/implementation-plan-template.md) | Implementation plan template — structured plan written after context gathering |
| [scripts/review-log-template.md](scripts/review-log-template.md) | Review log template — multi-round review findings written by review agents |
