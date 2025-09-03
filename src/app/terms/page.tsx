import type { Metadata } from 'next';
import DOMPurify from 'isomorphic-dompurify';

export const metadata: Metadata = {
  title: 'UMHC | Terms of Service and Privacy Policy',
  description: 'Terms of Service and Privacy Policy for the University of Manchester Hiking Club website and services.',
  openGraph: {
    title: 'UMHC Terms of Service and Privacy Policy',
    description: 'Our terms of service and privacy policy governing access to and use of UMHC services.',
  },
};

// Terms Section Component
interface TermsSectionProps {
  sectionNumber: number;
  sectionTitle: string;
  sectionText: string;
}

// Convert markdown-style formatting to HTML
function parseMarkdown(text: string): string {
  const lines = text.split('\n');
  let html = '';
  let lastWasEmpty = false;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Handle empty lines - only add one br for consecutive empty lines
    if (!trimmedLine) {
      if (!lastWasEmpty) {
        html += '<br>';
        lastWasEmpty = true;
      }
      continue;
    }
    
    lastWasEmpty = false;
    
    // Check for sub-items FIRST (2.1. 2.2. 2.3. etc.)
    const subItemMatch = trimmedLine.match(/^(\d+)\.(\d+)\.\s*(.*)$/);
    if (subItemMatch) {
      const [, mainNum, subNum, text] = subItemMatch;
      html += `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="display: inline-block; min-width: 2em; vertical-align: top;">${mainNum}.${subNum}</span><span style="display: inline-block; vertical-align: top; width: calc(100% - 8em); margin-left: 0.5em;">${text}</span><br>`;
      continue;
    }
    
    // Check for bullet points (• text)
    const bulletMatch = trimmedLine.match(/^•\s*(.*)$/);
    if (bulletMatch) {
      const [, text] = bulletMatch;
      html += `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="display: inline-block; min-width: 1.5em; vertical-align: top; font-size: 1.2em; font-weight: bold;">•</span><span style="display: inline-block; vertical-align: top; width: calc(100% - 8em); margin-left: 0.5em;">${text}</span><br>`;
      continue;
    }
    
    // Regular text
    html += `${trimmedLine}<br>`;
  }
  
  // Sanitize the HTML before returning
  return DOMPurify.sanitize(html);
}

