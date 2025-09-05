# Security Policy

## Supported Versions

We are committed to maintaining the security of the UMHC website. Currently supported versions:

| Version | Supported          |
| ------- | ------------------ |
| v1.5  | :white_check_mark: |
| < v1.5 | :x:                |

We recommend always using the latest version deployed on the [UMHC Website Repository](https://www.github.com.umhc/umhc-website).

## Reporting a Vulnerability

The University of Manchester Hiking Club (UMHC) takes security seriously. We appreciate your efforts to help keep our website and members' information secure.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report security vulnerabilities to us via:

- **Email**: `security@umhc.org.uk`
- **Subject Line**: `[SECURITY] Vulnerability Report - UMHC Website`

### What to Include

When reporting a vulnerability, please include:

1. **Description** - A clear description of the vulnerability
2. **Steps to Reproduce** - Detailed steps to reproduce the issue
3. **Impact** - What information or functionality could be compromised
4. **Suggested Fix** - If you have ideas on how to fix it (optional)
5. **Your Contact Information** - So we can follow up with questions

### Our Commitment

- We will do our best to acknowledge receipt of your report within **48 hours**
- We will do our best to provide an initial assessment within **7 days**
- We will keep you informed of our progress

### What We Protect

Our security efforts focus on protecting:

- **Member Information** - Contact details
- **Website Integrity** - Preventing unauthorized modifications
- **User Experience** - Ensuring the site remains available and functional
- **Society Reputation** - Maintaining trust in our digital presence

## Security Best Practices

If you're contributing to the UMHC website:

1. **Dependencies** - Keep all dependencies up to date
2. **Secrets** - Never commit API keys, passwords, or sensitive data
3. **Input Validation** - Always validate and sanitize user inputs
4. **Environment Variables** - Use environment variables for configuration
5. **Code Review** - All changes require review before merging

## Incident Response

In the event of a security incident:

1. **Immediate Response** - Take affected systems offline if necessary
2. **Assessment** - Evaluate the scope and impact
3. **Communication** - Notify affected parties appropriately
4. **Recovery** - Implement fixes and restore normal operations
5. **Review** - Conduct a post-incident review to prevent recurrence

## Security Tools and Monitoring

We use the following security measures:

- **GitHub Security Advisories** - Automated vulnerability scanning
- **Dependabot** - Automated dependency updates

## Contact Information

For security-related inquiries:
- **Primary Contact**: UMHC Web Secretary (`security@umhc.org.uk`)
- **Alternative**: University of Manchester Students' Union

## Scope

This security policy applies to:
- The main UMHC website repository
- All associated deployment infrastructure (Vercel)
- Related services and integrations
- Any subdomains or redirects

**Not in scope:**
- Third-party services we link to but don't control
- University of Manchester infrastructure
- Personal devices or accounts of members

---

**Last Updated**: September 2025

Thank you for helping keep UMHC and our community safe!
