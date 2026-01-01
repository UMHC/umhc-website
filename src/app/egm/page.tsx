import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "UMHC | Understanding our EGM",
  description: "Join us for an Extraordinary General Meeting (EGM) to appoint committee members and vote on changes to our constitution. This page intends to provide information about the process and how to get involved in shaping your society.",
  openGraph: {
    title: "UMHC | Understanding our EGM",
    description: "Join us for an Extraordinary General Meeting (EGM) to appoint committee members and vote on changes to our constitution. This page intends to provide information about the process and how to get involved in shaping your society.",
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
    description: "Join us for an Extraordinary General Meeting (EGM) to appoint committee members and vote on changes to our constitution. This page intends to provide information about the process and how to get involved in shaping your society.",
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
    "image": "https://umhc.co.uk/images/activity-images/vote-box.webp",
    "organizer": {
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
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-[#b15539] focus:text-white focus:px-4 focus:py-2 focus:rounded focus:outline-none focus:ring-2 focus:ring-white"
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
          Due to recent internal events within our committee, we will now be hosting an Extraordinary General Meeting (EGM) to appoint new committee members and potentially introduce new laws to our constitution. Almost anyone can apply for an open role within the committee and we encourage all of our members to join us to vote on the upcoming changes. This page hopes to help you understand what&apos;s going on within your committee, how things work, and what you can do to get involved.
        </p>
        <p className="font-bold text-base sm:text-lg md:text-xl text-center text-[#494949] leading-relaxed sm:leading-10">
          The Date and Location have not yet been arranged
        </p>
      </section>

      {/* Action Buttons */}
      <nav aria-label="EGM application actions" className="flex flex-col sm:flex-row gap-4 sm:gap-9 items-center justify-center w-full">
        <Link href="https://docs.google.com/forms/d/e/1FAIpQLScsVt2nCYl2xG_tdSpZrELyOU4sLeuj0Mu2ISwYNeWu-O894Q/viewform?usp=dialog" className="bg-[#b15539] text-[#fffefb] font-semibold text-[15px] px-3.5 py-1.5 rounded-full shadow-md hover:bg-[#9a4730] transition-colors text-center whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-[#b15539] focus:ring-offset-2" aria-label="Apply for a proxy vote to vote on your behalf">
          Apply for a Proxy Vote
        </Link>
        <Link href="https://docs.google.com/forms/d/e/1FAIpQLScsVt2nCYl2xG_tdSpZrELyOU4sLeuj0Mu2ISwYNeWu-O894Q/viewform?usp=dialog" className="bg-[#b15539] text-[#fffefb] font-semibold text-[15px] px-3.5 py-1.5 rounded-full shadow-md hover:bg-[#9a4730] transition-colors text-center whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-[#b15539] focus:ring-offset-2" aria-label="Apply for an open committee role">
          Apply for a Role
        </Link>
      </nav>

      {/* What is an EGM Section */}
      <section aria-labelledby="what-is-egm" className="flex flex-col w-full max-w-4xl">
        <h2 id="what-is-egm" className="font-bold text-2xl sm:text-3xl md:text-4xl text-black mb-2">
          What is an EGM?
        </h2>
        <p className="font-medium text-sm sm:text-base text-black">
          EGM is an acronym for the full phrase Extraordinary General Meeting. We normally hold an Annual General Meeting (AGM) in March to appoint new committee members and laws to our constitution, however when an event occurs that can&apos;t wait for the AGM, we hold an EGM to handle it. In this case, we&apos;ve had multiple committee members step down from their roles and we must vote to appoint new committee members for these open roles for our club to function correctly once again.
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
                This is a crucial role and required for the society to function, this person will take the chair at all meetings at which they are present and should be available in person when necessary to ensure the smooth running of the society. They also contribute to all aspects of the functions of the society including arranging our Winter and Easter trips.
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
                The Vice-Chair assists the Chair where possible and will fill in for them when necessary. They also help to ensure the society runs smoothly whilst coordinating the work of the Hikes Secretaries to make sure everything is prepared for day trips every week.
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
                We have three hike secretaries who all work together to plan the routes for all of our upcoming day trip hikes and scrambles across Snowdonia and the Lake District. As part of the role, the hike secretary should also give notice of routes to the trip leader and members, as well as organise the booking of coaches, including the drop-off and collection points, for the day hikes. Please note, a suggestion has been made to reduce the number of hike secretaries down from three to two; this may be voted on within this EGM before voting is open for an applicant to be appointed to the role.
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
                We have two social secretaries who both work together to organise all of our upcoming social events, whether it&apos;s the usual weekly socials or special events such as our Christmas dinner or Annual Dinner (we like our food). Their work helps to keep everyone in our society involved and included so that the club can be as fun, active, and welcoming as possible.
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
            If you wish to apply for a role whilst not a current student, it may be best to request special permission from the Student Union; it&apos;s advised to do so ahead of time to prevent any later issues if unsuccessful. They will ask you a few questions to grant you an exception to the SU rules, one of which may be whether the role you wish to run for is uncontested, and you may also be required to prove permission from the UMHC committee to be a part of it. At the end of the day, whether you can run for a role whilst not being a current student is at the discretion of the Student Union.
          </p>
          <p>
            It&apos;s greatly encouraged that anyone put their hat into the ring to run for an open role in the committee; if you wish to do so, then please <Link href="https://docs.google.com/forms/d/e/1FAIpQLScsVt2nCYl2xG_tdSpZrELyOU4sLeuj0Mu2ISwYNeWu-O894Q/viewform?usp=dialog" className="text-[#b15539] underline hover:text-[#9a4730] focus:outline-none focus:ring-2 focus:ring-[#b15539] focus:ring-offset-2 rounded" aria-label="Fill in the role application form">fill in the form which you can find at this link</Link> no later than 24 hours before the EGM.
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
            For many, the EGM or AGM is completely new to them so it&apos;s understandable to not be too sure how everything works. While some societies just take down applications via a form, post it on their social media and then leave it for their members to vote, we perform our applicant process slightly differently.
          </p>
          <p>
            Like other societies, we require all applicants to fill in an online form; this allows us to prepare ballots and other resources ahead of the EGM so that we can ensure everything is ready so that the event runs smoothly. This form will ask you what role you wish to apply for, as well as the name of the person you wish to have nominate you (we&apos;ll explain this in a second). The applicant form is also shared with the proxy vote form; a proxy vote just provides the ability for a member to nominate someone ahead of time to vote for them if they can&apos;t make it to the EGM. You don&apos;t need to fill in the proxy vote input if you&apos;re running for a role.
          </p>
          <p>
            Once you&apos;ve filled in the form and the big day has arrived, the EGM will work as follows. An introductory speech will be made to welcome everyone from the chair and to commence the EGM. Once complete, any amendments to the constitution will be put forward along with an explanation of why the person believes such amendments should be made; after they&apos;ve pitched their amendment, anyone from the room may ask them questions about their suggestion, closely followed by a vote on such amendment. Finally, once all constitutional amendments have been voted upon, we move onto the roles. We&apos;ll work through the available roles with each applicant&apos;s nominee introducing them with a short speech about the applicant; once the nominee has finished their speech, it will become the applicant&apos;s turn to make a speech about why they believe they&apos;re a good fit for the role and why people should vote for them. Once all applicants for a role have had their turn, voting for the role will open; after that has completed for the role, we&apos;ll move onto the next available role until all roles have been voted upon. Finally, this will result in the announcement and appointment of our new committee members, and we head off to celebrate.
          </p>
          <p>
            All in all, it can be a lengthy process, however an EGM is much shorter and quicker than an AGM which will occur in March.
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
            Voting is open for all members of the club, whether you have a student membership, an associate membership, or a lifetime membership. You can even purchase a membership up until just minutes before the voting begins! It&apos;s very strongly encouraged that all of our members vote at the EGM as it ensures that the club stays focussed around our members and not the interests of a small few people. If you&apos;re entitled to vote but can&apos;t make it to the EGM then you have the right to a proxy vote which allows you to appoint a member of the club who can make it to the EGM to vote for you on your behalf. To do this, please <Link href="https://docs.google.com/forms/d/e/1FAIpQLScsVt2nCYl2xG_tdSpZrELyOU4sLeuj0Mu2ISwYNeWu-O894Q/viewform?usp=dialog" className="text-[#b15539] underline hover:text-[#9a4730] focus:outline-none focus:ring-2 focus:ring-[#b15539] focus:ring-offset-2 rounded" aria-label="Fill in the proxy vote application form">fill in the form which you can find at this link</Link> no later than 24 hours before the EGM (please note this is a shared form for role applicants to also fill in, you do not need to fill in the role applicant parts if you&apos;re just applying for a proxy vote).
          </p>
          <p>
            Finally, if this is your first EGM or AGM, it&apos;s crucial to know that on all voting slips, you will be provided with an option titled &apos;RON&apos;; this option is available if you do not wish any of the current applicants to be awarded the role. If this option wins the election, nominations for the role will be reopened for fresh applications and either voted for again on the spot or at a later EGM (dependent on the circumstances).
          </p>
        </div>
      </section>

      {/* I'm a Member Section */}
      <section aria-labelledby="get-involved" className="flex flex-col w-full max-w-4xl">
        <h2 id="get-involved" className="font-bold text-2xl sm:text-3xl md:text-4xl text-black mb-2">
          I&apos;m a Member, how do I get involved?
        </h2>
        <p className="font-medium text-sm sm:text-base text-black">
          It&apos;s super easy! Just come along to our EGM and vote for whoever you wish to be elected to the role. If you can&apos;t make it then you&apos;re entitled to a proxy vote, where another member who will be there can vote on your behalf. If you wish to do this then <Link href="https://docs.google.com/forms/d/e/1FAIpQLScsVt2nCYl2xG_tdSpZrELyOU4sLeuj0Mu2ISwYNeWu-O894Q/viewform?usp=dialog" className="text-[#b15539] underline hover:text-[#9a4730] focus:outline-none focus:ring-2 focus:ring-[#b15539] focus:ring-offset-2 rounded" aria-label="Fill in the proxy vote form">please fill in this form.</Link>
        </p>
      </section>

      {/* Bottom Action Buttons */}
      <nav aria-label="EGM application actions" className="flex flex-col sm:flex-row gap-4 sm:gap-9 items-center justify-center w-full">
        <Link href="https://docs.google.com/forms/d/e/1FAIpQLScsVt2nCYl2xG_tdSpZrELyOU4sLeuj0Mu2ISwYNeWu-O894Q/viewform?usp=dialog" className="bg-[#b15539] text-[#fffefb] font-semibold text-[15px] px-3.5 py-1.5 rounded-full shadow-md hover:bg-[#9a4730] transition-colors text-center whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-[#b15539] focus:ring-offset-2" aria-label="Apply for a proxy vote to vote on your behalf">
          Apply for a Proxy Vote
        </Link>
        <Link href="https://docs.google.com/forms/d/e/1FAIpQLScsVt2nCYl2xG_tdSpZrELyOU4sLeuj0Mu2ISwYNeWu-O894Q/viewform?usp=dialog" className="bg-[#b15539] text-[#fffefb] font-semibold text-[15px] px-3.5 py-1.5 rounded-full shadow-md hover:bg-[#9a4730] transition-colors text-center whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-[#b15539] focus:ring-offset-2" aria-label="Apply for an open committee role">
          Apply for a Role
        </Link>
      </nav>
    </main>
    </>
  );
}
