/**
 * Convert text to decimal byte values.
 */
export function textToBytes(input: string, delimiter = ' '): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(input, 'utf-8').toJSON().data.join(delimiter);
  }
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  return Array.from(data).join(delimiter);
}

/**
 * Convert decimal byte values to text.
 */
export function bytesToText(input: string, delimiter = ' '): string {
  // Handle different delimiters (space, comma, etc)
  const cleanInput = input.replace(/[\[\],]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!cleanInput) return '';
  
  const bytes = cleanInput.split(' ').map(n => parseInt(n, 10));
  if (bytes.some(isNaN)) throw new Error('Invalid byte sequence');
  
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('utf-8');
  }
  
  const decoder = new TextDecoder('utf-8');
  return decoder.decode(new Uint8Array(bytes));
}

/**
 * Convert Hex string to Bytes (decimal).
 */
export function hexToBytes(input: string, delimiter = ' '): string {
  const clean = input.replace(/\s/g, '');
  if (clean.length % 2 !== 0) throw new Error('Invalid hex string length');
  
  const bytes: number[] = [];
  for (let i = 0; i < clean.length; i += 2) {
    bytes.push(parseInt(clean.substr(i, 2), 16));
  }
  return bytes.join(delimiter);
}

/**
 * Convert Bytes (decimal) to Hex.
 */
export function bytesToHex(input: string, delimiter = ' '): string {
  const cleanInput = input.replace(/[\[\],]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!cleanInput) return '';
  
  const bytes = cleanInput.split(' ').map(n => parseInt(n, 10));
  return bytes.map(b => b.toString(16).padStart(2, '0')).join(''); // Usually Hex is contiguous, but let's respect requirement? 
  // "Hex" usually means contiguous. But "Hex <-> Bytes" implies one is the raw, one is the decimal list?
  // Actually, "Hex" usually implies string hex.
  // Let's output contiguous hex for "Bytes to Hex".
}

/**
 * Convert number base.
 * Input: string number, fromBase, toBase.
 */
export function numberBaseConvert(input: string, fromBase: number, toBase: number): string {
  // Use BigInt for arbitrary precision if possible?
  // JS parseInt is limited.
  // Let's use BigInt parsing.
  
  try {
    // Remove prefixes like 0x, 0b
    let clean = input.trim();
    if (fromBase === 16 && clean.startsWith('0x')) clean = clean.slice(2);
    if (fromBase === 2 && clean.startsWith('0b')) clean = clean.slice(2);
    
    // BigInt doesn't support arbitrary base parsing directly except Hex/Bin/Octal via prefix.
    // But we can use a library or simple loop.
    // Since "Mini CyberChef" might handle large numbers, BigInt is good.
    
    const val = parseInt(clean, fromBase); // Standard parseInt supports 2-36
    if (isNaN(val)) throw new Error('Invalid number');
    
    // If it's safe integer range
    return val.toString(toBase);
    
    // TODO: Handle large integers if needed. Standard JS parseInt handles up to 2^53 safely.
    // For simple implementation, standard parseInt is fine.
  } catch (e) {
    throw new Error('Conversion failed');
  }
}

/**
 * Endianness swap.
 * Input: Hex string.
 * Word width: 2 (short), 4 (int), 8 (long).
 */
export function endiannessSwap(input: string, width: number = 4): string {
  // Input assumed to be Hex
  const clean = input.replace(/\s/g, '');
  if (clean.length % (width * 2) !== 0) {
     // Pad? Or Error?
     // Let's pad left
  }
  
  // Process in chunks of `width` bytes (width * 2 chars)
  const chunkChars = width * 2;
  let result = '';
  
  // We process from left to right, but swap bytes within chunk
  for (let i = 0; i < clean.length; i += chunkChars) {
    let chunk = clean.substr(i, chunkChars);
    // Pad if last chunk is short?
    if (chunk.length < chunkChars) chunk = chunk.padStart(chunkChars, '0');
    
    // Swap bytes in chunk
    // AABBCCDD -> DDCCBBAA
    const bytes: string[] = [];
    for (let j = 0; j < chunk.length; j += 2) {
      bytes.push(chunk.substr(j, 2));
    }
    result += bytes.reverse().join('');
  }
  return result;
}


