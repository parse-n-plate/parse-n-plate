'use client';

import { toast } from 'sonner';
import { getErrorDetails, ERROR_CODES } from '@/utils/formatError';
import { ToastErrorDetails } from '@/components/ui/toast-error-details';

interface ShowErrorOptions {
  code?: string;
  message?: string;
  retry?: () => void;
}

/**
 * Custom hook for showing toast notifications
 * Provides consistent error handling with expandable details
 */
export function useToast() {
  const showError = (options: ShowErrorOptions) => {
    const { code = ERROR_CODES.ERR_UNKNOWN, message, retry } = options;
    const errorDetails = getErrorDetails(code);
    
    // Use provided message or fallback to user-friendly message
    const userMessage = message || errorDetails.userMessage;

    // Use JSX component for expandable details
    const description = (
      <ToastErrorDetails
        detailedExplanation={errorDetails.detailedExplanation}
        suggestions={errorDetails.suggestions}
      />
    );

    // Create the toast with JSX description
    return toast.error(userMessage, {
      description,
      duration: errorDetails.suggestions.length > 0 ? 10000 : 5000, // Longer duration when details are available
      classNames: {
        description: 'sonner-toast-description',
      },
      action: retry
        ? {
            label: 'Retry',
            onClick: retry,
          }
        : undefined,
    });
  };

  const showSuccess = (message: string, description?: string) => {
    return toast.success(message, {
      description,
      duration: 3000,
    });
  };

  const showWarning = (message: string, description?: string) => {
    return toast.warning(message, {
      description,
      duration: 4000,
    });
  };

  const showInfo = (message: string, description?: string) => {
    return toast.info(message, {
      description,
      duration: 4000,
    });
  };

  return {
    showError,
    showSuccess,
    showWarning,
    showInfo,
  };
}

