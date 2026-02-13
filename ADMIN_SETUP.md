# Admin Dashboard Setup Guide

## Prerequisites

1. **Railway Postgres Database** - Already provisioned with `DATABASE_URL` in Vercel
2. **Node.js** - For running the setup script locally
3. **Access to Encrypted Credentials** - For decrypting the database password

## Step 1: Decrypt Database Credentials

The database credentials are encrypted. Run this command to decrypt:

```bash
node scripts/decrypt-creds.js
```

This will output the DATABASE_URL needed for setup.

## Step 2: Set Up Database Schema

Run the SQL schema in your Railway Postgres console:

```bash
# Connect to Railway Postgres and run:
psql "YOUR_DATABASE_URL" -f schema.sql
```

Or copy the contents of `schema.sql` and run in Railway's PostgreSQL console.

## Step 3: Create Admin Account

Set the DATABASE_URL environment variable and run the setup script:

```bash
# Windows (PowerShell)
$env:DATABASE_URL = "YOUR_DECRYPTED_DATABASE_URL"
node scripts/setup-admin.js

# Linux/Mac
DATABASE_URL="YOUR_DECRYPTED_DATABASE_URL" node scripts/setup-admin.js
```

This will:
- Create the `admins` table if it doesn't exist
- Create/update the admin account for `rlooney@rodericklooney.com`
- Generate a secure random password
- Save the encrypted password to `secrets/roddy/securethevote-admin-password.txt`

## Step 4: Configure Vercel Environment Variables

In Vercel dashboard for SecureTheVote, add these environment variables:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Railway Postgres connection string |
| `JWT_SECRET` | Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `SETUP_TOKEN` | A secure token for admin setup (keep secret) |

## Step 5: Deploy

The admin dashboard will be available at `/admin/` once deployed.

### Files Created

```
repos/Secure-the-Vote/
├── schema.sql                    # Database schema
├── api/
│   ├── admin/
│   │   ├── _auth.js             # JWT authentication utilities
│   │   ├── login.js             # POST /api/admin/login
│   │   ├── setup.js             # POST /api/admin/setup (one-time)
│   │   └── signatures.js        # GET /api/admin/signatures
│   ├── admin/
│   │   └── export.js            # GET /api/admin/export
│   └── petition/
│       └── submit.js            # POST /api/petition/submit
├── public/
│   ├── admin/
│   │   ├── index.html           # Admin dashboard UI
│   │   ├── css/
│   │   │   └── admin.css        # Dashboard styles
│   │   └── js/
│   │       └── admin.js         # Dashboard JavaScript
│   └── js/
│       └── admin.js             # Same as above (symlinked or copied)
└── scripts/
    ├── setup-admin.js           # Create admin account script
    └── decrypt-creds.js         # Decrypt database credentials
```

## API Endpoints

### Public Endpoints

#### POST /api/petition/submit
Submit a new petition signature.

**Request:**
```json
{
  "petition_name": "election-security",
  "full_name": "John Doe",
  "email": "john@example.com",
  "zip_code": "12345"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Thank you for signing the petition!",
  "id": 1,
  "created_at": "2026-02-13T17:00:00Z"
}
```

### Admin Endpoints (Require JWT)

All admin endpoints require header: `Authorization: Bearer <token>`

#### POST /api/admin/login
Authenticate admin and get JWT token.

**Request:**
```json
{
  "email": "rlooney@rodericklooney.com",
  "password": "your-password"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "email": "rlooney@rodericklooney.com"
}
```

#### GET /api/admin/signatures
Get petition signatures (paginated).

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 50)
- `petition` (optional filter)

**Response:**
```json
{
  "success": true,
  "signatures": [
    {
      "id": 1,
      "petition_name": "election-security",
      "full_name": "John Doe",
      "email": "john@example.com",
      "zip_code": "12345",
      "created_at": "2026-02-13T17:00:00Z",
      "ip_address": "192.168.1.1"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "totalPages": 2
  }
}
```

#### GET /api/admin/export
Export all signatures as CSV file.

**Response:** Returns `text/csv` with Content-Disposition for download.

## Admin Dashboard

Access: `https://securethevote.vercel.app/admin/`

Features:
- JWT-based authentication
- View all petition signatures
- Filter by petition
- Search by name/email
- Export to CSV
- Real-time statistics

## Troubleshooting

### "Database connection failed"
- Verify `DATABASE_URL` is set correctly in Vercel
- Check Railway Postgres is running
- Ensure SSL is enabled for Railway

### "Invalid token" on admin endpoints
- JWT_SECRET must be set and consistent
- Token expires after 24 hours
- Re-login to get new token

### "Table not found" errors
- Run schema.sql in Railway PostgreSQL console
- Table names: `admins`, `petition_signatures`

## Security Notes

- **Never commit credentials** to Git
- Use environment variables for all secrets
- Rotate JWT_SECRET periodically
- The setup token should be a one-time use value

## Password Recovery

If admin password is lost:

1. Run `scripts/decrypt-creds.js` to get DATABASE_URL
2. Set DATABASE_URL and run: `scripts/setup-admin.js`
3. New password will be generated and saved to encrypted secrets