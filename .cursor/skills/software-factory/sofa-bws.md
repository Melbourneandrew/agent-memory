# Software Factory Blueprint Writing Specification (SOFA-BWS)

This is the canonical specification for writing Blueprints: technical specification documents authored in Software Factory.

---

## Introduction to Blueprints

### What Are Blueprints?

Software Factory defines each product through two sets of complementary documents: Requirements and Blueprints. Requirements capture the externally expected outcomes and constraints through structured user stories and acceptance criteria; Blueprints are the technical specifications that define how the software system operates to satisfy those requirements.
Both document types are authored as markdown and are intended to be readable as plain source documents while still supporting structured references and machine-assisted workflows.

In requirements-engineering terms, Requirements describe *what* must be true from the user and business perspective, while Blueprints describe *how* the system is structured and behaves to make that true. Blueprints allocate behavior to concrete runtime components, define the data/contracts that cross component boundaries, and describe the dependency and control flow that turns user intent into system behavior.

Together, Requirements and Blueprints form a complete product definition that is testable in both directions: each Blueprint should trace upward to Requirements and downward to real code symbols and runtime interactions.

### Two Kinds of Blueprint

**Component Blueprint** — Describes a **reusable system capability**: a cohesive group of services, controllers, hooks, strategies, and other runtime components that together power one capability. It is the prose equivalent of a C4 component diagram: structured component blocks are the nodes, paragraphs between the component blocks are the relationship edges. Component Blueprints are **feature-agnostic** (they describe what the system *can* do, not what any one feature uses) and commonly **span multiple C4 containers** (e.g., API Server and Client App). In modern software systems, most capabilities are inherently cross-container because end-to-end behavior typically combines user-interface, API orchestration, background processing, and persistence concerns.

**Feature Blueprint** — Describes how capabilities from **Component Blueprints** come together, plus any feature-specific components, to satisfy a set of product Requirements. Each Feature Blueprint corresponds to a Feature Requirements Document (FRD) and is its technical counterpart: Requirements say *what*; the Feature Blueprint says *how*. Feature Blueprints are **composition-first**: they wire shared capabilities together, configure them for the feature, and document feature-only glue.

### How the Two Types Relate

**Product Manager defines features:**
  "Checkout" (auto-initializes: `Checkout` FRD + `Checkout` Feature Blueprint)
  "Order Tracking" (auto-initializes: `Order Tracking` FRD + `Order Tracking` Feature Blueprint)

**Product Manager writes structured requirements into the FRDs:**
  → Checkout (REQ-CHECKOUT-001, REQ-CHECKOUT-002, …)
  → Order Tracking (REQ-TRACK-001, REQ-TRACK-002, …)

**Engineer reads requirements and identifies shared system capabilities, creates Component Blueprints:**
  → Identity and Session Management (containing components like `AuthenticationService`, `SessionTokenStore`, `UserProfileClient`)
  → Notification Delivery (containing components like `NotificationRouter`, `EmailDeliveryService`, `SmsDeliveryService`)

**Engineer writes Feature Blueprints:**
  → Checkout Feature Blueprint (composes Identity and Session Management + checkout-specific components)
  → Order Tracking Feature Blueprint (composes Identity and Session Management + Notification Delivery + order-tracking-specific components)


The engineer's job: (1) identify shared capabilities that underpin features, (2) document them as Component Blueprints, (3) compose them into Feature Blueprints that map onto Requirements. The ideal outcome is that Feature Blueprints are mostly *composition*; feature-specific components exist where needed. Components often start in Feature Blueprints and are refactored into Component Blueprints when reuse emerges — that lifecycle is expected.

---

## Core Syntax and Semantics

Blueprint syntax defines the canonical structural elements that can appear in a Blueprint document (`component` and `model` blocks). Blueprint semantics define how those elements should be interpreted: what each element means, how elements relate across sections and documents, and how references map to runtime ownership, contracts, and behavior.

### Component Blocks

Components are defined in structured code blocks that act as the **nodes** of the architecture:

- **name:** PascalCase, matches the component's code identity.
- **container:** C4 container(s), comma-separated if multiple (e.g., `Client App`, `API Server`, `Task Server`, or `Client App, API Server`).
- **responsibilities:** Tab-indented bullet list (`- `) of what this component does. Use element mentions (`` `...` ``) for data/contracts and component mentions (`` `#...` ``) or element mentions when responsibilities depend on or collaborate with other components (including components defined in other Blueprints).

