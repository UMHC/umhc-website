# Committee Console Access Guide

## Overview
The UMHC Committee Console is a secure administrative interface for club committee members. It is intentionally hidden from the main navigation to maintain security and only accessible to authenticated users with the appropriate permissions.

## How to Access

### Direct URL Access
The committee console is available at:
- **Main Console**: `/committee`
- **Settings**: `/committee/settings`

### Authentication Requirements
1. Users must be authenticated through Kinde
2. Users must have the `is-committee` role assigned in Kinde
3. Access is automatically redirected to login if not authenticated

### Kinde Setup Required
To use the committee console, you need to:

1. **Set up Kinde account** and create an application
2. **Configure environment variables** in `.env.local`:
   ```
   KINDE_CLIENT_ID=your_kinde_client_id
   KINDE_CLIENT_SECRET=your_kinde_client_secret
   KINDE_ISSUER_URL=https://your-domain.kinde.com
   KINDE_SITE_URL=http://localhost:3000
   KINDE_POST_LOGOUT_REDIRECT_URL=http://localhost:3000
   KINDE_POST_LOGIN_REDIRECT_URL=http://localhost:3000/committee
   ```

3. **Create roles in Kinde**:
   - Create a role called `is-committee`
   - Assign this role to committee members

4. **Assign users**: Add committee members to your Kinde application and assign them the `is-committee` role

## Features
- **Dashboard**: Overview of club finances, membership, and recent activities
- **Settings**: Configure system settings and manage committee access
- **Role-based Access**: Only users with `is-committee` role can access
- **Secure**: Uses Kinde authentication with server-side verification

## Security Features
- Server-side authentication checks
- Role-based access control
- Automatic redirects for unauthorized access
- Hidden from main navigation
- Middleware protection on all `/committee/*` routes

## Adding New Committee Members
1. Add user to your Kinde application
2. Assign them the `is-committee` role
3. They can then access `/committee` directly

## Troubleshooting
- If redirected to login, ensure you have the `is-committee` role
- Check that environment variables are correctly set
- Verify your Kinde application is properly configured
- Contact the Website Secretary if you need access
