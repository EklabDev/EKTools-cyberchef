# Schema Mapper — Proposal

## Why

Developers work across many languages and frameworks (TypeScript, Go, Java, Python, Prisma, etc.), each with its own way of defining data shapes—types, validation schemas, and ORM models. When building or integrating APIs, copying and manually rewriting these definitions is error-prone and slow. A single place to paste one representation and get another (e.g., TypeScript interface → Go struct or Zod → Pydantic) would let developers switch formats quickly and keep API contracts consistent across stacks.

## What Changes

- **New tab: Schema Mapper** in the EKTools app (alongside Text Tools and Image Tools).
- **Multi-format interconversion** for schema/type definitions among:
  - TypeScript types
  - Java Lombok `@Data` class
  - Zod validation schema
  - Prisma schema (model definitions)
  - Golang struct
  - Python Pydantic model
  - JSON Schema
- **Bidirectional flow**: user pastes or selects a source format, chooses a target format, and gets generated code/schema they can copy or download.
- **Single capability** covering the new tab, supported formats, and conversion behavior (inputs, outputs, and UX expectations).

## Capabilities

### New Capabilities

- **schema-mapper**: Schema Mapper tab and conversion engine. Covers the new tab in the app, the set of supported formats (TypeScript, Java Lombok, Zod, Prisma, Go struct, Pydantic, JSON Schema), conversion direction (any supported format → any other), and the UX (paste/select source, choose target, view/copy/download result). Spec will define requirements for supported formats, conversion accuracy, and UI behavior.

### Modified Capabilities

- *(none)*

## Impact

- **App shell**: New navigation entry and route for the Schema Mapper tab; layout consistent with existing Text Tools / Image Tools.
- **Dependencies**: Likely new libraries or parsers/generators for each format (e.g., parsers for TS/Go/Java/Prisma/Pydantic, JSON Schema as common interchange).
- **Scope**: Feature is additive; no changes to existing Text or Image tool behavior.
