'use client';

import { useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import NavbarSearch from './navbar-search';

interface MobileSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileSearchDialog({
  isOpen,
  onClose,
}: MobileSearchDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when dialog is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Close on outside click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        className="fixed inset-x-0 top-0 bg-white z-50 shadow-lg animate-in slide-in-from-top duration-200 max-h-screen overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-search-title"
      >
        <div className="sticky top-0 bg-white p-4 border-b border-stone-200 flex items-center justify-between z-10">
          <h2 id="mobile-search-title" className="font-albert font-medium text-[16px] text-stone-900">
            Search Recipes
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-100 rounded-full transition-colors"
            aria-label="Close search dialog"
          >
            <X className="w-5 h-5 text-stone-600" />
          </button>
        </div>

        <div className="p-4 relative">
          <NavbarSearch />
        </div>
      </div>
    </>
  );
}

