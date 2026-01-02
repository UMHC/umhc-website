import Link from 'next/link';

interface MembershipFeature {
  text: string;
}

interface MembershipCardProps {
  title: string;
  price: string;
  period?: string;
  buttonText?: string;
  buttonLink?: string;
  features: MembershipFeature[];
  variant?: 'free' | 'student' | 'associate';
}

function CheckIcon() {
  return (
    <svg
      className="w-3.5 h-3.5 text-black shrink-0 mt-1"
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

function MembershipCard({ title, price, period, buttonText, buttonLink, features, variant = 'student' }: MembershipCardProps) {
  const cardWidth = 'w-full max-w-sm mx-auto';
  const shadow = variant === 'free' 
    ? 'shadow-[0_2px_8px_rgba(0,0,0,0.1)] sm:shadow-[0px_4px_10px_5px_rgba(0,0,0,0.15)]' 
    : 'shadow-[0_4px_12px_rgba(0,0,0,0.15)] sm:shadow-[0px_4px_15px_5px_rgba(0,0,0,0.25)]';
  
  return (
    <article 
      className={`bg-cream-white rounded-[10px] ${shadow} p-4 md:p-5 pt-2.5 pb-6 md:pb-[30px] pr-4 md:pr-[30px] ${cardWidth}`}
      role="region"
      aria-labelledby={`membership-${variant}-title`}
    >
      <header className="flex flex-col items-center gap-2.5 pb-4 md:pb-[15px]">
        <div className="flex flex-col items-center text-black text-center">
          <h3 
            id={`membership-${variant}-title`}
            className="font-semibold text-sm md:text-base mb-1"
          >
            {title}
          </h3>
          <div className="font-bold" aria-label={`Price: ${price}${period ? ` ${period}` : ''}`}>
            {variant === 'free' ? (
              <span className="text-3xl md:text-4xl">{price}</span>
            ) : (
              <>
                <span className="text-3xl md:text-4xl">{price} </span>
                {period && <span className="text-lg md:text-xl">{period}</span>}
              </>
            )}
          </div>
        </div>
        {buttonText && buttonLink && (
          <Link 
            href={buttonLink}
            className="border-2 border-earth-orange text-earth-orange px-3 md:px-[9px] py-1.5 md:py-1 rounded-full text-sm font-semibold hover:bg-earth-orange hover:text-white focus:bg-earth-orange focus:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-earth-orange focus:ring-offset-2 active:scale-95 transform"
            aria-label={`${buttonText} for ${title}`}
          >
            {buttonText}
          </Link>
        )}
      </header>
      
      <div className="space-y-2" role="list" aria-label={`${title} features`}>
        {features.map((feature, index) => (
          <div key={index} className="flex items-start gap-2" role="listitem">
            <CheckIcon />
            <span className="text-black text-sm md:text-base font-medium flex-1 leading-relaxed">
              {feature.text}
            </span>
          </div>
        ))}
      </div>
    </article>
  );
}

export default function MembershipSection() {
  const studentMembershipUrl = process.env.NEXT_PUBLIC_STUDENT_MEMBERSHIP_URL || '/membership';
  const associateMembershipUrl = process.env.NEXT_PUBLIC_ASSOCIATE_MEMBERSHIP_URL || '/membership';

  const freeFeatures: MembershipFeature[] = [
    { text: "Access to most hikes" },
    { text: "Access to all social events" },
    { text: "Full price hike tickets (£21.50)" }
  ];

  const studentFeatures: MembershipFeature[] = [
    { text: "Access to all hikes" },
    { text: "Access to all social events" },
    { text: "Discounted hike tickets (£14.75)" },
    { text: "£15 million combined liability insurance (via BMC)" },
    { text: "£10000 personal accident insurance cover (via BMC)" },
    { text: "15% discount in Cotswold Outdoor, Snow+Rock, Runners Need and more (via BMC)" },
    { text: "Access to BMC Travel Insurance (via BMC)" },
    { text: "Mountain Training Registration (via BMC)" },
    { text: "Discounted membership or extended free trials with Strava, OS Maps, Komoot, AllTrails, and more (via BMC)" },
    { text: "96% discount on YHA membership if you're under 26 (via BMC)" }
  ];

  const associateFeatures: MembershipFeature[] = [
    { text: "Access to hikes" },
    { text: "Access to ticketed social events" },
    { text: "Discounted hike tickets (£14.75)" },
    { text: "£15 million combined liability insurance (via BMC)" },
    { text: "£10000 personal accident insurance cover (via BMC)" },
    { text: "15% discount in Cotswold Outdoor, Snow+Rock, Runners Need and more (via BMC)" },
    { text: "Access to BMC Travel Insurance (via BMC)" },
    { text: "Mountain Training Registration (via BMC)" },
    { text: "Discounted membership or extended free trials with Strava, OS Maps, Komoot, AllTrails, and more (via BMC)" },
    { text: "96% discount on YHA membership if you're under 26 (via BMC)" }
  ];

  return (
    <section className="bg-whellow pt-8 md:pt-10 pb-12 md:pb-16" aria-labelledby="membership-heading">
      <div className="container mx-auto px-4 max-w-7xl">
        <header className="text-center mb-8 md:mb-[30px] px-2 sm:px-4 md:px-12 lg:px-20">
          <h2 id="membership-heading" className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-6 md:mb-5">
            Join Us
          </h2>
          <p className="text-sm sm:text-base font-medium text-black max-w-4xl mx-auto leading-relaxed">
            Anybody can be a part of our community, by purchasing a membership you get extended access to it! 
            The key benefit of our membership is the ability to register with the British Mountaineering Council (BMC) 
            at no extra cost to receive £15 million combined liability insurance, £10000 personal accident insurance cover, 
            15% off at a variety of outdoor suppliers and more. On top of this, we tend to limit popular trips to members only.
          </p>
        </header>

        <div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 items-start justify-items-center"
          role="group" 
          aria-label="Membership options"
        >
          <MembershipCard
            title="Non-Member"
            price="Free"
            features={freeFeatures}
            variant="free"
          />
          
          <MembershipCard
            title="Student Membership"
            price="£30"
            period="per year"
            buttonText="Purchase on the SU Website"
            buttonLink={studentMembershipUrl}
            features={studentFeatures}
            variant="student"
          />
          
          <MembershipCard
            title="Associate Membership (Non-UoM)"
            price="£35"
            period="per year"
            buttonText="Purchase on the SU Website"
            buttonLink={associateMembershipUrl}
            features={associateFeatures}
            variant="associate"
          />
        </div>
      </div>
    </section>
  );
}