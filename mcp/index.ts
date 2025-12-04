import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { tools as encodingTools } from "./encoding";
import { tools as cryptoTools } from "./crypto";
import { tools as convertTools } from "./convert";
import { tools as dateTools } from "./date";
import { tools as binaryTools } from "./binary";
import { ToolDefinition } from "./tools";
import { zodToJsonSchema } from "zod-to-json-schema";

const allTools: ToolDefinition[] = [
  ...encodingTools,
  ...cryptoTools,
  ...convertTools,
  ...dateTools,
  ...binaryTools
];

const server = new Server(
  {
    name: "mini-cyberchef",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: allTools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: zodToJsonSchema(tool.inputSchema as any) as any,
    })),
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const tool = allTools.find((t) => t.name === request.params.name);
  if (!tool) {
    throw new Error("Tool not found");
  }

  try {
    // Validate arguments
    const args = tool.inputSchema.parse(request.params.arguments);
    
    const result = await tool.handler(args);
    
    // Return JSON string as requested
    if ('error' in result) {
        // The prompt says: Each tool must return JSON: { success: false, error: string }
        // MCP protocol expects content list. We put the JSON in the text.
        return {
            content: [{ type: "text", text: JSON.stringify({ success: false, error: result.error }) }],
            isError: true // signal error to client
        };
    }

    return {
        content: [{ type: "text", text: JSON.stringify({ success: true, output: result.output }) }],
    };
  } catch (e: any) {
      return {
          content: [{ type: "text", text: JSON.stringify({ success: false, error: e.message }) }],
          isError: true
      };
  }
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Mini CyberChef MCP Server running on stdio");
}

runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});


