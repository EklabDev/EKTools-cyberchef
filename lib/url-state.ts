export type AppMode = 'text' | 'image' | 'schema';

const SECTION_TO_MODE: Record<string, AppMode> = {
  'TextTools': 'text',
  'ImageTools': 'image',
  'SchemaMapper': 'schema',
};

const MODE_TO_SECTION: Record<AppMode, string> = {
  'text': 'TextTools',
  'image': 'ImageTools',
  'schema': 'SchemaMapper',
};

const CATEGORY_TO_SLUG: Record<string, string> = {
  'Encoding': 'Encoding',
  'Encryption': 'Encryption',
  'Conversion': 'Conversion',
  'Date & Time': 'Date&Time',
  'Binary': 'Binary',
  'Schema': 'Schema',
  'Text compare': 'TextCompare',
};

const SLUG_TO_CATEGORY: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_TO_SLUG).map(([display, slug]) => [slug.toLowerCase(), display])
);

export interface UrlState {
  mode: AppMode;
  category?: string;
  tool?: string;
  operation?: string;
  source?: string;
  target?: string;
}

export function parseUrlState(): UrlState {
  if (typeof window === 'undefined') return { mode: 'text' };

  const segments = window.location.pathname.split('/').filter(Boolean).map(s => decodeURIComponent(s));
  const params = new URLSearchParams(window.location.search);
  const mode = SECTION_TO_MODE[segments[0] ?? ''] ?? 'text';
  const state: UrlState = { mode };

  if (mode === 'text') {
    const catSlug = segments[1];
    if (catSlug) state.category = SLUG_TO_CATEGORY[catSlug.toLowerCase()];
    const tool = params.get('tool');
    if (tool) state.tool = tool;
  } else if (mode === 'image') {
    const op = params.get('operation');
    if (op) state.operation = op;
  } else if (mode === 'schema') {
    const src = params.get('source');
    const tgt = params.get('target');
    if (src) state.source = src;
    if (tgt) state.target = tgt;
  }

  return state;
}

export function setUrlState(state: UrlState): void {
  const section = MODE_TO_SECTION[state.mode];
  let path = `/${section}`;
  const params = new URLSearchParams();

  if (state.mode === 'text') {
    if (state.category) {
      path += `/${CATEGORY_TO_SLUG[state.category] ?? state.category}`;
    }
    if (state.tool) params.set('tool', state.tool);
  } else if (state.mode === 'image') {
    if (state.operation) params.set('operation', state.operation);
  } else if (state.mode === 'schema') {
    if (state.source) params.set('source', state.source);
    if (state.target) params.set('target', state.target);
  }

  const qs = params.toString();
  const url = qs ? `${path}?${qs}` : path;
  window.history.replaceState(null, '', url);
}

export function buildTitle(state: UrlState): string {
  const base = 'EK Tools';

  if (state.mode === 'text') {
    const parts: string[] = ['Text Tools'];
    if (state.category) parts.push(state.category);
    if (state.tool) parts.push(state.tool);
    return `${parts.join(' – ')} | ${base}`;
  }
  if (state.mode === 'image') {
    const parts: string[] = ['Image Tools'];
    if (state.operation) parts.push(state.operation);
    return `${parts.join(' – ')} | ${base}`;
  }
  if (state.mode === 'schema') {
    const parts: string[] = ['Schema Mapper'];
    if (state.source && state.target) parts.push(`${state.source} → ${state.target}`);
    return `${parts.join(' – ')} | ${base}`;
  }

  return base;
}
