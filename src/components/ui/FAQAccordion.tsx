import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
}

export default function FAQAccordion({ items }: FAQAccordionProps) {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const toggle = (index: number) => {
    setOpenItems(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <div className="faq-accordion">
      {items.map((item, index) => {
        const isOpen = openItems.has(index);
        const answerId = `faq-answer-${index}`;
        return (
          <div key={index} className={`faq-item${isOpen ? ' is-open' : ''}`}>
            <button
              className="faq-question"
              onClick={() => toggle(index)}
              aria-expanded={isOpen}
              aria-controls={answerId}
            >
              <span>{item.question}</span>
              <ChevronDown className="faq-chevron" size={16} aria-hidden="true" />
            </button>
            <div
              id={answerId}
              className="faq-answer"
              role="region"
              aria-hidden={!isOpen}
            >
              <div className="faq-answer-inner">
                <p>{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
