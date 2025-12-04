import CryptoJS from 'crypto-js';
import forge from 'node-forge';

export type HashAlgo = 'SHA1' | 'SHA256' | 'SHA512' | 'MD5';

export function shaHash(input: string, algo: HashAlgo): string {
  switch (algo) {
    case 'SHA1': return CryptoJS.SHA1(input).toString();
    case 'SHA256': return CryptoJS.SHA256(input).toString();
    case 'SHA512': return CryptoJS.SHA512(input).toString();
    case 'MD5': return CryptoJS.MD5(input).toString();
    default: throw new Error(`Unsupported hash algorithm: ${algo}`);
  }
}

export function hmac(input: string, key: string, algo: HashAlgo): string {
  switch (algo) {
    case 'SHA1': return CryptoJS.HmacSHA1(input, key).toString();
    case 'SHA256': return CryptoJS.HmacSHA256(input, key).toString();
    case 'SHA512': return CryptoJS.HmacSHA512(input, key).toString();
    case 'MD5': return CryptoJS.HmacMD5(input, key).toString();
    default: throw new Error(`Unsupported hash algorithm: ${algo}`);
  }
}

export function aesEncrypt(input: string, key: string, iv: string = '', mode: 'CBC' | 'CTR' = 'CBC'): string {
  const opts: any = {
    mode: mode === 'CTR' ? CryptoJS.mode.CTR : CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  };
  
  if (iv) {
    // RAW MODE: Key must be 128/192/256 bits. We use SHA256(key) -> 256 bits.
    const keyHash = CryptoJS.SHA256(key); 
    // IV must be 128 bits (16 bytes).
    // If user provides string, we treat as UTF-8.
    // If it's not 16 bytes, we might need to pad or hash.
    // Let's use MD5(iv) -> 128 bits for simplicity to ensure it works?
    // Or just Parse Utf8.
    const ivWA = CryptoJS.enc.Utf8.parse(iv);
    
    opts.iv = ivWA;
    const encrypted = CryptoJS.AES.encrypt(input, keyHash, opts);
    // Return Base64 of Ciphertext
    return encrypted.ciphertext.toString(CryptoJS.enc.Base64);
  } else {
    // PASSPHRASE MODE
    const encrypted = CryptoJS.AES.encrypt(input, key, opts);
    return encrypted.toString(); // OpenSSL format (Salted...)
  }
}

export function aesDecrypt(input: string, key: string, iv: string = '', mode: 'CBC' | 'CTR' = 'CBC'): string {
  const opts: any = {
    mode: mode === 'CTR' ? CryptoJS.mode.CTR : CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  };

  if (iv) {
    const keyHash = CryptoJS.SHA256(key);
    const ivWA = CryptoJS.enc.Utf8.parse(iv);
    opts.iv = ivWA;
    
    // Input is assumed Base64 ciphertext
    const decrypted = CryptoJS.AES.decrypt(input, keyHash, opts);
    return decrypted.toString(CryptoJS.enc.Utf8);
  } else {
    // PASSPHRASE MODE
    const decrypted = CryptoJS.AES.decrypt(input, key, opts);
    return decrypted.toString(CryptoJS.enc.Utf8);
  }
}

export function rsaEncrypt(input: string, publicKeyPem: string): string {
  try {
    const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
    const encrypted = publicKey.encrypt(input, 'RSA-OAEP');
    return forge.util.encode64(encrypted);
  } catch (e: any) {
    throw new Error('RSA Encrypt failed: ' + e.message);
  }
}

export function rsaDecrypt(input: string, privateKeyPem: string): string {
  try {
    const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
    const decoded = forge.util.decode64(input);
    const decrypted = privateKey.decrypt(decoded, 'RSA-OAEP');
    return decrypted;
  } catch (e: any) {
    throw new Error('RSA Decrypt failed: ' + e.message);
  }
}
