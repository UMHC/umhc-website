'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getScheduleEvents } from '@/lib/scheduleService'
import { ScheduleEvent } from '@/types/schedule'

interface EventCardProps {
  event: ScheduleEvent
  onClick: (event: ScheduleEvent) => void
}

function EventCard({ event, onClick }: EventCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const day = date.getDate()
    const month = date.toLocaleDateString('en-GB', { month: 'long' })
    return { day, month }
  }

  const { day, month } = formatDate(event.event_date)

  return (
    <div 
      className="flex flex-row gap-5 items-center justify-start p-0 relative w-full cursor-pointer py-3 px-2"
      onClick={() => onClick(event)}
    >
      {/* Date Section - responsive sizing */}
      <div className="flex flex-col items-center justify-center leading-none not-italic pb-2.5 pt-0 px-0 relative shrink-0 text-umhc-green text-center w-16 sm:w-20 md:w-24 lg:w-[107px]">
        <div className="flex flex-col font-bold justify-center mb-[-8px] sm:mb-[-10px] relative shrink-0 text-3xl sm:text-4xl md:text-5xl lg:text-[52px] w-full">
          <p className="block leading-normal">{day}</p>
        </div>
        <div className="flex flex-col font-semibold justify-center mb-[-8px] sm:mb-[-10px] relative shrink-0 text-sm sm:text-base md:text-lg lg:text-[20px] w-full">
          <p className="block leading-normal">{month}</p>
        </div>
      </div>

      {/* Content Section - responsive sizing */}
      <div className="flex flex-col gap-[3px] items-start justify-center p-0 relative shrink-0 flex-1">
        <div className="flex flex-row gap-4 sm:gap-6 md:gap-[22px] items-center justify-start p-0 relative shrink-0">
          <div className="flex flex-col font-bold justify-center leading-none not-italic relative shrink-0 text-deep-black text-lg sm:text-xl md:text-[22px] lg:text-[24px] text-left">
            <p className="block leading-normal">{event.title}</p>
          </div>
        </div>
        <div className="font-normal min-w-full not-italic relative shrink-0 text-deep-black text-sm sm:text-base md:text-[16px] text-left leading-relaxed">
          <p className="block overflow-hidden text-ellipsis" style={{ 
            display: '-webkit-box', 
            WebkitLineClamp: 3, 
            WebkitBoxOrient: 'vertical',
            lineHeight: '1.4em',
            maxHeight: '4.2em'
          }}>
            {event.description || "Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas."}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SchedulePreview() {
  const [events, setEvents] = useState<ScheduleEvent[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function fetchEvents() {
      try {
        const data = await getScheduleEvents()
        // Get next 4 upcoming events for more compact display
        const upcomingEvents = data.slice(0, 4)
        setEvents(upcomingEvents)
      } catch (err) {
        console.error('Error fetching events:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const handleEventClick = (event: ScheduleEvent) => {
    // Navigate to schedule page with event ID as a query parameter
    router.push(`/schedule?eventId=${event.id}`)
  }

  if (loading) {
    return (
      <section className="bg-whellow py-12">
        <div className="flex flex-col items-center justify-center">
          <p className="text-lg text-slate-grey">Loading events...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-whellow relative overflow-hidden pt-0 pb-16 sm:pb-20 md:pb-24 lg:pb-32">
      {/* Activity icons with responsive positioning */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Top row - mobile has 2 icons flanking title, desktop has full border */}
        <img src="/images/activity-images/mountain-trees.webp" alt="" className="absolute w-12 h-12 sm:w-14 sm:h-14 lg:w-20 lg:h-20 opacity-7 lg:hidden" style={{ left: '12.5%', top: '-5px' }} />
        <img src="/images/activity-images/map.webp" alt="" className="absolute w-12 h-12 sm:w-14 sm:h-14 lg:w-20 lg:h-20 opacity-7 lg:hidden" style={{ right: '12.5%', top: '-5px' }} />
        
        {/* Desktop top border - full row */}
        <img src="/images/activity-images/mountain-trees.webp" alt="" className="absolute w-12 h-12 opacity-7 hidden lg:block z-50" style={{ left: '5%', top: '10px' }} />
        <img src="/images/activity-images/boots.webp" alt="" className="absolute w-12 h-12 opacity-7 hidden lg:block z-50" style={{ left: '20%', top: '10px' }} />
        <img src="/images/activity-images/oak-tree.webp" alt="" className="absolute w-12 h-12 opacity-7 hidden lg:block z-50" style={{ left: '35%', top: '10px' }} />
        <img src="/images/activity-images/pine-tree.webp" alt="" className="absolute w-12 h-12 opacity-7 hidden lg:block z-50" style={{ right: '35%', top: '10px' }} />
        <img src="/images/activity-images/playing-cards.webp" alt="" className="absolute w-12 h-12 opacity-7 hidden lg:block z-50" style={{ right: '20%', top: '10px' }} />
        <img src="/images/activity-images/map.webp" alt="" className="absolute w-12 h-12 opacity-7 hidden lg:block z-50" style={{ right: '5%', top: '10px' }} />
        
        {/* Left border - desktop only */}
        <img src="/images/activity-images/bowling.webp" alt="" className="absolute w-12 h-12 opacity-7 hidden lg:block z-50" style={{ left: '2%', top: '25%' }} />
        <img src="/images/activity-images/pool.webp" alt="" className="absolute w-12 h-12 opacity-7 hidden lg:block z-50" style={{ left: '2%', top: '45%' }} />
        <img src="/images/activity-images/trees-path.webp" alt="" className="absolute w-12 h-12 opacity-7 hidden lg:block z-50" style={{ left: '2%', top: '65%' }} />
        <img src="/images/activity-images/cinema.webp" alt="" className="absolute w-12 h-12 opacity-7 hidden lg:block z-50" style={{ left: '2%', top: '85%' }} />
        
        {/* Right border - desktop only */}
        <img src="/images/activity-images/karaoke.webp" alt="" className="absolute w-12 h-12 opacity-7 hidden lg:block z-50" style={{ right: '2%', top: '25%' }} />
        <img src="/images/activity-images/darts.webp" alt="" className="absolute w-12 h-12 opacity-7 hidden lg:block z-50" style={{ right: '2%', top: '45%' }} />
        <img src="/images/activity-images/trees-waterfall.webp" alt="" className="absolute w-12 h-12 opacity-7 hidden lg:block z-50" style={{ right: '2%', top: '65%' }} />
        <img src="/images/activity-images/dance.webp" alt="" className="absolute w-12 h-12 opacity-7 hidden lg:block z-50" style={{ right: '2%', top: '85%' }} />
        
        {/* Bottom row - mobile has 4 icons, desktop has full border */}
        <img src="/images/activity-images/boots.webp" alt="" className="absolute w-10 h-10 sm:w-12 sm:h-12 lg:hidden opacity-7" style={{ left: '15%', bottom: '25px' }} />
        <img src="/images/activity-images/board-game.webp" alt="" className="absolute w-10 h-10 sm:w-12 sm:h-12 lg:hidden opacity-7" style={{ left: '35%', bottom: '25px' }} />
        <img src="/images/activity-images/pine-tree.webp" alt="" className="absolute w-10 h-10 sm:w-12 sm:h-12 lg:hidden opacity-7" style={{ right: '35%', bottom: '25px' }} />
        <img src="/images/activity-images/quiz.webp" alt="" className="absolute w-10 h-10 sm:w-12 sm:h-12 lg:hidden opacity-7" style={{ right: '15%', bottom: '25px' }} />
        
        {/* Desktop bottom border - full row */}
        <img src="/images/activity-images/banquet.webp" alt="" className="absolute w-12 h-12 opacity-7 hidden lg:block z-50" style={{ left: '8%', bottom: '15px' }} />
        <img src="/images/activity-images/board-game.webp" alt="" className="absolute w-12 h-12 opacity-7 hidden lg:block z-50" style={{ left: '20%', bottom: '15px' }} />
        <img src="/images/activity-images/gavel.webp" alt="" className="absolute w-12 h-12 opacity-7 hidden lg:block z-50" style={{ left: '32%', bottom: '15px' }} />
        <img src="/images/activity-images/quiz.webp" alt="" className="absolute w-12 h-12 opacity-7 hidden lg:block z-50" style={{ left: '44%', bottom: '15px' }} />
        <img src="/images/activity-images/laser-tag.webp" alt="" className="absolute w-12 h-12 opacity-7 hidden lg:block z-50" style={{ right: '44%', bottom: '15px' }} />
        <img src="/images/activity-images/football-goal.webp" alt="" className="absolute w-12 h-12 opacity-7 hidden lg:block z-50" style={{ right: '32%', bottom: '15px' }} />
        <img src="/images/activity-images/beer.webp" alt="" className="absolute w-12 h-12 opacity-7 hidden lg:block z-50" style={{ right: '20%', bottom: '15px' }} />
        <img src="/images/activity-images/backpack.webp" alt="" className="absolute w-12 h-12 opacity-7 hidden lg:block z-50" style={{ right: '8%', bottom: '15px' }} />
      </div>

      {/* Content */}
      <div className="flex flex-col items-center w-full relative z-10">
        <div className="flex flex-col gap-[3px] items-center justify-start px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 w-full text-center max-w-7xl mx-auto">
          <h2 className="font-bold text-deep-black text-3xl md:text-4xl lg:text-[40px] text-center whitespace-nowrap mt-0 mb-4 sm:mb-6 md:mb-8">
            Schedule
          </h2>
          
          {/* Events List */}
          <div className="w-11/12 space-y-0">
            {events.map((event) => (
              <EventCard key={event.id} event={event} onClick={handleEventClick} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}