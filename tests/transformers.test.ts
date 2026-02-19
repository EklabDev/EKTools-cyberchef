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
    test('Timestamp to DateTime (default)', () => {
        expect(date.timestampToDatetime(0)).toContain('1970-01-01');
    });

    test('Timestamp to DateTime with inputUnit seconds', () => {
        const result = date.timestampToDatetime(1705305600, 'UTC', 'seconds');
        expect(result).toContain('2024-01-15');
    });

    test('Timestamp to DateTime with inputUnit milliseconds', () => {
        const result = date.timestampToDatetime(1705305600000, 'UTC', 'milliseconds');
        expect(result).toContain('2024-01-15');
    });

    test('Timestamp to DateTime with outputFormat preset', () => {
        const result = date.timestampToDatetime(0, 'UTC', undefined, 'us');
        expect(result).toBe('01/01/1970');
    });

    test('Datetime to Timestamp (default ms)', () => {
        const result = date.datetimeToTimestamp('2024-01-15T12:00:00.000Z');
        expect(Number(result)).toBe(1705320000000);
    });

    test('Datetime to Timestamp outputUnit seconds', () => {
        const result = date.datetimeToTimestamp('2024-01-15T12:00:00.000Z', 'UTC', undefined, 'seconds');
        expect(Number(result)).toBe(1705320000);
    });

    test('Datetime to Timestamp with inputFormat preset', () => {
        const result = date.datetimeToTimestamp('01/15/2024', 'UTC', 'us');
        expect(Number(result)).toBeGreaterThan(0);
    });

    test('datetimeAdd with amount + unit', () => {
        const result = date.datetimeAdd('2024-01-15T12:00:00.000Z', undefined, 'UTC', 3, 'days');
        expect(result).toContain('2024-01-18');
    });

    test('datetimeAdd with negative amount', () => {
        const result = date.datetimeAdd('2024-01-15T12:00:00.000Z', undefined, 'UTC', -2, 'hours');
        expect(result).toContain('10:00:00');
    });

    test('datetimeAdd backward compat with duration string', () => {
        const result = date.datetimeAdd('2024-01-15T12:00:00.000Z', '1 day', 'UTC');
        expect(result).toContain('2024-01-16');
    });

    test('datetimeDiff default units', () => {
        const result = date.datetimeDiff('2024-01-01T00:00:00Z', '2024-01-15T00:00:00Z');
        const obj = JSON.parse(result);
        expect(obj.days).toBe(14);
    });

    test('datetimeDiff custom units', () => {
        const result = date.datetimeDiff('2024-01-01T00:00:00Z', '2024-01-15T12:00:00Z', ['days', 'hours']);
        const obj = JSON.parse(result);
        expect(obj.days).toBe(14);
        expect(obj.hours).toBe(12);
    });

    test('datetimeFormat with inputFormat and preset output', () => {
        const result = date.datetimeFormat('15/01/2024', 'eu', 'UTC', 'eu');
        expect(result).toBe('15/01/2024');
    });

    test('datetimeFormat with custom Luxon output', () => {
        const result = date.datetimeFormat('2024-01-15T12:00:00.000Z', 'dd MMM yyyy', 'UTC');
        expect(result).toBe('15 Jan 2024');
    });

    test('validateFormat returns true for valid format', () => {
        expect(date.validateFormat('yyyy-MM-dd')).toBe(true);
    });

    test('validateFormat returns true for preset id', () => {
        expect(date.validateFormat('iso8601')).toBe(true);
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