Anything defined with a `component` block (e.g. `name: MyComponent`) in a document can be referenced as `#MyComponent` from any document.

Example:
````
```component
name: NotificationDeliveryService
container: API Server
responsibilities:
	- Selecting delivery channels based on `NotificationPreference` and message type
	- Rendering channel-specific payloads from `NotificationTemplate`
	- Dispatching messages through provider adapters with retry and idempotency guards
```
````


### Model Blocks

Use a **model** block when a Blueprint needs an explicit, canonical data/domain model that is central to implementation but is not a runtime component:

- **name:** Model name.
- **store:** Where the model is stored (e.g. `Postgres`, `S3`, `DynamoDb`, `CacheMemory`).
- **description:** Short statement of purpose.
- **fields:** Tab-indented bullet list of canonical fields and types.
- **constraints:** Invariant rules enforced by domain logic.

Models are mentioned with backticks like an element (see Mentions below).

Example:
````
```model
name: CustomerOrder
store: Postgres
description: Canonical persisted order model used by checkout, fulfillment, and support workflows.
fields:
	- id: UUID (required)
	- order_number: string (required)
	- customer_account_id: UUID (required; foreign key -> `CustomerAccount.id`)
	- status: Draft | Placed | Packed | Shipped | Delivered | Cancelled (required)
	- total_amount: decimal (required)
	- placed_at: datetime (nullable)
constraints:
	- unique `order_number`
	- `total_amount` is non-negative
	- `placed_at` is present when `status` is not `Draft`
```
````

### Mentions

Blueprints use three mention types to create navigable links:

- `` `#ComponentName` `` for components (runtime behavior).
- `` `ElementName` `` for elements (data shapes and contracts).
- `@SystemEntity` for whole documents and platform entities.

The table below summarizes syntax, scope, and where each type is defined.

| Syntax | What it references | Example | Defined in Blueprints? |
|--------|--------------------|--------|-------------------------|
| `` `#Name` `` | Components (runtime behavior) | `` `#NotificationDeliveryService` `` | Yes, via component blocks |
| `` `Name` `` | Elements (data shapes, contracts) | `` `CustomerOrder` `` | Code symbols or model blocks |
| `@Name` | Other system entities/documents | `@Checkout Requirements` | Platform entities |

**`` `#ComponentName` ``** — Backticked hashtag for components (services, controllers, hooks, strategies, providers). These are things that have (or could have) a `component` block. Components are runtime things that *do work*. Examples: `` `#NotificationDeliveryService` ``, `` `#OrderLifecycleService` ``, `` `#CheckoutApiController` ``. Components defined in *any* Blueprint using the ` ```component ``` ` block syntax can be mentioned this way from any other Blueprint; this cross-Blueprint referencing is how composition is expressed.

**`` `ElementName` ``** — Backticks for elements: architecturally significant code symbols that are *not* defined as components — schemas, configs, domain types, enums, request/response models, exceptions, feature flags, permission matrices, and models (including those defined in `model` blocks). Elements *describe shape*; they define contracts and configuration that components read, produce, or share. Request/response models and exception types are especially good as element mentions because their names are often self-documenting. Use the casing of the source language (e.g. `CustomerOrder`, `OrderStatus`, `NotificationTemplate`, `CheckoutRequest`, `CheckoutResponse`). Element mentions don't create blueprint-to-blueprint dependency; multiple blueprints can mention the same element without implying a dependency.

**`@SystemEntity`** — At-sign for other system entities/documents managed by the platform: Requirements, Blueprints, Work Orders, and Artifacts. Examples: `@Checkout Requirements`, `@Order Tracking Feature Blueprint`, `@WO-123`, `@Customer Call Artifact`. These link to actual documents and entities in Software Factory.

**When to use which:** Does work (processes, orchestrates, renders, fetches) -> `#Component`. Describes shape or contract (schema, type, config, enum, model, request/response, exception) -> `Element`. Document (Requirements, Blueprint) or artifact in Software Factory -> `@SystemEntity`.

