'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { getScheduleEvents } from '@/lib/scheduleService'
import { ScheduleEvent, EventType } from '@/types/schedule'
import { CalendarDaysIcon, MapPinIcon, ClockIcon, FunnelIcon } from '@heroicons/react/24/outline'
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/solid'
import EarthOrangeButton from '@/components/EarthOrangeButton'
import Image from 'next/image'

const eventTypeConfig: Record<EventType, { color: string; label: string }> = {
  hike: { color: 'bg-umhc-green', label: 'Hike' },
  social: { color: 'bg-earth-orange', label: 'Social' },
  residential: { color: 'bg-stealth-green', label: 'Residential' },
  other: { color: 'bg-slate-grey', label: 'Other' }
}

export default function SchedulePage() {
  const searchParams = useSearchParams()
  const [events, setEvents] = useState<ScheduleEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null)
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [visibleCount, setVisibleCount] = useState(10)
  const [windowSize, setWindowSize] = useState({ width: 1024, height: 768 })
  const [accessibilityFilters, setAccessibilityFilters] = useState({
    dda_compliant_ramp_access: false,
    lift_access_within_building: false,
    accessible_toilets: false,
    gender_neutral_toilets: false,
    seating_available: false,
    alcohol_served: false
  })
  
  // Refs for focus management
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Available activity icons for background decoration
  const activityIcons = [
    'mountain-trees', 'pine-tree', 'boots', 'backpack', 'oak-tree', 'bowling',
    'map', 'beer', 'karaoke', 'board-game', 'quiz', 'trees-path', 'cinema',
    'dance', 'bus', 'banquet', 'sign', 'playing-cards', 'football-goal',
    'laser-tag', 'pool', 'darts', 'mountain-trees-river', 'bunk-bed',
    'trees-waterfall', 'rock-mountain', 'mountain-trees-lake', 'gavel'
  ]

  // Generate background icons based on content height and screen size
  const generateBackgroundIcons = () => {
    // Responsive sizing and spacing based on screen width
    const screenWidth = windowSize.width
    const isSmall = screenWidth < 640
    const isMedium = screenWidth >= 640 && screenWidth < 1024
    const isLarge = screenWidth >= 1024
    
    // Calculate RESPONSIVE content height based on actual screen behavior
    const headerHeight = isSmall ? 550 : isMedium ? 480 : 450 // Header wraps more on mobile
    const eventHeight = isSmall ? 120 : isMedium ? 95 : 85 // Events taller on mobile due to wrapping
    const eventListHeight = visibleEvents.length * eventHeight
    const loadMoreButtonHeight = hasMoreEvents ? (isSmall ? 100 : 80) : 0 // More space on mobile
    const mobileLayoutBuffer = isSmall ? 50 : 0 // Extra space for mobile layout differences
    const bottomBuffer = 150 // Buffer before bottom row
    const totalContentAreaHeight = headerHeight + eventListHeight + loadMoreButtonHeight + mobileLayoutBuffer + bottomBuffer
    
    // Dynamic icon sizing and spacing
    const iconSize = isSmall ? 35 : isMedium ? 45 : 55
    const verticalSpacing = isSmall ? 80 : isMedium ? 100 : 140
    const sidePadding = isSmall ? 15 : isMedium ? 20 : 30 // Responsive padding from screen edges
    
    // Fill the ENTIRE content area with side icons - no artificial limits
    const startPosition = 100 // Start after header
    const endPosition = totalContentAreaHeight - 50 // Stop before bottom row area
    const availableHeight = endPosition - startPosition
    const iconsNeeded = Math.floor(availableHeight / verticalSpacing) // Fill entire height
    
    const leftIcons = []
    const rightIcons = []
    
    for (let i = 0; i < iconsNeeded; i++) {
      const topPosition = 100 + (i * verticalSpacing) // Start after header, use dynamic spacing
      const leftIcon = activityIcons[i % activityIcons.length]
      const rightIcon = activityIcons[(i + Math.floor(activityIcons.length / 2)) % activityIcons.length]
      
      leftIcons.push({
        src: `/images/activity-images/${leftIcon}.webp`,
        top: topPosition,
        left: sidePadding,
        size: iconSize,
        opacity: i % 2 === 0 ? 'opacity-8' : 'opacity-7',
        id: `left-${i}`
      })
      
      rightIcons.push({
        src: `/images/activity-images/${rightIcon}.webp`,
        top: topPosition + (isSmall ? 15 : 20), // Even tighter spacing
        right: sidePadding,
        size: iconSize,
        opacity: i % 2 === 0 ? 'opacity-7' : 'opacity-8',
        id: `right-${i}`
      })
    }
    
    return { leftIcons, rightIcons }
  }

  // Handle window resize for responsive icons
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    if (typeof window !== 'undefined') {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

  useEffect(() => {
    async function fetchEvents() {
      try {
        const data = await getScheduleEvents()
        setEvents(data)
      } catch (err) {
        setError('Failed to load events')
        console.error('Error fetching events:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  // Separate effect to handle URL parameters after events are loaded
  useEffect(() => {
    if (events.length > 0) {
      const eventId = searchParams.get('eventId')
      if (eventId) {
        const targetEvent = events.find(event => event.id.toString() === eventId)
        if (targetEvent) {
          setSelectedEvent(targetEvent)
        }
      }
      
      // Handle filter parameter from URL
      const filterParam = searchParams.get('filter')
      if (filterParam && ['hike', 'social', 'residential', 'other'].includes(filterParam)) {
        setSelectedFilter(filterParam)
      }
    }
  }, [events, searchParams])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const day = date.getDate() // No leading zero
    const month = date.toLocaleDateString('en-GB', { month: 'long' })
    return `${day} ${month}`
  }

  const formatTime = (timeString: string | null) => {
    if (!timeString) return null
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const min = parseInt(minutes)
    
    if (min === 0) {
      return hour >= 12 ? `${hour === 12 ? 12 : hour - 12}pm` : `${hour}am`
    } else {
      const displayHour = hour >= 12 ? (hour === 12 ? 12 : hour - 12) : hour
      const period = hour >= 12 ? 'pm' : 'am'
      return `${displayHour}.${min.toString().padStart(2, '0')}${period}`
    }
  }

  const getEventIcon = (eventImage: string | null) => {
    // Use calendar as fallback for null, undefined, or 'other'
    if (!eventImage || eventImage === 'other') {
      return '/images/activity-images/calendar.webp'
    }
    // Use the event_image value with .webp extension
    return `/images/activity-images/${eventImage}.webp`
  }

  const hasActiveFilters = Object.values(accessibilityFilters).some(filter => filter)

  const filteredEvents = events.filter(event => {
    // Filter by event type
    const typeMatch = selectedFilter === 'all' || event.event_type === selectedFilter
    
    // Filter by accessibility features (only if any are selected)
    if (!hasActiveFilters) {
      return typeMatch
    }
    
    // If accessibility filters are active, event must match at least one selected filter
    const accessibilityMatch = Object.entries(accessibilityFilters).some(([key, isActive]) => {
      if (!isActive) return false
      // Special case for alcohol_served - when filter is active, show events where alcohol is NOT served
      if (key === 'alcohol_served') {
        return !event[key as keyof typeof accessibilityFilters]
      }
      return event[key as keyof typeof accessibilityFilters]
    })
    
    return typeMatch && accessibilityMatch
  })

  const visibleEvents = filteredEvents.slice(0, visibleCount)
  const hasMoreEvents = filteredEvents.length > visibleCount

  // Generate dynamic background icons based on current visible content and window size
  const { leftIcons, rightIcons } = React.useMemo(() => {
    return generateBackgroundIcons()
  }, [visibleEvents.length, hasMoreEvents, windowSize.width, windowSize.height])

  // Reset visible count when filters change
  const resetVisibleCount = () => setVisibleCount(10)
  
  // Update visible count when filters change
  React.useEffect(() => {
    resetVisibleCount()
  }, [selectedFilter, accessibilityFilters])

  // Focus management for modal
  useEffect(() => {
    if (selectedEvent) {
      // Store the currently focused element
      previousFocusRef.current = document.activeElement as HTMLElement
      
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
      
      // Focus the modal after a brief delay to ensure it's rendered
      setTimeout(() => {
        modalRef.current?.focus()
      }, 100)
    } else {
      // Re-enable body scroll
      document.body.style.overflow = 'unset'
      
      // Return focus to the previously focused element
      if (previousFocusRef.current) {
        previousFocusRef.current.focus()
      }
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [selectedEvent])

  // Handle keyboard navigation within modal
  const handleModalKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      const modal = modalRef.current
      if (!modal) return

      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const firstElement = focusableElements[0] as HTMLElement
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

      if (e.shiftKey) {
        // Shift + Tab (backwards)
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        // Tab (forwards)
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }
  }

  if (loading) {
    return (
      <div className="bg-whellow min-h-screen px-4 sm:px-8 md:px-12 lg:px-16 pt-16 sm:pt-20 pb-8 sm:pb-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center py-12">
            <p className="text-lg text-slate-grey">Loading events...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-whellow min-h-screen px-4 sm:px-8 md:px-12 lg:px-16 pt-16 sm:pt-20 pb-8 sm:pb-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center py-12">
            <p className="text-lg text-red-600">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-whellow min-h-screen px-4 sm:px-8 md:px-12 lg:px-16 pt-16 sm:pt-20 pb-12 sm:pb-16 relative overflow-hidden">
      {/* Dynamic background decorative images */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Left edge icons - dynamically generated */}
        {leftIcons.map((icon) => (
          <img
            key={icon.id}
            src={icon.src}
            alt=""
            className={`absolute ${icon.opacity} hidden sm:block`}
            style={{ 
              left: `${icon.left}px`,
              top: `${icon.top}px`, 
              width: `${icon.size}px`, 
              height: `${icon.size}px`,
              imageRendering: 'crisp-edges'
            }}
          />
        ))}
        
        {/* Right edge icons - dynamically generated */}
        {rightIcons.map((icon) => (
          <img
            key={icon.id}
            src={icon.src}
            alt=""
            className={`absolute ${icon.opacity} hidden sm:block`}
            style={{ 
              right: `${icon.right}px`,
              top: `${icon.top}px`, 
              width: `${icon.size}px`, 
              height: `${icon.size}px`,
              imageRendering: 'crisp-edges'
            }}
          />
        ))}
        
      </div>
      
      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header Section */}
        <header className="text-center space-y-2 mb-4 sm:mb-4">
          <div className="flex items-center justify-center gap-6 sm:gap-12 md:gap-16 lg:gap-20 w-full max-w-6xl mx-auto">
            {/* Left side icons */}
            <div className="flex items-center gap-3 sm:gap-4 md:gap-6 lg:gap-8">
              <img
                src="/images/activity-images/boots.webp"
                alt=""
                className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 opacity-7"
                style={{ imageRendering: 'crisp-edges' }}
              />
              <img
                src="/images/activity-images/bowling.webp"
                alt=""
                className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 opacity-8"
                style={{ imageRendering: 'crisp-edges' }}
              />
              {/* Extra icons for larger screens */}
              <img
                src="/images/activity-images/mountain-trees.webp"
                alt=""
                className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 opacity-7 hidden lg:block"
                style={{ imageRendering: 'crisp-edges' }}
              />
              <img
                src="/images/activity-images/backpack.webp"
                alt=""
                className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 opacity-8 hidden xl:block"
                style={{ imageRendering: 'crisp-edges' }}
              />
            </div>
            
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-deep-black leading-tight font-sans px-6">
              Schedule
            </h1>
            
            {/* Right side icons */}
            <div className="flex items-center gap-3 sm:gap-4 md:gap-6 lg:gap-8">
              {/* Extra icons for larger screens */}
              <img
                src="/images/activity-images/cinema.webp"
                alt=""
                className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 opacity-8 hidden xl:block"
                style={{ imageRendering: 'crisp-edges' }}
              />
              <img
                src="/images/activity-images/football-goal.webp"
                alt=""
                className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 opacity-7 hidden lg:block"
                style={{ imageRendering: 'crisp-edges' }}
              />
              <img
                src="/images/activity-images/quiz.webp"
                alt=""
                className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 opacity-8"
                style={{ imageRendering: 'crisp-edges' }}
              />
              <img
                src="/images/activity-images/karaoke.webp"
                alt=""
                className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 opacity-7"
                style={{ imageRendering: 'crisp-edges' }}
              />
            </div>
          </div>
          <div className="max-w-5xl mx-auto px-2 sm:px-20 md:px-16 lg:px-12 xl:px-2">
            <p className="text-xs sm:text-sm md:text-base text-deep-black font-medium font-sans leading-relaxed">
              As a society, we run a whole variety of activities throughout the year to suit hikers of all experience levels. Every weekend, we organize hikes with four different difficulty levels available, ensuring our regular schedule offers something for everyone. We also arrange residential weekend trips to hostels every so often, plus plenty of social events to bring our community together. Whether it's bowling nights, board game evenings, karaoke sessions, pot luck dinners, or the occasional pub quiz, there's always a chance to get out and meet new people. Check out our upcoming activities below!
            </p>
          </div>
        </header>

        {/* Event Type Filter */}
        <div className="flex flex-col gap-1 items-start justify-start p-0 relative max-w-5xl mx-auto mb-4 mt-12 px-4">
          <div className="flex flex-row font-semibold gap-2 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-12 items-center justify-center md:justify-between not-italic p-0 relative w-full text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-left">
            <div className="flex flex-row gap-4 sm:gap-6 md:gap-8 lg:gap-10 xl:gap-14 items-center justify-start flex-nowrap overflow-x-auto pl-4">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`relative shrink-0 transition-all duration-300 pb-1 ${selectedFilter === 'all' ? 'text-deep-black border-b-2 border-deep-black' : 'text-slate-grey'}`}
              >
                <p className="block leading-normal whitespace-nowrap">All Events</p>
              </button>
              <button
                onClick={() => setSelectedFilter('hike')}
                className={`relative shrink-0 transition-all duration-300 pb-1 ${selectedFilter === 'hike' ? 'text-deep-black border-b-2 border-deep-black' : 'text-slate-grey'}`}
              >
                <p className="block leading-normal whitespace-nowrap">Hikes</p>
              </button>
              <button
                onClick={() => setSelectedFilter('social')}
                className={`relative shrink-0 transition-all duration-300 pb-1 ${selectedFilter === 'social' ? 'text-deep-black border-b-2 border-deep-black' : 'text-slate-grey'}`}
              >
                <p className="block leading-normal whitespace-nowrap">Socials</p>
              </button>
              <button
                onClick={() => setSelectedFilter('residential')}
                className={`relative shrink-0 transition-all duration-300 pb-1 ${selectedFilter === 'residential' ? 'text-deep-black border-b-2 border-deep-black' : 'text-slate-grey'}`}
              >
                <p className="block leading-normal whitespace-nowrap">Residential</p>
              </button>
              <button
                onClick={() => setSelectedFilter('other')}
                className={`relative shrink-0 transition-all duration-300 pb-1 ${selectedFilter === 'other' ? 'text-deep-black border-b-2 border-deep-black' : 'text-slate-grey'}`}
              >
                <p className="block leading-normal whitespace-nowrap">Other</p>
              </button>
            </div>
            
            {/* Filter Button */}
            <button 
              onClick={() => setShowFilterModal(true)}
              className="relative rounded-full border-slate-grey border border-solid hover:bg-slate-grey hover:bg-opacity-10 transition-colors ml-2 shrink-0 mr-4"
            >
              <div className="flex flex-row items-center gap-1.5 px-2 py-1 md:px-3 md:py-1.5">
                <FunnelIcon className="w-4 h-4 text-slate-grey" />
                <div className="font-medium text-slate-grey text-sm whitespace-nowrap hidden md:block">
                  Filter
                </div>
              </div>
              {hasActiveFilters && (
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-earth-orange rounded-full border-2 border-cream-white" />
              )}
            </button>
          </div>
        </div>

        {/* Schedule Content */}
        <main className="space-y-0 max-w-5xl mx-auto px-4" role="main">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-slate-grey">No upcoming events found.</p>
            </div>
          ) : (
            <div className="space-y-0">
              {visibleEvents.map((event) => (
                <article
                  key={event.id}
                  className="flex flex-row gap-3 items-start justify-start p-0 relative w-full cursor-pointer hover:bg-cream-white hover:bg-opacity-50 transition-colors duration-200 py-3 px-2 sm:px-4 rounded-lg"
                  onClick={() => setSelectedEvent(event)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setSelectedEvent(event)
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`View details for ${event.title}`}
                >
                  {/* Date Display */}
                  <div className="flex flex-col items-center justify-start leading-tight not-italic pb-1 pt-0 px-0 relative shrink-0 text-umhc-green text-center w-16 sm:w-16 md:w-20 lg:w-24">
                    <div className="flex flex-col font-bold justify-center relative shrink-0 text-2xl sm:text-3xl md:text-4xl lg:text-5xl w-full">
                      <p className="block leading-normal">
                        {new Date(event.event_date).toLocaleDateString('en-GB', {
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="flex flex-col font-semibold justify-center relative shrink-0 text-sm sm:text-base md:text-lg w-full">
                      <p className="block leading-normal">
                        {new Date(event.event_date).toLocaleDateString('en-GB', {
                          month: 'long'
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="flex flex-col gap-1 sm:gap-2 items-start justify-start p-0 relative shrink-0 flex-1 min-w-0">
                    <div className="flex flex-row gap-2 sm:gap-3 md:gap-4 items-start justify-start p-0 relative shrink-0 flex-wrap">
                      <div className="flex flex-col font-bold justify-start leading-tight not-italic relative shrink-0 text-deep-black text-base sm:text-lg md:text-xl lg:text-2xl text-left min-w-0 flex-1">
                        <p className="block leading-normal break-words">{event.title}</p>
                      </div>
                      
                      {/* Accessibility Markers - aligned with title */}
                      {event.dda_compliant_ramp_access && (
                        <div className="relative rounded-full border-earth-orange border border-solid hidden lg:block">
                          <div className="flex flex-row items-center justify-center px-2 py-0.5">
                            <div className="font-medium text-earth-orange text-xs sm:text-sm whitespace-nowrap">
                              Wheelchair accessible
                            </div>
                          </div>
                        </div>
                      )}
                      {event.accessible_toilets && (
                        <div className="relative rounded-full border-earth-orange border border-solid hidden lg:block">
                          <div className="flex flex-row items-center justify-center px-2 py-0.5">
                            <div className="font-medium text-earth-orange text-xs sm:text-sm whitespace-nowrap">
                              Accessible toilets
                            </div>
                          </div>
                        </div>
                      )}
                      {event.gender_neutral_toilets && (
                        <div className="relative rounded-full border-earth-orange border border-solid hidden lg:block">
                          <div className="flex flex-row items-center justify-center px-2 py-0.5">
                            <div className="font-medium text-earth-orange text-xs sm:text-sm whitespace-nowrap">
                              Gender neutral toilets
                            </div>
                          </div>
                        </div>
                      )}
                      {event.seating_available && (
                        <div className="relative rounded-full border-earth-orange border border-solid hidden lg:block">
                          <div className="flex flex-row items-center justify-center px-2 py-0.5">
                            <div className="font-medium text-earth-orange text-xs sm:text-sm whitespace-nowrap">
                              Seating available
                            </div>
                          </div>
                        </div>
                      )}
                      {event.lift_access_within_building && (
                        <div className="relative rounded-full border-earth-orange border border-solid hidden lg:block">
                          <div className="flex flex-row items-center justify-center px-2 py-0.5">
                            <div className="font-medium text-earth-orange text-xs sm:text-sm whitespace-nowrap">
                              Lift access
                            </div>
                          </div>
                        </div>
                      )}
                      {event.alcohol_served && (
                        <div className="relative rounded-full border-earth-orange border border-solid hidden lg:block">
                          <div className="flex flex-row items-center justify-center px-2 py-0.5">
                            <div className="font-medium text-earth-orange text-xs sm:text-sm whitespace-nowrap">
                              Alcohol served
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {event.description && (
                      <div className="font-normal leading-relaxed min-w-full not-italic relative shrink-0 text-deep-black text-sm sm:text-base text-left">
                        <p className="block leading-relaxed line-clamp-3 overflow-hidden text-ellipsis">
                          {event.description}
                        </p>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
          
          {/* Load More Button */}
          {hasMoreEvents && (
            <div className="flex justify-center mt-6 sm:mt-8">
              <button
                onClick={() => setVisibleCount(prev => prev + 10)}
                className="px-4 sm:px-6 py-2 sm:py-3 border border-slate-grey text-slate-grey rounded-lg hover:bg-slate-grey hover:text-white transition-colors text-sm sm:text-base"
              >
                Load More
              </button>
            </div>
          )}
        </main>

        {/* Filter Modal */}
        {showFilterModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-[9999]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="filter-modal-title"
          >
            <div className="bg-cream-white rounded-lg w-full max-w-xs sm:max-w-sm max-h-[75vh] sm:max-h-[90vh] overflow-y-auto">
              <div className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 id="filter-modal-title" className="text-base sm:text-lg font-bold text-umhc-green">
                    Filter Events
                  </h2>
                  <button
                    onClick={() => setShowFilterModal(false)}
                    className="text-slate-grey hover:text-umhc-green transition-colors p-1 rounded-full hover:bg-whellow focus:outline-none focus:ring-2 focus:ring-umhc-green"
                    aria-label="Close filter"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm sm:text-base font-semibold text-umhc-green">Accessibility Features</h3>
                  <div className="space-y-2">
                    {[
                      { key: 'dda_compliant_ramp_access', label: 'Wheelchair accessible' },
                      { key: 'accessible_toilets', label: 'Accessible toilets' },
                      { key: 'gender_neutral_toilets', label: 'Gender neutral toilets' },
                      { key: 'seating_available', label: 'Seating available' },
                      { key: 'lift_access_within_building', label: 'Lift access' },
                      { key: 'alcohol_served', label: 'No alcohol served' }
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center space-x-2 cursor-pointer py-1 px-2 rounded hover:bg-whellow transition-colors">
                        <input
                          type="checkbox"
                          checked={accessibilityFilters[key as keyof typeof accessibilityFilters]}
                          onChange={(e) => 
                            setAccessibilityFilters(prev => ({
                              ...prev,
                              [key]: e.target.checked
                            }))
                          }
                          className="w-4 h-4 text-umhc-green border-slate-grey rounded focus:ring-umhc-green"
                        />
                        <span className="text-slate-grey text-sm flex-1">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2 mt-4 pt-3 border-t border-whellow">
                  <button
                    onClick={() => setShowFilterModal(false)}
                    className="w-full px-3 py-2 bg-umhc-green text-white rounded hover:bg-stealth-green transition-colors text-sm font-medium"
                  >
                    View Results
                  </button>
                  <button
                    onClick={() => {
                      setAccessibilityFilters({
                        dda_compliant_ramp_access: false,
                        lift_access_within_building: false,
                        accessible_toilets: false,
                        gender_neutral_toilets: false,
                        seating_available: false,
                        alcohol_served: false
                      })
                    }}
                    className="w-full px-3 py-2 border border-slate-grey text-slate-grey rounded hover:bg-slate-grey hover:text-white transition-colors text-sm"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Event Detail Modal */}
        {selectedEvent && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-24 pb-3 px-3 z-[100000] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="event-modal-title"
            aria-describedby="event-modal-description"
            onClick={() => setSelectedEvent(null)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setSelectedEvent(null)
              }
            }}
          >
            <div 
              ref={modalRef}
              className="bg-whellow rounded-lg w-full max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-3xl max-h-[85vh] overflow-y-auto focus:outline-none"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={handleModalKeyDown}
              tabIndex={-1}
              role="document"
            >
              {/* Close Button */}
              <div className="flex justify-end p-2 border-b border-cream-white">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-slate-grey hover:text-umhc-green transition-colors p-1 rounded-full hover:bg-cream-white focus:outline-none focus:ring-2 focus:ring-umhc-green focus:ring-offset-2"
                  aria-label="Close event details"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="px-6 pt-2 pb-4 space-y-4">
                {/* Title Section */}
                <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-4 sm:gap-6">
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center sm:items-center flex-1 min-w-0">
                    <div className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-lg overflow-hidden flex items-center justify-center">
                      <Image
                        src={getEventIcon(selectedEvent.event_image)}
                        alt={`${selectedEvent.title} icon`}
                        width={96}
                        height={96}
                        className="object-cover w-full h-full rounded-lg"
                        onError={(e) => {
                          // Fallback to calendar icon if image fails to load
                          e.currentTarget.src = '/images/activity-images/calendar.webp'
                        }}
                      />
                    </div>
                    <div className="flex flex-col items-center sm:items-start justify-center min-w-0 flex-1 text-center sm:text-left">
                      <h1 id="event-modal-title" className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-deep-black leading-tight break-words">
                        {selectedEvent.title}
                      </h1>
                      <p className="text-base sm:text-lg md:text-xl font-semibold text-deep-black mt-1">
                        {formatDate(selectedEvent.event_date)}
                        {selectedEvent.event_time && ` at ${formatTime(selectedEvent.event_time)}`}
                      </p>
                    </div>
                  </div>
                  {selectedEvent.su_website_url && (
                    <div className="w-full sm:w-auto">
                      <EarthOrangeButton href={selectedEvent.su_website_url}>
                        View on the SU Website
                      </EarthOrangeButton>
                    </div>
                  )}
                </div>

                {/* Info Section */}
                <div className="space-y-4">
                  {/* Description */}
                  {selectedEvent.description && (
                    <div>
                      <p id="event-modal-description" className="text-sm sm:text-base text-deep-black leading-relaxed">
                        {selectedEvent.description}
                      </p>
                    </div>
                  )}

                  {/* Location */}
                  {selectedEvent.full_address && (
                    <div className="space-y-2">
                      <h2 className="text-lg sm:text-xl font-semibold text-deep-black">
                        Location
                      </h2>
                      <div className="space-y-1">
                        <div className="text-sm sm:text-base text-deep-black">
                          <p className="font-medium">{selectedEvent.full_address.split(',')[0]}</p>
                          {selectedEvent.full_address.split(',').slice(1).map((part, index) => (
                            <p key={index} className="font-medium">{part.trim()}</p>
                          ))}
                        </div>
                        {selectedEvent.what3words && (
                          <div className="text-sm sm:text-base">
                            <p>
                              <span className="text-[#e11f26] font-mono">///</span>
                              <span className="font-mono">{selectedEvent.what3words}</span>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Accessibility Section */}
                  <div className="space-y-3">
                    <h2 className="text-lg sm:text-xl font-semibold text-deep-black">
                      Accessibility
                    </h2>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-[3fr_4fr] gap-4 lg:gap-3">
                      {/* Accessibility Features */}
                      <div className="space-y-2">
                        {[
                          { key: 'dda_compliant_ramp_access', label: 'DDA Compliant Ramp Access' },
                          { key: 'lift_access_within_building', label: 'Lift Access within the Building' },
                          { key: 'accessible_toilets', label: 'Accessible Toilets' },
                          { key: 'gender_neutral_toilets', label: 'Gender Neutral Toilets' },
                          { key: 'seating_available', label: 'Seating Available' },
                          { key: 'alcohol_served', label: 'Alcohol will be served' }
                        ].map(({ key, label }) => {
                          const isAvailable = selectedEvent[key as keyof ScheduleEvent] as boolean
                          return (
                            <div key={key} className="flex items-center gap-3">
                              <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                                {isAvailable ? (
                                  <CheckIcon className={`w-5 h-5 ${isAvailable ? 'text-deep-black' : 'text-slate-grey'}`} aria-hidden="true" />
                                ) : (
                                  <XMarkIcon className={`w-5 h-5 ${isAvailable ? 'text-deep-black' : 'text-slate-grey'}`} aria-hidden="true" />
                                )}
                              </div>
                              <span className={`text-base ${isAvailable ? 'text-deep-black font-medium' : 'text-slate-grey'}`}>
                                {label}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                      
                      {/* Additional Info */}
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <h3 className="text-sm sm:text-base font-semibold text-deep-black">
                            Requesting a Carer Ticket or Adjustments
                          </h3>
                          <p className="text-xs sm:text-sm text-deep-black leading-relaxed">
                            To request a carer ticket or inquire about any inclusion related adjustments you can either speak to any member of our committee or privately reach out to our inclusions officer at{' '}
                            <a href="mailto:inclusions@umhc.org.uk" className="text-umhc-green hover:underline focus:outline-none focus:underline">
                              inclusions@umhc.org.uk
                            </a>{' '}
                            ideally with suitable time before the event.
                          </p>
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-sm sm:text-base font-semibold text-deep-black">
                            Event Inquiries
                          </h3>
                          <p className="text-xs sm:text-sm text-deep-black leading-relaxed">
                            If you have any questions about this event, feel free to reach out to us on any one of our social platforms, in-person with any member of our committee or directly to one of our event secretaries.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {selectedEvent.accessibility_notes && (
                      <div className="space-y-1 pt-3 border-t border-cream-white">
                        <h3 className="text-sm sm:text-base font-semibold text-deep-black">
                          Further Information
                        </h3>
                        <p className="text-xs sm:text-sm text-deep-black leading-relaxed">
                          {selectedEvent.accessibility_notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}