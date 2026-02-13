// Local test script to verify login API logic
require('dotenv').config();

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Simulate environment
const DATABASE_URL = process.env.DATABASE_URL;
const JWT_SECRET = process.env.JWT_SECRET;

console.log('=== Environment Check ===');
console.log('DATABASE_URL set:', !!DATABASE_URL);
console.log('JWT_SECRET set:', !!JWT_SECRET);

if (!DATABASE_URL || !JWT_SECRET) {
  console.log('\n❌ Missing environment variables!');
  console.log('Please set DATABASE_URL and JWT_SECRET in .env file');
  process.exit(1);
}

async function testLogin() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('\n=== Testing Database Connection ===');
    await pool.query('SELECT 1');
    console.log('✅ Database connected successfully');

    console.log('\n=== Testing Admin Lookup ===');
    const result = await pool.query(
      'SELECT id, email, password_hash FROM admins WHERE email = $1',
      ['rlooney@rodericklooney.com']
    );

    if (result.rows.length === 0) {
      console.log('❌ Admin account not found!');
      process.exit(1);
    }

    const admin = result.rows[0];
    console.log('✅ Admin found:', admin.email);

    console.log('\n=== Testing Password ===');
    const testPassword = 'STVmd2026!';
    const validPassword = await bcrypt.compare(testPassword, admin.password_hash);
    
    if (validPassword) {
      console.log('✅ Password valid!');
    } else {
      console.log('❌ Password invalid!');
      process.exit(1);
    }

    console.log('\n=== Testing JWT Generation ===');
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    console.log('✅ JWT generated successfully');
    console.log('Token (first 50 chars):', token.substring(0, 50) + '...');

    console.log('\n🎉 All tests passed!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Code:', error.code);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testLogin();
