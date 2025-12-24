'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ToastErrorDetailsProps {
  detailedExplanation: string;
  suggestions: string[];
}

export function ToastErrorDetails({
  detailedExplanation,
  suggestions,
}: ToastErrorDetailsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // If no suggestions, just show the explanation
  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="toast-error-details-wrapper">
        <p className="toast-error-explanation">{detailedExplanation}</p>
      </div>
    );
  }

  return (
    <div className="toast-error-details-wrapper">
      {/* Always show the detailed explanation */}
      <p className="toast-error-explanation">{detailedExplanation}</p>

      {/* Expandable suggestions section */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsExpanded(!isExpanded);
        }}
        className="toast-error-toggle-btn"
        aria-expanded={isExpanded}
        aria-label={isExpanded ? 'Hide details' : 'Show details'}
      >
        {isExpanded ? (
          <>
            <ChevronUp size={14} />
            <span>Hide Details</span>
          </>
        ) : (
          <>
            <ChevronDown size={14} />
            <span>Show Details</span>
          </>
        )}
      </button>

      {/* Suggestions list - shown when expanded */}
      {isExpanded && (
        <div className="toast-error-suggestions">
          <ul className="toast-error-suggestions-list">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="toast-error-suggestion-item">
                <span className="toast-error-bullet">•</span>
                <span className="toast-error-suggestion-text">{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

