'use client';

import { generateICSFile, openInCalendar } from '@/lib/calendar';

interface AddToCalendarButtonProps {
  className?: string;
}

export default function AddToCalendarButton({ className = '' }: AddToCalendarButtonProps) {
  const handleAddToCalendar = () => {
    const eventDetails = {
      title: 'UMHC EGM',
      description: `Join us for the UMHC Extraordinary General Meeting (EGM) to appoint new committee members and vote on constitutional changes.

Location Details: Room 5.206 is located on the fifth floor of Uni Place. Enter through the main entrance on Oxford Road (opposite the Manchester Museum) and take the lift or stairs to the fifth floor. Room 5.206 will be signposted along the corridor.

Accessibility: Uni Place has level access at the main entrance and lifts to all floors. If you have any accessibility concerns either on the day or beforehand, please don't hesitate to contact the committee via the UMHC social media.

Latitude: 53.466799
Longitude: -2.2339019

P.S. Will is the best Web Secretary to ever exist 👑`,
      location: 'Room 5.206, Uni Place, Oxford Road, Manchester M13 9PL',
      startDate: new Date('2026-02-03T19:00:00'), // 7:00 PM on February 3rd, 2026
      endDate: new Date('2026-02-03T21:00:00'), // 9:00 PM
      url: 'https://umhc.co.uk/egm',
    };

    const icsContent = generateICSFile(eventDetails);
    openInCalendar(icsContent);
  };

  return (
    <button
      onClick={handleAddToCalendar}
      className={`bg-[#2E4E39] text-[#fffefb] font-semibold text-[15px] px-3.5 py-1.5 rounded-full shadow-md hover:bg-[#243d2e] transition-colors flex items-center gap-2 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-[#2E4E39] focus:ring-offset-2 ${className}`}
      aria-label="Add EGM to your calendar"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M12 2.66667V1.33333M4 2.66667V1.33333M1.33333 6H14.6667M2.66667 2.66667H13.3333C14.0697 2.66667 14.6667 3.26362 14.6667 4V13.3333C14.6667 14.0697 14.0697 14.6667 13.3333 14.6667H2.66667C1.93029 14.6667 1.33333 14.0697 1.33333 13.3333V4C1.33333 3.26362 1.93029 2.66667 2.66667 2.66667Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8 9V11.5M8 11.5L6.5 10M8 11.5L9.5 10"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Add to Calendar
    </button>
  );
}
