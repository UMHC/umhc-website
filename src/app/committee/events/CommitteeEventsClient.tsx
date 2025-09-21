'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  CalendarDaysIcon,
  ArrowLeftIcon,
  ArrowRightOnRectangleIcon,
  PencilIcon,
  PlusIcon,
  EyeIcon,
  MapPinIcon,
  ClockIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { ScheduleEvent, EventType } from '@/types/schedule';
import { CreateEventData, UpdateEventData } from '@/lib/eventService';
import EventForm from './EventForm';

interface CommitteeEventsClientProps {
  user: {
    id: string;
    email: string | null;
    given_name: string | null;
    family_name: string | null;
    picture: string | null;
  };
}

interface EventTypeStat {
  label: string;
  value: string;
  type: EventType | 'other';
  icon: React.ElementType;
  color: string;
}

export default function CommitteeEventsClient({ user }: CommitteeEventsClientProps) {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/committee/events');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setEvents(data.events);
        } else {
          setError('Failed to fetch events');
        }
      } else {
        setError('Failed to fetch events');
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Update time every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    fetchEvents();

    return () => clearInterval(interval);
  }, []);

  const getUpcomingEventsByType = (type: EventType | 'other') => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const upcomingEvents = events.filter(event => {
      const eventDate = new Date(event.event_date);
      const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
      
      return eventDateOnly >= today && event.event_type === type;
    });
    
    return upcomingEvents.length;
  };

  const eventTypeStats: EventTypeStat[] = [
    {
      label: 'Upcoming Day Hikes',
      value: getUpcomingEventsByType('hike').toString(),
      type: 'hike',
      icon: CalendarDaysIcon,
      color: 'text-green-600'
    },
    {
      label: 'Upcoming Socials',
      value: getUpcomingEventsByType('social').toString(),
      type: 'social',
      icon: UsersIcon,
      color: 'text-blue-600'
    },
    {
      label: 'Upcoming Overnight Trips',
      value: getUpcomingEventsByType('residential').toString(),
      type: 'residential',
      icon: MapPinIcon,
      color: 'text-purple-600'
    },
    {
      label: 'Other Events',
      value: getUpcomingEventsByType('other').toString(),
      type: 'other',
      icon: ClockIcon,
      color: 'text-orange-600'
    }
  ];

  const getUpcomingEvents = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return events
      .filter(event => {
        const eventDate = new Date(event.event_date);
        const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
        return eventDateOnly >= today;
      })
      .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-UK', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return 'Time TBA';
    const time = new Date(`1970-01-01T${timeString}`);
    return time.toLocaleTimeString('en-UK', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventTypeColor = (type: EventType) => {
    switch (type) {
      case 'hike':
        return 'bg-green-100 text-green-800';
      case 'social':
        return 'bg-blue-100 text-blue-800';
      case 'residential':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEventClick = (event: ScheduleEvent) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  const handleCloseEventDetails = () => {
    setSelectedEvent(null);
    setShowEventDetails(false);
  };

  const handleCreateEvent = () => {
    setShowCreateForm(true);
  };

  const handleEditEvent = (event: ScheduleEvent) => {
    setEditingEvent(event);
    setShowEditForm(true);
  };

  const handleCloseCreateForm = () => {
    setShowCreateForm(false);
  };

  const handleCloseEditForm = () => {
    setShowEditForm(false);
    setEditingEvent(null);
  };

  const handleSubmitEvent = async (eventData: CreateEventData | UpdateEventData, isEdit = false) => {
    try {
      setSubmitting(true);
      const url = '/api/committee/events';
      const method = isEdit ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        // Refresh events list
        await fetchEvents();
        
        // Close forms
        if (isEdit) {
          handleCloseEditForm();
        } else {
          handleCloseCreateForm();
        }
        
        // Show success message (you could add a toast here)
        console.log(result.message);
      } else {
        setError(result.error || 'Failed to save event');
      }
    } catch (err) {
      console.error('Error saving event:', err);
      setError('An error occurred while saving the event');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`/api/committee/events?id=${eventId}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        // Refresh events list
        await fetchEvents();
        
        // Close details modal if it's open for the deleted event
        if (selectedEvent?.id === eventId) {
          handleCloseEventDetails();
        }
        
        // Show success message
        console.log(result.message);
      } else {
        setError(result.error || 'Failed to delete event');
      }
    } catch (err) {
      console.error('Error deleting event:', err);
      setError('An error occurred while deleting the event');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDuplicateEvent = async (eventId: number) => {
    try {
      setSubmitting(true);
      const response = await fetch('/api/committee/events/duplicate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: eventId }),
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        // Refresh events list
        await fetchEvents();
        
        // Show success message
        console.log(result.message);
      } else {
        setError(result.error || 'Failed to duplicate event');
      }
    } catch (err) {
      console.error('Error duplicating event:', err);
      setError('An error occurred while duplicating the event');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-whellow">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                {/* Logo */}
                <Link 
                  href="/"
                  className="h-[32px] w-[56px] relative shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-umhc-green focus-visible:ring-offset-2 rounded"
                  aria-label="UMHC Homepage"
                >
                  <div className="relative w-full h-full">
                    <Image
                      src="/images/umhc-logo.webp"
                      alt="UMHC - University of Manchester Hiking Club"
                      fill
                      sizes="56px"
                      className="object-contain"
                      priority
                    />
                  </div>
                </Link>
                
                {/* Title */}
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Event Management</h1>
                  <p className="text-sm text-gray-500">Schedule and manage club events</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Link
                  href="/committee"
                  className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <ArrowLeftIcon className="w-4 h-4 mr-1" />
                  Back to Console
                </Link>
                
                <div className="h-4 w-px bg-gray-300"></div>
                
                <span className="text-sm text-gray-500">
                  Welcome, {user?.given_name || user?.email || 'Committee Member'}
                </span>
                <LogoutLink
                  className="flex items-center text-sm text-gray-500 hover:text-gray-700"
                  postLogoutRedirectURL="/"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4 mr-1" />
                  Sign out
                </LogoutLink>
                
                <div className="h-4 w-px bg-gray-300"></div>
                
                <span className="text-sm text-gray-500">
                  {currentTime.toLocaleTimeString('en-UK', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-umhc-green mx-auto mb-4"></div>
            <p className="text-slate-grey">Loading events...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-whellow">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                {/* Logo */}
                <Link 
                  href="/"
                  className="h-[32px] w-[56px] relative shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-umhc-green focus-visible:ring-offset-2 rounded"
                  aria-label="UMHC Homepage"
                >
                  <div className="relative w-full h-full">
                    <Image
                      src="/images/umhc-logo.webp"
                      alt="UMHC - University of Manchester Hiking Club"
                      fill
                      sizes="56px"
                      className="object-contain"
                      priority
                    />
                  </div>
                </Link>
                
                {/* Title */}
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Event Management</h1>
                  <p className="text-sm text-gray-500">Schedule and manage club events</p>
                </div>
              </div>
              
              <Link
                href="/committee"
                className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-1" />
                Back to Console
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-8">
            <div className="text-red-600 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-slate-grey">Error loading events: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-whellow">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              {/* Logo */}
              <Link 
                href="/"
                className="h-[32px] w-[56px] relative shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-umhc-green focus-visible:ring-offset-2 rounded"
                aria-label="UMHC Homepage"
              >
                <div className="relative w-full h-full">
                  <Image
                    src="/images/umhc-logo.webp"
                    alt="UMHC - University of Manchester Hiking Club"
                    fill
                    sizes="56px"
                    className="object-contain"
                    priority
                  />
                </div>
              </Link>
              
              {/* Title */}
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Event Management</h1>
                <p className="text-sm text-gray-500">Schedule and manage club events</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                href="/committee"
                className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-1" />
                Back to Console
              </Link>
              
              <div className="h-4 w-px bg-gray-300"></div>
              
              <span className="text-sm text-gray-500">
                Welcome, {user?.given_name || user?.email || 'Committee Member'}
              </span>
              <LogoutLink
                className="flex items-center text-sm text-gray-500 hover:text-gray-700"
                postLogoutRedirectURL="/"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4 mr-1" />
                Sign out
              </LogoutLink>
              
              <div className="h-4 w-px bg-gray-300"></div>
              
              <span className="text-sm text-gray-500">
                {currentTime.toLocaleTimeString('en-UK', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Event Type Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {eventTypeStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
                <div className="p-3 rounded-full bg-gray-50">
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">All Events</h2>
            <button 
              onClick={handleCreateEvent}
              className="flex items-center px-4 py-2 bg-umhc-green text-white rounded-lg hover:bg-stealth-green transition-colors"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Event
            </button>
          </div>
          
          <div className="p-6">
            {getUpcomingEvents().length === 0 ? (
              <div className="text-center py-8">
                <CalendarDaysIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No upcoming events found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {getUpcomingEvents().map((event) => (
                  <div 
                    key={event.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleEventClick(event)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEventTypeColor(event.event_type)}`}>
                            {event.event_type}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <CalendarDaysIcon className="w-4 h-4 mr-1" />
                            {formatDate(event.event_date)}
                          </div>
                          <div className="flex items-center">
                            <ClockIcon className="w-4 h-4 mr-1" />
                            {formatTime(event.event_time)}
                          </div>
                          {event.full_address && (
                            <div className="flex items-center">
                              <MapPinIcon className="w-4 h-4 mr-1" />
                              {event.full_address}
                            </div>
                          )}
                        </div>
                        
                        {event.description && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{event.description}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEventClick(event);
                          }}
                          className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                          title="View details"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditEvent(event);
                          }}
                          className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                          title="Edit event"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Event Details Modal */}
      {showEventDetails && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">{selectedEvent.title}</h2>
                <button
                  onClick={handleCloseEventDetails}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getEventTypeColor(selectedEvent.event_type)}`}>
                    {selectedEvent.event_type}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">Date</h3>
                    <p className="text-sm text-gray-900">{formatDate(selectedEvent.event_date)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">Time</h3>
                    <p className="text-sm text-gray-900">{formatTime(selectedEvent.event_time)}</p>
                  </div>
                </div>
                
                {selectedEvent.full_address && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">Location</h3>
                    <p className="text-sm text-gray-900">{selectedEvent.full_address}</p>
                  </div>
                )}
                
                {selectedEvent.what3words && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">What3Words</h3>
                    <p className="text-sm text-gray-900">{selectedEvent.what3words}</p>
                  </div>
                )}
                
                {selectedEvent.description && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">Description</h3>
                    <p className="text-sm text-gray-900">{selectedEvent.description}</p>
                  </div>
                )}
                
                {selectedEvent.su_website_url && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">SU Website</h3>
                    <a 
                      href={selectedEvent.su_website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-umhc-green hover:text-stealth-green"
                    >
                      View on SU Website
                    </a>
                  </div>
                )}
                
                {/* Accessibility Information */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Accessibility</h3>
                  <div className="space-y-1">
                    {selectedEvent.dda_compliant_ramp_access && (
                      <div className="flex items-center text-sm text-green-600">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        DDA compliant ramp access
                      </div>
                    )}
                    {selectedEvent.lift_access_within_building && (
                      <div className="flex items-center text-sm text-green-600">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Lift access within building
                      </div>
                    )}
                    {selectedEvent.accessible_toilets && (
                      <div className="flex items-center text-sm text-green-600">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Accessible toilets
                      </div>
                    )}
                    {selectedEvent.gender_neutral_toilets && (
                      <div className="flex items-center text-sm text-green-600">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Gender neutral toilets
                      </div>
                    )}
                    {selectedEvent.seating_available && (
                      <div className="flex items-center text-sm text-green-600">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Seating available
                      </div>
                    )}
                    {selectedEvent.alcohol_served && (
                      <div className="flex items-center text-sm text-blue-600">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Alcohol served
                      </div>
                    )}
                  </div>
                  
                  {selectedEvent.accessibility_notes && (
                    <div className="mt-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Accessibility Notes</h4>
                      <p className="text-sm text-gray-600">{selectedEvent.accessibility_notes}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    handleDeleteEvent(selectedEvent.id);
                  }}
                  className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Event
                </button>
                
                <div className="flex space-x-3">
                  <button
                    onClick={handleCloseEventDetails}
                    className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      handleDuplicateEvent(selectedEvent.id);
                      handleCloseEventDetails();
                    }}
                    className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Duplicate
                  </button>
                  <button
                    onClick={() => {
                      handleEditEvent(selectedEvent);
                      handleCloseEventDetails();
                    }}
                    className="px-4 py-2 text-sm text-white bg-umhc-green rounded-lg hover:bg-stealth-green transition-colors"
                  >
                    Edit Event
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Event Form */}
      {showCreateForm && (
        <EventForm
          onSubmit={(eventData) => handleSubmitEvent(eventData, false)}
          onCancel={handleCloseCreateForm}
          submitting={submitting}
        />
      )}

      {/* Edit Event Form */}
      {showEditForm && editingEvent && (
        <EventForm
          event={editingEvent}
          onSubmit={(eventData) => handleSubmitEvent(eventData, true)}
          onCancel={handleCloseEditForm}
          submitting={submitting}
        />
      )}
    </div>
  );
}
