// Database migration script for SecureTheVote CMS
const { Pool } = require('pg');

async function runMigrations() {
  const pool = new Pool({
    connectionString: (process.env.DATABASE_URL || '').trim(),
    ssl: { rejectUnauthorized: false },
    max: 1
  });

  try {
    console.log('🔄 Starting database migrations...');

    // Blog posts table
    console.log('Creating posts table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        slug VARCHAR(500) NOT NULL UNIQUE,
        content TEXT,
        excerpt TEXT,
        category VARCHAR(100) DEFAULT 'uncategorized',
        post_type VARCHAR(50) DEFAULT 'article',
        external_url TEXT,
        featured_image TEXT,
        seo_title VARCHAR(200),
        seo_description VARCHAR(500),
        og_image TEXT,
        status VARCHAR(20) DEFAULT 'draft',
        author_email VARCHAR(255),
        published_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Banner slides table
    console.log('Creating banner_slides table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS banner_slides (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        link_url TEXT,
        link_text VARCHAR(100) DEFAULT 'Discover more',
        background_image TEXT,
        sort_order INTEGER DEFAULT 0,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Site settings table
    console.log('Creating site_settings table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        key VARCHAR(100) PRIMARY KEY,
        value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Petitions table
    console.log('Creating petitions table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS petitions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        active BOOLEAN DEFAULT true,
        fields JSONB DEFAULT '["full_name","email","zip_code"]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert default banner toggle setting
    console.log('Setting default banner toggle...');
    await pool.query(`
      INSERT INTO site_settings (key, value, updated_at)
      VALUES ('banner_enabled', 'true', CURRENT_TIMESTAMP)
      ON CONFLICT (key) DO NOTHING
    `);

    console.log('✅ All migrations completed successfully!');
    console.log('\nTables created:');
    console.log('  - posts');
    console.log('  - banner_slides');
    console.log('  - site_settings');
    console.log('  - petitions');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end().catch(() => {});
  }
}

// Run migrations
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('\n✨ Migration complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Migration error:', error.message);
      process.exit(1);
    });
}

module.exports = { runMigrations };
