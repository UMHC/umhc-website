'use client'

import { useState } from 'react'
import { CalendarDaysIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import type { EventType } from '@/types/schedule'

const categories: { value: EventType; label: string }[] = [
  { value: 'hike', label: 'Day hikes' },
  { value: 'social', label: 'Socials' },
  { value: 'residential', label: 'Weekend trips' },
  { value: 'other', label: 'Other' },
]

export default function ScheduleCalendarSubscription() {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<'categories' | 'instructions' | 'success'>('categories')
  const [selectedCategories, setSelectedCategories] = useState<EventType[]>(categories.map(({ value }) => value))

  const subscriptionOrigin = typeof window === 'undefined'
    ? ''
    : window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? window.location.origin
      : window.location.origin.replace(/^http:/, 'https:')
  const subscriptionUrl = `${subscriptionOrigin}/api/calendar?types=${selectedCategories.join(',')}`
  const webcalUrl = subscriptionUrl.replace(/^https?:/, 'webcal:')

  const close = () => {
    setIsOpen(false)
    setStep('categories')
  }

  const toggleCategory = (category: EventType) => {
    setSelectedCategories((current) => current.includes(category)
      ? current.filter((value) => value !== category)
      : [...current, category])
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-full border border-umhc-green px-3 py-1.5 text-sm font-semibold text-umhc-green transition-colors hover:bg-umhc-green hover:text-white focus:outline-none focus:ring-2 focus:ring-umhc-green focus:ring-offset-2"
      >
        <CalendarDaysIcon className="h-4 w-4" aria-hidden="true" />
        Add to calendar
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="calendar-subscription-title"
          onClick={close}
        >
          <div
            className="w-full max-w-md rounded-lg bg-cream-white p-5 shadow-xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-earth-orange">Schedule subscription</p>
                <h2 id="calendar-subscription-title" className="mt-1 text-xl font-bold text-deep-black">
                  {step === 'categories' && 'Choose your events'}
                  {step === 'instructions' && 'Add UMHC to your calendar'}
                  {step === 'success' && 'You are all set'}
                </h2>
              </div>
              <button
                type="button"
                onClick={close}
                className="rounded-full p-1 text-slate-grey transition-colors hover:bg-whellow hover:text-umhc-green focus:outline-none focus:ring-2 focus:ring-umhc-green"
                aria-label="Close calendar subscription"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {step === 'categories' && (
              <>
                <p className="mb-4 text-sm leading-relaxed text-slate-grey">
                  Select the types of events you would like to see. You can change this later by deleting the UMHC calendar and subscribing again.
                </p>
                <fieldset className="space-y-2">
                  <legend className="sr-only">Event categories</legend>
                  {categories.map(({ value, label }) => (
                    <label key={value} className="relative flex cursor-pointer items-center gap-3 rounded-md border border-whellow px-3 py-2.5 text-sm text-slate-grey transition-colors hover:bg-whellow">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(value)}
                        onChange={() => toggleCategory(value)}
                        className="peer sr-only"
                      />
                      <span
                        aria-hidden="true"
                        className="h-5 w-5 shrink-0 rounded border-2 border-umhc-green bg-transparent transition-colors peer-checked:bg-umhc-green peer-focus-visible:ring-2 peer-focus-visible:ring-umhc-green peer-focus-visible:ring-offset-2"
                      />
                      <CheckIcon
                        aria-hidden="true"
                        className="pointer-events-none absolute left-[14px] h-3.5 w-3.5 text-white opacity-0 transition-opacity peer-checked:opacity-100"
                      />
                      {label}
                    </label>
                  ))}
                </fieldset>
                <button
                  type="button"
                  disabled={selectedCategories.length === 0}
                  onClick={() => setStep('instructions')}
                  className="mt-5 w-full rounded-md bg-umhc-green px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-stealth-green disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-umhc-green focus:ring-offset-2"
                >
                  Next
                </button>
              </>
            )}

            {step === 'instructions' && (
              <>
                <ol className="space-y-3 text-sm leading-relaxed text-slate-grey">
                  <li><strong className="text-deep-black">1.</strong> Press the <strong className="text-deep-black">Add UMHC calendar</strong> button below.</li>
                  <li><strong className="text-deep-black">2.</strong> Your device will open its calendar app or ask which app to use.</li>
                  <li><strong className="text-deep-black">3.</strong> Confirm the subscription when prompted. The calendar will update as we add events.</li>
                </ol>
                <a
                  href={webcalUrl}
                  onClick={() => setStep('success')}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-umhc-green px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-stealth-green focus:outline-none focus:ring-2 focus:ring-umhc-green focus:ring-offset-2"
                >
                  <CalendarDaysIcon className="h-4 w-4" aria-hidden="true" />
                  Add UMHC calendar
                </a>
                <button type="button" onClick={() => setStep('categories')} className="mt-3 w-full text-sm font-semibold text-umhc-green hover:underline">
                  Back to categories
                </button>
              </>
            )}

            {step === 'success' && (
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-umhc-green text-white">
                  <CheckIcon className="h-7 w-7" aria-hidden="true" />
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-grey">
                  Your calendar app should now be subscribing to the UMHC events you selected. It will refresh when new events are published.
                </p>
                <p className="mt-3 text-sm leading-relaxed text-slate-grey">
                  To change your preferences, delete the UMHC calendar from your calendar app and subscribe again.
                </p>
                <button type="button" onClick={close} className="mt-5 w-full rounded-md bg-umhc-green px-4 py-2.5 text-sm font-semibold text-white hover:bg-stealth-green focus:outline-none focus:ring-2 focus:ring-umhc-green focus:ring-offset-2">
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}