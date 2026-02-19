# Schema Mapper — Design

## Context

EKTools already has Text Tools and Image Tools as tabs. Schema Mapper will be a new tab offering conversion between schema/type definitions used across languages and frameworks (TypeScript, Go, Java, Zod, Prisma, Pydantic, JSON Schema). The proposal calls for any supported format to be convertible to any other. Implementing every pairwise conversion (e.g. TypeScript ↔ Go, Zod ↔ Pydantic) would mean N² converters and duplicated logic. Using a single canonical representation simplifies the system: we implement one “parse” and one “generate” per format, and every conversion is a composition of two steps.

## Goals / Non-Goals

**Goals:**

- Support conversion between all proposed formats (TypeScript types, Java Lombok `@Data`, Zod, Prisma schema, Go struct, Python Pydantic, JSON Schema) via a single, consistent pipeline.
- Use **JSON Schema as the canonical intermediate**: every format parses to JSON Schema, every format generates from JSON Schema. Any conversion A → B is implemented as parse A → JSON Schema → generate B.
- Add a Schema Mapper tab with the same layout patterns as Text/Image Tools (source input, format selection, target selection, output with copy/download).
- Keep the conversion engine testable and extensible (adding a new format = add one parser + one generator).

**Non-Goals:**

- Full semantic equivalence for every language-specific feature (e.g. Prisma relations, Pydantic validators); focus on structural shape and common types first.
- Editing or validating JSON Schema in the UI beyond using it as the internal interchange format.
- Runtime validation of data against schemas in the app; this is a code/schema conversion tool only.

## Decisions

### 1. JSON Schema as the single canonical intermediate

**Decision:** All conversions go through JSON Schema. We implement only:

- **Parsers:** Format X → JSON Schema (one per source format).
- **Generators:** JSON Schema → Format Y (one per target format).

A user-facing conversion “TypeScript → Go” is: `tsToJsonSchema(input)` then `jsonSchemaToGo(jsonSchema)`.

**Rationale:** Avoids N² pairwise converters, centralizes type/shape logic in one representation, and reuses the large JSON Schema ecosystem. JSON Schema is widely supported and maps well to object shapes across languages.

**Alternatives considered:**

- **Pairwise converters:** Rejected due to combinatorial growth and duplicated logic.
- **AST-based canonical form:** More expressive but heavier; JSON Schema is sufficient for common API DTOs and keeps the implementation smaller.

### 2. Conversion pipeline shape

**Decision:** Two-phase pipeline: **Parse (source format → JSON Schema)** then **Generate (JSON Schema → target format)**. The UI always shows “source format” and “target format”; the backend composes the two steps. No caching of intermediate JSON Schema in the first version unless we hit performance needs.

**Rationale:** Matches the mental model “paste this, get that” and keeps the API simple (e.g. one endpoint or one handler: source format, target format, source text).

### 3. Where conversion runs

**Decision:** Prefer **client-side conversion** where possible (e.g. Zod, JSON Schema, TypeScript via existing or lightweight libs) to avoid round-trips and to keep the app usable offline. Use **server/API route** for formats that require Node-only or heavy dependencies (e.g. some language parsers/generators that depend on `fs` or native tooling), following the same pattern as the existing “JSON Schema → TypeScript” API route.

**Rationale:** Aligns with current EKTools architecture and avoids unnecessary server load for simple conversions.

### 4. Validators and transform gating

**Decision:** Each format has a **validator** (same logic as parse or a lightweight check). On source input change, run the validator after a **debounce** delay. The **Transform** (convert) button is **enabled only when validation passes**; otherwise it is disabled and validation feedback is shown. This avoids running full conversion on invalid input and gives immediate feedback.

**Rationale:** Keeps the UI responsive and prevents confusing conversion errors when the source is not valid for the selected format.

### 5. Format support order

**Decision:** Implement parsers and generators incrementally. Suggested first set: **JSON Schema** (identity), **Zod**, **TypeScript types** (already partially in place). Then add Go struct, Pydantic, Java Lombok, Prisma. Each format is a pair: one parser, one generator (except JSON Schema, which is both identity and the hub).

**Rationale:** Delivers value early and de-risks the canonical-intermediate approach with a small matrix of conversions before expanding.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Some formats can’t express the full JSON Schema feature set | Document supported subset per format; surface “best effort” or warnings when dropping unsupported constructs. |
| Parsing/generation quality varies by format | Start with a well-defined subset (objects, primitives, arrays, optional); extend with iterations and user feedback. |
| Large or invalid input can slow or crash the tab | Debounce conversion, run heavy work in a Web Worker or server; validate input size and time out long runs. |
| Multiple Zod/TS versions or dialects | Pin to a single conversion approach per format and document limitations. Zod v4 and TypeScript 5 are the pinned versions for those formats. |

## Migration Plan

- **Deploy:** Add Schema Mapper as a new tab and route; no changes to Text or Image Tools. No data migration.
- **Rollback:** Remove the tab and route; no shared state with existing features.
- **Feature flag:** Optional; can ship behind a flag if we want a staged rollout.

## Resolved: Former Open Questions

- **Source/target format UI:** Use exact source and target format selection via **dropdowns** (no paste-and-detect). Same set of options in both dropdowns.
- **JSON Schema in UI:** JSON Schema is a **selectable source and target** in the dropdowns so users can paste or produce JSON Schema and use it as the canonical form.
- **Prisma:** Support **multiple models (and enums) in one paste**. Ignore all non-model, non-enum input (e.g. `datasource`, `generator`, and any other blocks); only `model` and `enum` blocks are parsed and converted.
