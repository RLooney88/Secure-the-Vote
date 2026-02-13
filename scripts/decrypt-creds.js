#!/usr/bin/env node
// Decrypt database credentials
// Usage: node scripts/decrypt-creds.js

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Use absolute paths
const encryptedPath = 'C:\\Users\\Roddy\\.openclaw\\workspace\\secrets\\roddy\\securethevote-database.json.enc';
const keyPath = 'C:\\Users\\Roddy\\.openclaw\\workspace\\.encryption-key';

// Read encrypted file
const encrypted = fs.readFileSync(encryptedPath, 'utf8').trim();

// Read encryption key
const key = fs.readFileSync(keyPath, 'utf8').trim();

// Decrypt using OpenClaw's gpg or openssl
// The file appears to be encrypted with OpenClaw's encryption system
// Let's try to decrypt using the workspace's decryption tool

try {
  // Try using OpenClaw's decryption if available
  const decrypted = execSync('op --decrypt', { 
    input: encrypted,
    encoding: 'utf8'
  }).toString();
  
  console.log(decrypted);
} catch (error) {
  // Fallback: decrypt using Node.js crypto if it's AES encrypted
  try {
    const [ivHex, authTagHex, encryptedText] = encrypted.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(key, 'base64'), iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    console.log(decrypted);
  } catch (cryptoError) {
    console.error('Failed to decrypt credentials');
    console.error('Error:', cryptoError.message);
    process.exit(1);
  }
}