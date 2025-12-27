import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "UMHC | EGM",
  description: "Join us for an Extraordinary General Meeting (EGM) to appoint committee members and vote on changes to our constitution. This page intends to provide information about the process and how to get involved in shaping your society.",
  openGraph: {
    title: "UMHC | EGM",
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
    title: "UMHC | EGM",
    description: "Join us for an Extraordinary General Meeting (EGM) to appoint committee members and vote on changes to our constitution. This page intends to provide information about the process and how to get involved in shaping your society.",
    images: ["/images/activity-images/vote-box.webp"],
  },
};

export default function EGMPage() {
  return (
    <div className="flex flex-col gap-6 sm:gap-9 items-center w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="flex flex-col items-center w-full">
        <div className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-60 md:h-60 mb-4">
          <Image
            alt="Voting box illustration"
            src="/images/activity-images/vote-box.webp"
            fill
            className="object-cover"
            sizes="(max-width: 640px) 160px, (max-width: 768px) 192px, 240px"
          />
        </div>
        <h1 className="font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-center text-black mb-4">
          We&apos;re Having an EGM
        </h1>
        <p className="font-medium text-sm sm:text-base text-center text-black max-w-4xl mb-4">
          Due to recent internal events within our committee, we will now be hosting an Extraordinary General Meeting (EGM) to appoint new committee members and potentially introduce new laws to our constitution. Almost anyone can apply for an open role within the committee and we encourage all of our members to join us to vote on the upcoming changes. This page hopes to help you understand what&apos;s going on within your committee, how things work, and what you can do to get involved.
        </p>
        <p className="font-bold text-base sm:text-lg md:text-xl text-center text-[#494949] leading-relaxed sm:leading-10">
          The Date and Location have not yet been arranged
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-9 items-center justify-center w-full">
        <Link href="/under-development" className="bg-[#b15539] text-[#fffefb] font-semibold text-[15px] px-3.5 py-1.5 rounded-full shadow-md hover:bg-[#9a4730] transition-colors text-center whitespace-nowrap">
          Apply for a Proxy Vote
        </Link>
        <Link href="/under-development" className="bg-[#b15539] text-[#fffefb] font-semibold text-[15px] px-3.5 py-1.5 rounded-full shadow-md hover:bg-[#9a4730] transition-colors text-center whitespace-nowrap">
          Apply for a Role
        </Link>
      </div>

      {/* What is an EGM Section */}
      <div className="flex flex-col w-full max-w-4xl">
        <h2 className="font-bold text-2xl sm:text-3xl md:text-4xl text-black mb-2">
          What is an EGM?
        </h2>
        <p className="font-medium text-sm sm:text-base text-black">
          EGM is an acronym for the full phrase Extraordinary General Meeting. We normally hold an Annual General Meeting (AGM) in March to appoint new committee members and laws to our constitution, however when an event occurs that can&apos;t wait for the AGM, we hold an EGM to handle it. In this case, we&apos;ve had multiple committee members step down from their roles and we must vote to appoint new committee members for these open roles for our club to function correctly once again.
        </p>
      </div>

      {/* Understanding the Open Roles Section */}
      <div className="flex flex-col gap-2 w-full max-w-4xl">
        <h2 className="font-bold text-2xl sm:text-3xl md:text-4xl text-black mb-2">
          Understanding the Open Roles
        </h2>
        <div className="flex flex-col gap-4 sm:gap-6 w-full">
          {/* Chair */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start w-full">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-[101px] md:h-[101px] flex-shrink-0">
              <Image
                alt="Chair role"
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
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-[101px] md:h-[101px] flex-shrink-0">
              <Image
                alt="Vice-Chair role"
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
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-[101px] md:h-[101px] flex-shrink-0">
              <Image
                alt="Hike Secretary role"
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
                We have three hike secretaries who all work together to plan the routes for all of our upcoming day trip hikes and scrambles across Snowdonia and the Lake District. As part of the role, the hike secretary should also give notice of routes to the trip leader and members as well as also organise the booking of coaches, including teh drop-off and collection points, for the day hikes. Please note, a suggestion has been made to reduce the number of hike secretaries down from three to two, this may be voted on within this EGM before voting is open for an applicant to be appointed to the role.
              </p>
            </div>
          </div>

          {/* Publicity Secretary */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start w-full">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-[101px] md:h-[101px] flex-shrink-0">
              <Image
                alt="Publicity Secretary role"
                src="/images/activity-images/camera.webp"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, 101px"
              />
            </div>
            <div className="flex flex-col flex-1">
              <h3 className="font-bold text-xl sm:text-2xl text-black mb-1">
                Publicity Secretary
              </h3>
              <p className="font-medium text-sm sm:text-base text-black">
                The publicity secretary is in charge of all of our social media and ensures that we keep our members and the general public up to date with what we&apos;re up to and our upcoming plans through the use of excellent graphic design skills which they publish across TikTok and Instagram.
              </p>
            </div>
          </div>

          {/* Social Secretary */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start w-full">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-[101px] md:h-[101px] flex-shrink-0">
              <Image
                alt="Social Secretary role"
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
      </div>

      {/* Can I run for an Open Role Section */}
      <div className="flex flex-col w-full max-w-4xl">
        <h2 className="font-bold text-2xl sm:text-3xl md:text-4xl text-black mb-2">
          Can I run for an Open Role?
        </h2>
        <div className="font-medium text-sm sm:text-base text-black space-y-4">
          <p>
            Yes! All of our roles are open for almost anyone to apply for. The only condition is that you must either be a current student (at any Manchester University) or have special permission from the Student Union if not.
          </p>
          <p>
            If you wish to apply for a role whlst not a current student, it may be best to request special permission from the Student Union, it&apos;s advised to do so ahead of time to prevent any later issues if unsuccessful. They will ask you a few questions to grant you an exception to the SU rules, one of which may be whether the role you wish to run for is uncontested and you may also be required to prove permission from the UMHC committee to be apart of it. At the the end of the day, whether you can run for a role whilst not being a current student is at the discretion of the Student Union.
          </p>
          <p>
            It&apos;s greatly encourage that anyone put their hat into the ring to run for an open role in the committee, if you wish to do so then please <Link href="/under-development" className="text-[#b15539] underline hover:text-[#9a4730]">fill in the form which you can find at this link</Link> no later than 24 hours before the EGM.
          </p>
        </div>
      </div>

      {/* How does the process work Section */}
      <div className="flex flex-col w-full max-w-4xl">
        <h2 className="font-bold text-2xl sm:text-3xl md:text-4xl text-black mb-2">
          How does the process work?
        </h2>
        <div className="font-medium text-sm sm:text-base text-black space-y-4">
          <p>
            For many, the EGM or AGM is completely new to them so it&apos;s understandable to not be too sure how everything works. While some societies just take down applications via a form, post it on their social media and then leave it for their members to vote, we perform our applicant process slightly differently.
          </p>
          <p>
            Like other societies, we require all applicant to fill in an online form, this allows us to prepare ballots and other resources ahead of the EGM so that we can ensure everything is ready so that the event runs smoothly. This form, will ask you what role you wish to apply for as well as the name of the person you wish to have nominate you (we&apos;ll explain this in a second). The applicant form is also shared with the proxy vote form, a proxy vote just provides the ability for a member to nominate someone ahead of time to vote for them if they can&apos;t make it to the EGM, you don&apos;t need to fill in the proxy vote input if you&apos;re running for a role.
          </p>
          <p>
            Once you&apos;ve filled in the form and the big day has arrived, the EGM will work as follows. An introductory speech will be made to welcome everyone frm the chair and to commence the EGM. Once complete, any amendments to the constitution will be put forward along with an explanation of why the person believes such amendments should be made, after they&apos;ve pitched their amendment, anyone from the room may ask them questions about their suggestion, closely followed by a vote on such amendment. Finally, once all constitutional amendments have been voted upon, we move onto the roles. We&apos;ll work through the available roles with each applicant&apos;s nominee introducing them with a short speech about the applicant, once the nominee has finished their speech, it will become the applicants turn to make a speech about why they believe their a good fit for the role and why people should vote for them. Once all applicants for a role have had their turn, voting for the role will open, after that has completed for the role, we&apos;ll move onto to next available role until all roles have been voted upon. Finally, resulting in the announcement and appointment of our new committee members and we head off to celebrate.
          </p>
          <p>
            All in all, it can be a lengthy process, however an EGM is much shorter and quicker than an AGM which will occur in March.
          </p>
        </div>
      </div>

      {/* Crucial Voting Info Section */}
      <div className="flex flex-col w-full max-w-4xl">
        <h2 className="font-bold text-2xl sm:text-3xl md:text-4xl text-black mb-2">
          Crucial Voting Info
        </h2>
        <div className="font-medium text-sm sm:text-base text-black space-y-4">
          <p>
            Voting is open for all members of the club, whether you have a student membership, an associate membership, or a lifetime membership. You can even purchase a membership up until just minutes before the voting begins! It&apos;s very strongly encouraged that all of our members vote at the EGM as it ensures that the club stays focussed around our members and not the interests of a small few people. If you&apos;re entitled to vote but can&apos;t make it to the EGM then you have the right to a proxy vote which allows you to appoint a member of the club who can make it to the EGM to vote for you on your behalf. To do this, please <Link href="/under-development" className="text-[#b15539] underline hover:text-[#9a4730]">fill in the form which you can find at this link</Link> no later than 24 hours before the EGM (please note this is a shared form for role applicants to also fill in, you do not need to fill in the role applicant parts if you&apos;re just applying for a proxy vote).
          </p>
          <p>
            Finally, if this is you&apos;re first EGM or AGM, it&apos;s crucial to know that on all voting slips, you will be provided with an option titled &apos;RON&apos;, this option is available if you do not wish any of the current applicants to be awarded the role. If this option wins teh election, nominations for the role will be reopened for fresh applications and either voted for again on the spot or at a later EGM (dependant on the circumstances)
          </p>
        </div>
      </div>

      {/* I'm a Member Section */}
      <div className="flex flex-col w-full max-w-4xl">
        <h2 className="font-bold text-2xl sm:text-3xl md:text-4xl text-black mb-2">
          I&apos;m a Member, how do I get involved?
        </h2>
        <p className="font-medium text-sm sm:text-base text-black">
          It&apos;s super easy! Just come along to our EGM and vote for whoever you wish to be elected to the role. If you can&apos;t make it then you&apos;re entitled to a proxy vote, where another member who will be there can vote on your behalf. If you wish to do this then <Link href="/under-development" className="text-[#b15539] underline hover:text-[#9a4730]">please fill in this form.</Link>
        </p>
      </div>

      {/* Bottom Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-9 items-center justify-center w-full">
        <Link href="/under-development" className="bg-[#b15539] text-[#fffefb] font-semibold text-[15px] px-3.5 py-1.5 rounded-full shadow-md hover:bg-[#9a4730] transition-colors text-center whitespace-nowrap">
          Apply for a Proxy Vote
        </Link>
        <Link href="/under-development" className="bg-[#b15539] text-[#fffefb] font-semibold text-[15px] px-3.5 py-1.5 rounded-full shadow-md hover:bg-[#9a4730] transition-colors text-center whitespace-nowrap">
          Apply for a Role
        </Link>
      </div>
    </div>
  );
}
