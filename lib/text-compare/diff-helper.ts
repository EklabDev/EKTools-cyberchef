import { diffLines, Change } from 'diff';

export interface DiffLine {
  text: string;
  type: 'added' | 'removed' | 'unchanged';
}

export interface DiffResult {
  sourcePerspective: DiffLine[];
  targetPerspective: DiffLine[];
}

const MAX_INPUT_SIZE = 100_000;

export function computeDiff(source: string, target: string): DiffResult {
  if (source.length > MAX_INPUT_SIZE || target.length > MAX_INPUT_SIZE) {
    throw new Error(`Input too large. Max ${MAX_INPUT_SIZE / 1000}K characters per side.`);
  }

  const changes: Change[] = diffLines(source, target);

  const sourcePerspective: DiffLine[] = [];
  const targetPerspective: DiffLine[] = [];

  for (const change of changes) {
    const lines = splitIntoLines(change.value);

    if (change.added) {
      for (const line of lines) {
        targetPerspective.push({ text: line, type: 'added' });
      }
    } else if (change.removed) {
      for (const line of lines) {
        sourcePerspective.push({ text: line, type: 'removed' });
      }
    } else {
      for (const line of lines) {
        sourcePerspective.push({ text: line, type: 'unchanged' });
        targetPerspective.push({ text: line, type: 'unchanged' });
      }
    }
  }

  return { sourcePerspective, targetPerspective };
}

function splitIntoLines(text: string): string[] {
  if (!text) return [];
  const lines = text.split('\n');
  if (lines[lines.length - 1] === '') lines.pop();
  return lines;
}
