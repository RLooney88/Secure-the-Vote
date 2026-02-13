#!/usr/bin/env node
// Setup Admin Account Script
// Run this to create the initial admin account
// Usage: node scripts/setup-admin.js

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Configuration
const ADMIN_EMAIL = 'rlooney@rodericklooney.com';

// Generate secure password
function generatePassword(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

// Encrypt password for storage
function encrypt(text, keyPath = path.join(__dirname, '..', '.encryption-key')) {
  let keyBuffer;
  try {
    const keyStr = fs.readFileSync(keyPath, 'utf8').trim();
    keyBuffer = Buffer.from(keyStr, 'base64');
    if (keyBuffer.length !== 32) {
      keyBuffer = crypto.createHash('sha256').update(keyStr).digest();
    }
  } catch (e) {
    keyBuffer = crypto.createHash('sha256').update('default-key').digest();
  }
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

async function main() {
  console.log('\n=== SecureTheVote Admin Setup ===\n');
  
  // Get database URL
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('Error: DATABASE_URL environment variable not set');
    console.log('Please set it first: export DATABASE_URL="postgresql://..."');
    process.exit(1);
  }
  
  // Generate password
  const password = generatePassword();
  console.log('Generated admin credentials:');
  console.log('  Email:', ADMIN_EMAIL);
  console.log('  Password:', password);
  
  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);
  
  // Connect to database
  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    console.log('\nConnected to database...');
    
    // Create admins table
    await client.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Ensured admins table exists');
    
    // Insert admin (upsert)
    const result = await client.query(
      `INSERT INTO admins (email, password_hash)
       VALUES ($1, $2)
       ON CONFLICT (email) DO UPDATE SET password_hash = $2
       RETURNING id, email, created_at`,
      [ADMIN_EMAIL.toLowerCase(), passwordHash]
    );
    
    console.log('Admin account created/updated');
    console.log('  ID:', result.rows[0].id);
    console.log('  Created:', result.rows[0].created_at);
    
    // Save encrypted password
    const encryptedPassword = encrypt(password);
    const secretsDir = path.join(process.env.HOME || process.env.USERPROFILE, '.openclaw', 'secrets', 'roddy');
    const secretsPath = path.join(secretsDir, 'securethevote-admin-password.txt');
    
    if (!fs.existsSync(secretsDir)) {
      fs.mkdirSync(secretsDir, { recursive: true });
    }
    
    fs.writeFileSync(secretsPath, encryptedPassword);
    console.log('\nEncrypted password saved to:');
    console.log(' ', secretsPath);
    
    console.log('\n=== Setup Complete ===\n');
    console.log('⚠️  IMPORTANT: Save this password securely!');
    console.log('   You will need it to log in to the admin dashboard.\n');
    
  } catch (error) {
    console.error('Setup failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main().catch(console.error);