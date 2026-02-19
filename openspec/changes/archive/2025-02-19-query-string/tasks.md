## 1. Routing and URL structure

- [x] 1.1 Add Next.js route structure so path can encode section and (for Text Tools) category (e.g. `/TextTools/date-time`, `/ImageTools`, `/SchemaMapper`)
- [x] 1.2 Add URL parsing utility or hook that reads pathname and searchParams and returns derived mode, category slug, tool id, operation, source, target (with defaults for missing/invalid values)
- [x] 1.3 Define category display name ↔ slug mapping for Text Tools and use it when reading and writing URL path segments

## 2. State initialisation from URL

- [x] 2.1 On app load, initialise mode (text | image | schema) from path and set header tab selection accordingly
- [x] 2.2 On load in Text Tools mode, initialise selectedCategory and selectedToolName from path/query; fall back to first category and first tool when invalid or missing
- [x] 2.3 On load in Image Tools mode, initialise selected operation from query; fall back to first operation when missing or invalid
- [x] 2.4 On load in Schema Mapper mode, initialise source and target from query; fall back to defaults when missing or invalid
- [x] 2.5 Ensure no flash of wrong tab: use URL-derived initial state in useState or single sync effect so first paint matches URL

## 3. URL updates on user action

- [x] 3.1 When user changes section (Text / Image / Schema tab), update URL path and query via replaceState to match new section and its default or current tool/operation
- [x] 3.2 When user changes category or tool in Text Tools, update URL path segment and `tool` query param via replaceState
- [x] 3.3 When user changes operation in Image Tools, update `operation` query param via replaceState
- [x] 3.4 When user changes source or target in Schema Mapper, update `source` and `target` query params via replaceState

## 4. Back / forward and popstate

- [x] 4.1 Subscribe to popstate (or Next.js router events) and when URL changes from back/forward, re-run URL parsing and set state so rendered view matches the navigated-to URL

## 5. Metadata from context

- [x] 5.1 Set document title on load and whenever effective context (section + tool/operation) changes; title SHALL include section and tool or operation name (e.g. "Date & Time – datetime_format | EK Tools")
- [x] 5.2 Optionally set meta description from current section/tool and update it when context changes

## 6. Defaults and validation

- [x] 6.1 When path or query is missing or invalid, use defined defaults (e.g. Text Tools, first category, first tool) and update URL to reflect the effective selection so address bar stays consistent
