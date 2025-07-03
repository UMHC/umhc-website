# Security Documentation - UMHC WhatsApp Verification System

## Overview
This document outlines the security measures implemented in the UMHC WhatsApp group verification system.

## Security Features

### 1. Phone Number Validation
- **UK-only validation**: Only accepts UK mobile numbers (+44 7xxxxxxxxx)
- **Format validation**: Strict regex pattern matching
- **Input sanitization**: Removes non-digit characters except +

### 2. Bot Protection
- **Cloudflare Turnstile**: CAPTCHA-like verification using Cloudflare's security
- **Honeypot field**: Hidden form field to catch automated bots
- **Rate limiting**: 5 attempts per IP per 15-minute window
- **Question-based verification**: Random UMHC-specific questions

### 3. Server-Side Validation
- **Turnstile token verification**: Server validates tokens with Cloudflare
- **Answer verification**: Checks answers against server-side question database
- **Input encoding**: URL-encodes all data sent to external APIs
- **Error handling**: Proper error responses without exposing sensitive info

### 4. Privacy Protection
- **Phone number masking**: Logs only show masked phone numbers (***1234)
- **No data storage**: No persistent storage of user data
- **Environment variables**: Sensitive config stored in environment variables
- **Secure redirects**: Immediate redirects prevent retry attempts

### 5. Production Security
- **Debug logging disabled**: Console logs only in development mode
- **Required environment variables**: System fails secure if not configured
- **Error boundaries**: Graceful error handling without exposing internals
- **HTTPS enforcement**: All external API calls use HTTPS

## Environment Variables (Production)

```bash
# REQUIRED - Replace with actual values
WHATSAPP_GROUP_LINK=https://chat.whatsapp.com/YOUR-ACTUAL-GROUP-LINK
TURNSTILE_SECRET_KEY=YOUR-ACTUAL-SECRET-KEY
NODE_ENV=production
```

## Security Checklist for Deployment

### Pre-Deployment
- [ ] Replace placeholder WhatsApp link with actual group link
- [ ] Configure Cloudflare Turnstile with production keys
- [ ] Set NODE_ENV=production
- [ ] Verify all environment variables are set
- [ ] Test rate limiting functionality
- [ ] Test phone number validation edge cases

### Post-Deployment
- [ ] Monitor server logs for failed verification attempts
- [ ] Check Cloudflare dashboard for Turnstile metrics
- [ ] Verify HTTPS is enforced
- [ ] Test complete verification flow
- [ ] Monitor for suspicious activity patterns

## Security Monitoring

### Log Analysis
- Monitor for excessive failed verification attempts
- Watch for unusual phone number patterns
- Track Turnstile failure rates

### Rate Limiting
- Current limit: 5 attempts per IP per 15 minutes
- Adjust based on legitimate usage patterns
- Consider implementing exponential backoff

## Incident Response

### Suspected Bot Activity
1. Check server logs for patterns
2. Review Cloudflare Turnstile dashboard
3. Consider temporary rate limit adjustments
4. Update question database if compromised

### System Compromise
1. Immediately revoke Turnstile keys
2. Rotate WhatsApp group link
3. Review all verification logs
4. Update security measures as needed

## Security Best Practices

### For Administrators
- Regularly rotate Turnstile keys
- Monitor verification success/failure rates
- Keep questions database updated
- Review access logs monthly

### For Developers
- Never commit secrets to version control
- Always validate input server-side
- Use environment variables for configuration
- Implement proper error handling
- Follow principle of least privilege

## Contact
For security concerns or incidents, contact:
- Technical & Security Lead: [webmaster@umhc.org.uk]