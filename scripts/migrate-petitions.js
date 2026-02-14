// Migration script to upgrade petition system to match SpeakOut! Pro features
const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:xuDFleLFzoWrKvuMjcNCqFEuIjZAMriR@crossover.proxy.rlwy.net:37736/railway';

const pool = new Pool({
  connectionString: DATABASE_URL.trim(),
  ssl: { rejectUnauthorized: false },
  max: 1
});

async function migrate() {
  console.log('🔄 Starting petition system migration...\n');

  try {
    // 1. Alter petitions table
    console.log('📝 Adding new columns to petitions table...');
    await pool.query(`
      ALTER TABLE petitions ADD COLUMN IF NOT EXISTS target_email TEXT;
      ALTER TABLE petitions ADD COLUMN IF NOT EXISTS target_email_cc TEXT;
      ALTER TABLE petitions ADD COLUMN IF NOT EXISTS email_subject TEXT;
      ALTER TABLE petitions ADD COLUMN IF NOT EXISTS greeting TEXT;
      ALTER TABLE petitions ADD COLUMN IF NOT EXISTS petition_message TEXT;
      ALTER TABLE petitions ADD COLUMN IF NOT EXISTS goal INTEGER;
      ALTER TABLE petitions ADD COLUMN IF NOT EXISTS goal_auto_increase BOOLEAN DEFAULT false;
      ALTER TABLE petitions ADD COLUMN IF NOT EXISTS goal_bump_percent INTEGER DEFAULT 25;
      ALTER TABLE petitions ADD COLUMN IF NOT EXISTS goal_trigger_percent INTEGER DEFAULT 90;
      ALTER TABLE petitions ADD COLUMN IF NOT EXISTS sends_email BOOLEAN DEFAULT true;
      ALTER TABLE petitions ADD COLUMN IF NOT EXISTS requires_confirmation BOOLEAN DEFAULT false;
      ALTER TABLE petitions ADD COLUMN IF NOT EXISTS display_message BOOLEAN DEFAULT true;
      ALTER TABLE petitions ADD COLUMN IF NOT EXISTS message_editable BOOLEAN DEFAULT false;
      ALTER TABLE petitions ADD COLUMN IF NOT EXISTS allow_anonymous BOOLEAN DEFAULT false;
      ALTER TABLE petitions ADD COLUMN IF NOT EXISTS show_signature_list BOOLEAN DEFAULT true;
      ALTER TABLE petitions ADD COLUMN IF NOT EXISTS signature_privacy VARCHAR(20) DEFAULT 'first_initial';
      ALTER TABLE petitions ADD COLUMN IF NOT EXISTS social_sharing BOOLEAN DEFAULT true;
      ALTER TABLE petitions ADD COLUMN IF NOT EXISTS optin_enabled BOOLEAN DEFAULT false;
      ALTER TABLE petitions ADD COLUMN IF NOT EXISTS optin_label TEXT DEFAULT 'Add me to your mailing list';
      ALTER TABLE petitions ADD COLUMN IF NOT EXISTS bcc_signer BOOLEAN DEFAULT false;
      ALTER TABLE petitions ADD COLUMN IF NOT EXISTS thank_you_email BOOLEAN DEFAULT false;
      ALTER TABLE petitions ADD COLUMN IF NOT EXISTS thank_you_subject TEXT;
      ALTER TABLE petitions ADD COLUMN IF NOT EXISTS thank_you_content TEXT;
      ALTER TABLE petitions ADD COLUMN IF NOT EXISTS redirect_url TEXT;
      ALTER TABLE petitions ADD COLUMN IF NOT EXISTS expires BOOLEAN DEFAULT false;
      ALTER TABLE petitions ADD COLUMN IF NOT EXISTS expiration_date TIMESTAMP;
      ALTER TABLE petitions ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '[]';
    `);
    console.log('✅ Petitions table updated\n');

    // 2. Alter petition_signatures table
    console.log('📝 Adding new columns to petition_signatures table...');
    await pool.query(`
      ALTER TABLE petition_signatures ADD COLUMN IF NOT EXISTS confirmed BOOLEAN DEFAULT false;
      ALTER TABLE petition_signatures ADD COLUMN IF NOT EXISTS confirmation_token VARCHAR(100);
      ALTER TABLE petition_signatures ADD COLUMN IF NOT EXISTS anonymous BOOLEAN DEFAULT false;
      ALTER TABLE petition_signatures ADD COLUMN IF NOT EXISTS optin BOOLEAN DEFAULT false;
      ALTER TABLE petition_signatures ADD COLUMN IF NOT EXISTS custom_data JSONB DEFAULT '{}';
      ALTER TABLE petition_signatures ADD COLUMN IF NOT EXISTS street TEXT;
      ALTER TABLE petition_signatures ADD COLUMN IF NOT EXISTS city TEXT;
      ALTER TABLE petition_signatures ADD COLUMN IF NOT EXISTS state TEXT;
      ALTER TABLE petition_signatures ADD COLUMN IF NOT EXISTS country TEXT;
    `);
    console.log('✅ Petition signatures table updated\n');

    // 3. Import existing petition
    console.log('📝 Importing existing petition data...');
    
    const petitionMessage = `We are writing to invite you to stand with us in exercising our constitutional right to petition our elected officials on matters fundamental to election security and voter confidence.

<strong>NOTICE TO SIGNERS:</strong> This is a <em>non-binding, advisory petition</em> intended to express the will of Maryland voters to the Maryland General Assembly and other public officials. This petition is <strong>not</strong> a statutory referendum, does <strong>not</strong> invoke Article XVI of the Maryland Constitution, and does <strong>not</strong> itself enact or repeal any law.

<strong>PREAMBLE</strong>

<strong>WHEREAS</strong>, Article 13 of the Declaration of Rights of the Maryland Constitution states, "That every man (<em>and woman</em>) hath a right to petition the Legislature for the redress of grievances in a peaceable and orderly manner" (italics added, as affirmed by Article 46 of the Declaration of Rights);

<strong>WHEREAS</strong>, the integrity of our elections is fundamental to the preservation of our democratic republic and the consent of the governed;

<strong>WHEREAS</strong>, the current electronic voting systems used in Maryland may be vulnerable to tampering, hacking, malfunction, or administrative error, potentially undermining public confidence in election outcomes;

<strong>WHEREAS</strong>, a system that relies on hand-marked paper ballots—counted both by optical scanners and subject to random manual audits—provides the most transparent, verifiable, and secure method of recording and tabulating votes;

<strong>WHEREAS</strong>, citizens have a legitimate interest in ensuring that every vote is accurately counted and that election results can be independently verified;

<strong>NOW THEREFORE</strong>, we the undersigned respectfully petition the Maryland General Assembly to enact legislation requiring the use of hand-marked paper ballots in all Maryland elections, counted by optical scanners and subject to mandatory random manual audits, in order to restore and maintain public trust in the electoral process.`;

    await pool.query(`
      INSERT INTO petitions (
        name, 
        title, 
        description,
        active,
        target_email,
        target_email_cc,
        email_subject,
        greeting,
        petition_message,
        sends_email,
        display_message,
        fields
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (name) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        target_email = EXCLUDED.target_email,
        target_email_cc = EXCLUDED.target_email_cc,
        email_subject = EXCLUDED.email_subject,
        greeting = EXCLUDED.greeting,
        petition_message = EXCLUDED.petition_message,
        sends_email = EXCLUDED.sends_email,
        display_message = EXCLUDED.display_message
    `, [
      'secure-your-vote-2026',
      'Secure YOUR Vote! A Petition for Secure Elections',
      'Join us in petitioning the Maryland General Assembly to require hand-marked paper ballots in all Maryland elections.',
      true,
      'stvmd26@gmail.com',
      'citizenvoter2024@gmail.com',
      'I support the Secure the Vote Act of 2026!',
      'Dear Maryland Resident,',
      petitionMessage,
      true,
      true,
      JSON.stringify(['full_name', 'email', 'zip_code'])
    ]);
    
    console.log('✅ Petition imported: secure-your-vote-2026\n');

    console.log('🎉 Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end().catch(() => {});
  }
}

// Run migration
migrate().catch(err => {
  console.error(err);
  process.exit(1);
});
