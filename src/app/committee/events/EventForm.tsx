'use client';

import { useState, useEffect } from 'react';
import { ScheduleEvent, EventType } from '@/types/schedule';
import { CreateEventData, UpdateEventData } from '@/lib/eventService';

const EVENT_IMAGE_OPTIONS = [
  '',
  'backpack',
  'banquet',
  'beer',
  'board-game',
  'boots',
  'bowling-ball',
  'bowling',
  'bunk-bed',
  'bus',
  'cinema',
  'dance',
  'darts',
  'football-goal',
  'gavel',
  'karaoke',
  'lake-with-trees',
  'laser-tag',
  'map',
  'mountain-trees-lake',
  'mountain-trees-river',
  'mountain-trees',
  'oak-tree',
  'pine-tree',
  'playing-cards',
  'pool',
  'quiz',
  'rock-mountain',
  'sign',
  'trees-path',
  'trees-waterfall',
  'other',
] as const;

interface EventFormProps {
  event?: ScheduleEvent | null;
  onSubmit: (eventData: CreateEventData | UpdateEventData) => void;
  onCancel: () => void;
  submitting: boolean;
}

export default function EventForm({ event, onSubmit, onCancel, submitting }: EventFormProps) {
  const [formData, setFormData] = useState<CreateEventData>({
    title: '',
    description: '',
    event_type: 'hike',
    event_date: '',
    event_time: '',
    full_address: '',
    what3words: '',
    su_website_url: '',
    dda_compliant_ramp_access: false,
    lift_access_within_building: false,
    accessible_toilets: false,
    gender_neutral_toilets: false,
    seating_available: false,
    alcohol_served: false,
    accessibility_notes: '',
    event_image: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        event_type: event.event_type,
        event_date: event.event_date || '',
        event_time: event.event_time || '',
        full_address: event.full_address || '',
        what3words: event.what3words || '',
        su_website_url: event.su_website_url || '',
        dda_compliant_ramp_access: event.dda_compliant_ramp_access || false,
        lift_access_within_building: event.lift_access_within_building || false,
        accessible_toilets: event.accessible_toilets || false,
        gender_neutral_toilets: event.gender_neutral_toilets || false,
        seating_available: event.seating_available || false,
        alcohol_served: event.alcohol_served || false,
        accessibility_notes: event.accessibility_notes || '',
        event_image: event.event_image || '',
      });
    }
  }, [event]);

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.event_date) {
      newErrors.event_date = 'Event date is required';
    }

    if (!formData.event_type) {
      newErrors.event_type = 'Event type is required';
    }

    // Validate date is not in the past
    if (formData.event_date) {
      const eventDate = new Date(formData.event_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (eventDate < today) {
        newErrors.event_date = 'Event date cannot be in the past';
      }
    }

    // Validate URL format if provided
    if (formData.su_website_url && formData.su_website_url.trim()) {
      try {
        new URL(formData.su_website_url);
      } catch {
        newErrors.su_website_url = 'Please enter a valid URL';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const eventData = event 
      ? { ...formData, id: event.id } as UpdateEventData
      : formData;

    onSubmit(eventData);
  };

  const handleInputChange = (field: keyof CreateEventData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-[2px] flex items-center justify-center p-4 z-50">
      <div className="bg-cream-white rounded-xl border border-gray-200 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-deep-black">
              {event ? 'Edit Event' : 'Create New Event'}
            </h2>
            <button
              onClick={onCancel}
              className="px-3 py-2 text-sm text-slate-grey bg-whellow rounded-lg border border-gray-200 hover:text-deep-black hover:border-gray-300 transition-colors"
              disabled={submitting}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-label="Close">
                <title>Close</title>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-whellow rounded-lg border border-gray-200 p-5">
              <div className="md:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-deep-black mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-umhc-green ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter event title"
                  disabled={submitting}
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <label htmlFor="event_type" className="block text-sm font-medium text-deep-black mb-1">
                  Event Type *
                </label>
                <select
                  id="event_type"
                  value={formData.event_type}
                  onChange={(e) => handleInputChange('event_type', e.target.value as EventType)}
                  className={`w-full px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-umhc-green ${
                    errors.event_type ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={submitting}
                >
                  <option value="hike">Day Hike</option>
                  <option value="social">Social</option>
                  <option value="residential">Overnight Trip</option>
                  <option value="other">Other</option>
                </select>
                {errors.event_type && <p className="text-red-500 text-sm mt-1">{errors.event_type}</p>}
              </div>

              <div>
                <label htmlFor="event_date" className="block text-sm font-medium text-deep-black mb-1">
                  Event Date *
                </label>
                <input
                  type="date"
                  id="event_date"
                  value={formData.event_date}
                  onChange={(e) => handleInputChange('event_date', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-umhc-green ${
                    errors.event_date ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={submitting}
                />
                {errors.event_date && <p className="text-red-500 text-sm mt-1">{errors.event_date}</p>}
              </div>

              <div>
                <label htmlFor="event_time" className="block text-sm font-medium text-deep-black mb-1">
                  Event Time
                </label>
                <input
                  type="time"
                  id="event_time"
                  value={formData.event_time}
                  onChange={(e) => handleInputChange('event_time', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-umhc-green"
                  disabled={submitting}
                />
              </div>

              <div>
                <label htmlFor="event_image" className="block text-sm font-medium text-deep-black mb-1">
                  Event Image Icon
                </label>
                <select
                  id="event_image"
                  value={formData.event_image || ''}
                  onChange={(e) => handleInputChange('event_image', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-umhc-green"
                  disabled={submitting}
                >
                  {EVENT_IMAGE_OPTIONS.map((option) => (
                    <option key={option || 'NULL'} value={option}>
                      {option === '' ? 'NULL' : option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="su_website_url" className="block text-sm font-medium text-deep-black mb-1">
                  SU Website URL
                </label>
                <input
                  type="url"
                  id="su_website_url"
                  value={formData.su_website_url}
                  onChange={(e) => handleInputChange('su_website_url', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-umhc-green ${
                    errors.su_website_url ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="https://manchesterstudentsunion.com/..."
                  disabled={submitting}
                />
                {errors.su_website_url && <p className="text-red-500 text-sm mt-1">{errors.su_website_url}</p>}
              </div>
            </div>

            {/* Description */}
            <div className="bg-whellow rounded-lg border border-gray-200 p-5">
              <label htmlFor="description" className="block text-sm font-medium text-deep-black mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-umhc-green"
                placeholder="Describe the event..."
                disabled={submitting}
              />
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-whellow rounded-lg border border-gray-200 p-5">
              <div>
                <label htmlFor="full_address" className="block text-sm font-medium text-deep-black mb-1">
                  Full Address
                </label>
                <input
                  type="text"
                  id="full_address"
                  value={formData.full_address}
                  onChange={(e) => handleInputChange('full_address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-umhc-green"
                  placeholder="Enter full address"
                  disabled={submitting}
                />
              </div>

              <div>
                <label htmlFor="what3words" className="block text-sm font-medium text-deep-black mb-1">
                  What3Words
                </label>
                <input
                  type="text"
                  id="what3words"
                  value={formData.what3words}
                  onChange={(e) => handleInputChange('what3words', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-umhc-green"
                  placeholder="///word.word.word"
                  disabled={submitting}
                />
              </div>
            </div>

            {/* Accessibility */}
            <div className="bg-whellow rounded-lg border border-gray-200 p-5">
              <h3 className="text-lg font-medium text-deep-black mb-4">Accessibility Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.dda_compliant_ramp_access}
                    onChange={(e) => handleInputChange('dda_compliant_ramp_access', e.target.checked)}
                    className="h-4 w-4 text-umhc-green focus:ring-umhc-green border-gray-300 rounded"
                    disabled={submitting}
                  />
                  <span className="ml-2 text-sm text-deep-black">DDA compliant ramp access</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.lift_access_within_building}
                    onChange={(e) => handleInputChange('lift_access_within_building', e.target.checked)}
                    className="h-4 w-4 text-umhc-green focus:ring-umhc-green border-gray-300 rounded"
                    disabled={submitting}
                  />
                  <span className="ml-2 text-sm text-deep-black">Lift access within building</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.accessible_toilets}
                    onChange={(e) => handleInputChange('accessible_toilets', e.target.checked)}
                    className="h-4 w-4 text-umhc-green focus:ring-umhc-green border-gray-300 rounded"
                    disabled={submitting}
                  />
                  <span className="ml-2 text-sm text-deep-black">Accessible toilets</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.gender_neutral_toilets}
                    onChange={(e) => handleInputChange('gender_neutral_toilets', e.target.checked)}
                    className="h-4 w-4 text-umhc-green focus:ring-umhc-green border-gray-300 rounded"
                    disabled={submitting}
                  />
                  <span className="ml-2 text-sm text-deep-black">Gender neutral toilets</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.seating_available}
                    onChange={(e) => handleInputChange('seating_available', e.target.checked)}
                    className="h-4 w-4 text-umhc-green focus:ring-umhc-green border-gray-300 rounded"
                    disabled={submitting}
                  />
                  <span className="ml-2 text-sm text-deep-black">Seating available</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.alcohol_served}
                    onChange={(e) => handleInputChange('alcohol_served', e.target.checked)}
                    className="h-4 w-4 text-umhc-green focus:ring-umhc-green border-gray-300 rounded"
                    disabled={submitting}
                  />
                  <span className="ml-2 text-sm text-deep-black">Alcohol served</span>
                </label>
              </div>

              <div className="mt-4">
                <label htmlFor="accessibility_notes" className="block text-sm font-medium text-deep-black mb-1">
                  Accessibility Notes
                </label>
                <textarea
                  id="accessibility_notes"
                  value={formData.accessibility_notes}
                  onChange={(e) => handleInputChange('accessibility_notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-umhc-green"
                  placeholder="Additional accessibility information..."
                  disabled={submitting}
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-semibold text-slate-grey bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-semibold text-white bg-umhc-green rounded-lg hover:bg-stealth-green transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : (event ? 'Update Event' : 'Create Event')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}