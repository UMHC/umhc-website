import type { Metadata } from 'next';
import DOMPurify from 'isomorphic-dompurify';

export const metadata: Metadata = {
  title: 'UMHC | Constitution',
  description: 'University of Manchester Hiking Club constitution outlining our principles and guidelines for creating a welcoming and inclusive community.',
  openGraph: {
    title: 'UMHC Constitution',
    description: 'Our constitution outlines the principles and guidelines that help us maintain a safe, respectful, and welcoming environment.',
  },
};

// Constitution Section Component - Copy this entire block for each new section
interface ConstitutionSectionProps {
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
    
    // Check for sub-items FIRST (a.1. a.2. a.3. etc.)
    const subItemMatch = trimmedLine.match(/^([a-z])\.(\d+)\.\s*(.*)$/);
    if (subItemMatch) {
      const [, , number, text] = subItemMatch;
      const romanNumerals = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii', 'xiii', 'xiv', 'xv', 'xvi', 'xvii', 'xviii', 'xix', 'xx'];
      const roman = romanNumerals[parseInt(number) - 1] || number;
      // Don't make any sub-items bold - user requested no bolding for sub-items
      const romanText = `${roman})`;
      html += `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="display: inline-block; min-width: 2em; vertical-align: top;">${romanText}</span><span style="display: inline-block; vertical-align: top; width: calc(100% - 8em); margin-left: 0.5em;">${text}</span><br>`;
      continue;
    }
    
    // Check for main lettered items (a. b. c.)
    const letteredMatch = trimmedLine.match(/^([a-z])\.\s*(.*)$/);
    if (letteredMatch) {
      const [, letter, text] = letteredMatch;
      html += `<span style="display: inline-block; min-width: 1.5em; vertical-align: top;"><strong>${letter})</strong></span><span style="display: inline-block; vertical-align: top; width: calc(100% - 1.5em);">${text}</span><br>`;
      continue;
    }
    