**Example paragraph:**  
`#CheckoutApiController` (see @Checkout Feature Blueprint) validates `CheckoutRequest` and calls `#OrderLifecycleService` to create a `CustomerOrder`. The service sets `OrderStatus` to `Placed` and then calls `#NotificationDeliveryService` with a `NotificationTemplate`.  
Here the `#` names are components with definitions somewhere; `` `CheckoutRequest` ``, `CustomerOrder`, `OrderStatus`, and `NotificationTemplate` are elements; `@Checkout Feature Blueprint` is a platform entity.

---

## Writing Component Relationship Paragraphs

Relationships between components are described in **natural language paragraphs** that act as the **edges** of the architecture: what flows between components, who depends on whom, and why.

**Key principles:** Use each paragraph to connect concrete components defined via `component` blocks; mention both components early so the edge is explicit. State direction (who depends on whom). Use component mentions (`#...`) and element mentions (`...`) to add implementation detail and data-flow clarity, not as ends in themselves. Explain *why*, not just *what*. One relationship per paragraph, 2-4 sentences. Do not restate component block responsibilities; describe the *interaction* and what crosses the boundary.

---

## Component Blueprint Guidance

### What They Are and When to Create One

A Component Blueprint is the technical documentation of a reusable system capability. It is feature-agnostic and may span multiple C4 containers. Component Blueprints primarily serve Feature Blueprints by defining reusable capabilities that features compose, and secondarily serve engineers and AI agents during implementation, debugging, and extension.

**Create a Component Blueprint when:** you're building a shared technical system that two or more features depend on (or will); you're abstracting a reusable capability; the system has enough internal structure (multiple components and relationships) to warrant its own document; or you want to establish the contracts (elements) that other Blueprints will reference.

**Don't create one for:** a single utility or helper with no internal structure; feature-specific logic that only makes sense in one context (that belongs in a Feature Blueprint); or infrastructure already well-documented elsewhere (reference as external dependency if needed).

### Structure

1. **Title and capability summary** — Start with the Blueprint title, then add `## Capability Summary` that explains what the capability does in 2–3 sentences and names key elements flowing through it.
2. **Core components (grouped logically)** — Add `## Core Components` and define component blocks in logical groups (for example ingestion, orchestration, persistence, and presentation; or backend then frontend).
3. **Relationship paragraphs as edges** — Treat `component` blocks as nodes and prose paragraphs as edges. Insert a relationship paragraph between components or groups when direction, data flow, or intent is not obvious from colocation. If adjacency already makes the relationship unambiguous, the paragraph is optional.
4. **Section headers and dividers** — Keep all component definitions under `## Core Components`, then use `###` subheadings to group related components (for example "### API Layer", "### Frontend: Api Hooks"). Use `---` between major boundaries (for example backend vs frontend) when additional visual separation helps.

### Optional Sections

- **`## System Contracts`** — Optional but recommended when the capability has non-trivial guarantees or boundary interfaces. Organize this section with `### Key Contracts` (invariants, correctness rules, reliability semantics such as idempotency/ordering/consistency/retry behavior) and `### Integration Contracts` (events published/consumed, API interfaces, webhook payloads, and composition expectations). Use `### Integration Boundaries` when the emphasis is ownership and separation of concerns rather than payload/API detail.
- **`## Architecture Decision Records`** — Optional section for non-obvious design choices and trade-offs. Use concise ADR entries with `Context`, `Decision`, and `Consequences`; place this section after `## System Contracts` when both are present.
- Use these sections only when they reduce ambiguity; they are not required for Blueprint validity.

---

## Feature Blueprint Guidance

### What They Are and When to Create One

A Feature Blueprint describes how Component Blueprints compose — plus any feature-specific components — to satisfy product Requirements. It is composition-first: shared capabilities do the heavy lifting; the Feature Blueprint wires and configures them and documents feature-only glue.

**Create a Feature Blueprint when:** a product manager has defined a feature with structured Requirements; the feature composes one or more Component Blueprints; you need to document how those capabilities are configured and wired for this feature; or feature-specific components exist that don't belong in any Component Blueprint.

### Requirements Connection

Every Feature Blueprint has a corresponding **Feature Requirements Document** in structured format, e.g.:

