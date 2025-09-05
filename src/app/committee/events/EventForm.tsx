'use client';

import { useState, useEffect } from 'react';
import { ScheduleEvent, EventType } from '@/types/schedule';
import { CreateEventData, UpdateEventData } from '@/lib/eventService';

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {event ? 'Edit Event' : 'Create New Event'}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
              disabled={submitting}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-umhc-green ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter event title"
                  disabled={submitting}
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <label htmlFor="event_type" className="block text-sm font-medium text-gray-700 mb-1">
                  Event Type *
                </label>
                <select
                  id="event_type"
                  value={formData.event_type}
                  onChange={(e) => handleInputChange('event_type', e.target.value as EventType)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-umhc-green ${
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
                <label htmlFor="event_date" className="block text-sm font-medium text-gray-700 mb-1">
                  Event Date *
                </label>
                <input
                  type="date"
                  id="event_date"
                  value={formData.event_date}
                  onChange={(e) => handleInputChange('event_date', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-umhc-green ${
                    errors.event_date ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={submitting}
                />
                {errors.event_date && <p className="text-red-500 text-sm mt-1">{errors.event_date}</p>}
              </div>

              <div>
                <label htmlFor="event_time" className="block text-sm font-medium text-gray-700 mb-1">
                  Event Time
                </label>
                <input
                  type="time"
                  id="event_time"
                  value={formData.event_time}
                  onChange={(e) => handleInputChange('event_time', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-umhc-green"
                  disabled={submitting}
                />
              </div>

              <div>
                <label htmlFor="su_website_url" className="block text-sm font-medium text-gray-700 mb-1">
                  SU Website URL
                </label>
                <input
                  type="url"
                  id="su_website_url"
                  value={formData.su_website_url}
                  onChange={(e) => handleInputChange('su_website_url', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-umhc-green ${
                    errors.su_website_url ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="https://manchesterstudentsunion.com/..."
                  disabled={submitting}
                />
                {errors.su_website_url && <p className="text-red-500 text-sm mt-1">{errors.su_website_url}</p>}
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-umhc-green"
                placeholder="Describe the event..."
                disabled={submitting}
              />
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="full_address" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Address
                </label>
                <input
                  type="text"
                  id="full_address"
                  value={formData.full_address}
                  onChange={(e) => handleInputChange('full_address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-umhc-green"
                  placeholder="Enter full address"
                  disabled={submitting}
                />
              </div>

              <div>
                <label htmlFor="what3words" className="block text-sm font-medium text-gray-700 mb-1">
                  What3Words
                </label>
                <input
                  type="text"
                  id="what3words"
                  value={formData.what3words}
                  onChange={(e) => handleInputChange('what3words', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-umhc-green"
                  placeholder="///word.word.word"
                  disabled={submitting}
                />
              </div>
            </div>

            {/* Accessibility */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Accessibility Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.dda_compliant_ramp_access}
                    onChange={(e) => handleInputChange('dda_compliant_ramp_access', e.target.checked)}
                    className="h-4 w-4 text-umhc-green focus:ring-umhc-green border-gray-300 rounded"
                    disabled={submitting}
                  />
                  <span className="ml-2 text-sm text-gray-700">DDA compliant ramp access</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.lift_access_within_building}
                    onChange={(e) => handleInputChange('lift_access_within_building', e.target.checked)}
                    className="h-4 w-4 text-umhc-green focus:ring-umhc-green border-gray-300 rounded"
                    disabled={submitting}
                  />
                  <span className="ml-2 text-sm text-gray-700">Lift access within building</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.accessible_toilets}
                    onChange={(e) => handleInputChange('accessible_toilets', e.target.checked)}
                    className="h-4 w-4 text-umhc-green focus:ring-umhc-green border-gray-300 rounded"
                    disabled={submitting}
                  />
                  <span className="ml-2 text-sm text-gray-700">Accessible toilets</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.gender_neutral_toilets}
                    onChange={(e) => handleInputChange('gender_neutral_toilets', e.target.checked)}
                    className="h-4 w-4 text-umhc-green focus:ring-umhc-green border-gray-300 rounded"
                    disabled={submitting}
                  />
                  <span className="ml-2 text-sm text-gray-700">Gender neutral toilets</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.seating_available}
                    onChange={(e) => handleInputChange('seating_available', e.target.checked)}
                    className="h-4 w-4 text-umhc-green focus:ring-umhc-green border-gray-300 rounded"
                    disabled={submitting}
                  />
                  <span className="ml-2 text-sm text-gray-700">Seating available</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.alcohol_served}
                    onChange={(e) => handleInputChange('alcohol_served', e.target.checked)}
                    className="h-4 w-4 text-umhc-green focus:ring-umhc-green border-gray-300 rounded"
                    disabled={submitting}
                  />
                  <span className="ml-2 text-sm text-gray-700">Alcohol served</span>
                </label>
              </div>

              <div className="mt-4">
                <label htmlFor="accessibility_notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Accessibility Notes
                </label>
                <textarea
                  id="accessibility_notes"
                  value={formData.accessibility_notes}
                  onChange={(e) => handleInputChange('accessibility_notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-umhc-green"
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
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm text-white bg-umhc-green rounded-lg hover:bg-stealth-green transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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