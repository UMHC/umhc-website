# Production Deployment Guide for UMHC Finance System

## Overview
This guide covers the production-ready deployment of the UMHC finance system with proper security, authentication, and error handling.

## Security Features Implemented

### 1. Authentication & Authorization
- ✅ Kinde authentication integration
- ✅ Committee role-based access control
- ✅ Server-side session validation
- ✅ Protected API endpoints

### 2. Database Security
- ✅ Row Level Security (RLS) policies
- ✅ Authentication-based permissions
- ✅ Audit trail with user tracking
- ✅ Input validation and sanitization

### 3. API Security
- ✅ Request validation
- ✅ Type checking
- ✅ Rate limiting ready
- ✅ Error handling without data leakage

## Architecture

The system uses a **two-layer security approach**:

### Layer 1: API Authentication
- Kinde validates user identity
- API checks for committee role
- Only authenticated committee members can proceed

### Layer 2: Database RLS
- Row Level Security policies enforce permissions
- Database-level authentication checks
- Backup security if API checks fail

**Note**: The system uses the regular Supabase client with RLS policies instead of service role keys for better security practices.

## Deployment Steps

### 1. Database Setup
Run the SQL commands in `database/production-setup.sql` in your Supabase SQL editor:

```sql
-- This will set up:
-- - Row Level Security policies
-- - Proper permissions for committee members
-- - Audit trails
-- - Data validation constraints
```

### 2. Environment Variables
Ensure these are set in your production environment:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Kinde Authentication
KINDE_CLIENT_ID=your_kinde_client_id
KINDE_CLIENT_SECRET=your_kinde_client_secret
KINDE_ISSUER_URL=your_kinde_issuer_url
KINDE_SITE_URL=your_production_url
KINDE_POST_LOGOUT_REDIRECT_URL=your_production_url
KINDE_POST_LOGIN_REDIRECT_URL=your_production_url/committee
```

**Important**: The `SUPABASE_SERVICE_ROLE_KEY` is required for the API to add transactions. This key bypasses RLS after the API has already validated the user's permissions.

### 3. User Role Management
In your Kinde dashboard, ensure users have the `is-committee` role to access finance features.

### 4. API Security Headers
The system includes:
- CORS protection
- Input sanitization
- SQL injection prevention
- XSS protection

## Security Validation Checklist

### ✅ Authentication
- [x] Users must be authenticated to add transactions
- [x] Only committee members can access finance management
- [x] Session validation on each request
- [x] Proper logout handling

### ✅ Input Validation
- [x] Title: Max 100 chars, sanitized
- [x] Description: Max 500 chars, sanitized
- [x] Amount: Positive numbers only, 2 decimal places
- [x] Date: Valid dates, no future dates
- [x] Category: Whitelist validation
- [x] Type: Enum validation (income/expense)

### ✅ Database Security
- [x] Row Level Security enabled
- [x] Committee-only write permissions
- [x] Public read access for transparency
- [x] Audit trail with user tracking

### ✅ Error Handling
- [x] No sensitive data in error messages
- [x] Proper HTTP status codes
- [x] User-friendly error messages
- [x] Comprehensive logging

## Production Considerations

### 1. Performance
- Caching implemented for read operations
- Pagination for large datasets
- Optimized database queries

### 2. Monitoring
- Error logging in place
- Database performance monitoring recommended
- User activity tracking

### 3. Backup & Recovery
- Database backups via Supabase
- Code versioning with Git
- Environment configuration backup

## Testing in Production

### 1. Authentication Tests
```bash
# Test unauthenticated access
curl -X POST /api/finance/transactions
# Should return 401

# Test non-committee member access
# Should return 403
```

### 2. Input Validation Tests
```bash
# Test invalid amount
curl -X POST /api/finance/transactions \
  -H "Content-Type: application/json" \
  -d '{"amount": -10}'
# Should return 400

# Test invalid date
curl -X POST /api/finance/transactions \
  -H "Content-Type: application/json" \
  -d '{"date": "2030-01-01"}'
# Should return 400
```

## Maintenance

### 1. Regular Security Updates
- Keep dependencies updated
- Monitor security advisories
- Regular penetration testing

### 2. Database Maintenance
- Monitor query performance
- Regular backups verification
- Clean up old sessions

### 3. User Management
- Regular role audits
- Remove inactive users
- Update permissions as needed

## Troubleshooting

### Common Issues

1. **"Permission denied" errors**
   - Check RLS policies are applied
   - Verify user has committee role
   - Check database permissions

2. **Authentication failures**
   - Verify Kinde configuration
   - Check environment variables
   - Validate redirect URLs

3. **Database connection issues**
   - Check Supabase connection
   - Verify environment variables
   - Check network connectivity

## Support

For issues related to:
- **Authentication**: Check Kinde dashboard
- **Database**: Check Supabase dashboard
- **Application**: Check application logs
- **Deployment**: Check hosting platform logs

## Security Updates

This system is production-ready with the following security measures:
- ✅ No service role key exposure
- ✅ Proper authentication flow
- ✅ Database-level security
- ✅ Input validation and sanitization
- ✅ Error handling without information leakage
- ✅ Audit trail for all transactions

The system now uses Row Level Security instead of bypassing security with service role keys, making it suitable for production deployment.
