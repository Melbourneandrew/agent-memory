# Software Factory Requirements Writing Specification (SOFA-RWS)

This is the canonical specification for writing Requirements Documents: product specification documents authored in Software Factory.

---

## Introduction to Requirements

### What Are Requirements?

Software Factory defines each product through two sets of complementary documents: Requirements and Blueprints. Requirements capture the externally expected outcomes and constraints through structured user stories and acceptance criteria; Blueprints are the technical specifications that define how the software system operates to satisfy those requirements. Both document types are authored as markdown and are intended to be readable as plain source documents while still supporting structured references and machine-assisted workflows.

Requirements describe *what* must be true from the user and business perspective. They are the foundation of all other work in Software Factory — Blueprints contain the technical specification that implements them, and work orders decompose that specification into implementable tasks. When requirements are clear and well-maintained, every downstream artifact inherits that clarity; when they are vague or stale, that ambiguity compounds through the entire development lifecycle.

### Two Kinds of Requirements Document

**Overview Requirements** — A narrative document that establishes product-wide context: the business problem, current state, personas, product description, or other framing that applies across all features. Overview Requirements have no feature association, no structured requirement IDs, and no acceptance criteria. They are prose documents written for a human audience.

**Feature Requirements Document (FRD)** — A structured document that specifies the expected behavior of a single feature through an overview, terminology definitions, and a set of numbered requirements each containing a user story and acceptance criteria. Every FRD belongs to a feature and has a corresponding Feature Blueprint in Foundry. FRDs are the primary input for engineering implementation. FRDs can be nested: a parent FRD can contain child FRDs, forming a hierarchy that mirrors the feature's decomposition into sub-features.

### How the Two Types Relate

Overview Requirements set the stage; FRDs specify the product.

A reader should be able to start with the Overview Requirements (Business Problem, Current State, Personas, Product Description) and understand the full context of the product before reading any FRDs. FRDs then specify what the system must do, feature by feature, without restating the product framing.

Because FRDs can be nested, large features are naturally decomposed into a tree. A **module-level FRD** sits at the top of that tree: it describes the module's purpose and lists its child sub-features with brief summaries, but does not itself contain structured requirement IDs — those live in the child FRDs. This keeps the parent document lightweight and navigable while the children carry the detailed specifications.

---

## Overview Requirements

Overview Requirements are free-form narrative documents initialized with every new Software Factory project. They have no prescribed internal structure beyond a heading and prose. The default documents are:

- **Business Problem** — Why the product exists; the pain points it addresses.
- **Current State** — The status quo that the product disrupts.
- **Personas** — The user archetypes and their goals.
- **Product Description** — What the product is and how its modules fit together.

### Guidance

Write in clear, direct prose. Avoid jargon unless the audience is exclusively technical. Overview Requirements should be readable by product managers, executives, and engineers alike. They should be stable — updated infrequently and only when the product's fundamental framing changes.

---

## Feature Requirements

Feature Requirements follow a consistent structure with three sections: **Overview**, **Terminology**, and **Requirements**.

### Overview Section

A short prose description (1–3 paragraphs) of the feature's purpose, scope, and how it fits into the broader product. This section sets the context for the structured requirements that follow.

Example:

```markdown
## Overview

The Checkout module provides the end-to-end purchase flow from cart review
through payment confirmation. It integrates with the product catalog for
pricing and inventory, and with the notification system for order
confirmation delivery.
```

### Terminology Section

A bulleted glossary of domain terms used in the requirements. Define terms once here; do not redefine them inline. Each entry is formatted as a bolded term followed by a colon and its definition.

Example:

```markdown
## Terminology

* **Cart**: The working collection of items a customer intends to purchase.
* **Order**: A finalized purchase record created when checkout completes.
* **Fulfillment Hold**: A temporary block on order processing pending
  manual review.
```

### Requirements Section

The structured body of the document. Each requirement is a numbered block containing a **user story** and one or more **acceptance criteria**.

Each requirement within a Feature Requirement document is a numbered block with three parts:

- **ID and title:** `REQ-{PREFIX}-{NNN}: Requirement Name` — a unique identifier with a short mnemonic prefix derived from the FRD title (e.g., `CHK` for "Checkout", `NOTIF` for "Notifications") and a zero-padded sequence number. The prefix is chosen once per document and used consistently for all requirements within it.
- **User story:** A single sentence in the format `As a [role], I want to [action], so that [outcome].`
- **Acceptance criteria:** One or more numbered criteria (`AC-{PREFIX}-{NNN}.{N}`) each following the format `When [trigger or condition], the system shall [expected behavior].`

Example:

```markdown
### REQ-CHK-003: Payment Confirmation

**User Story:** As a customer, I want to receive confirmation after
my payment is processed so that I know my order was placed successfully.

**Acceptance Criteria:**

* **AC-CHK-003.1:** When payment processing succeeds, the system shall
  display a confirmation page with the order number and estimated
  delivery date.
* **AC-CHK-003.2:** When payment processing fails, the system shall
  return the user to the payment form with an error message describing
  the failure reason.
* **AC-CHK-003.3:** When the user navigates away during processing,
  the system shall complete the transaction and display the confirmation
  on their next visit.
```

### Sub-features

Some features are large enough to be decomposed into sub-features. In these cases the parent document serves as a **module overview**: it states the module's purpose and lists the sub-features with brief summaries. It does not contain `REQ-` identifiers — those belong in the sub-feature documents.

```markdown
# Order Management Module

The Order Management Module handles the full order lifecycle from
placement through fulfillment and return processing.

## Sub-Features

**Order Placement**: Provides the checkout flow for submitting new
orders with payment and address validation.

**Order Tracking**: Displays real-time order status, shipment tracking,
and estimated delivery information.

**Returns & Refunds**: Manages return initiation, approval workflows,
and refund processing.
```

---

## Requirements Principles

1. **User-centered.** Requirements describe what users need and what the system must do for them, not how the system is built internally.
2. **Testable.** Every acceptance criterion should be clear enough that test cases can be derived from it.
3. **Atomic.** Each acceptance criterion covers one behavior. Compound behaviors are split into separate criteria.
4. **Structured identifiers.** Requirements and acceptance criteria use consistent, machine-readable ID schemes (`REQ-{PREFIX}-{NNN}`, `AC-{PREFIX}-{NNN}.{N}`).
5. **Markdown-native.** Requirements are markdown documents with lightweight structural conventions.
6. **Living artifacts.** Requirements evolve with the product as understanding deepens and scope changes.

---

## Authoring Checklist

- **Choose document type** — Overview Requirement (product-wide context) vs Feature Requirement (structured user stories and acceptance criteria).
- **Write the Overview section** — 1–3 paragraphs of feature context and scope.
- **Define Terminology** — Glossary of domain terms used in the document; define each term once.
- **Assign a prefix** — Derive a short, consistent mnemonic from the FRD title for requirement IDs (e.g., `CHK` from "Checkout", `NOTIF` from "Notifications").
- **Write user stories** — One per requirement, in "As a / I want to / so that" format.
- **Write acceptance criteria** — One testable behavior per criterion, using "When / the system shall" format.
- **Use cross-references** — Reference related documents with `@DocumentName` mentions.
- **Keep module-level documents light** — Purpose statement and sub-feature summaries only; no `REQ-` blocks.
