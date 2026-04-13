# AGENT_OPERATING_SYSTEM.md

## AI Engineering Team Operating System

### Project: EHMRS Vue3 Client Rebuild

This document defines how AI agents collaborate as a structured
engineering team.

It works together with:

-   QWEN.md (governance)
-   MASTER_PROMPT.md (project initialization)

This file defines **execution discipline**, **review cycles**, and
**decision workflows**.

------------------------------------------------------------------------

# Core Principle

Agents must behave like a **real software engineering team**, not
independent coders.

Every feature must pass through:

1.  Design
2.  Architecture
3.  Contracts
4.  Implementation
5.  Verification

Skipping phases is not allowed.

------------------------------------------------------------------------

# Engineering Workflow

Each feature or module follows this lifecycle.

    Idea
     ↓
    Architecture Review
     ↓
    Design System Alignment
     ↓
    API Contract Definition
     ↓
    Implementation
     ↓
    Verification
     ↓
    Approval

------------------------------------------------------------------------

# Engineering Rituals

To maintain coordination, agents follow these rituals.

------------------------------------------------------------------------

# Architecture Review

Performed before implementing a new system capability.

Participants:

-   @software-architect
-   @ui-ux-designer
-   @contract-architect
-   @skeptical-verifier

Goal:

-   Validate structure
-   Prevent architectural drift
-   Ensure scalability

Output:

    docs/ARCHITECTURE.md updates
    docs/DECISIONS.md entry
    docs/CLIENT_ROADMAP.md

------------------------------------------------------------------------

# Design Review

Performed before implementing UI for a module.

Responsible:

    @ui-ux-designer

Goals:

-   enforce design system
-   ensure workflow efficiency
-   maintain UI consistency

Outputs:

    docs/CLIENT_PAGE_SPECS.md

------------------------------------------------------------------------

# Contract Review

Performed before API integration.

Responsible:

    @contract-architect

Goals:

-   validate request/response structures
-   ensure type safety
-   enforce pagination and error conventions

Outputs:

    docs/API_CONVENTIONS.md
    types/

------------------------------------------------------------------------

# Implementation Cycle

After design and contracts exist.

Responsible:

    @code-executor

Implementation must follow:

-   architecture rules
-   design system patterns
-   shared API contracts

No deviations allowed.

------------------------------------------------------------------------

# Verification Gate

Every implementation must pass verification.

Responsible:

    @skeptical-verifier

Checks:

-   logical correctness
-   security risks
-   accessibility compliance
-   UI pattern adherence
-   performance issues
-   edge cases

Outputs:

    docs/VERIFICATION_ISSUES.md

Implementation cannot be approved until verification passes.

------------------------------------------------------------------------

# Decision Logging

All significant decisions must be logged.

Document:

    docs/DECISIONS.md

Format:

    Date
    Decision
    Responsible Agent
    Reason

This prevents future architectural confusion.

------------------------------------------------------------------------

# Escalation Protocol

If agents disagree:

1.  Escalate to responsible authority agent
2.  Document the decision
3.  Update relevant documentation

Authority order:

    Architecture → @software-architect
    Design → @ui-ux-designer
    API → @contract-architect
    Quality → @skeptical-verifier

------------------------------------------------------------------------

# Change Management

If a change affects:

-   architecture
-   design system
-   API contracts

Then:

1.  Update the relevant document
2.  Notify dependent agents
3.  Re-run verification

------------------------------------------------------------------------

# Documentation Discipline

Every phase must update documentation.

Required docs:

    docs/
     ARCHITECTURE.md
     CLIENT_ROADMAP.md
     CLIENT_DESIGN_SYSTEM.md
     CLIENT_PAGE_SPECS.md
     API_CONVENTIONS.md
     DECISIONS.md
     VERIFICATION_ISSUES.md

Agents must **never allow documentation to drift from implementation**.

------------------------------------------------------------------------

# Anti-Chaos Rules

Agents must never:

-   implement features without design
-   create undocumented APIs
-   invent UI patterns outside the design system
-   bypass verification
-   modify architecture without approval

Violation requires correction before proceeding.

------------------------------------------------------------------------

# Success Metrics

The project is successful if:

-   architecture remains consistent
-   UI patterns remain uniform
-   API types remain synchronized
-   modules remain independent
-   verification passes continuously

------------------------------------------------------------------------

This document ensures the AI agents behave as a **coordinated
engineering organization rather than isolated generators**.
