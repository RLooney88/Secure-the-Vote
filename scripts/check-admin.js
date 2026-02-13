const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function checkAdmin() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    console.log('? Connected to database');
    
    const result = await client.query(
      'SELECT id, email, password_hash FROM admins WHERE email = $1',
      ['rlooney@rodericklooney.com']
    );
    
    if (result.rows.length === 0) {
      console.log('? Admin account NOT FOUND in database');
    } else {
      const admin = result.rows[0];
      console.log('? Admin account found:');
      console.log('  ID:', admin.id);
      console.log('  Email:', admin.email);
      console.log('  Password hash:', admin.password_hash.substring(0, 20) + '...');
      
      // Test password
      const testPassword = 'STVmd2026!';
      const isValid = await bcrypt.compare(testPassword, admin.password_hash);
      console.log('');
      console.log('Password test (STVmd2026!):', isValid ? '? VALID' : '? INVALID');
    }
  } catch (error) {
    console.log('? Database error:', error.message);
  } finally {
    await client.end();
  }
}

checkAdmin().catch(console.error);
