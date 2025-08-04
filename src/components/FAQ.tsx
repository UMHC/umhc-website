'use client';

import { useState, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import ContentRenderer from './ContentRenderer';

// Import types from ContentRenderer to avoid duplication
interface TextContent {
  type: 'text';
  text: string;
}

interface ListContent {
  type: 'list';
  items: (string | ContentBlock[])[];
}

interface LinkContent {
  type: 'link';
  text: string;
  href: string;
}

type ContentBlock = TextContent | ListContent | LinkContent;

interface StructuredAnswer {
  type: 'structured';
  content: ContentBlock[];
}

interface FAQItem {
  id: number;
  question: string;
  answer: StructuredAnswer | string; // Support both old and new format
}

interface FAQData {
  faqs: FAQItem[];
}

export default function FAQ() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [openItem, setOpenItem] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const response = await fetch('/faq.json');
        const data: FAQData = await response.json();
        setFaqs(data.faqs);
      } catch {
        // Silently handle error
      } finally {
        setLoading(false);
      }
    };

    fetchFAQs();
  }, []);

  const toggleItem = (id: number) => {
    setOpenItem(openItem === id ? null : id);
  };

  const handleKeyDown = (event: React.KeyboardEvent, id: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleItem(id);
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-cream-white" aria-labelledby="faq-heading">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-slate-grey font-sans">Loading FAQs...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-1 pb-16 bg-cream-white" aria-labelledby="faq-heading">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center space-y-2 mb-4 sm:mb-6">
          <h2 id="faqs" className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-deep-black leading-tight font-sans px-2 scroll-mt-20">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto px-2">
            <p className="text-xs sm:text-sm md:text-base text-deep-black font-medium font-sans leading-relaxed">
              Got questions about joining UMHC? Here are the answers to our most common enquiries.
            </p>
          </div>
        </header>

        <div className="max-w-4xl mx-auto border border-slate-grey/20 rounded-lg bg-whellow shadow-sm overflow-hidden">
          {faqs.map((faq, index) => {
            const isOpen = openItem === faq.id;
            const isLast = index === faqs.length - 1;
            return (
              <div
                key={faq.id}
                className={`${!isLast ? 'border-b border-slate-grey/20' : ''}`}
              >
                <button
                  onClick={() => toggleItem(faq.id)}
                  onKeyDown={(e) => handleKeyDown(e, faq.id)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${faq.id}`}
                  className="w-full px-6 py-4 text-left focus:outline-none hover:bg-slate-grey/5 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm sm:text-base md:text-lg font-semibold text-deep-black font-sans pr-4">
                      {faq.question}
                    </h3>
                    <div className="flex-shrink-0">
                      {isOpen ? (
                        <ChevronUpIcon 
                          className="h-5 w-5 text-umhc-green transition-transform duration-200"
                          aria-hidden="true"
                        />
                      ) : (
                        <ChevronDownIcon 
                          className="h-5 w-5 text-umhc-green transition-transform duration-200"
                          aria-hidden="true"
                        />
                      )}
                    </div>
                  </div>
                </button>
                
                <div
                  id={`faq-answer-${faq.id}`}
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                  aria-hidden={!isOpen}
                >
                  <div className="px-6 pb-4">
                    {typeof faq.answer === 'string' ? (
                      <p className="text-xs sm:text-sm md:text-base text-slate-grey font-sans leading-relaxed">
                        {faq.answer}
                      </p>
                    ) : (
                      <ContentRenderer answer={faq.answer} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}