// Script to encrypt admin password for storage
// Usage: node scripts/encrypt-secrets.js <password>

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Read encryption key
const keyPath = path.join(__dirname, '..', '.encryption-key');
const key = fs.readFileSync(keyPath, 'utf8').trim();

// Encryption function
function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key, 'base64'), iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

// Get password from command line or generate secure one
const password = process.argv[2] || crypto.randomBytes(32).toString('hex');

console.log('\n=== SecureTheVote Admin Password ===\n');
console.log('Password:', password);
console.log('Email: rlooney@rodericklooney.com\n');

const encrypted = encrypt(password);
console.log('Encrypted:', encrypted);

// Save to file
const secretsDir = path.join(process.env.HOME || process.env.USERPROFILE, '.openclaw', 'secrets', 'roddy');
const secretsPath = path.join(secretsDir, 'securethevote-admin-password.txt');

if (!fs.existsSync(secretsDir)) {
  fs.mkdirSync(secretsDir, { recursive: true });
}

fs.writeFileSync(secretsPath, encrypted);
console.log('\nSaved to:', secretsPath);
console.log('\n⚠️  Keep this password safe! You will need it to log in.\n');