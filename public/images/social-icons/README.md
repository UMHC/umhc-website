# Social Icons

These icons are public assets and can be used directly in email signatures, templates, or other external assets.

## Direct static URLs

- `/images/social-icons/whatsapp.svg`
- `/images/social-icons/tiktok.svg`

## Email-safe route URLs

- `/api/social-icon?file=whatsapp.svg`
- `/api/social-icon?file=tiktok.svg`

The API route mirrors the logo endpoint behavior:
- strong caching headers
- cross-origin access enabled
- content-type set from the file extension