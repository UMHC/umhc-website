import { Metadata } from 'next';
import MembershipButton from '@/components/MembershipButton';

export const metadata: Metadata = {
  title: 'Membership - UMHC | University of Manchester Hiking Club',
  description: 'Join UMHC with our Student or Associate membership options. Access to hikes, social events, insurance coverage and more.',
};

interface MembershipFeature {
  text: string;
}

interface MembershipCardProps {
  title: string;
  price: string;
  period: string;
  buttonText: string;
  features: MembershipFeature[];
}

function CheckIcon() {
  return (
    <svg
      className="w-3.5 h-3.5 text-black"
      fill="currentColor"
      viewBox="0 0 14 14"
      aria-hidden="true"
    >
      <path
        clipRule="evenodd"
        fillRule="evenodd"
        d="M7 14C8.85652 14 10.637 13.2625 11.9497 11.9497C13.2625 10.637 14 8.85652 14 7C14 5.14348 13.2625 3.36301 11.9497 2.05025C10.637 0.737498 8.85652 0 7 0C5.14348 0 3.36301 0.737498 2.05025 2.05025C0.737498 3.36301 0 5.14348 0 7C0 8.85652 0.737498 10.637 2.05025 11.9497C3.36301 13.2625 5.14348 14 7 14ZM10.2436 5.86862C10.403 5.7036 10.4912 5.48257 10.4892 5.25315C10.4872 5.02373 10.3952 4.80427 10.233 4.64203C10.0707 4.4798 9.85127 4.38778 9.62185 4.38579C9.39243 4.38379 9.1714 4.47199 9.00638 4.63138L6.125 7.51275L4.99362 6.38138C4.8286 6.22199 4.60757 6.13379 4.37815 6.13579C4.14873 6.13778 3.92927 6.2298 3.76703 6.39203C3.6048 6.55427 3.51278 6.77373 3.51079 7.00315C3.50879 7.23257 3.59699 7.4536 3.75638 7.61862L5.50638 9.36862C5.67046 9.53266 5.89298 9.62481 6.125 9.62481C6.35702 9.62481 6.57954 9.53266 6.74362 9.36862L10.2436 5.86862Z"
      />
    </svg>
  );
}

function MembershipCard({ title, price, period, buttonText, features }: MembershipCardProps) {
  return (
    <div className="bg-cream-white rounded-[10px] shadow-[0px_4px_15px_5px_rgba(0,0,0,0.25)] p-5 pt-2.5 pb-[30px] pr-[30px] w-[387px] max-w-full">
      <div className="flex flex-col items-center gap-2.5 pb-[15px]">
        <div className="flex flex-col items-center text-black text-center">
          <h3 className="font-semibold text-sm mb-1">
            {title}
          </h3>
          <div className="font-bold">
            <span className="text-4xl">{price} </span>
            <span className="text-xl">{period}</span>
          </div>
        </div>
        <MembershipButton buttonText={buttonText} title={title} />
      </div>
      
      <div className="space-y-2">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center gap-2">
            <CheckIcon />
            <span className="text-black text-base font-medium flex-1">
              {feature.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MembershipPage() {
  const studentFeatures: MembershipFeature[] = [
    { text: "Access to all hikes" },
    { text: "Access to all social events" },
    { text: "Discounted hike tickets" },
    { text: "£15 million combined liability insurance (via BMC)" },
    { text: "£10000 personal accident insurance cover (via BMC)" },
    { text: "15% discount in Cotswold Outdoor, Snow+Rock, Runners Need and more (via BMC)" },
    { text: "Access to BMC Travel Insurance (via BMC)" },
    { text: "Mountain Training Registration (via BMC)" },
    { text: "Discounted membership or extended free trials with Strava, OS Maps, Komoot, AllTrails, and more (via BMC)" },
    { text: "96% discount on YHA membership if you're under 26 (via BMC)" }
  ];

  const associateFeatures: MembershipFeature[] = [
    { text: "Limited access to hikes" },
    { text: "Limited access to ticketed social events" },
    { text: "Discounted hike tickets" },
    { text: "£15 million combined liability insurance (via BMC)" },
    { text: "£10000 personal accident insurance cover (via BMC)" },
    { text: "15% discount in Cotswold Outdoor, Snow+Rock, Runners Need and more (via BMC)" },
    { text: "Access to BMC Travel Insurance (via BMC)" },
    { text: "Mountain Training Registration (via BMC)" },
    { text: "Discounted membership or extended free trials with Strava, OS Maps, Komoot, AllTrails, and more (via BMC)" },
    { text: "96% discount on YHA membership if you're under 26 (via BMC)" }
  ];

  return (
    <main className="bg-whellow min-h-screen">
      <div className="container mx-auto px-4 pt-24 pb-10">
        <div className="max-w-[1120px] mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-3">
              Take your pick
            </h1>
            <p className="text-base md:text-lg lg:text-xl font-medium text-black max-w-4xl mx-auto">
              We&apos;d love to have you as a member! Select which membership applies 
              to you below and we&apos;ll send you to the correct place. A student 
              membership is only available to University of Manchester students, 
              whilst the associate membership is available to anyone.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-10 items-center justify-center">
            <MembershipCard
              title="Student Membership"
              price="£25"
              period="per year"
              buttonText="Purchase on the SU Website"
              features={studentFeatures}
            />
            
            <MembershipCard
              title="Associate Membership (Non-UoM)"
              price="£32"
              period="per year"
              buttonText="Purchase on the SU Website"
              features={associateFeatures}
            />
          </div>
        </div>
      </div>
    </main>
  );
}