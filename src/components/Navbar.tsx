'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Bars2Icon, XMarkIcon } from '@heroicons/react/24/outline';
import TextButton from './TextButton';

interface NavbarProps {
  className?: string;
}

// Animation constants
const ANIMATION_DURATION = 520;
const STAGGER_DELAY = 80;
const DEBOUNCE_DELAY = 150;

export default function Navbar({ className = '' }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [lastToggleTime, setLastToggleTime] = useState(0);
  const [navbarHeight, setNavbarHeight] = useState(64);
  
  // Refs for focus management
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const firstMenuItemRef = useRef<HTMLAnchorElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const navbarRef = useRef<HTMLElement>(null);
  
  const navigationItems = [
    { text: 'Schedule', href: '/schedule' },
    /*{ text: 'Guides', href: '/guides' },*/
    { text: 'Equipment', href: '/equipment' },
    { text: 'Constitution', href: '/constitution' },
    { text: 'About Us', href: '/about' },
  ];

  // Debounced menu toggle to prevent rapid clicking
  const handleMenuToggle = useCallback(() => {
    const now = Date.now();
    if (now - lastToggleTime < DEBOUNCE_DELAY) return;
    setLastToggleTime(now);
    
    if (isMenuOpen) {
      setIsClosing(true);
      timeoutRef.current = setTimeout(() => {
        setIsMenuOpen(false);
        setIsClosing(false);
        // Return focus to menu button when menu closes
        menuButtonRef.current?.focus();
      }, ANIMATION_DURATION);
    } else {
      setIsMenuOpen(true);
    }
  }, [isMenuOpen, lastToggleTime]);

  const handleMenuItemClick = useCallback(() => {
    setIsClosing(true);
    timeoutRef.current = setTimeout(() => {
      setIsMenuOpen(false);
      setIsClosing(false);
      // Return focus to menu button when menu closes
      menuButtonRef.current?.focus();
    }, ANIMATION_DURATION);
  }, []);
  
  // Handle keyboard navigation for accessibility
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isMenuOpen || isClosing) return;
    
    if (e.key === 'Escape') {
      e.preventDefault();
      handleMenuToggle();
      return;
    }
    
    // Focus trapping within mobile menu
    if (e.key === 'Tab') {
      const menuItems = mobileMenuRef.current?.querySelectorAll('a[href], button:not([disabled])');
      if (!menuItems || menuItems.length === 0) return;
      
      const firstItem = menuItems[0] as HTMLElement;
      const lastItem = menuItems[menuItems.length - 1] as HTMLElement;
      
      if (e.shiftKey && document.activeElement === firstItem) {
        e.preventDefault();
        lastItem.focus();
      } else if (!e.shiftKey && document.activeElement === lastItem) {
        e.preventDefault();
        firstItem.focus();
      }
    }
  }, [isMenuOpen, isClosing, handleMenuToggle]);
  
  // Calculate navbar height for mobile menu positioning
  useEffect(() => {
    const updateNavbarHeight = () => {
      if (navbarRef.current) {
        setNavbarHeight(navbarRef.current.offsetHeight);
      }
    };
    
    updateNavbarHeight();
    window.addEventListener('resize', updateNavbarHeight);
    
    return () => {
      window.removeEventListener('resize', updateNavbarHeight);
    };
  }, []);

  // Set up keyboard event listeners and focus management
  useEffect(() => {
    if (isMenuOpen && !isClosing) {
      document.addEventListener('keydown', handleKeyDown);
      // Don't auto-focus first menu item to avoid unwanted hover state
      // Users can tab to navigate into the menu if using keyboard
    } else {
      document.removeEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen, isClosing, handleKeyDown]);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  // Get current menu state for display
  const menuState = isMenuOpen ? (isClosing ? 'closing' : 'open') : 'closed';

  return (
    <nav 
        ref={navbarRef}
        className={`bg-cream-white shadow-sm fixed top-0 w-full z-[99999] ${className}`}
        role="navigation"
        aria-label="Main navigation"
      >
      <div className="flex flex-row items-center h-full">
        <div className="flex flex-row items-center justify-between px-4 sm:px-9 py-2.5 w-full">
          {/* Logo section - clickable link to homepage */}
          <Link 
            href="/"
            className="h-[32px] w-[56px] relative shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-umhc-green focus-visible:ring-offset-2 rounded"
            aria-label="UMHC Homepage"
          >
            <div className="relative w-full h-full">
              <Image
                src="/images/umhc-logo.webp"
                alt="University of Manchester Hiking Club Logo of 'UMHC' letters with mountain graphic with the sun above"
                fill
                sizes="56px"
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation buttons - hidden on mobile */}
          <div 
            className="hidden md:flex flex-row gap-[30px] items-center justify-end"
            role="list"
          >
            {navigationItems.map((item) => (
              <div 
                key={item.text}
                role="listitem"
                className="flex flex-row gap-2.5 items-center justify-center"
              >
                <TextButton href={item.href} priority className="text-slate-grey">
                  {item.text}
                </TextButton>
              </div>
            ))}
          </div>

          {/* Mobile hamburger menu button - hidden on desktop */}
          <button
            ref={menuButtonRef}
            className="md:hidden p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-umhc-green focus-visible:ring-offset-2 rounded relative z-[100000] cursor-pointer"
            onClick={handleMenuToggle}
            aria-label={menuState !== 'closed' ? "Close mobile menu" : "Open mobile menu"}
            aria-expanded={menuState !== 'closed'}
            aria-controls="mobile-menu"
            aria-haspopup="true"
          >
            <div className="relative w-5 h-5">
              <Bars2Icon 
                className={`absolute inset-0 w-5 h-5 text-slate-grey transition-all duration-150 ease-in-out motion-reduce:transition-none ${
                  menuState !== 'closed' ? 'opacity-0 rotate-45 scale-75' : 'opacity-100 rotate-0 scale-100'
                }`} 
                strokeWidth={2.5} 
              />
              <XMarkIcon 
                className={`absolute inset-0 w-5 h-5 text-slate-grey transition-all duration-150 ease-in-out motion-reduce:transition-none ${
                  menuState !== 'closed' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-45 scale-75'
                }`} 
                strokeWidth={2.5} 
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile menu overlay - shown when menu is open */}
      {menuState !== 'closed' && (
        <div 
          ref={mobileMenuRef}
          id="mobile-menu"
          className={`md:hidden fixed left-0 w-full z-[99999] motion-reduce:animate-none ${
            menuState === 'closing' ? 'animate-slide-up' : 'animate-slide-down'
          }`}
          style={{ 
            top: `${navbarHeight}px`,
            backgroundColor: '#FFFEFB',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }}
          role="menu"
          aria-labelledby="mobile-menu-button"
        >
          <div className="flex flex-col gap-[12px] px-9 py-6">
            {/* Mobile navigation links */}
            {navigationItems.map((item, index) => (
              <div 
                key={`${item.text}-${menuState === 'closing' ? 'closing' : 'opening'}`} 
                className={`flex justify-start motion-reduce:animate-none ${
                  menuState === 'closing'
                    ? 'animate-fade-out-up' 
                    : 'animate-fade-in-up'
                }`}
                data-menu-state={menuState}
                style={{ 
                  animationDelay: menuState === 'closing'
                    ? `${(navigationItems.length - index - 1) * (STAGGER_DELAY / 1000)}s`
                    : `${(index + 1) * (STAGGER_DELAY / 1000)}s` 
                }}
                role="none"
              >
                <TextButton 
                  ref={index === 0 ? firstMenuItemRef : undefined}
                  href={item.href}
                  variant="large"
                  priority
                  className="text-left text-slate-grey"
                  onClick={handleMenuItemClick}
                  role="menuitem"
                >
                  {item.text}
                </TextButton>
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}