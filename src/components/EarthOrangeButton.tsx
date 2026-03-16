interface EarthOrangeButtonProps {
  children: React.ReactNode
  href?: string
  onClick?: () => void
  className?: string
}

export default function EarthOrangeButton({ 
  children, 
  href, 
  onClick, 
  className = "" 
}: EarthOrangeButtonProps) {
  const baseClasses = `
    relative rounded-[100px] border-earth-orange border-[1.5px] border-solid
    hover:bg-earth-orange transition-colors duration-200
    flex flex-row items-center justify-center px-[9px] py-1
    font-semibold text-earth-orange text-[14px] text-nowrap
    hover:text-cream-white
    ${className}
  `

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={baseClasses}
      >
        {children}
      </a>
    )
  }

  return (
    <button
      onClick={onClick}
      className={baseClasses}
    >
      {children}
    </button>
  )
}