import * as encoding from '../lib/transformers/encoding';
import * as crypto from '../lib/transformers/crypto';
import * as convert from '../lib/transformers/convert';
import * as date from '../lib/transformers/date';
import * as binary from '../lib/transformers/binary';

describe('Encoding', () => {
  test('Base64 Encode/Decode', () => {
    const txt = 'Hello World';
    const enc = encoding.base64Encode(txt);
    expect(enc).toBe('SGVsbG8gV29ybGQ=');
    expect(encoding.base64Decode(enc)).toBe(txt);
  });
  
  test('Hex to Text', () => {
      expect(encoding.textToHex('ABC')).toBe('414243');
      expect(encoding.hexToText('414243')).toBe('ABC');
  });
});

describe('Crypto', () => {
    test('SHA256', () => {
        expect(crypto.shaHash('abc', 'SHA256')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
    });
    
    test('AES Encrypt/Decrypt', () => {
        const msg = "Secret Message";
        const key = "MySecretKey";
        const enc = crypto.aesEncrypt(msg, key);
        const dec = crypto.aesDecrypt(enc, key);
        expect(dec).toBe(msg);
    });
});

describe('Convert', () => {
    test('Text to Bytes', () => {
        expect(convert.textToBytes('ABC')).toBe('65 66 67');
    });
    test('Bytes to Text', () => {
        expect(convert.bytesToText('65 66 67')).toBe('ABC');
    });
});

describe('Date', () => {
    test('Timestamp to DateTime', () => {
        // 0 is 1970-01-01T00:00:00.000Z
        expect(date.timestampToDatetime(0)).toContain('1970-01-01');
    });
});

describe('Binary', () => {
    test('XOR', () => {
        // 'A' is 0x41 (01000001)
        // Key ' ' (space) is 0x20 (00100000)
        // XOR -> 0x61 ('a')
        expect(binary.xor('A', ' ')).toBe('61');
    });
});


