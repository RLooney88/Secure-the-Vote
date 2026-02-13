#!/usr/bin/env node
// Verify Admin Dashboard Setup
// Usage: node scripts/verify-setup.js

const fs = require('fs');
const path = require('path');

console.log('\n=== SecureTheVote Admin Dashboard Verification ===\n');

const checks = [
  {
    name: 'schema.sql',
    path: path.join(__dirname, '..', 'schema.sql'),
    required: true
  },
  {
    name: 'api/admin/_auth.js',
    path: path.join(__dirname, '..', 'api', 'admin', '_auth.js'),
    required: true
  },
  {
    name: 'api/admin/login.js',
    path: path.join(__dirname, '..', 'api', 'admin', 'login.js'),
    required: true
  },
  {
    name: 'api/admin/signatures.js',
    path: path.join(__dirname, '..', 'api', 'admin', 'signatures.js'),
    required: true
  },
  {
    name: 'api/admin/export.js',
    path: path.join(__dirname, '..', 'api', 'admin', 'export.js'),
    required: true
  },
  {
    name: 'api/admin/setup.js',
    path: path.join(__dirname, '..', 'api', 'admin', 'setup.js'),
    required: true
  },
  {
    name: 'api/petition/submit.js',
    path: path.join(__dirname, '..', 'api', 'petition', 'submit.js'),
    required: true
  },
  {
    name: 'public/admin/index.html',
    path: path.join(__dirname, '..', 'public', 'admin', 'index.html'),
    required: true
  },
  {
    name: 'public/css/admin.css',
    path: path.join(__dirname, '..', 'public', 'css', 'admin.css'),
    required: true
  },
  {
    name: 'public/js/admin.js',
    path: path.join(__dirname, '..', 'public', 'js', 'admin.js'),
    required: true
  },
  {
    name: 'ADMIN_SETUP.md',
    path: path.join(__dirname, '..', 'ADMIN_SETUP.md'),
    required: true
  },
  {
    name: 'scripts/setup-admin.js',
    path: path.join(__dirname, '..', 'scripts', 'setup-admin.js'),
    required: true
  }
];

let allPassed = true;

for (const check of checks) {
  const exists = fs.existsSync(check.path);
  const status = exists ? '✓' : '✗';
  
  if (exists) {
    console.log(`${status} ${check.name}`);
  } else {
    console.log(`${status} ${check.name} - MISSING!`);
    if (check.required) allPassed = false;
  }
}

console.log('\n--- Environment Variables Check ---\n');

const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];

for (const varName of requiredEnvVars) {
  const exists = process.env[varName];
  const status = exists ? '✓' : '✗';
  
  if (exists) {
    console.log(`${status} ${varName} is set`);
  } else {
    console.log(`${status} ${varName} is NOT set - add to Vercel environment variables`);
    allPassed = false;
  }
}

console.log('\n--- Summary ---\n');

if (allPassed) {
  console.log('✓ All files and configurations are in place!');
  console.log('\nNext steps:');
  console.log('1. Run schema.sql in Railway Postgres');
  console.log('2. Run: node scripts/setup-admin.js');
  console.log('3. Deploy to Vercel');
} else {
  console.log('✗ Some items are missing. Please complete the setup steps.');
}

console.log('\n');