'use client';

interface MembershipButtonProps {
  buttonText: string;
  title: string;
}

export default function MembershipButton({ buttonText, title }: MembershipButtonProps) {
  const handleButtonClick = () => {
    const url = title.includes('Student') ? 
      process.env.NEXT_PUBLIC_STUDENT_MEMBERSHIP_URL : 
      process.env.NEXT_PUBLIC_ASSOCIATE_MEMBERSHIP_URL;
    
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <button
      onClick={handleButtonClick}
      className="border-2 border-earth-orange text-earth-orange px-[9px] py-1 rounded-full text-sm font-semibold hover:bg-earth-orange hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-earth-orange focus:ring-offset-2"
      aria-label={`${buttonText} for ${title}`}
    >
      {buttonText}
    </button>
  );
}