import { z } from "zod";

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: z.ZodType<any>;
  handler: (args: any) => Promise<{ output: string } | { error: string }>;
}


