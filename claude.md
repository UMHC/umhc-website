# Claude Code Guide for UMHC Website Development

## Project Overview
Building a new website for the University of Manchester Hiking Club (UMHC) using Next.js and deploying to Vercel.

## Project Setup
- **Framework:** Next.js with App Router
- **Bundler:** Turbopack (for faster development)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Typography:** Open Sans font family
- **Deployment:** Vercel
- **Database:** Oracle Free Tier (planned) or Vercel Blob for events/schedule
- **Icons:** Heroicons + Bootstrap Icons (downloaded) + Custom hiking icons
- **Accessibility:** WCAG 2.1 AA compliance - CRITICAL REQUIREMENT
- **Project Structure:** src/ directory with import aliases (@/*)

## Project Created With
✅ **Already set up with:**
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
# With Turbopack enabled for faster development
```

## Project Structure
```
umhc-website/
├── src/
│   └── app/
│       ├── globals.css
│       ├── layout.tsx
│       ├── page.tsx
│       └── components/ (create this)
├── public/
│   ├── images/
│   │   ├── hero/           # Homepage hero images
│   │   ├── events/         # Event-specific photos
│   │   ├── gallery/        # Photo gallery images
│   │   ├── committee/      # Team member photos
│   │   └── icons/          # Custom hiking-themed icons
│   └── icons/
│       └── bootstrap/      # Downloaded Bootstrap Icons
├── tailwind.config.js
├── claude.md (this file)
└── package.json
```

## Development Commands
```bash
# Start development server (with Turbopack)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## UMHC Brand Colors

### Light Mode Colors
```css
--umhc-green: #1C5713;      /* Primary brand color - headers, CTA buttons */
--stealth-green: #2E4E39;   /* Secondary green - navigation, accents */
--earth-orange: #B15539;    /* Accent color - event tags, highlights */
--slate-grey: #494949;      /* Body text, secondary elements */
--deep-black: #000000;      /* Strong headings, important text */
--whellow: #FFFCF7;         /* Main page background */
--cream-white: #FFFEFB;     /* Navbar background, smaller elements */
```

### Dark Mode
```css
/* Dark mode colors - TO BE DESIGNED LATER */
/* Currently focusing on light mode only */
```

## Typography Setup

### Open Sans Implementation:
```tsx
// In src/app/layout.tsx
import { Open_Sans } from 'next/font/google'

const openSans = Open_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-open-sans',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={openSans.variable}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
```

### Tailwind Config for Open Sans:
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        'sans': ['var(--font-open-sans)', 'system-ui', 'sans-serif'],
      },
      colors: {
        'umhc-green': '#1C5713',
        'stealth-green': '#2E4E39',
        'earth-orange': '#B15539',
        'slate-grey': '#494949',
        'whellow': '#FFFCF7',
        'cream-white': '#FFFEFB',
      }
    }
  }
}
```

## Tailwind CSS Classes for UMHC Colors

```css
/* Custom colors in tailwind.config.js */
colors: {
  'umhc-green': '#1C5713',
  'stealth-green': '#2E4E39',
  'earth-orange': '#B15539',
  'slate-grey': '#494949',
  'whellow': '#FFFCF7',        // Main page background
  'cream-white': '#FFFEFB',    // Navbar & small elements
}

/* Font family already configured for Open Sans */
fontFamily: {
  'sans': ['var(--font-open-sans)', 'system-ui', 'sans-serif'],
}
```

Usage in TypeScript components:
```tsx
// Example layout structure with Open Sans typography
export default function Layout() {
  return (
    <>
      {/* Navbar with cream-white background and Open Sans */}
      <nav className="bg-cream-white border-b font-sans">
        <div className="bg-umhc-green text-white">
          <h1 className="text-2xl font-semibold">UMHC</h1>
        </div>
      </nav>
      
      {/* Main content with whellow background and Open Sans */}
      <main className="bg-whellow min-h-screen font-sans">
        <div className="text-slate-grey">
          <p className="text-lg">Page content in Open Sans</p>
        </div>
      </main>
    </>
  )
}
```

## Accessibility Requirements - CRITICAL
This website MUST be fully accessible. Every component and page should follow WCAG 2.1 AA guidelines.

### Key Accessibility Features to Implement:
- **Semantic HTML:** Proper heading hierarchy (h1, h2, h3), nav, main, section elements
- **Keyboard Navigation:** All interactive elements accessible via keyboard only
- **Screen Reader Support:** Proper alt text, aria-labels, aria-describedby
- **Color Contrast:** Minimum 4.5:1 ratio for normal text, 3:1 for large text
- **Focus Management:** Visible focus indicators, logical tab order
- **Alternative Text:** Descriptive alt text for all hiking photos and icons
- **Form Accessibility:** Labels, error messages, fieldsets where appropriate
- **Motion Preferences:** Respect prefers-reduced-motion for animations

### Testing Requirements:
- Test with screen readers (NVDA, JAWS, VoiceOver)
- Keyboard-only navigation testing
- Color contrast validation
- Automated testing with axe-core

### Claude Code Accessibility Prompts:
```
"Ensure this component follows WCAG 2.1 AA guidelines with proper semantic HTML, 
aria-labels, and keyboard navigation"

"Add proper alt text and screen reader support to this image gallery component"

"Make this navigation component fully keyboard accessible with focus management"
```

## Image Organization & Optimization

### Next.js Image Optimization:
```tsx
import Image from 'next/image'

// Example usage with accessibility
<Image
  src="/images/hero/lake-district.jpg"
  alt="Hikers walking along a mountain ridge in the Lake District with dramatic clouds overhead"
  width={1200}
  height={600}
  priority // For above-the-fold images
  className="object-cover"
/>
```

### Icon Implementation:
```tsx
// Heroicons (npm package)
import { MapPinIcon } from '@heroicons/react/24/outline'

// Bootstrap Icons (downloaded files)
import BootstrapIcon from '@/components/BootstrapIcon'

// Custom hiking icons (your downloaded files)
import HikingIcon from '@/public/icons/hiking-boots.svg'
```

## Social Media Embeds

### Official Embed Strategy:
- **Instagram:** Use Instagram Basic Display API or oEmbed
- **TikTok:** TikTok oEmbed API
- **Strava:** Strava API for activity feeds or embed widgets

### Implementation Planning:
```tsx
// Example structure for social media section
<section className="bg-whellow py-12" aria-labelledby="social-heading">
  <h2 id="social-heading" className="text-umhc-green text-3xl font-bold text-center mb-8">
    Check out our socials!
  </h2>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <InstagramEmbed />
    <StravaEmbed />
    <TikTokEmbed />
  </div>
</section>
```

## SEO Framework

### Meta Tags & Structure:
```tsx
// Example metadata for pages
export const metadata = {
  title: 'UMHC - University of Manchester Hiking Club',
  description: 'Join Manchester\'s premier hiking society. Weekly hikes, social events, and adventures for all skill levels. Open to University of Manchester students.',
  keywords: 'hiking, manchester, university, outdoor, adventure, student society',
  openGraph: {
    title: 'University of Manchester Hiking Club',
    description: 'Explore the great outdoors with UMHC',
    images: ['/images/hero/umhc-og-image.jpg'],
  },
}
```

### SEO Best Practices:
- Semantic HTML structure with proper headings
- Descriptive page titles and meta descriptions
- Schema.org structured data for events
- Sitemap generation
- Fast loading times with optimized images
- Mobile-responsive design

**Note:** Specific SEO content (descriptions, keywords, University guidelines) should be confirmed with human before implementation.

## Database Planning

### Oracle Free Tier Setup (Recommended)
```sql
-- Events table structure planning
CREATE TABLE events (
  id NUMBER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  title VARCHAR2(200) NOT NULL,
  description CLOB,
  event_date DATE NOT NULL,
  event_type VARCHAR2(50), -- 'hike', 'social', 'residential', 'other'
  location VARCHAR2(500),
  accessibility_features CLOB, -- JSON string
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Alternative: Vercel Blob + JSON
```typescript
// Event type definition
interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'hike' | 'social' | 'residential' | 'other';
  location: string;
  accessibility: {
    wheelchairAccessible: boolean;
    quietRoom: boolean;
    genderNeutralToilets: boolean;
    seatingAvailable: boolean;
    alcoholWillBeServed: boolean;
  };
}
```

## Key Pages from Current Site Analysis

### 1. Homepage Structure
- **Hero Section:** Large UMHC text over hiking landscape image
- **Who Are We:** Text section about the club
- **Schedule Preview:** List of upcoming events with date cards
- **Photo Gallery:** Social media style grid
- **Join Us:** Membership tiers (Free, £25 Student, £32 Associate)
- **Footer:** Links, social media, University of Manchester branding

### 2. Schedule Page
- **Filter System:** All Events, Day Hikes, Socials, Overnight Trips, Other
- **Event Cards:** Date, title, description, accessibility badges
- **Event Modal:** Detailed view with location, accessibility info
- **Categories:** Visual icons for different event types

### 3. Constitution Page
- **Structured Content:** Numbered sections (Name, Formation, Aims, etc.)
- **Clean Typography:** Easy to read legal/formal content

### 4. About/Committee Page
- **Team Grid:** Committee member cards with photos and roles
- **History Section:** Club background and formation
- **Contact Information:** Multiple contact methods

### 5. Membership Page
- **Pricing Tiers:** Clear comparison of membership options
- **Benefits Lists:** Detailed breakdown of what each tier includes
- **Call to Action:** "Become a Member" buttons

## Useful Claude Code Commands

### First Steps After Setup
1. **"Add UMHC custom colors including whellow (#FFFCF7) and cream-white (#FFFEFB) to tailwind.config.js and configure Open Sans font family"**
2. **"Update src/app/globals.css with UMHC color variables and ensure Open Sans is properly loaded"**
3. **"Configure Open Sans font in src/app/layout.tsx using Next.js font optimization"**
4. **"Create a components folder in src/app/"**
5. **"Replace the default homepage in src/app/page.tsx with UMHC design using whellow background and Open Sans typography"**

### Component Development
1. **"Create a fully accessible responsive navigation component with cream-white background, proper ARIA labels, and keyboard navigation in src/app/components/"**
2. **"Build an accessible hero section with whellow background, optimized Next.js Image, and proper heading hierarchy"**
3. **"Create an accessible events listing component with semantic HTML, keyboard-navigable filters, and screen reader support"**
4. **"Add accessible social media embed components for Instagram, Strava, and TikTok with fallback content"**
5. **"Create an accessible photo gallery with keyboard navigation, focus management, and descriptive alt text"**
6. **"Build accessible membership pricing cards with proper contrast ratios and semantic structure"**
7. **"Add accessible footer with UMHC green background and proper link structure"**

## Key Features to Implement
- [ ] Responsive navigation with cream-white background + full accessibility
- [ ] Hero section with whellow background and optimized hiking imagery
- [ ] Upcoming events preview on homepage with proper semantic structure
- [ ] Full schedule page with accessible filtering system
- [ ] Photo gallery with modal functionality + keyboard navigation
- [ ] Membership information with accessible pricing comparison
- [ ] Committee/About page with accessible team grid
- [ ] Constitution page with structured, accessible content
- [ ] Social media embeds (Instagram, Strava, TikTok) with fallbacks
- [ ] Footer with social links and University branding
- [ ] Database integration for events (Oracle/Vercel Blob)
- [ ] SEO optimization with proper meta tags and structured data
- [ ] Full accessibility compliance (WCAG 2.1 AA)
- [ ] Admin panel for content management (future enhancement)
- [ ] Member login functionality (future enhancement)
- [ ] Dark mode toggle (future enhancement)

## Next.js + TypeScript Concepts to Learn
- **App Router:** New routing system (src/app/ directory)
- **TypeScript:** Type safety for better code quality
- **Server Components:** Default in App Router (run on server)
- **Client Components:** Use 'use client' directive (run in browser)
- **Layouts:** Shared UI across routes (layout.tsx)
- **Metadata:** SEO optimization with TypeScript types
- **Import Aliases:** Use @/ to import from src/ directory

## Example Prompts for Claude Code
```
"Add the UMHC custom colors to tailwind.config.js including whellow (#FFFCF7) 
for page backgrounds and cream-white (#FFFEFB) for navbar backgrounds, configure 
Open Sans as the default font family, ensuring all color combinations meet 
WCAG 2.1 AA contrast requirements"

"Set up Open Sans font in src/app/layout.tsx using Next.js font optimization 
and create a fully accessible header component for UMHC in src/app/components/Header.tsx 
with TypeScript, cream-white background, Open Sans typography, proper semantic HTML, 
ARIA labels, and keyboard navigation"

"Build an accessible homepage at src/app/page.tsx with whellow background, 
Open Sans typography, semantic heading hierarchy, optimized Next.js Images 
with descriptive alt text, and proper landmark regions"

"Create an accessible events schedule page at src/app/schedule/page.tsx with 
whellow background, Open Sans typography, keyboard-navigable filter tabs, 
semantic event cards with proper ARIA labels, and screen reader announcements"

"Build an accessible photo gallery component with Open Sans typography, 
keyboard navigation, focus management for modal dialogs, descriptive alt text 
for all hiking photos, and proper ARIA attributes for lightbox functionality"
```

## Deployment to Vercel
1. Push code to GitHub
2. Connect GitHub repo to Vercel
3. Vercel will auto-deploy on commits to main branch

## Tips for Working with Claude Code
- Be specific about what you want to build
- Mention responsive design requirements
- Specify which UMHC colors to use
- Ask for TypeScript when needed
- Request accessibility features
- Ask for SEO best practices
- Always mention Open Sans typography

## Getting Started Checklist
After your project is created and `npm run dev` is running:

- [ ] Save this claude.md file in your project root
- [ ] Check http://localhost:3000 shows the default Next.js page
- [ ] Ask Claude Code to add UMHC colors (including whellow/cream-white) to tailwind.config.js
- [ ] Set up image organization structure in public/images/
- [ ] Create src/app/components/ directory
- [ ] Install and configure accessibility testing tools (axe-core)
- [ ] Replace default homepage with accessible UMHC landing page (whellow background)
- [ ] Build accessible header component with cream-white navbar
- [ ] Add accessible footer component with UMHC green background
- [ ] Create accessible schedule page with event filtering
- [ ] Build accessible membership page with pricing tiers
- [ ] Add accessible constitution page
- [ ] Implement social media embeds with fallbacks
- [ ] Plan database integration for events
- [ ] Test with screen readers and keyboard navigation
- [ ] Validate color contrast ratios
- [ ] Design and implement dark mode (future phase)

## Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [React Documentation](https://react.dev)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [axe-core Accessibility Testing](https://github.com/dequelabs/axe-core)

## Notes for Learning Computer Science
- **TypeScript helps catch errors early** - great for learning proper coding
- **Component-based architecture** - reusable pieces of UI
- **File-based routing** - each file in src/app/ becomes a page
- **Modern React patterns** - Server/Client components
- **CSS-in-JS alternative** - Tailwind for rapid styling
- **Git version control** - commit your changes regularly
- **Focus on light mode first** - dark mode can be added later once core functionality works
- **Accessibility-first development** - build inclusive experiences from the start
- **Performance optimization** - Next.js Image, lazy loading, Core Web Vitals