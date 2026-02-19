import { z } from "zod";
import { ToolDefinition } from "./tools";
import { computeDiff } from "../lib/text-compare/diff-helper";

export const tools: ToolDefinition[] = [
  {
    name: "text_compare",
    description: "Compare two texts and show git-style diff from source and target perspectives.",
    inputSchema: z.object({
      input: z.string().describe("Source text"),
      target: z.string().describe("Target text"),
    }),
    handler: async (args) => {
      try {
        const result = computeDiff(args.input, args.target);
        const sourceLines = result.sourcePerspective
          .map(l => `${l.type === 'removed' ? '- ' : '  '}${l.text}`)
          .join('\n');
        const targetLines = result.targetPerspective
          .map(l => `${l.type === 'added' ? '+ ' : '  '}${l.text}`)
          .join('\n');
        return { output: `=== Source Perspective ===\n${sourceLines}\n\n=== Target Perspective ===\n${targetLines}` };
      } catch (e: any) {
        return { error: e.message };
      }
    },
  },
];
