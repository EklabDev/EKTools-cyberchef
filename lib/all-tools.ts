import { tools as encodingTools } from "../mcp/encoding";
import { tools as cryptoTools } from "../mcp/crypto";
import { tools as convertTools } from "../mcp/convert";
import { tools as dateTools } from "../mcp/date";
import { tools as binaryTools } from "../mcp/binary";

export const allTools = [
  ...encodingTools.map(t => ({ ...t, category: 'Encoding' })),
  ...cryptoTools.map(t => ({ ...t, category: 'Encryption' })),
  ...convertTools.map(t => ({ ...t, category: 'Conversion' })),
  ...dateTools.map(t => ({ ...t, category: 'Date & Time' })),
  ...binaryTools.map(t => ({ ...t, category: 'Binary' })),
];


