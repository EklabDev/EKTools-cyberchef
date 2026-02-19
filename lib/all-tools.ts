import { tools as encodingTools } from "../mcp/encoding";
import { tools as cryptoTools } from "../mcp/crypto";
import { tools as convertTools } from "../mcp/convert";
import { tools as dateTools } from "../mcp/date";
import { tools as binaryTools } from "../mcp/binary";
import { tools as schemaTools } from "../mcp/schema";
import { tools as textCompareTools } from "../mcp/text-compare";

export const allTools = [
  ...encodingTools.map(t => ({ ...t, category: 'Encoding' })),
  ...cryptoTools.map(t => ({ ...t, category: 'Encryption' })),
  ...convertTools.map(t => ({ ...t, category: 'Conversion' })),
  ...dateTools.map(t => ({ ...t, category: 'Date & Time' })),
  ...binaryTools.map(t => ({ ...t, category: 'Binary' })),
  ...schemaTools.map(t => ({ ...t, category: 'Schema' })),
  ...textCompareTools.map(t => ({ ...t, category: 'Text compare' })),
];


