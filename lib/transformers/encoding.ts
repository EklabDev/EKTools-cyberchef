import * as base32 from 'hi-base32';
import he from 'he';

/**
 * Encodes a string to Base64.
 * Handles UTF-8 characters correctly.
 */
export function base64Encode(input: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(input, 'utf-8').toString('base64');
  }
  return btoa(encodeURIComponent(input).replace(/%([0-9A-F]{2})/g,
    (match, p1) => String.fromCharCode(parseInt(p1, 16))
  ));
}

/**
 * Decodes a Base64 string to text.
 * Handles UTF-8 characters correctly.
 */
export function base64Decode(input: string): string {
  try {
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(input, 'base64').toString('utf-8');
    }
    return decodeURIComponent(Array.prototype.map.call(atob(input), (c: string) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  } catch (e) {
    throw new Error('Invalid Base64 string');
  }
}

export function base32Encode(input: string): string {
  return base32.encode(input);
}

export function base32Decode(input: string): string {
  try {
    return base32.decode(input);
  } catch (e) {
    throw new Error('Invalid Base32 string');
  }
}

export function urlEncode(input: string): string {
  return encodeURIComponent(input);
}

export function urlDecode(input: string): string {
  return decodeURIComponent(input);
}

export function htmlEntityEncode(input: string): string {
  return he.encode(input);
}

export function htmlEntityDecode(input: string): string {
  return he.decode(input);
}

export function textToHex(input: string): string {
  let result = '';
  for (let i = 0; i < input.length; i++) {
    const hex = input.charCodeAt(i).toString(16);
    result += ('000' + hex).slice(-4).substr(2); // Simple UTF-16 hex? Or UTF-8?
    // Requirement says "Hex <-> UTF-8 text"
    // If we want UTF-8 hex, we need to encode to bytes first.
  }
  // Better approach for UTF-8 Hex:
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(input, 'utf-8').toString('hex');
  }
  // Browser polyfill for UTF-8 Hex
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  return Array.from(data).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function hexToText(input: string): string {
  // Remove spaces/newlines
  const cleanInput = input.replace(/\s/g, '');
  if (cleanInput.length % 2 !== 0) throw new Error('Invalid hex string length');
  
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(cleanInput, 'hex').toString('utf-8');
  }
  
  const bytes = new Uint8Array(cleanInput.length / 2);
  for (let i = 0; i < cleanInput.length; i += 2) {
    bytes[i / 2] = parseInt(cleanInput.substr(i, 2), 16);
  }
  const decoder = new TextDecoder('utf-8');
  return decoder.decode(bytes);
}

export function binaryToText(input: string): string {
    // Input is a string of 0s and 1s, maybe space separated
    const cleanInput = input.replace(/[\s]/g, '');
    if (!/^[01]*$/.test(cleanInput)) throw new Error('Invalid binary string');
    if (cleanInput.length % 8 !== 0) throw new Error('Binary string length must be multiple of 8');
    
    const byteCount = cleanInput.length / 8;
    const bytes = new Uint8Array(byteCount);
    for (let i = 0; i < byteCount; i++) {
        bytes[i] = parseInt(cleanInput.substr(i * 8, 8), 2);
    }
    
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(bytes);
}

export function textToBinary(input: string): string {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(input);
    let result = '';
    for (let i = 0; i < bytes.length; i++) {
        result += bytes[i].toString(2).padStart(8, '0') + ' ';
    }
    return result.trim();
}


