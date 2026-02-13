const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:xuDFleLFzoWrKvuMjcNCqFEuIjZAMriR@crossover.proxy.rlwy.net:37736/railway',
  ssl: { rejectUnauthorized: false }
});

async function test() {
  const r = await pool.query("SELECT email, password_hash FROM admins WHERE email = 'rlooney@rodericklooney.com'");
  if (r.rows.length === 0) { console.log('No admin found'); return; }
  console.log('Email:', r.rows[0].email);
  console.log('Hash:', r.rows[0].password_hash);
  const match = await bcrypt.compare('STVmd2026!', r.rows[0].password_hash);
  console.log('Password match:', match);
  await pool.end();
}
test().catch(e => { console.error(e); pool.end(); });
