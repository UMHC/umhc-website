import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'UMHC Email Verification System',
  description: 'Email verification system for the University of Manchester Hiking Club WhatsApp community access.',
  openGraph: {
    title: 'UMHC Email Verification System',
    description: 'Secure email verification system for UMHC WhatsApp community access.',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function VerifyPage() {
  return (
    <div className="bg-whellow min-h-screen px-2 sm:px-4 md:px-6 lg:px-8 pt-16 sm:pt-20 pb-8 sm:pb-12">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <header className="text-center space-y-6 mb-8 sm:mb-12">
          {/* UMHC Logo/Branding */}
          <div className="flex justify-center mb-6">
            <div className="bg-umhc-green text-white px-6 py-3 rounded-lg">
              <h1 className="text-2xl sm:text-3xl font-bold font-sans">
                UMHC
              </h1>
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-deep-black leading-tight font-sans">
              Email Verification System
            </h1>
            <p className="text-lg sm:text-xl text-slate-grey font-medium font-sans max-w-2xl mx-auto">
              This subdomain is used by the University of Manchester Hiking Club for secure email verification.
            </p>
          </div>
        </header>

        {/* Main Content */}
        <main className="space-y-8 sm:space-y-12">
          {/* Purpose Section */}
          <section className="bg-cream-white rounded-lg p-6 sm:p-8 border border-gray-100">
            <h2 className="text-xl sm:text-2xl font-semibold text-umhc-green font-sans mb-4">
              What is this subdomain for?
            </h2>
            <div className="space-y-4 text-deep-black font-sans">
              <p className="leading-relaxed">
                The <code className="bg-gray-100 px-2 py-1 rounded font-mono text-sm">verify.umhc.org.uk</code> subdomain 
                is our dedicated email verification system for managing access to the UMHC WhatsApp community.
              </p>
              <p className="leading-relaxed">
                When you request access to our WhatsApp group through our website, verification emails are sent 
                from this subdomain to ensure security and prevent unauthorized access.
              </p>
            </div>
          </section>

          {/* How it Works */}
          <section className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-umhc-green font-sans text-center">
              How Email Verification Works
            </h2>
            
            <div className="grid gap-6 md:grid-cols-3">
              <div className="bg-cream-white rounded-lg p-6 text-center border border-gray-100">
                <div className="w-12 h-12 bg-umhc-green rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">1</span>
                </div>
                <h3 className="font-semibold text-deep-black font-sans mb-2">Request Access</h3>
                <p className="text-sm text-slate-grey font-sans">
                  Submit your university email through our WhatsApp access form on the main website.
                </p>
              </div>
              
              <div className="bg-cream-white rounded-lg p-6 text-center border border-gray-100">
                <div className="w-12 h-12 bg-umhc-green rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
                <h3 className="font-semibold text-deep-black font-sans mb-2">Receive Email</h3>
                <p className="text-sm text-slate-grey font-sans">
                  Get a secure verification email from verify.umhc.org.uk in your university inbox.
                </p>
              </div>
              
              <div className="bg-cream-white rounded-lg p-6 text-center border border-gray-100">
                <div className="w-12 h-12 bg-umhc-green rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">3</span>
                </div>
                <h3 className="font-semibold text-deep-black font-sans mb-2">Join WhatsApp</h3>
                <p className="text-sm text-slate-grey font-sans">
                  Click the verification link to instantly join our WhatsApp community.
                </p>
              </div>
            </div>
          </section>

          {/* Security Notice */}
          <section className="bg-blue-50 border border-blue-200 rounded-lg p-6 sm:p-8">
            <h2 className="text-lg sm:text-xl font-semibold text-blue-800 font-sans mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Security & Privacy
            </h2>
            <div className="text-blue-700 font-sans space-y-2 text-sm sm:text-base">
              <p>
                • All verification emails are sent securely using industry-standard encryption
              </p>
              <p>
                • Your email address is only used for verification purposes and accessing our WhatsApp community
              </p>
              <p>
                • We comply with GDPR and UK data protection regulations
              </p>
              <p>
                • Verification links expire after a reasonable time period for security
              </p>
            </div>
          </section>

          {/* Contact and Links */}
          <section className="text-center space-y-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-umhc-green font-sans">
              Need Help?
            </h2>
            <div className="space-y-2 text-deep-black font-sans">
              <p>
                Visit our main website: <a href="https://umhc.org.uk" className="text-umhc-green hover:text-stealth-green underline font-medium">umhc.org.uk</a>
              </p>
              <p>
                Request WhatsApp access: <a href="https://umhc.org.uk/whatsapp-request" className="text-umhc-green hover:text-stealth-green underline font-medium">umhc.org.uk/whatsapp-request</a>
              </p>
              <p>
                Contact us: <a href="mailto:contact@umhc.org.uk" className="text-umhc-green hover:text-stealth-green underline font-medium">contact@umhc.org.uk</a>
              </p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-200 text-center">
          <p className="text-sm text-slate-grey font-sans">
            © 2025 University of Manchester Hiking Club. All rights reserved.
          </p>
          <p className="text-xs text-slate-grey font-sans mt-2">
            This is an automated email verification system. For general inquiries, please visit our main website.
          </p>
        </footer>
      </div>
    </div>
  );
}