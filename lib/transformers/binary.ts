import CRC32 from 'crc-32';
import ADLER32 from 'adler-32';

// Helper to convert string to byte array
function getBytes(input: string): Uint8Array {
    if (typeof Buffer !== 'undefined') {
        return new Uint8Array(Buffer.from(input, 'utf-8'));
    }
    return new TextEncoder().encode(input);
}

export function xor(input: string, key: string): string {
    const data = getBytes(input);
    const keyBytes = getBytes(key);
    if (keyBytes.length === 0) return input; // No key
    
    const result = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
        result[i] = data[i] ^ keyBytes[i % keyBytes.length];
    }
    
    // Return as Hex? Or Text?
    // "Binary Operations" often return Hex or Raw.
    // Prompt: "XOR (single byte or repeating key)"
    // Usually users want to see the result. If result is non-printable, Hex is safer.
    // But "Mini CyberChef" usually has "Output" as text unless converted.
    // Let's return Latin1 string to preserve bytes, or Hex.
    // Let's return Hex for binary operations by default?
    // Or return string if printable?
    // Let's return Hex encoded string for safety as XOR often produces garbage.
    // But if the user wants text back, they can use "Hex to Text".
    
    // Let's follow the "Mini CyberChef" UI pattern: Input (Text) -> Output (Text).
    // If I return raw bytes as string, it might be garbled.
    // I will return a Hex string to be safe, and the user can decode if they know it's text.
    // Wait, "Mini CyberChef" - if I XOR "ABC" with "A" (0x41), I get 00 03 02...
    
    // Actually, let's return a raw string (using Latin1/Binary string) so it can be piped?
    // But MCP output is JSON string.
    // Safest is Hex or Base64.
    // Let's stick to Hex for binary ops results.
    
    return Array.from(result).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function bitwiseOp(input: string, op: 'AND' | 'OR' | 'NOT', value?: string): string {
    const data = getBytes(input);
    const valBytes = value ? getBytes(value) : new Uint8Array(0);
    const result = new Uint8Array(data.length);
    
    for (let i = 0; i < data.length; i++) {
        const v = valBytes.length > 0 ? valBytes[i % valBytes.length] : 0;
        if (op === 'AND') result[i] = data[i] & v;
        else if (op === 'OR') result[i] = data[i] | v;
        else if (op === 'NOT') result[i] = ~data[i];
    }
    return Array.from(result).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function bitwiseShift(input: string, shift: number, direction: 'Left' | 'Right'): string {
    const data = getBytes(input);
    const result = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
        if (direction === 'Left') result[i] = (data[i] << shift) & 0xFF;
        else result[i] = (data[i] >> shift) & 0xFF;
    }
    return Array.from(result).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function crc32(input: string): string {
    // CRC32 returns signed int usually
    const val = CRC32.str(input);
    // Convert to unsigned hex
    return (val >>> 0).toString(16).toUpperCase();
}

export function adler32(input: string): string {
    const val = ADLER32.str(input);
    return (val >>> 0).toString(16).toUpperCase();
}