function TermsSection({
  sectionNumber,
  sectionTitle,
  sectionText,
}: TermsSectionProps) {
  return (
    <section className="flex flex-col gap-1 px-2 sm:px-4 py-4" aria-labelledby={`section-${sectionNumber}`}>
      <div className="flex items-start">
        <span className="text-lg sm:text-xl md:text-2xl font-semibold text-umhc-green font-sans mr-2 flex-shrink-0 leading-tight" aria-hidden="true">
          {sectionNumber}.
        </span>
        <h2 
          id={`section-${sectionNumber}`}
          className="text-lg sm:text-xl md:text-2xl font-semibold text-umhc-green font-sans leading-tight"
        >
          {sectionTitle}
        </h2>
      </div>
      <div className="pl-4 sm:pl-6">
        <div 
          className="text-sm sm:text-base text-deep-black font-medium font-sans leading-relaxed"
          dangerouslySetInnerHTML={{ __html: parseMarkdown(sectionText) }}
        />
      </div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <div className="bg-whellow min-h-screen px-2 sm:px-4 md:px-6 lg:px-8 pt-16 sm:pt-20 pb-8 sm:pb-12">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <header className="text-center space-y-2 mb-4 sm:mb-4">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-deep-black leading-tight font-sans px-2">
            Terms of Service and Privacy Policy
          </h1>
          <div className="max-w-5xl mx-auto px-2">
            <p className="text-xs sm:text-sm md:text-base text-deep-black font-medium font-sans leading-relaxed">
              These Terms of Service and Privacy Policy govern your access to and use of the services provided by the University of Manchester Hiking Club (UMHC), including our website, associated platforms, WhatsApp community, and related services. By accessing or using our services, you agree to be bound by this agreement. If you do not agree, you must not use the services. (Last Updated: 02/09/25)
            </p>
          </div>
        </header>

        {/* Terms Sections */}
        <main className="space-y-0.5 sm:space-y-1 max-w-5xl mx-auto" role="main">
          <TermsSection
            sectionNumber={1}
            sectionTitle="Definitions"
            sectionText={`• "User", "you", or "your" means any individual accessing or using the Services.
• "Committee Member" means an authorised representative of UMHC with administrative or decision-making responsibilities.
• "Personal Data" means any information relating to an identified or identifiable natural person as defined under the UK General Data Protection Regulation ("UK GDPR").
• "Third-Party Providers" means the external services UMHC engages, including but not limited to Supabase, Kinde, Resend, Vercel, Cloudflare, and WhatsApp.`}
          />

          <TermsSection
            sectionNumber={2}
            sectionTitle="Data Collection and Processing"
            sectionText={`2.1 User Data

UMHC may collect and process the following Personal Data when you submit a manual request to join our WhatsApp community:
	•	First name and surname
	•	Email address
	•	Telephone number
	•	Self-identification (e.g., student, alumni, public, other)
	•	Optional: trip participation history with UMHC

When automatic access is granted, we process the following:
	•	Email address (for delivery of the WhatsApp link via Resend)
	•	Telephone number, provided once by the User as a verification step to reduce automated and fraudulent submissions. This number is processed transiently for validation purposes only. It is not stored, or retained in any database or system controlled by UMHC or its Third-Party Providers.

2.2 Website and Analytics Data

When you access the Services, the following may be collected automatically:
• IP address, browser, and device information
• Anonymised analytics and performance metrics (via Vercel)
• Bot-detection and security data (via Cloudflare Turnstile)
• Cookies and caching technologies

2.3 Committee Members' Data

Committee Member authentication and role-based access is managed by Kinde. Data relating to committee members is processed for the purposes of identity management, access control, and accountability.

2.4 Communications

If you contact UMHC by email, we will process any Personal Data contained in your correspondence.`}
          />

          <TermsSection
            sectionNumber={3}
            sectionTitle="Lawful Basis and Purpose"
            sectionText={`Personal Data is processed under Article 6(1)(b) and 6(1)(f) of the UK GDPR, namely:
	•	For the performance of providing access to the WhatsApp community and related Services;
	•	For UMHC's legitimate interests in preventing abuse of the Services, including the use of temporary telephone number submission as a security measure.`}
          />

          <TermsSection
            sectionNumber={4}
            sectionTitle="Retention of Data"
            sectionText={`• Personal Data collected through manual WhatsApp requests shall be retained for no longer than 30 days, after which it shall be permanently deleted, irrespective of approval outcome.
• Committee Member data shall be retained for the duration of their role.
• Analytics data may be retained in anonymised or aggregated form.
• Email communications may be retained as necessary for record-keeping.`}
          />

          <TermsSection
            sectionNumber={5}
            sectionTitle="Data Sharing and Transfers"
            sectionText={`UMHC does not sell Personal Data. Data may be shared only with Third-Party Providers strictly necessary to operate the Services, namely:
• Supabase (data storage)
• Kinde (authentication and committee management)
• Resend (email sending)
• Vercel (hosting, analytics, performance monitoring)
• Cloudflare (security and optimisation)
• WhatsApp (community hosting, subject to WhatsApp's own terms)

Each Third-Party Provider processes Personal Data under its own privacy policy and terms of service.`}
          />

          <TermsSection
            sectionNumber={6}
            sectionTitle="User Rights"
            sectionText={`Under the UK GDPR, Users have the right to:
• Access their Personal Data
• Rectify inaccuracies
• Request erasure ("right to be forgotten")
• Restrict or object to processing
• Obtain a copy of their data in a portable format

Requests may be submitted to data@umhc.org.uk. UMHC will respond in accordance with statutory timeframes.`}
          />

          <TermsSection
            sectionNumber={7}
            sectionTitle="WhatsApp Community Rules"
            sectionText={`• Admission to the WhatsApp community is at UMHC's discretion.
• UMHC reserves the right to remove or block Users from the WhatsApp community, events, or the website for conduct deemed inappropriate or contrary to UMHC's policies.
• Users must comply with WhatsApp's own eligibility and age restrictions. UMHC is not responsible for enforcement of WhatsApp's policies.`}
          />

          <TermsSection
            sectionNumber={8}
            sectionTitle="Security"
            sectionText={`UMHC implements appropriate technical and organisational measures to safeguard Personal Data, including restricted access to Supabase, role-based permissions via Kinde, and security measures provided by our Third-Party Providers.

No system can guarantee absolute security. UMHC shall not be held liable for unauthorised access, disclosure, or loss of data beyond reasonable control.`}
          />

          <TermsSection
            sectionNumber={9}
            sectionTitle="Cookies"
            sectionText={`The Services use cookies and caching technologies to optimise performance, enhance security, and collect anonymised analytics. Users may manage cookies through their browser settings, but certain features may not function without them.`}
          />

          <TermsSection
            sectionNumber={10}
            sectionTitle="Disclaimers and Limitation of Liability"
            sectionText={`• The Services are provided on an "as is" and "as available" basis.
• UMHC disclaims all warranties, express or implied, including but not limited to fitness for a particular purpose.
• UMHC shall not be liable for indirect, incidental, or consequential damages arising out of or related to use of the Services.
• UMHC shall not be responsible for interruptions, errors, or failures caused by Third-Party Providers, including but not limited to WhatsApp, Vercel, Supabase, Resend, Cloudflare, or Kinde.
• To the maximum extent permitted by law, UMHC's total liability to any User shall not exceed £100.`}
          />

          <TermsSection
            sectionNumber={11}
            sectionTitle="Changes"
            sectionText={`UMHC reserves the right to amend this Agreement at any time. The updated version will be posted on the website with the "Last Updated" date revised accordingly. Continued use of the Services constitutes acceptance of any changes.`}
          />

          <TermsSection
            sectionNumber={12}
            sectionTitle="Governing Law"
            sectionText={`This Agreement shall be governed by and construed in accordance with the laws of England and Wales. Users agree that the courts of England and Wales shall have exclusive jurisdiction over any dispute arising from or relating to this Agreement.`}
          />

          <TermsSection
            sectionNumber={13}
            sectionTitle="Severability"
            sectionText={`If any provision of this Agreement is held invalid or unenforceable, the remaining provisions shall remain in full force and effect.`}
          />

          <TermsSection
            sectionNumber={14}
            sectionTitle="Contact Information"
            sectionText={`For general enquiries: contact@umhc.org.uk
For GDPR or data protection requests: data@umhc.org.uk`}
          />
        </main>
      </div>
    </div>
  )
}