'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useCommandK } from '@/contexts/CommandKContext';
import CommandKHomeSearch from './command-k-home-search';
import CommandKRecipeSearch from './command-k-recipe-search';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * CommandKModal Component
 * 
 * Main modal container for the Command K search interface.
 * Context-aware: shows different interfaces based on current page.
 */
export default function CommandKModal() {
  const { isOpen, close } = useCommandK();
  const pathname = usePathname();
  const modalRef = useRef<HTMLDivElement>(null);

  // Determine if we're on a recipe page
  const isRecipePage = pathname === '/parsed-recipe-page';

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        close();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isOpen, close]);

  // Close on ESC key (handled by useCommandK hook, but ensure it works)
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        close();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, close]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            onClick={close}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[101] flex items-start justify-center pt-[10vh] px-4 pointer-events-none md:pt-[10vh] pt-[5vh]">
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="w-full max-w-2xl bg-white rounded-xl md:rounded-xl rounded-t-xl shadow-2xl border border-[#d9d9d9] pointer-events-auto max-h-[85vh] md:max-h-[80vh] overflow-hidden flex flex-col"
            >
              {/* Render appropriate search interface based on context */}
              {isRecipePage ? (
                <CommandKRecipeSearch onClose={close} />
              ) : (
                <CommandKHomeSearch onClose={close} />
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

