/**
 * Generate an ICS (iCalendar) file content for adding events to calendar apps
 */
export function generateICSFile(event: {
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  url?: string;
}): string {
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const escapeICSText = (text: string): string => {
    return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//UMHC//EGM Event//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@umhc.co.uk`,
    `DTSTAMP:${formatDate(new Date())}`,
    `DTSTART:${formatDate(event.startDate)}`,
    `DTEND:${formatDate(event.endDate)}`,
    `SUMMARY:${escapeICSText(event.title)}`,
    `DESCRIPTION:${escapeICSText(event.description)}`,
    `LOCATION:${escapeICSText(event.location)}`,
    event.url ? `URL:${event.url}` : '',
    // Add reminders (1 week before, 2 days before, and on the day)
    'BEGIN:VALARM',
    'TRIGGER:-P7D',
    'ACTION:DISPLAY',
    'DESCRIPTION:Hey! Don\'t get too excited but EGM is in one week!',
    'END:VALARM',
    'BEGIN:VALARM',
    'TRIGGER:-P2D',
    'ACTION:DISPLAY',
    'DESCRIPTION:Only 2 days to go until the EGM! Get ready!',
    'END:VALARM',
    'BEGIN:VALARM',
    'TRIGGER:PT0M',
    'ACTION:DISPLAY',
    'DESCRIPTION:It\'s EGM day! See you this evening!',
    'END:VALARM',
    'BEGIN:VALARM',
    'TRIGGER:-PT30M',
    'ACTION:DISPLAY',
    'DESCRIPTION:EGM starts in 30 minutes - you better be there! Or else ...',
    'END:VALARM',
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(line => line !== '')
    .join('\r\n');

  return icsContent;
}

/**
 * Open calendar event directly in device's calendar app
 */
export function openInCalendar(icsContent: string): void {
  // Create data URI
  const dataUri = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`;
  
  // Try to open directly (works better on mobile devices)
  const link = document.createElement('a');
  link.href = dataUri;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  
  // For iOS devices, this will open in Calendar app
  // For Android, it will prompt to choose calendar app
  // For desktop, it may download or open in default calendar app
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
