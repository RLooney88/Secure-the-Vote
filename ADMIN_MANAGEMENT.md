# SecureTheVote Admin Dashboard - Complete with Admin Management

## Admin Management Features Added

### New API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/admin/create` | POST | JWT | Create new admin account |
| `/api/admin/delete` | DELETE | JWT | Delete admin account |
| `/api/admin/list` | GET | JWT | List all admin accounts |

### New Dashboard Features

1. **Tab Navigation**
   - Signatures tab: View and manage petition signatures
   - Admins tab: Manage admin user accounts

2. **Add Admin Section**
   - Email input for new admin
   - Password field (or auto-generate checkbox)
   - Auto-generate secure random password option
   - Display generated password after creation

3. **Admin List Table**
   - Shows all admin accounts
   - Displays creation date
   - "You" badge for current user
   - Delete button for each admin (except yourself)
   - Delete confirmation modal

## Files Created/Updated

```
repos/Secure-the-Vote/
├── api/admin/
│   ├── _auth.js              # JWT authentication (existing)
│   ├── login.js              # Admin login (existing)
│   ├── signatures.js         # List signatures (existing)
│   ├── export.js             # Export CSV (existing)
│   ├── setup.js              # One-time setup (existing)
│   ├── create.js             # NEW - Create admin
│   ├── delete.js             # NEW - Delete admin
│   └── list.js               # NEW - List admins
├── public/admin/
│   ├── index.html            # Updated with admin management UI
│   └── css/admin.css         # Updated with new styles
└── public/js/admin.js        # Updated with admin management JS
```

## API Details

### POST /api/admin/create

Create a new admin account.

**Headers:**
- Authorization: Bearer \<token\>

**Request Body:**
```json
{
  "email": "newadmin@example.com",
  "auto_generate": true,
  "password": "optional-password-if-not-auto-generating"
}
```

**Response (auto-generate):**
```json
{
  "success": true,
  "message": "Admin created successfully",
  "admin": {
    "email": "newadmin@example.com"
  },
  "generated_password": "abc123xyz..."
}
```

**Response (custom password):**
```json
{
  "success": true,
  "message": "Admin created successfully",
  "admin": {
    "email": "newadmin@example.com"
  }
}
```

### DELETE /api/admin/delete?id=\<id\>

Delete an admin account (cannot delete yourself).

**Headers:**
- Authorization: Bearer \<token\>

**Response:**
```json
{
  "success": true,
  "message": "Admin email@example.com deleted successfully"
}
```

**Error - Cannot delete yourself:**
```json
{
  "error": "Cannot delete your own account"
}
```

### GET /api/admin/list

List all admin accounts.

**Headers:**
- Authorization: Bearer \<token\>

**Response:**
```json
{
  "success": true,
  "admins": [
    {
      "id": 1,
      "email": "admin@example.com",
      "created_at": "2026-02-13T17:00:00Z",
      "is_current": true
    },
    {
      "id": 2,
      "email": "other@example.com",
      "created_at": "2026-02-13T18:00:00Z",
      "is_current": false
    }
  ]
}
```

## Usage

1. Log in to admin dashboard at `/admin/`
2. Click "Admin Users" tab
3. Fill in the form to add a new admin
4. Use auto-generate for secure random passwords
5. View all admins in the table below
6. Delete admins (except yourself) using the delete button

## Security Notes

- Admin management requires JWT authentication
- Cannot delete your own account (prevents lockout)
- Passwords are bcrypt-hashed in the database
- Generated passwords are shown once and cannot be recovered

## Ready for Deployment ✓

All admin management features are complete and ready for deployment.