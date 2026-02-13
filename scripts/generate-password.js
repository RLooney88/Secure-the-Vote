#!/usr/bin/env node
// Generate and save admin password
// Usage: node scripts/generate-password.js

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Read encryption key
const keyPath = path.join(__dirname, '..', '.encryption-key');
let keyBuffer;
try {
  const keyStr = fs.readFileSync(keyPath, 'utf8').trim();
  // Key should be base64 encoded, decode to get 32 bytes
  keyBuffer = Buffer.from(keyStr, 'base64');
  if (keyBuffer.length !== 32) {
    // If not 32 bytes, hash it to get 32 bytes
    keyBuffer = crypto.createHash('sha256').update(keyStr).digest();
  }
} catch (e) {
  console.error('Encryption key not found. Using default key.');
  keyBuffer = crypto.createHash('sha256').update('default-key-replace-in-production').digest();
}

// Encrypt function
function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

console.log('\n=== Generate Admin Password ===\n');

// Generate secure password
const password = crypto.randomBytes(32).toString('hex');

console.log('Generated Password:', password);

// Encrypt and save
const encrypted = encrypt(password);
const secretsDir = path.join(process.env.HOME || process.env.USERPROFILE, '.openclaw', 'secrets', 'roddy');
const secretsPath = path.join(secretsDir, 'securethevote-admin-password.txt');

if (!fs.existsSync(secretsDir)) {
  fs.mkdirSync(secretsDir, { recursive: true });
}

fs.writeFileSync(secretsPath, encrypted);

console.log('Encrypted Password:', encrypted);
console.log('Saved to:', secretsPath);
console.log('\n⚠️  Save this password securely!\n');