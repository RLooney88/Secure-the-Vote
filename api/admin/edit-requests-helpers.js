const { Pool } = require('pg');
const crypto = require('crypto');

const SITE_ID = process.env.EDIT_REQUEST_SITE_ID || 'securethevotemd';
const SITE_KEY = process.env.EDIT_REQUEST_SITE_KEY || SITE_ID;
const EDIT_REQUEST_API_URL = process.env.EDIT_REQUEST_API_URL || 'https://nova-site-editor-production.up.railway.app/api/site-edit-request';
const EDIT_REQUEST_CALLBACK_AUTH = process.env.EDIT_REQUEST_CALLBACK_AUTH || '';
const PUBLIC_SITE_URL = process.env.PUBLIC_SITE_URL || 'https://www.securethevotemd.com';

function getPool() {
  return new Pool({ connectionString: (process.env.DATABASE_URL || '').trim(), ssl: { rejectUnauthorized: false }, max: 1 });
}

async function ensureTable(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS edit_requests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      client_request_id VARCHAR(255) UNIQUE NOT NULL,
      title VARCHAR(500) NOT NULL,
      page VARCHAR(255),
      description TEXT NOT NULL,
      requester_email VARCHAR(255),
      attachments JSONB DEFAULT '[]'::jsonb,
      preview_approval_needed BOOLEAN DEFAULT true,
      status VARCHAR(50) DEFAULT 'open',
      history JSONB DEFAULT '[]'::jsonb,
      api_response JSONB,
      callback_status VARCHAR(50),
      callback_received_at TIMESTAMPTZ,
      callback_payload JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

function callbackUrl(req) {
  return `${PUBLIC_SITE_URL}/api/integrations/edit-requests/callback`;
}

async function sendToNova(requestData) {
  const resp = await fetch(EDIT_REQUEST_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestData)
  });
  const text = await resp.text();
  let parsed;
  try { parsed = JSON.parse(text); } catch { parsed = { raw: text }; }
  if (!resp.ok) throw new Error(parsed.detail || parsed.error || `Nova request failed: ${resp.status}`);
  return parsed;
}

async function triggerReviewAction(actionUrl) {
  if (!actionUrl) return { status: 'missing', reason: 'No action URL provided' };
  const resp = await fetch(actionUrl, { method: 'POST' });
  const text = await resp.text();
  return { status: resp.ok ? 'sent' : 'failed', statusCode: resp.status, body: text.slice(0, 1000) };
}

function splitAssets(attachments) {
  const images = [];
  const files = [];
  for (const a of attachments || []) {
    if ((a.kind || '').includes('image') || (a.contentType || '').startsWith('image/')) images.push(a); else files.push(a);
  }
  return { images, files };
}

function uuid() { return crypto.randomUUID(); }

module.exports = { SITE_ID, SITE_KEY, EDIT_REQUEST_API_URL, EDIT_REQUEST_CALLBACK_AUTH, PUBLIC_SITE_URL, getPool, ensureTable, callbackUrl, sendToNova, triggerReviewAction, splitAssets, uuid };
