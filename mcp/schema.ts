import { z } from "zod";
import { ToolDefinition } from "./tools";
import * as transformers from "../lib/transformers/schema";

export const tools: ToolDefinition[] = [
  {
    name: "json_schema_to_typescript",
    description: "Convert JSON Schema to TypeScript Interface.",
    inputSchema: z.object({
      input: z.string().describe("JSON Schema string"),
      name: z.string().default("MySchema").optional()
    }),
    handler: async (args) => {
      try {
        return { output: await transformers.jsonSchemaToTypescript(args.input, args.name) };
      } catch (e: any) { return { error: e.message }; }
    }
  },
  {
    name: "json_schema_to_zod",
    description: "Convert JSON Schema to Zod Schema code.",
    inputSchema: z.object({
      input: z.string().describe("JSON Schema string"),
      name: z.string().default("schema").optional()
    }),
    handler: async (args) => {
      try {
        return { output: transformers.jsonSchemaToZodSchema(args.input, args.name) };
      } catch (e: any) { return { error: e.message }; }
    }
  },
  {
    name: "zod_to_json_schema",
    description: "Convert Zod Schema code to JSON Schema. Input must be an expression evaluating to a Zod schema (e.g. `z.object(...)`).",
    inputSchema: z.object({
      input: z.string().describe("Zod code expression")
    }),
    handler: async (args) => {
      try {
        return { output: transformers.zodCodeToJsonSchema(args.input) };
      } catch (e: any) { return { error: e.message }; }
    }
  }
];



