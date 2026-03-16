import { Metadata } from 'next';
import MembershipButton from '@/components/MembershipButton';

export const metadata: Metadata = {
  title: 'UMHC | Membership',
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
      role="img"
    >
      <title>Check mark</title>
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
    <div className="bg-cream-white rounded-[10px] shadow-[0_4px_12px_rgba(0,0,0,0.15)] sm:shadow-[0px_4px_15px_5px_rgba(0,0,0,0.25)] p-4 sm:p-5 pt-2.5 pb-6 sm:pb-[30px] pr-4 sm:pr-[30px] w-full sm:w-[387px] max-w-full">
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
    { text: "Reduced price day hike tickets (£14.75)" },
    { text: "Priority on waiting lists" },
    { text: "Reduced price weekend trip tickets" },
    { text: "More tickets available for members " },
    { text: "Reduced price easter trip tickets" },
    { text: "The ability to vote at EGMs & our AGM)" }
  ];

  const associateFeatures: MembershipFeature[] = [
    { text: "Reduced price day hike tickets (£14.75)" },
    { text: "Priority on waiting lists" },
    { text: "Reduced price weekend trip tickets" },
    { text: "More tickets available for members " },
    { text: "Reduced price easter trip tickets" },
    { text: "The ability to vote at EGMs & our AGM)" }
  ];

  return (
    <main className="bg-whellow min-h-screen">
      <div className="container mx-auto px-4 pt-24 pb-10">
        <div className="max-w-[1120px] mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-3">
              Membership
            </h1>
            <p className="text-base md:text-lg lg:text-xl font-medium text-black max-w-4xl mx-auto">
              Our semester 2 membership offers a more reduced packaged compared to our full year membership that we offered throughout semester one, this is mainly due to it not including BMC membership. Student membership is only available to UoM students whilst the associate membership is available for anyone else
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-center justify-center">
            <MembershipCard
              title="Student Membership"
              price="£10"
              period="for sem 2"
              buttonText="Purchase on the SU Website"
              features={studentFeatures}
            />
            
            <MembershipCard
              title="Associate Membership (Non-UoM)"
              price="£15"
              period="for sem 2"
              buttonText="Purchase on the SU Website"
              features={associateFeatures}
            />
          </div>
        </div>
      </div>
    </main>
  );
}