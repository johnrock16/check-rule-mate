# Documentation

Welcome to the **check-rule-mate documentation**.

This folder contains detailed, structured guides that explain **how the engine works, why it was designed this way**, and **how to use it effectively** in real-world scenarios.

The goal of this documentation is not only to explain how to use check-rule-mate, but also to help you **reason about validation as a system**, especially when dealing with complex forms and business rules.

## Documentation Structure
Each file in this folder focuses on a specific aspect of the project.

### Core Concepts
#### `introduction.md`:
 High-level overview of the project, its goals, and when it should be used.

#### `concepts.md`:
Deep dive into the core building blocks:
- Rules
- Schemas
- Validation helpers
- Error messages

Explains how these pieces interact and why they are decoupled.

### CLI & Tooling
Complete reference for the CLI commands:

#### `CLI.md`
Includes examples, use cases, and design philosophy.
- `docs`
- `docs:playground`
- `verify`

## How to Read This Documentation
If you are **new to check-rule-mate**, follow this order:

1. `introduction.md`
2. `concepts.md`
3. `CLI.md`

## Philosophy Behind the Docs

These docs are written with the following principles:

- **Validation is a system**, not a single function
- **Rules should be reusable and composable**
- **Schemas should describe intent, not logic**
- **Execution should be observable**
- **Tooling should prevent mistakes early**

check-rule-mate is intentionally more explicit than traditional schema validators.
The documentation reflects this by favoring **clarity over magic**.

## Where to Go Next
- Read `introduction.md` to understand the project vision
- Explore `concepts.md` to learn how the engine is structured
- Use `CLI.md` to integrate documentation and validation checks into your workflow