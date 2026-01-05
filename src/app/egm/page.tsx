import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import AddToCalendarButton from "@/components/AddToCalendarButton";

export const metadata: Metadata = {
  title: "UMHC | Understanding our EGM",
  description: "Join us for an Extraordinary General Meeting (EGM) to appoint committee members and vote on changes to our constitution. This page aims to help you understand the process and how to get involved in shaping your society.",
  openGraph: {
    title: "UMHC | Understanding our EGM",
    description: "Join us for an Extraordinary General Meeting (EGM) to appoint committee members and vote on changes to our constitution. This page aims to help you understand the process and how to get involved in shaping your society.",
    images: [
      {
        url: "/images/activity-images/vote-box.webp",
        width: 1200,
        height: 630,
        alt: "A voting box with a ballot being inserted",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "UMHC | Understanding our EGM",
    description: "Join us for an Extraordinary General Meeting (EGM) to appoint committee members and vote on changes to our constitution. This page aims to help you understand the process and how to get involved in shaping your society.",
    images: ["/images/activity-images/vote-box.webp"],
  },
};

// Force static generation for optimal performance
export const dynamic = 'force-static';

// Revalidate every hour (3600 seconds)
export const revalidate = 3600;

export default function EGMPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": "UMHC Extraordinary General Meeting (EGM)",
    "description": "Join us for an Extraordinary General Meeting (EGM) to appoint committee members and vote on changes to our constitution.",
    "image": "https://umhc.co.uk/images/activity-images/vote-box.webp",    "startDate": "2026-02-03T19:00:00+00:00",
    "endDate": "2026-02-03T21:00:00+00:00",
    "location": {
      "@type": "Place",
      "name": "Uni Place",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Oxford Road",
        "addressLocality": "Manchester",
        "postalCode": "M13 9PL",
        "addressCountry": "GB"
      }
    },    "organizer": {
      "@type": "Organization",
      "name": "University of Manchester Hiking Club",
      "url": "https://umhc.co.uk"
    },
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode"
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      {/* Skip to Main Content Link */}
      <a
        href="#main-content"
        className="hidden"
      >
        Skip to main content
      </a>

      <main id="main-content" className="flex flex-col gap-6 sm:gap-9 items-center w-full px-4 sm:px-6 lg:px-8 pt-20 pb-8 sm:pt-24 sm:pb-12 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section aria-labelledby="egm-title" className="flex flex-col items-center w-full">
        <div className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-60 md:h-60 mb-4">
          <Image
            alt="Voting box illustration"
            src="/images/activity-images/vote-box.webp"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 640px) 160px, (max-width: 768px) 192px, 240px"
          />
        </div>
        <h1 id="egm-title" className="font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-center text-black mb-4">
          We&apos;re Having an EGM
        </h1>
        <p className="font-medium text-sm sm:text-base text-center text-black max-w-4xl mb-4">
          Due to recent internal events within our committee, we&apos;re hosting an Extraordinary General Meeting (EGM) to appoint new committee members and potentially introduce new laws to our constitution. Almost anyone can apply for an open role within the committee, and we encourage all of you to join us to vote on the upcoming changes. This page aims to help you understand how things work and what you can do to get involved.
        </p>
        <p className="font-bold text-base sm:text-lg md:text-xl text-center text-[#494949]">
          3rd February | 7:00 PM | Room 5.206, Uni Place
        </p>
      </section>

      {/* Action Button */}
      <nav aria-label="EGM application actions" className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full">
        <AddToCalendarButton />
        <Link href="https://docs.google.com/forms/d/e/1FAIpQLScsVt2nCYl2xG_tdSpZrELyOU4sLeuj0Mu2ISwYNeWu-O894Q/viewform?usp=dialog" className="bg-[#b15539] text-[#fffefb] font-semibold text-[15px] px-3.5 py-1.5 rounded-full shadow-md hover:bg-[#9a4730] transition-colors text-center whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-[#b15539] focus:ring-offset-2" aria-label="Apply for a proxy vote or committee role">
          Apply for Proxy Vote or Role
        </Link>
      </nav>

      {/* What is an EGM Section */}
      <section aria-labelledby="what-is-egm" className="flex flex-col w-full max-w-4xl">
        <h2 id="what-is-egm" className="font-bold text-2xl sm:text-3xl md:text-4xl text-black mb-2">
          What is an EGM?
        </h2>
        <p className="font-medium text-sm sm:text-base text-black">
          EGM stands for Extraordinary General Meeting. We normally hold an Annual General Meeting (AGM) in March to appoint new committee members and approve amendments to our constitution; however, when something occurs that can&apos;t wait for the AGM, we hold an EGM to handle it. In this case, we&apos;ve had multiple committee members step down from their roles, and we need to vote to appoint new committee members so our club can function properly once again.
        </p>
      </section>

      {/* Understanding the Open Roles Section */}
      <section aria-labelledby="open-roles" className="flex flex-col gap-2 w-full max-w-4xl">
        <h2 id="open-roles" className="font-bold text-2xl sm:text-3xl md:text-4xl text-black mb-2">
          Understanding the Open Roles
        </h2>
        <div className="flex flex-col gap-4 sm:gap-6 w-full">
          {/* Chair */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start w-full">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-[101px] md:h-[101px] flex-shrink-0" aria-hidden="true">
              <Image
                alt=""
                src="/images/activity-images/gavel.webp"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, 101px"
              />
            </div>
            <div className="flex flex-col flex-1">
              <h3 className="font-bold text-xl sm:text-2xl text-black mb-1">
                Chair
              </h3>
              <p className="font-medium text-sm sm:text-base text-black">
                This is a crucial role and is required for the society to function. The Chair will lead all meetings at which they are present and should be available in person when necessary to ensure the smooth running of the society. They also contribute to all aspects of the society&apos;s functions, including arranging our Winter and Easter trips.
              </p>
            </div>
          </div>

          {/* Vice-Chair */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start w-full">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-[101px] md:h-[101px] flex-shrink-0" aria-hidden="true">
              <Image
                alt=""
                src="/images/activity-images/pen.webp"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, 101px"
              />
            </div>
            <div className="flex flex-col flex-1">
              <h3 className="font-bold text-xl sm:text-2xl text-black mb-1">
                Vice-Chair
              </h3>
              <p className="font-medium text-sm sm:text-base text-black">
                The Vice-Chair assists the Chair wherever possible and fills in for them when necessary. They also help to ensure the society runs smoothly whilst coordinating the work of the Hikes Secretaries to make sure everything is prepared for our day trips every week.
              </p>
            </div>
          </div>

          {/* Hike Secretary */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start w-full">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-[101px] md:h-[101px] flex-shrink-0" aria-hidden="true">
              <Image
                alt=""
                src="/images/activity-images/map.webp"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, 101px"
              />
            </div>
            <div className="flex flex-col flex-1">
              <h3 className="font-bold text-xl sm:text-2xl text-black mb-1">
                Hike Secretary
              </h3>
              <p className="font-medium text-sm sm:text-base text-black">
                We have three Hike Secretaries who all work together to plan the routes for all of our upcoming day trip hikes and scrambles across Snowdonia and the Lake District. As part of the role, the Hike Secretary should also give notice of routes to the trip leader and members, as well as organise the booking of coaches, including the drop-off and collection points, for the day hikes. Please note: a suggestion has been made to reduce the number of Hike Secretaries from three to two; this may be voted on at this EGM before voting opens for an applicant to be appointed to the role.
              </p>
            </div>
          </div>

          {/* Social Secretary */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start w-full">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-[101px] md:h-[101px] flex-shrink-0" aria-hidden="true">
              <Image
                alt=""
                src="/images/activity-images/bowling.webp"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, 101px"
              />
            </div>
            <div className="flex flex-col flex-1">
              <h3 className="font-bold text-xl sm:text-2xl text-black mb-1">
                Social Secretary
              </h3>
              <p className="font-medium text-sm sm:text-base text-black">
                We have two Social Secretaries who both work together to organise all of our upcoming social events, whether it&apos;s the usual weekly socials or special events such as our Christmas Dinner or Annual Dinner (we like our food). Their work helps to keep everyone in our society involved and included, so that the club can be as fun, active, and welcoming as possible.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Can I run for an Open Role Section */}
      <section aria-labelledby="run-for-role" className="flex flex-col w-full max-w-4xl">
        <h2 id="run-for-role" className="font-bold text-2xl sm:text-3xl md:text-4xl text-black mb-2">
          Can I run for an Open Role?
        </h2>
        <div className="font-medium text-sm sm:text-base text-black space-y-4">
          <p>
            Yes! All of our roles are open for almost anyone to apply for. The only condition is that you must either be a current student (at any Manchester University) or have special permission from the Student Union if not.
          </p>
          <p>
            If you wish to apply for a role whilst not being a current student, it may be best to request special permission from the Student Union; we&apos;d advise doing so ahead of time to prevent any issues. They&apos;ll ask you a few questions to grant you an exception to the SU rules, one of which may be whether the role you wish to run for is uncontested, and you may also be required to prove you have permission from the UMHC committee to be a part of it. At the end of the day, whether you can run for a role whilst not being a current student is at the discretion of the Student Union.
          </p>
          <p>
            We greatly encourage anyone to put their hat in the ring to run for an open role on the committee; if you wish to do so, please <Link href="https://docs.google.com/forms/d/e/1FAIpQLScsVt2nCYl2xG_tdSpZrELyOU4sLeuj0Mu2ISwYNeWu-O894Q/viewform?usp=dialog" className="text-[#b15539] underline hover:text-[#9a4730] focus:outline-none focus:ring-2 focus:ring-[#b15539] focus:ring-offset-2 rounded" aria-label="Fill in the role application form">fill in this form</Link> no later than 24 hours before the EGM.
          </p>
        </div>
      </section>

      {/* How does the process work Section */}
      <section aria-labelledby="process" className="flex flex-col w-full max-w-4xl">
        <h2 id="process" className="font-bold text-2xl sm:text-3xl md:text-4xl text-black mb-2">
          How does the process work?
        </h2>
        <div className="font-medium text-sm sm:text-base text-black space-y-4">
          <p>
            For many of you, the EGM or AGM might be completely new, so it&apos;s understandable if you&apos;re not quite sure how everything works. Whilst some societies just take applications via a form, post it on their social media, and then leave it for their members to vote, we run our application process slightly differently.
          </p>
          <p>
            Like other societies, we require all applicants to fill in an online form; this allows us to prepare ballots and other resources ahead of the EGM to ensure the event runs smoothly. This form will ask what role you wish to apply for, as well as the name of the person you wish to have nominate you (we&apos;ll explain this in a second). The application form is also shared with the proxy vote form; a proxy vote simply provides the ability for a member to nominate someone ahead of time to vote for them if they can&apos;t make it to the EGM. You don&apos;t need to fill in the proxy vote section if you&apos;re running for a role.
          </p>
          <p>
            Once you&apos;ve filled in the form and the big day has arrived, the EGM will work as follows. The Chair will make an introductory speech to welcome everyone and commence the EGM. Once complete, any amendments to the constitution will be put forward along with an explanation of why they should be made; after the proposer has pitched their amendment, anyone in the room may ask them questions about it, closely followed by a vote on the amendment. Finally, once all constitutional amendments have been voted upon, we&apos;ll move on to the roles. We&apos;ll work through the available roles with each applicant&apos;s nominee introducing them with a short speech; once the nominee has finished, it&apos;ll be the applicant&apos;s turn to make a speech about why they believe they&apos;re a good fit for the role and why you should vote for them. Once all applicants for a role have had their turn, voting for the role will open; after that&apos;s completed, we&apos;ll move on to the next available role until all roles have been voted upon. Finally, we&apos;ll announce and appoint our new committee members, and head off to celebrate!
          </p>
          <p>
            All in all, it can be a lengthy process; however, an EGM is much shorter and quicker than an AGM, which will occur in March.
          </p>
        </div>
      </section>

      {/* Constitution Amendments Section */}
      <section aria-labelledby="constitution-amendments" className="flex flex-col w-full max-w-4xl">
        <h2 id="constitution-amendments" className="font-bold text-2xl sm:text-3xl md:text-4xl text-black mb-2">
          Constitution Amendments
        </h2>
        <div className="font-medium text-sm sm:text-base text-black space-y-4">
          <p>
            Our <Link href="https://umhc.org.uk/constitution" className="text-[#b15539] underline hover:text-[#9a4730] focus:outline-none focus:ring-2 focus:ring-[#b15539] focus:ring-offset-2 rounded" aria-label="View the UMHC constitution">constitution</Link> defines the rules and structure of our club. Any member can propose an amendment, which must be seconded by another member. Both members will be required to present their amendment at the EGM before voting begins.
          </p>
          <p>
            Submit your amendment proposals <Link href="https://docs.google.com/forms/d/e/1FAIpQLSc12G7lhQAF5JMjG079KRq4p6SKFZhuQKALgmUQvO127z1Tgw/viewform?usp=header" className="text-[#b15539] underline hover:text-[#9a4730] focus:outline-none focus:ring-2 focus:ring-[#b15539] focus:ring-offset-2 rounded" aria-label="Submit a constitution amendment proposal">using this form</Link>. The deadline is 7:00 PM on 27th January to give the committee time to prepare.
          </p>
        </div>
      </section>

      {/* Crucial Voting Info Section */}
      <section aria-labelledby="voting-info" className="flex flex-col w-full max-w-4xl">
        <h2 id="voting-info" className="font-bold text-2xl sm:text-3xl md:text-4xl text-black mb-2">
          Crucial Voting Info
        </h2>
        <div className="font-medium text-sm sm:text-base text-black space-y-4">
          <p>
            Voting is open to all members of the club, whether you have a student membership, an associate membership, or a lifetime membership. You can even purchase a membership right up until just minutes before voting begins! We strongly encourage all of you to vote at the EGM, as it ensures that the club stays focussed on our members and not the interests of just a few people. If you&apos;re entitled to vote but can&apos;t make it to the EGM, you have the right to a proxy vote, which allows you to appoint another member to vote on your behalf. To do this, please <Link href="https://docs.google.com/forms/d/e/1FAIpQLScsVt2nCYl2xG_tdSpZrELyOU4sLeuj0Mu2ISwYNeWu-O894Q/viewform?usp=dialog" className="text-[#b15539] underline hover:text-[#9a4730] focus:outline-none focus:ring-2 focus:ring-[#b15539] focus:ring-offset-2 rounded" aria-label="Fill in the proxy vote application form">fill in this form</Link> no later than 24 hours before the EGM. (Please note: this is a shared form for role applicants as well; you don&apos;t need to fill in the role application sections if you&apos;re just applying for a proxy vote.)
          </p>
          <p>
            Finally, if this is your first EGM or AGM, it&apos;s crucial to know that on all voting slips, you&apos;ll be provided with an option called &apos;RON&apos; (Re-Open Nominations). This option is available if you don&apos;t wish any of the current applicants to be awarded the role. If this option wins the election, nominations for the role will be reopened for fresh applications and voted on either again on the spot or at a later EGM, depending on the circumstances.
          </p>
        </div>
      </section>

      {/* I'm a Member Section */}
      <section aria-labelledby="get-involved" className="flex flex-col w-full max-w-4xl">
        <h2 id="get-involved" className="font-bold text-2xl sm:text-3xl md:text-4xl text-black mb-2">
          I&apos;m a Member, how do I get involved?
        </h2>
        <p className="font-medium text-sm sm:text-base text-black">
          It&apos;s super easy! Just come along to our EGM and vote for whoever you wish to be elected to the role. If you can&apos;t make it, you&apos;re entitled to a proxy vote, where another member who will be there can vote on your behalf. If you wish to do this, <Link href="https://docs.google.com/forms/d/e/1FAIpQLScsVt2nCYl2xG_tdSpZrELyOU4sLeuj0Mu2ISwYNeWu-O894Q/viewform?usp=dialog" className="text-[#b15539] underline hover:text-[#9a4730] focus:outline-none focus:ring-2 focus:ring-[#b15539] focus:ring-offset-2 rounded" aria-label="Fill in the proxy vote form">please fill in this form.</Link>
        </p>
      </section>
    </main>
    </>
  );
}
