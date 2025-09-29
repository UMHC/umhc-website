
![Logo](https://i.postimg.cc/9QBzbSd8/logo.png)


# UMHC Website

This is a [Next.js](https://nextjs.org), [React](react.dev), and [TailwindCSS](tailwindcss.com) codebase deployed to [Vercel](vercel.com), and integrated with [Supabase](supabase.com), [RapidAPI](rapidapi.com), [Mailgun](mailgun.com) and [Cloudflare](cloudflare.com) services to provide an efficient yet secure web service to all society members.

This is the full code base for the 2025 website which is currently running in production at [umhc.org.uk](umhc.org.uk).
## Publishing changes to Vercel
This codebase is registered under a Github Organisation, this prevents automatic deployment to Vercel Hobby Plan sites which is what this project uses to run the umhc.org.uk site. The work around for this is very simple and actually makes it easier to test changes before pushing to production.

#### Step 1: Install the Vercel CLI

Make sure that you're currently within the `umhc-website` project directory and then run the following in the terminal to install the Vercel CLI.
```bash
npm install -g vercel
```

#### Step 2: Verify Installation

To esnure that your install has completed successfully, run the following command, if successful, it should output a version number.
```bash
vercel --version
```

#### Step 3: Deploy to Vercel

Now that you're all setup, run the following command and follow the onscreen instructions to deploy to vercel. The codebase will then be built and deployed as a preview on vercel (won't assigned to the `umhc.org.uk` domain) which you can view at a unique URL created by Vercel.
```bash
vercel
```

#### Step 4: Deploy to Production (Optional)

If you're confident in your code, you can push your Vercel deployment from Preview to Production, making all of your changes accessible at `umhc.org.uk` by running the command below.
```bash
vercel --prod
```
## Environment Variable Reference
Below are all of the environment variables used throughout this codebase

| Name      | Value/Source                |
| :-------- | :------------------------- |
| `WHATSAPP_GROUP_LINK` | Just set this as the link to the Whatsapp Group |
| `TURNSTILE_SECRET_KEY` | Get this from the [Cloudflare Dashboard](dash.cloudlfare.com) Turnstile area|
| `MAILGUN_API_KEY` | Get this from [Mailgun](mailgun.com) - use your private API key from the verify.umhc.org.uk domain|
| `MAILGUN_FROM_EMAIL` | _(Optional)_ The email address you want to send from, defaults to `UMHC <noreply@verify.umhc.org.uk>`|
<!-- DEPRECATED: | `RESEND_API_KEY` | Get this from [Resend](resend.com)| -->
<!-- DEPRECATED: | `RESEND_FROM_EMAIL` | The email address you want to send from, I used `UMHC Hiking Club <response@mail.umhc.org.uk>`| -->
| `NEXT_PUBLIC_BASE_URL` | The URL for your site `localhost:3000` for local development and `umhc.org.uk` for production|
| `NODE_ENV` | The code environment, just use `production`|
| `NEXT_PUBLIC_SUPABASE_URL` | The URL for your [Supabase](supabase.com) database|
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | The Anon key for your [Supabase](supabase.com) database|
| `SUPABASE_SERVICE_ROLE_KEY` | The Service Role Key for your [Supabase](supabase.com) database|
| `NEXT_PUBLIC_STUDENT_MEMBERSHIP_URL` | The webpage that users are redirected to when signing up for a UoM membership (use the SU page)|
| `NEXT_PUBLIC_ASSOCIATE_MEMBERSHIP_URL` | The webpage that users are redirected to when signing up for a Non-UoM membership (use the SU page)|
| `RAPID_API_KEY` | Get this from [RapidAPI](rapidapi.com)|
| `STRAVA_CLIENT_ID` | Get this from [Strava Developer](developers.strava.com)|
| `STRAVA_CLIENT_SECRET` | Get this from [Strava Developer](developers.strava.com)|
| `STRAVA_REFRESH_TOKEN` | Get this from [Strava Developer](developers.strava.com)|
| `STRAVA_CLUB_ID` | The UMHC Strava Club ID (`umhc`)|
| `KINDE_CLIENT_ID` | Get this from your [Kinde](kinde.com) application|
| `KINDE_CLIENT_SECRET` | Get this from your [Kinde](kinde.com) application|
| `KINDE_ISSUER_URL` | Your Kinde auth domain, either `auth.umhc.org.uk` (our custom auth domain) or `umhc.kinde.com` (the default auth domain provided by Kinde)|
| `KINDE_SITE_URL` | The URL to our site, `umhc.org.uk` in production or `localhost:3000` in local development|
| `KINDE_POST_LOGOUT_REDIRECT_URL` | The URL to our site, `umhc.org.uk` in production or `localhost:3000` in local development|
| `KINDE_POST_LOGIN_REDIRECT_URL` | Where to direct logged in users to, `umhc.org.uk/committee` in production or `localhost:3000/committee` in local development|




---
This web application was built by [Will Hayes](https://github.com/willh36) (2025 Web Sec), if you have any questions, please feel free to reach out.
