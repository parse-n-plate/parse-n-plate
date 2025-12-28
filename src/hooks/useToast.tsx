'use client';

import { toast } from 'sonner';
import { getErrorDetails, ERROR_CODES } from '@/utils/formatError';

interface ShowErrorOptions {
  code?: string;
  message?: string;
  retry?: () => void;
}

/**
 * Custom hook for showing toast notifications
 * Provides consistent error handling
 */
export function useToast() {
  const showError = (options: ShowErrorOptions) => {
    const { code = ERROR_CODES.ERR_UNKNOWN, message, retry } = options;
    const errorDetails = getErrorDetails(code);
    
    // Use provided message or fallback to user-friendly message
    const userMessage = message || errorDetails.userMessage;
    // Use detailed explanation as description
    const description = errorDetails.detailedExplanation;

    // Create the toast with title and description
    return toast.error(userMessage, {
      description,
      duration: 5000,
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
      description: description || 'Operation completed successfully',
      duration: 3000,
    });
  };

  const showWarning = (message: string, description?: string) => {
    return toast.warning(message, {
      description: description || 'Please review this warning',
      duration: 4000,
    });
  };

  const showInfo = (messageOrOptions: string | ShowErrorOptions, description?: string) => {
    // Support both string message and options object (like showError)
    if (typeof messageOrOptions === 'string') {
      return toast.info(messageOrOptions, {
        description: description || 'Additional information',
        duration: 4000,
      });
    }
    
    // Handle options object (for error codes like ERR_NOT_A_URL)
    const { code = ERROR_CODES.ERR_UNKNOWN, message } = messageOrOptions;
    const errorDetails = getErrorDetails(code);
    const userMessage = message || errorDetails.userMessage;
    // Use detailed explanation as description
    const descriptionText = errorDetails.detailedExplanation;
    
    return toast.info(userMessage, {
      description: descriptionText,
      duration: 5000,
    });
  };

  return {
    showError,
    showSuccess,
    showWarning,
    showInfo,
  };
}

