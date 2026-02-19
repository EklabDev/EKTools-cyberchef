# Schema Mapper — Tasks

## 1. App shell and navigation

- [x] 1.1 Add Schema Mapper tab to the main page header (alongside Text Tools and Image Tools)
- [x] 1.2 Add Schema Mapper view component and route so selecting the tab shows the Schema Mapper UI
- [x] 1.3 Implement three-column layout for Schema Mapper (source input | controls | output) consistent with existing tabs

## 2. Conversion pipeline (JSON Schema as canonical)

- [x] 2.1 Define shared TypeScript type for JSON Schema (or use a minimal interface) used as the canonical intermediate
- [x] 2.2 Implement pipeline helper: given sourceFormat, targetFormat, and sourceText, run parse(sourceFormat → JSON Schema) then generate(JSON Schema → targetFormat) and return result or error
- [x] 2.3 Add JSON Schema identity support: parser and generator for JSON Schema (parse validates/normalizes, generate outputs the same)

## 3. Validators and transform gating

- [x] 3.1 Implement one validator per format (validates source content for selected source format)
- [x] 3.2 On source input change, debounce and run the validator for the selected source format; show validation feedback (error or success)
- [x] 3.3 Enable the Transform (convert) button only when validation passes; disable it and show validation error when validation fails
- [x] 3.4 Re-run validation when the user changes the source format dropdown

## 4. UI controls and wiring

- [x] 4.1 Add source format dropdown (options: TypeScript, Java Lombok, Zod, Prisma, Go struct, Pydantic, JSON Schema)
- [x] 4.2 Add target format dropdown with the same format options (JSON Schema selectable as both source and target)
- [x] 4.3 Add source textarea and Transform button (enabled only when validation passes) that invokes the pipeline
- [x] 4.4 Add output area that displays conversion result (read-only textarea or code block)
- [x] 4.5 Add Copy button to copy output to clipboard and Download button to download result with format-appropriate extension
- [x] 4.6 Surface conversion errors in the UI when parse or generate fails; keep validation errors separate from conversion errors

## 5. Format support — first set (JSON Schema, Zod v4, TypeScript 5)

- [x] 5.1 Implement Zod v4 → JSON Schema parser and Zod v4 validator
- [x] 5.2 Implement JSON Schema → Zod v4 generator
- [x] 5.3 Implement TypeScript 5 types → JSON Schema parser and TypeScript 5 validator (client or API route as needed)
- [x] 5.4 Implement JSON Schema → TypeScript 5 types generator (reuse existing API route or client path where applicable)

## 6. Format support — Go and Pydantic

- [x] 6.1 Implement Go struct → JSON Schema parser and validator
- [x] 6.2 Implement JSON Schema → Go struct generator
- [x] 6.3 Implement Pydantic model → JSON Schema parser and validator
- [x] 6.4 Implement JSON Schema → Pydantic model generator

## 7. Format support — Java Lombok and Prisma

- [x] 7.1 Implement Java Lombok @Data class → JSON Schema parser and validator
- [x] 7.2 Implement JSON Schema → Java Lombok @Data class generator
- [x] 7.3 Implement Prisma → JSON Schema parser and validator: multiple models and enums in one paste; ignore all non-model, non-enum input (datasource, generator, etc.)
- [x] 7.4 Implement JSON Schema → Prisma model generator

## 8. Polish and robustness

- [x] 8.1 Guard conversion for very large input (size limit or timeout) and keep debounce for validator only
- [x] 8.2 Document or display supported JSON Schema subset per format when a construct cannot be represented (e.g. optional warning or tooltip)
- [x] 8.3 Smoke-test all format pairs (each source × each target) for basic object/array/primitive shapes
