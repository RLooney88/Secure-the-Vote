const bcrypt = require('bcryptjs');
const { Client } = require('pg');

async function updatePassword() {
  const password = 'STVmd2026!';
  const email = 'rlooney@rodericklooney.com';
  
  const passwordHash = await bcrypt.hash(password, 10);
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    
    const result = await client.query(
      'UPDATE admins SET password_hash = $1 WHERE email = $2 RETURNING id, email',
      [passwordHash, email]
    );
    
    if (result.rowCount > 0) {
      console.log('? Password updated successfully');
      console.log('  Email:', result.rows[0].email);
      console.log('  New Password: STVmd2026!');
    } else {
      console.log('? Admin not found');
    }
  } finally {
    await client.end();
  }
}

updatePassword().catch(console.error);
