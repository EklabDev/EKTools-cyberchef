## Context

The app is a single-page Next.js app: one root page with a header that switches `mode` (text | image | schema) and renders CyberChef, ImageTools, or SchemaMapper. Navigation is entirely in-memory (useState); there are no routes or query parameters. Tool/category selection inside each section is also state-only. To support deep links, shareable URLs, and correct metadata, we need URL-driven navigation with state and URL kept in sync.

## Goals / Non-Goals

**Goals:**
- URLs that uniquely identify section and tool/operation (path + query).
- On load: parse URL and set mode, category, tool/operation, and SchemaMapper source/target so the correct view renders.
- On user action: update URL (path/query) so the address bar reflects current context; support back/forward where appropriate.
- Document title (and optional meta description) derived from current section and tool/operation.

**Non-Goals:**
- Persisting tool input/output or form field values in the URL (only selection state).
- Server-side rendering of tool-specific content; client-side routing is sufficient.
- Changing existing tool behavior or data models.

## Decisions

### 1. Route shape: path + search params on a single page

Use one logical page (e.g. `/` or `/tools`) with path segments and search params to encode context. Path encodes section (and for Text Tools, category); query encodes tool id, operation, or source/target. Alternative: separate routes per section (e.g. `/text-tools`, `/image-tools`, `/schema-mapper`) with search params. Chosen approach keeps one layout and avoids duplicate layout code; path segments still give readable URLs (e.g. `/TextTools/Date&Time?tool=datetime_format`). Next.js: use optional catch-all or a single dynamic segment plus `searchParams` (e.g. `/[section]/[[...sub]]` or dedicated segments per section).

### 2. URL update strategy: replaceState for in-app navigation

When the user changes tab, category, or tool in the UI, update the URL with `router.replaceState` (or equivalent) so the history entry is replaced and back button does not cycle through every tool change. When the user opens a direct link or uses back/forward to a different URL, use pushState or the default navigation so that back/forward works across distinct pages. Rationale: replaceState avoids cluttering history for small UI changes; initial load and cross-URL navigation remain in history.

### 3. Encoding category and tool names in URL

Use URL-safe slugs for path and query: category names like "Date & Time" encoded as path segment (e.g. `Date%20%26%20Time` or a slug like `date-time`). Tool ids and operation names are already identifiers; use as-is in query. For SchemaMapper, source/target values (e.g. "Typescript", "JSON Schema") encoded in query. Normalize when reading (decode plus map slugs to display names if we use slugs).

### 4. Metadata: client-side title + Next.js metadata where possible

Metadata must reflect the current section/tool after client-side navigation. Use a combination: (1) Default/static metadata in `layout.tsx` or `metadata` export for the initial document; (2) When route/searchParams change (or on mount with current URL), set `document.title` (and optionally a meta description via a small effect or component). This keeps metadata correct for deep links and after in-app navigation without requiring per-route server metadata.

### 5. Initialisation order

On first paint, read path and searchParams (from Next.js `useSearchParams` / `usePathname` or router), derive mode, category, tool, operation, source/target; set React state so the correct tab and tool are shown. Avoid flash of wrong tab: prefer reading URL in the same component tree that owns the state (or pass from a wrapper that reads router once) and initialising state from URL before or during first render where possible (e.g. `useState(initialFromUrl)` or a single sync effect that runs once).

## Risks / Trade-offs

- **Risk:** URL and state get out of sync (e.g. user edits URL manually). **Mitigation:** Treat URL as source of truth on load; on popstate or when URL is changed externally, re-read and sync state. For in-app actions, always update URL when state changes so the two stay aligned.
- **Risk:** Back/forward behavior is confusing if every small change pushes history. **Mitigation:** Use replaceState for in-app tab/tool/operation changes; use push only when we explicitly want a new history entry (if at all).
- **Trade-off:** Using path segments for "Date & Time" may require a slug map or encoding; slightly more logic than putting everything in query. **Mitigation:** Define a small mapping (category display name ↔ slug) and use it in one place when reading/writing URL.

## Migration Plan

1. Introduce routing and URL reading/writing without changing default UX: if no path/query, behave as today (default mode and first tool).
2. Add URL updates when user changes tab/category/tool so existing users see URLs appear as they navigate.
3. Add metadata updates. No data migration or rollback of app state; rollback is reverting the deploy and URLs will simply not be used for navigation on old version.

## Open Questions

- Exact path convention for Text Tools: one segment for category (e.g. `/TextTools/date-time`) vs two (e.g. `/TextTools/Date%20%26%20Time`). Recommend one segment with a fixed slug map for categories.
- Whether to add a "Share" or "Copy link" action that copies the current URL; out of scope for this design but natural follow-up.