```
### REQ-XXX-001: Requirement Name
**User Story:** As a [role], I want to [action], so that [outcome].
**Acceptance Criteria:**
* **AC-XXX-001.1:** When the user [action], the system shall [behavior].
* **AC-XXX-001.2:** When [condition], the system shall [behavior].
```

It is assumed that the author of a Feature Blueprint has read the corresponding Requirements Document. The Feature Blueprint provides the technical path for satisfying those requirements; no formal cross-referencing is required.

### Structure

1. **Title and feature summary** — Start with the Blueprint title, then add `## Feature Summary` with a 2–3 sentence user-centered summary that references the corresponding Requirements Document.
2. **Component Blueprint composition** — Add `## Component Blueprint Composition` to document which shared capabilities this feature composes and how each is configured or scoped. Use document mentions (`@...`) for referenced Blueprints/Requirements and component mentions (`#...`) for concrete runtime components involved in the composition.
3. **Feature-specific components** — Add `## Feature-Specific Components` for components that exist only for this feature (panels, pages, feature-specific hooks); give these full component blocks.
4. **Composition paragraphs** — Use relationship/composition paragraphs between sections to explain how referenced capabilities and feature-specific components wire together from user action to system behavior. Explicitly mention the concrete components from other Blueprints that participate in the implementation using `#...` mentions, and use element mentions for the contracts/data that cross boundaries.
5. **Contracts and ADRs when feature logic is substantial** — Add `## System Contracts` and/or `## Architecture Decision Records` when the Feature Blueprint defines significant feature-specific behavior (for example when Component Blueprints do not cover much of the functionality and key guarantees or design trade-offs are defined here).

### Referencing Component Blueprints and Feature-Specific Components

When referencing a Component Blueprint, don't redefine its components — describe *how* the feature *uses* the capability (e.g. feature-scoping, section limits, response transformation). Example:

> The Checkout feature uses shared Identity and Session Management plus Order Lifecycle capabilities. `#CheckoutApiController` validates `CheckoutRequest`, delegates authentication/session checks to `#AuthenticationService`, and submits the order command to `#OrderLifecycleService`. The resulting `CustomerOrder` is mapped to `CheckoutResponse` for the client.

Feature-specific components get full component blocks in the Feature Blueprint. Feature Blueprints can also extend shared capabilities with full component blocks when the extension is feature-specific. Any component defined in any Blueprint can be `#`-referenced from any other.

---

## Blueprint Principles

1. **Code-grounded.** Blueprints reference real code symbols. Components map to runtime components; elements map to concrete schemas, types, models, and contracts.
2. **Composition-first.** Component Blueprints define reusable capabilities; Feature Blueprints compose those capabilities and add feature-specific components only where needed.
3. **Structured and narrative.** Structured blocks provide anchor points (`component`, `model`); prose paragraphs explain interactions, direction, and intent.
4. **Implementable.** A Feature Blueprint should provide enough architectural clarity for implementation without material ambiguity.
5. **Markdown-native.** Blueprints and Requirements are markdown documents with lightweight structured conventions.
6. **Living artifacts.** Blueprints evolve with the system as architecture and requirements change.

---

## Authoring Checklist

- **Choose Blueprint type** — Component Blueprint (reusable capability) vs Feature Blueprint (composition + feature-specific behavior).
- **Follow baseline sections** — Component Blueprints use `## Capability Summary` and `## Core Components`; Feature Blueprints use `## Feature Summary`, `## Component Blueprint Composition`, and `## Feature-Specific Components`.
- **Declare components and models** — Use `component` blocks for runtime nodes; use `model` blocks only when you need a canonical domain model definition.
- **Use mention syntax correctly** — Use `#...` for components, `` `...` `` for elements (schemas, types, request/response models, exceptions, models), and `@...` for system entities/documents and artifacts.
- **Write composition/relationship paragraphs** — Name concrete components (including cross-blueprint `#...` references), state direction, identify data/contracts crossing boundaries, and explain why the interaction exists.
- **Add optional sections when relevant** — Use `## System Contracts` (`### Key Contracts`, `### Integration Contracts`/`### Integration Boundaries`) and `## Architecture Decision Records` when they reduce ambiguity, especially when significant feature behavior is defined in the Feature Blueprint.
- **Confirm requirement alignment (Feature Blueprints)** — Assume the author has read the Requirements Document and ensure each major requirement theme has a clear technical path through the Blueprint.
