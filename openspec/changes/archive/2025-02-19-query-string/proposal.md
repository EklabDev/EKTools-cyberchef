## Why

The site currently only supports navigation by clicking tabs and tools on the page. There is no way to deep-link to a specific tab or tool, share a direct link, or have the URL reflect the current context. For growth (sharing, bookmarks, SEO, and embedding), the site needs URL-driven navigation: paths and query parameters that identify the active section and tool, with state and URL kept in sync and page metadata (title, description) updated to match the current tool or category.

## What Changes

- **URL structure**: Introduce path and query parameters so users can land directly on a section and tool.
  - **Text Tools**: `baseUrl/TextTools/Date&Time?tool=datetime_format` — path encodes section and category (e.g. "Date & Time"), query encodes tool id (e.g. `datetime_format`).
  - **Image Tools**: `baseUrl/ImageTools?operation=Vectorize` — path for section, query for operation.
  - **Schema Mapper**: `baseUrl/SchemaMapper?source=Typescript&target=JSON%20Schema` — path for section, query for source and target formats.
- **State ↔ URL sync**: The URL is the source of truth for initial load (path + query drive which tab, category, and tool are shown). User actions that change tab, category, or tool update the URL (e.g. via `history.replaceState` or Next.js router) so the address bar always reflects the current context. Browser back/forward should follow URL changes where appropriate.
- **Metadata from context**: When the URL (or in-app state that mirrors it) changes, update document title and relevant meta tags (e.g. description) to match the current section/tool (e.g. "Date & Time – datetime_format | EK Tools").
- No breaking changes to existing tool behavior; this is additive (routing and metadata layer on top of current UI).

## Capabilities

### New Capabilities

- `url-navigation`: Deep-linkable URLs (path + query) that identify the active section, category/tool or operation, and (for Schema Mapper) source/target. State and URL stay in sync on load and on user interaction. Covers URL design, read on load, and write on state change (including back/forward handling where applicable).
- `metadata-from-context`: Page metadata (title, optional description) is derived from the current URL/context (section and tool or operation) and updated whenever the effective context changes.

### Modified Capabilities

- *(none)*

## Impact

- **App entry and layout**: `app/page.tsx` and any future route structure (e.g. Next.js App Router dynamic segments or a single page with search params). Need to read path/query on load and render the correct mode and tool.
- **State**: Current `mode` (text | image | schema), CyberChef’s `selectedCategory` and `selectedToolName`, ImageTools’ selected operation, and SchemaMapper’s source/target will be initialised from URL and kept in sync with URL on change.
- **Routing**: Use of Next.js router (or equivalent) for path and search params, and for updating URL on tab/tool/operation changes without full reload.
- **Metadata**: Use of Next.js metadata API or imperative document title/meta updates so title and description reflect the current section and tool/operation.
- **Dependencies**: No new external dependencies required; use existing Next.js routing and metadata facilities.
