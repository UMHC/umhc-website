'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  CalendarIcon,
  CalendarDaysIcon,
  ClockIcon,
  DocumentDuplicateIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  PencilIcon,
  PlusIcon,
  Squares2X2Icon,
  TrashIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { LogoutLink } from '@kinde-oss/kinde-auth-nextjs/components';

import EventForm from './EventForm';
import { CreateEventData, UpdateEventData } from '@/lib/eventService';
import { EventType, ScheduleEvent } from '@/types/schedule';

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
      if (!response.ok) {
        setError('Failed to fetch events');
        return;
      }

      const data = await response.json();
      if (data.success) {
        setEvents(data.events);
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
    fetchEvents();
  }, []);

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return events
      .filter((event) => {
        const eventDate = new Date(event.event_date);
        const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
        return eventDateOnly >= today;
      })
      .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
  }, [events]);

  const getUpcomingEventsByType = (type: EventType | 'other') => {
    return upcomingEvents.filter((event) => event.event_type === type).length;
  };

  const eventTypeStats: EventTypeStat[] = [
    {
      label: 'Upcoming Day Hikes',
      value: getUpcomingEventsByType('hike').toString(),
      type: 'hike',
      icon: CalendarDaysIcon,
      color: 'text-umhc-green',
    },
    {
      label: 'Upcoming Socials',
      value: getUpcomingEventsByType('social').toString(),
      type: 'social',
      icon: UsersIcon,
      color: 'text-sky-700',
    },
    {
      label: 'Upcoming Overnight Trips',
      value: getUpcomingEventsByType('residential').toString(),
      type: 'residential',
      icon: MapPinIcon,
      color: 'text-violet-700',
    },
    {
      label: 'Other Events',
      value: getUpcomingEventsByType('other').toString(),
      type: 'other',
      icon: Squares2X2Icon,
      color: 'text-slate-grey',
    },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return 'Time TBA';
    const time = new Date(`1970-01-01T${timeString}`);
    return time.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEventTypeColor = (type: EventType) => {
    switch (type) {
      case 'hike':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'social':
        return 'bg-sky-100 text-sky-800 border border-sky-200';
      case 'residential':
        return 'bg-violet-100 text-violet-800 border border-violet-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getEventTypeLabel = (type: EventType) => {
    switch (type) {
      case 'hike':
        return 'Day Hike';
      case 'social':
        return 'Social';
      case 'residential':
        return 'Overnight Trip';
      default:
        return 'Other';
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
      const method = isEdit ? 'PATCH' : 'POST';

      const response = await fetch('/api/committee/events', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        await fetchEvents();
        if (isEdit) {
          handleCloseEditForm();
        } else {
          handleCloseCreateForm();
        }
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
        await fetchEvents();
        if (selectedEvent?.id === eventId) {
          handleCloseEventDetails();
        }
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
        await fetchEvents();
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

  const renderContent = () => {
    if (loading) {
      return (
        <section aria-labelledby="event-management" className="bg-cream-white rounded-lg p-8 border border-gray-200">
          <div className="text-center py-8" role="status" aria-live="polite">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-umhc-green mx-auto mb-4"></div>
            <p className="text-slate-grey">Loading events...</p>
          </div>
        </section>
      );
    }

    if (error) {
      return (
        <section aria-labelledby="event-management" className="bg-cream-white rounded-lg p-8 border border-red-200">
          <div className="text-center py-6">
            <ExclamationTriangleIcon className="w-12 h-12 text-red-600 mx-auto mb-4" aria-hidden="true" />
            <p className="text-red-700 font-medium mb-5">Error loading events: {error}</p>
            <button
              onClick={fetchEvents}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap bg-umhc-green text-cream-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors duration-200 hover:bg-stealth-green focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-umhc-green"
            >
              <ArrowPathIcon className="w-4 h-4" />
              Retry
            </button>
          </div>
        </section>
      );
    }

    return (
      <section aria-labelledby="event-management" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {eventTypeStats.map((stat) => (
            <article key={stat.type} className="bg-cream-white rounded-lg p-5 border border-gray-200">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-grey">{stat.label}</p>
                  <p className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
                </div>
                <div className="p-3 rounded-full bg-whellow border border-gray-200">
                  <stat.icon className={`w-6 h-6 ${stat.color}`} aria-hidden="true" />
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="bg-cream-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 id="event-management" className="text-xl font-semibold text-deep-black">All Upcoming Events</h2>
              <p className="text-sm text-slate-grey mt-1">{upcomingEvents.length} scheduled</p>
            </div>
            <button
              onClick={handleCreateEvent}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap bg-umhc-green text-cream-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors duration-200 hover:bg-stealth-green focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-umhc-green"
            >
              <PlusIcon className="w-4 h-4" />
              Add Event
            </button>
          </div>

          <div className="p-6">
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-10 bg-whellow rounded-lg border border-dashed border-gray-300">
                <CalendarDaysIcon className="w-12 h-12 text-slate-grey mx-auto mb-4" aria-hidden="true" />
                <p className="text-slate-grey font-medium">No upcoming events found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <article
                    key={event.id}
                    className="group border border-gray-200 rounded-lg p-4 bg-whellow hover:border-umhc-green transition-colors cursor-pointer"
                    onClick={() => handleEventClick(event)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-lg font-semibold text-deep-black group-hover:text-umhc-green transition-colors">{event.title}</h3>
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getEventTypeColor(event.event_type)}`}>
                            {getEventTypeLabel(event.event_type)}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-grey">
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarIcon className="w-4 h-4" aria-hidden="true" />
                            {formatDate(event.event_date)}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <ClockIcon className="w-4 h-4" aria-hidden="true" />
                            {formatTime(event.event_time)}
                          </span>
                          {event.full_address && (
                            <span className="inline-flex items-center gap-1.5">
                              <MapPinIcon className="w-4 h-4" aria-hidden="true" />
                              {event.full_address}
                            </span>
                          )}
                        </div>

                        {event.description && <p className="text-sm text-slate-grey mt-3 line-clamp-2">{event.description}</p>}
                      </div>

                      <div className="shrink-0 flex gap-2">
                        <button
                          onClick={(eventClick) => {
                            eventClick.stopPropagation();
                            handleEventClick(event);
                          }}
                          className="px-3 py-2 text-xs font-semibold text-slate-grey bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:text-deep-black transition-colors"
                          title="View details"
                        >
                          View
                        </button>
                        <button
                          onClick={(eventClick) => {
                            eventClick.stopPropagation();
                            handleEditEvent(event);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-umhc-green bg-white rounded-lg border border-umhc-green/30 hover:bg-umhc-green/5 transition-colors"
                          title="Edit event"
                        >
                          <PencilIcon className="w-3.5 h-3.5" />
                          Edit
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  };

  return (
    <main className="min-h-screen bg-[#f6f6f4] pt-24 px-4 sm:px-6 lg:px-8 pb-14">
      <div className="max-w-5xl mx-auto py-6 sm:py-10 space-y-6">
        <header className="px-2 sm:px-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-umhc-green/80 mb-2">Tools</p>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-deep-black mb-3">Event Management</h1>
              <p className="max-w-2xl text-[17px] text-slate-grey leading-relaxed font-medium">
                Welcome back, {user?.given_name || 'Committee Member'}. Schedule and manage club events.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold text-sm px-4 py-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Back to Dashboard
              </Link>
              <LogoutLink className="inline-flex items-center justify-center gap-2 whitespace-nowrap bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-sm px-4 py-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 border border-red-200">
                Sign out
              </LogoutLink>
            </div>
          </div>
        </header>

        {renderContent()}
      </div>

      {showEventDetails && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center p-4 z-50">
          <div className="bg-cream-white rounded-xl border border-gray-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between gap-3 mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-deep-black">{selectedEvent.title}</h2>
                  <p className="text-sm text-slate-grey mt-1">Event details and accessibility profile</p>
                </div>
                <button
                  onClick={handleCloseEventDetails}
                  className="px-3 py-2 text-sm text-slate-grey bg-whellow rounded-lg border border-gray-200 hover:text-deep-black hover:border-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getEventTypeColor(selectedEvent.event_type)}`}>
                    {getEventTypeLabel(selectedEvent.event_type)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-whellow rounded-lg border border-gray-200 p-4">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-grey mb-2">Date</h3>
                    <p className="text-sm text-deep-black">{formatDate(selectedEvent.event_date)}</p>
                  </div>
                  <div className="bg-whellow rounded-lg border border-gray-200 p-4">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-grey mb-2">Time</h3>
                    <p className="text-sm text-deep-black">{formatTime(selectedEvent.event_time)}</p>
                  </div>
                </div>

                {selectedEvent.full_address && (
                  <div className="bg-whellow rounded-lg border border-gray-200 p-4">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-grey mb-2">Location</h3>
                    <p className="text-sm text-deep-black">{selectedEvent.full_address}</p>
                  </div>
                )}

                {selectedEvent.what3words && (
                  <div className="bg-whellow rounded-lg border border-gray-200 p-4">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-grey mb-2">What3Words</h3>
                    <p className="text-sm text-deep-black">{selectedEvent.what3words}</p>
                  </div>
                )}

                {selectedEvent.description && (
                  <div className="bg-whellow rounded-lg border border-gray-200 p-4">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-grey mb-2">Description</h3>
                    <p className="text-sm text-deep-black whitespace-pre-line">{selectedEvent.description}</p>
                  </div>
                )}

                {selectedEvent.su_website_url && (
                  <div className="bg-whellow rounded-lg border border-gray-200 p-4">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-grey mb-2">SU Website</h3>
                    <a
                      href={selectedEvent.su_website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-umhc-green hover:text-stealth-green underline"
                    >
                      View on SU Website
                    </a>
                  </div>
                )}

                <div className="bg-whellow rounded-lg border border-gray-200 p-4">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-grey mb-3">Accessibility</h3>
                  <div className="space-y-2 text-sm text-deep-black">
                    {selectedEvent.dda_compliant_ramp_access && <p>DDA compliant ramp access</p>}
                    {selectedEvent.lift_access_within_building && <p>Lift access within building</p>}
                    {selectedEvent.accessible_toilets && <p>Accessible toilets</p>}
                    {selectedEvent.gender_neutral_toilets && <p>Gender neutral toilets</p>}
                    {selectedEvent.seating_available && <p>Seating available</p>}
                    {selectedEvent.alcohol_served && <p>Alcohol served</p>}
                    {!selectedEvent.dda_compliant_ramp_access &&
                      !selectedEvent.lift_access_within_building &&
                      !selectedEvent.accessible_toilets &&
                      !selectedEvent.gender_neutral_toilets &&
                      !selectedEvent.seating_available &&
                      !selectedEvent.alcohol_served && <p className="text-slate-grey">No accessibility flags set</p>}
                  </div>

                  {selectedEvent.accessibility_notes && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-grey mb-2">Accessibility Notes</h4>
                      <p className="text-sm text-deep-black whitespace-pre-line">{selectedEvent.accessibility_notes}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => handleDeleteEvent(selectedEvent.id)}
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap bg-red-600 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors duration-200 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <TrashIcon className="w-4 h-4" />
                  Delete Event
                </button>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleCloseEventDetails}
                    className="px-4 py-2 text-sm text-slate-grey bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      handleDuplicateEvent(selectedEvent.id);
                      handleCloseEventDetails();
                    }}
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm text-slate-grey bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <DocumentDuplicateIcon className="w-4 h-4" />
                    Duplicate
                  </button>
                  <button
                    onClick={() => {
                      handleEditEvent(selectedEvent);
                      handleCloseEventDetails();
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm text-cream-white bg-umhc-green rounded-lg hover:bg-stealth-green transition-colors"
                  >
                    <PencilIcon className="w-4 h-4" />
                    Edit Event
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreateForm && (
        <EventForm
          onSubmit={(eventData) => handleSubmitEvent(eventData, false)}
          onCancel={handleCloseCreateForm}
          submitting={submitting}
        />
      )}

      {showEditForm && editingEvent && (
        <EventForm
          event={editingEvent}
          onSubmit={(eventData) => handleSubmitEvent(eventData, true)}
          onCancel={handleCloseEditForm}
          submitting={submitting}
        />
      )}
    </main>
  );
}