    // Check for bullet points (* text)
    const bulletMatch = trimmedLine.match(/^\*\s*(.*)$/);
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

function ConstitutionSection({
  sectionNumber,
  sectionTitle,
  sectionText,
}: ConstitutionSectionProps) {
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

export default function ConstitutionPage() {
  return (
    <div className="bg-whellow min-h-screen px-2 sm:px-4 md:px-6 lg:px-8 pt-16 sm:pt-20 pb-8 sm:pb-12">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <header className="text-center space-y-2 mb-4 sm:mb-4">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-deep-black leading-tight font-sans px-2">
            Constitution
          </h1>
          <div className="max-w-5xl mx-auto px-2">
            <p className="text-xs sm:text-sm md:text-base text-deep-black font-medium font-sans leading-relaxed">
              As a society under The University of Manchester Student Union, we&apos;re committed to creating a welcoming and inclusive community for all of our members. Our constitution outlines the principles and guidelines that help us maintain a safe, respectful, and welcoming environment where everyone can enjoy hiking and socialising together. These rules ensure fair participation in our activities, from weekend hikes to social events, while protecting the interests of all members. Whether you&apos;re a committee member or a general society member, understanding our constitution helps create the positive community experience we&apos;re all here for. (Last updated July 2025)
            </p>
          </div>
        </header>

        {/* Constitution Sections */}
        <main className="space-y-0.5 sm:space-y-1 max-w-5xl mx-auto" role="main">
          {/* Section 1 - Copy this ConstitutionSection component for each new section */}
          <ConstitutionSection
            sectionNumber={1}
            sectionTitle="Name"
            sectionText={`The society shall be called University of Manchester Hiking Club, hereafter called 'the society'.`}
          />

          <ConstitutionSection
            sectionNumber={2}
            sectionTitle="Formation"
            sectionText={`The society was formed by the merger of MUHC and UHMC, in accordance with resolutions of general meetings of those clubs on 18th October 2004 and 18th March 2004.`}
          />

          <ConstitutionSection
            sectionNumber={3}
            sectionTitle="Aims and Objectives"
            sectionText={`a. To promote interest in hiking, camping, and mountaineering by arranging day hikes, weekend trips, holiday trips, and social functions.
                        b. To encourage safe and considerate practice amongst members.
                        c. To encourage the continuation and development of the society members' knowledge and skills.`}
          />

          <ConstitutionSection
            sectionNumber={4}
            sectionTitle="Membership"
            sectionText= {`a. Membership is open to all students of the University of Manchester, and to any other person who supports the aims and objectives of the society.
                        b. Associate membership shall be open to all non-members of UMSU but shall not exceed 25% of the membership. 
                        c. Membership shall not be open to minors without the express written permission of a parent or guardian. 
                        d. Honorary life members may be elected at a general meeting by a majority vote and thereafter shall pay members’ prices for all trips but shall not pay membership fees. However, if life members wish to be included on the society's BMC membership list, they are required to cover the cost of this. In addition, life members of MUHC shall be life members of the society.
                        e. Membership shall only be open to those who accept that hiking, mountaineering, and climbing are activities with a danger of personal injury or death. Participants of events shall be aware of and accept these risks, act according to the Code of Conduct, and agree to be responsible for their own actions and involvements.`}
          />
          
          <ConstitutionSection
            sectionNumber={5}
            sectionTitle="Subscriptions"
            sectionText={`The subscription for full and associate membership shall be an amount determined annually by the committee and must be paid in full before any person becomes a member.`}
          />

          <ConstitutionSection
            sectionNumber={6}
            sectionTitle="Committee"
            sectionText={`a. Being a member of the committee brings about the following general responsibilities, as well as those specific to each role
                        a.1. Contributing to the general organisation of the society as part of a team.
                        a.2. Promoting the society and maintaining a positive image of it and its members.
                        a.3. Doing their best to help society members, both on hikes and with general hiking requests.
                        a.4. To not abuse the privileges of the position and always give priority to ordinary members, especially those who are also volunteering their time.
                        b. The committee positions of the society shall be:
                        * Chair
                        * Vice-Chair
                        * Secretary
                        * Hike Secretary (3 Posts)
                        * Weekend Secretary (2 Posts)
                        * Publicity Secretary
                        * Social Secretary (2 Posts)
                        * Equipment Secretary
                        * Website Secretary
                        * Inclusion Officer
                        * Training Secretary
                        * Health and Safety Secretary
                        * Food Secretary

                        All elected committee members should be University of Manchester students, unless given special dispensation by the Student Union.

                        Each elected officer post is one year.

                        c. The roles of the positions are defined as the following:
                        c.1. The Chair shall take the chair at all meetings at which they are present and shall be available in person when necessary to ensure the smooth running of the society.
                        c.2. The Vice-Chair coordinates the work of the Hikes Secretaries and will stand in for the Chair when the Chair is absent. 
                        c.3. The Secretary shall keep a record of all the proceedings and attendances at all meetings, keep the membership records, and report membership numbers to the BMC and UMSU when necessary.
                        c.4. The Treasurer shall keep the books and accounts and enter therein all financial transactions. They must be prepared to produce a financial statement at any general meeting or committee meeting at least once per session. Thirdly, the Treasurer is responsible for the payment of BMC membership.
                        c.5. The Inclusion Officer shall be responsible for ensuring all members can partake in all events, all members' wellbeing, and shall act as the main point of contact for anyone seeking help or advice. In addition, they will be responsible for dealing with any sensitive issues that might arise from complaints to do with inclusions and exclusions. 
                        c.6. The Hike Secretaries shall organise the day hikes and scrambles and shall give notice of routes to members. They shall also organise the booking of coaches, including the drop-offs and collection points, for the day hikes. They shall be responsible for passing on this information to the trip leader. 
                        c.7. The Weekend Secretaries shall be responsible for organising weekend trips. 
                        c.8. The Publicity Secretary shall be responsible for publicising hikes, socials, and any other society events. 
                        c.9. The Social Secretaries shall organise social events. 
                        c.10. The Equipment Secretary shall be responsible for the purchase, safekeeping, loaning, and upkeep of the society's equipment. 
                        c.11. The Website Secretary shall be responsible for the maintenance and development of the society's website and mailing list. 
                        c.12. The Training Secretary shall organise events for members that will further their hiking skills 
                        c.13. The Health and Safety Secretary shall be responsible for creating and regularly updating the society's risk assessments, and any other safety documents related to the club, and ensuring all activities are as safe and accessible as possible 
                        c.14. The Food Secretary shall be responsible for the organisation and preparation of food on any society activity where food is provided 
                        d. These positions shall be elected at the Annual General Meeting and shall constitute the committee. Positions that are vacant can be elected at an Extraordinary General Meeting. 
                        e. No less than six committee members shall be full members of the society. 
                        f. The committee shall have the power to co-opt additional persons onto the committee to perform a specific duty, until such time as their specific duty is completed. Co-opted members shall contribute to quorum and shall be allowed to vote at committee meetings.`}
          />

          <ConstitutionSection
            sectionNumber={7}
            sectionTitle="Committee Meetings"
            sectionText={`a. The quorum at committee meetings shall be eight.
                b. The chair shall, in the case of equal voting on any matter, have the casting vote.
                c. There shall be at least one committee meeting per term.
                d. The time and place of every committee meeting shall be posted on the society's website, social media, and/or mailing list in advance.
                e. All committee meetings shall be open to any society member to attend and speak, but not to vote, on any matter.
                f. The minutes from the previous meeting shall be posted on the society's website at the request of any member.
                g. Any committee member who is absent from three consecutive meetings without offering an acceptable reason will have a vote of no confidence, if the Inclusion Officer hasn't been able to open successful dialogue after the second missed meeting. After the second missed meeting, there should be some dialogue as to why and the Inclusion Officer will contact them to see if any further support is needed.
                An Officer may be removed from their position by a vote of no confidence. A vote of no confidence may be made by the Society's Committee by a 75% majority or by a general meeting of that Society by a simple majority.
                A vote of no confidence will only be valid if:
                h.1. The Officer who is to be removed is given at least two weeks' notice of the meeting where the decision is to be made
                h.2. The Officer who is removed has the right to speak at the meeting where the decision is to be made, and has the right to have a statement circulated to the members of that meeting in advance
                h.3. The vote is taken by a secret ballot`}
          />

          <ConstitutionSection
            sectionNumber={8}
            sectionTitle="General Meetings"
            sectionText= {`a. Only full, associate, and honorary life members may vote at a general meeting.
                        b. The quorum at a general meeting shall be twenty members, including committee members, or one third of the full membership, whichever is the smaller.
                        c. Notice of meetings shall be placed on the society's website, social media, and/or mailing list, announcing the date, time and place of the meeting and the agenda thereof - at least seven days before a general meeting and two weeks before the Annual General Meeting.
                        d. The Annual General Meeting shall be held before the Easter holiday and shall transact the following business:
                        d.1. Approval of the minutes of the previous Annual General Meeting and any subsequent general meetings.
                        d.2. Amendments to the constitution
                        d.3. Approval of the chair's annual report.
                        d.4. Approval of the annual accounts presented by the treasurer.
                        d.5. Election of committee members for the following year, honorary life members, and any elected awards
                        d.6. Any other business the meeting wishes to conduct.
                        e. Voting for committee members and constitutional amendments shall be done by secret ballot, voting cards with the candidates' names and amendments being drawn up prior to the meeting. In the event of a tie, the vote should either be re-opened or a coin toss held.
                        f. Before the election of each position, there shall be speeches in support of each candidate by their proposer, and then by the candidate, who shall outline reasons for standing, etc. and shall also be prepared to answer any reasonable questions which may be put to themselves (the number of questions being at the discretion of the chair).
                        g. The fictitious person 'RON' shall be added as a nominee to all positions and if elected will trigger reopening of nominations for that position. The position shall be re-advertised to the membership and an Extraordinary General Meeting held at a later date, as decided by the committee.
                        h. Any person can stand for and hold multiple positions. This is dependent upon their secondary position(s) being uncontested at the general meeting. In addition, a maximum of one position from: Chair, Treasurer or Inclusion Officer may be held by a single person.
                        i. In the event of a candidate failing to be elected to a position, they can be nominated at the time of the AGM for any other unfilled post, without being declared earlier. If there is no such candidate willing to fill an unfilled position, a member of the general membership may stand for the unfilled position at the AGM.
                        j. Any person otherwise entitled to vote who cannot attend a general meeting because of their prior commitments is entitled to a proxy vote as of right, with their proxy being a full member. Proxy votes must be applied for not less than twenty-four hours before the general meeting.
                        k. An Extraordinary General Meeting shall be called at the request of the committee or by petition of at least one third of the full membership, or twenty members, whichever is the smaller`}
          />

          <ConstitutionSection
            sectionNumber={9}
            sectionTitle="Ammendments to the Constitution"
            sectionText={`a. For the constitution to be amended, a member must propose, and another member second said amendment, at least one week before the general meeting. The list of amendments must be published to the membership before the general meeting. Before voting on the amendment, the proposer must outline reasons for the amendment and shall also be prepared to answer any reasonable questions which may be put to them (the number of questions being at the discretion of the chair).
                        b. The constitution may only be amended by a two-thirds majority at a general meeting. 
                        c. Any amendments to the constitution must comply with the Society By-Laws`}
          />

          <ConstitutionSection
            sectionNumber={10}
            sectionTitle="Discipline"
            sectionText={`a. In order to promote the safety of all members when on hikes, power shall be given to the committee to take disciplinary action against any member in accordance with subsection b of this section.
                        b. The committee may take disciplinary action if the member in question does any act while on a society event that endangers or is likely to endanger: the safety of themselves, any other society member, any other person, or any other vertebrate.
                        c. The executive committee may suspend any member from society events who is accused of serious misconduct, e.g. sexual or physical including harassment and intimidation, pending further investigation. The offence does not necessarily have to have happened at a society event. In the case that the allegations are found to be true, the special committee may ban said member from society events. If any intentionally false claims of misconduct are made, the accuser may also be suspended and potentially banned from the society.
                        c.1. Any issues of sexual or physical harassment should also be reported to the University's Report and Support Service AND the SU Groups Team should be notified.
                        d. Any member accused under this section shall have the following rights:
                        d.1. To have full details of the specific offence alleged.
                        d.2. To have reasonable opportunity to put their case orally to the committee, at a meeting in private if they so wish, notwithstanding subsection 7e of this constitution.
                        e. The power to expel members lies only within the current Activities and Culture Exec Officer.
                        f. Smoking is forbidden on club transport.`}
          />

          <ConstitutionSection
            sectionNumber={11}
            sectionTitle="Property and Dissolution"
            sectionText={`a. All property is ultimately the property of UMSU.
                        b. In the event of dissolution of the society, or if it shall have failed to meet during any period of 12 consecutive months, the said property, subject to the payment of any liabilities of the society and a right of the Treasurer to indemnify themself against any liabilities properly incurred by themself as Treasurer, be vested in the UMSU. 
                        c. The society can be dissolved by two thirds majority vote carried out in accordance with section 6 of this constitution.`}
          />

          {/* 
          INSTRUCTIONS FOR ADDING NEW SECTIONS:
          
          1. Copy the ConstitutionSection component above
          2. Update the sectionNumber (2, 3, 4, etc.)
          3. Update the sectionTitle with your section name
          4. Update the sectionText with your section content
          
          Example:
          <ConstitutionSection
            sectionNumber={2}
            sectionTitle="Formation"
            sectionText="Your section text goes here..."
          />
          */}
        </main>

        <header className="text-center space-y-2 mb-4 sm:mb-4 mt-12 sm:mt-16">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-deep-black leading-tight font-sans px-2">
            Code of Conduct
          </h1>
          <div className="max-w-5xl mx-auto px-2">
            <p className="text-xs sm:text-sm md:text-base text-deep-black font-medium font-sans leading-relaxed">
              This code of conduct sets out the expected behaviour of participants in University of Manchester Hiking Club (UMHC) events to maintain a welcoming and supportive environment. They have been created to embody the mission of UMHC: to promote interest in hiking, camping, and mountaineering; to encourage safe and considerate practice amongst members; to encourage the continuation and development of the society members’ knowledge and skills.
            </p>
          </div>
        </header>
        <main className="space-y-0.5 sm:space-y-1 max-w-5xl mx-auto" role="main">
          <ConstitutionSection
            sectionNumber={1}
            sectionTitle="Participants at society events:"
            sectionText={`a. Respect the rights, dignities and worth of everyone.
                        b. Take care of your health and safety and that of others who may be affected by your actions.
                        c. Do not use illegal substances at UMHC-organised events and only smoke/vape or consume alcohol in appropriate areas.
                        d. Always report concerns about safeguarding, bullying, harassment and discrimination including verbal, physical or online behaviour.
                        e. Maintain confidentiality when entrusted with privileged information.`}
          />

          <ConstitutionSection
            sectionNumber={2}
            sectionTitle="Day Trips, Weekend Trips, and Vacation Trips"
            sectionText={`a. Respect the natural outdoor environment and minimise the environmental impact of your activities, following Leave No Trace principles.
                        b. Be honest with yourself and leaders concerning illness, injury, and your ability to participate fully.
                        c. Never belittle a participant for their hiking performance or ability.`}
          />

          <ConstitutionSection
            sectionNumber={3}
            sectionTitle="Hike Leaders and Committee Members"
            sectionText={`a. Promote, maintain and uphold the reputation of UMHC.
                        b. Never condone code violation or use of illegal substances at UMHC events.
                        c. Do not consume alcohol during or immediately before leading hikes.
                        d. Always consider the well-being and safety of participants as paramount.
                        e. Actively work to create an inclusive environment where all participants feel welcome regardless of experience level.
                        f. Ensure all activities are planned, risk assessed and that participants are suitably prepared mentally and physically.
                        g. Never victimise or encourage the victimisation of any individual for raising concerns or making a complaint.
                        h. Never assume responsibility for any role for which you are not qualified, prepared, or that is beyond the scope of your expertise.
                        i. Never share sensitive and privileged information you have access to.`}
          />
        </main>
      </div>
    </div>
  )
}