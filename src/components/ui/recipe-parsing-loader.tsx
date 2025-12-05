'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Progress } from './progress';
import { Loader2, Search, ChefHat, FileText, Sparkles } from 'lucide-react';

interface RecipeParsingLoaderProps {
  isVisible: boolean;
}

// Define the parsing steps with their icons and descriptions
// Note: These are shown in order but progress is based on actual elapsed time, not preset durations
const parsingSteps = [
  {
    id: 'validating',
    label: 'Validating recipe URL',
    icon: Search,
    description: 'Checking if this is a valid recipe page',
  },
  {
    id: 'fetching',
    label: 'Fetching recipe content',
    icon: FileText,
    description: 'Downloading the recipe page',
  },
  {
    id: 'parsing',
    label: 'Parsing ingredients & instructions',
    icon: ChefHat,
    description: 'Extracting recipe details',
  },
  {
    id: 'finalizing',
    label: 'Finalizing your recipe',
    icon: Sparkles,
    description: 'Preparing everything for you',
  },
] as const;

export default function RecipeParsingLoader({ isVisible }: RecipeParsingLoaderProps) {
  // Track elapsed time
  const [elapsedTime, setElapsedTime] = useState(0);
  // Track current step index
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  // Track when loading started
  const startTimeRef = useRef<number | null>(null);
  // Interval ref for cleanup
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Reset state when visibility changes
  useEffect(() => {
    if (isVisible) {
      // Start tracking time when loading begins
      startTimeRef.current = Date.now();
      setElapsedTime(0);
      setCurrentStepIndex(0);

      // Update elapsed time every 100ms for smooth progress
      intervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const elapsed = Date.now() - startTimeRef.current;
          setElapsedTime(elapsed);

          // Update current step based on elapsed time
          // Steps transition dynamically based on actual elapsed time:
          // - First 3 seconds: Validating
          // - 3-8 seconds: Fetching
          // - 8+ seconds: Parsing (most time-consuming step)
          // - Final step shown when approaching completion
          const elapsedSeconds = elapsed / 1000;
          
          if (elapsedSeconds < 3) {
            setCurrentStepIndex(0); // Validating
          } else if (elapsedSeconds < 8) {
            setCurrentStepIndex(1); // Fetching
          } else if (elapsedSeconds < 30) {
            setCurrentStepIndex(2); // Parsing (can take a while)
          } else {
            setCurrentStepIndex(3); // Finalizing (shown for longer waits)
          }
        }
      }, 100);
    } else {
      // Clean up when loading stops
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      startTimeRef.current = null;
    }

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isVisible]);

  // Don't render if not visible
  if (!isVisible) return null;

  // Calculate progress percentage using an adaptive curve
  // This provides realistic progress that slows down over time since we don't know the actual duration
  // Formula: Progress = 100 * (1 - e^(-elapsedTime / scale))
  // This creates a logarithmic curve that approaches but never reaches 100%
  const elapsedSeconds = elapsedTime / 1000;
  
  // Adaptive progress calculation:
  // - Fast initial progress (0-10s): Shows quick movement
  // - Slows down over time (10-30s): More realistic for longer operations
  // - Capped at 95% until actual completion
  const scale = 15; // Controls how fast progress fills (lower = faster initial progress)
  const progressPercentage = Math.min(
    100 * (1 - Math.exp(-elapsedSeconds / scale)),
    95 // Cap at 95% until actual completion
  );

  // Get current step
  const currentStep = parsingSteps[currentStepIndex];
  const CurrentIcon = currentStep.icon;

  // Format elapsed time for display
  const formatTime = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div
      className="fixed inset-x-0 top-0 bottom-0 bg-[#fbf7f2]/95 backdrop-blur-sm z-50 flex items-center justify-center"
      style={{ marginTop: '72px' }}
      role="status"
      aria-live="polite"
      aria-label="Parsing recipe"
    >
      <Card className="w-full max-w-md mx-4 shadow-lg border-[#d9d9d9]">
        <CardHeader className="text-center pb-4">
          {/* Animated spinner icon */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Loader2 className="w-12 h-12 text-[#1e1e1e] animate-spin" />
              {/* Pulsing ring effect around spinner */}
              <div className="absolute inset-0 rounded-full border-2 border-[#1e1e1e]/20 animate-ping" />
            </div>
          </div>

          <CardTitle className="font-domine text-xl text-[#1e1e1e] mb-2">
            Parsing Your Recipe
          </CardTitle>
          <CardDescription className="font-albert text-sm text-[#757575]">
            {currentStep.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress
              value={progressPercentage}
              className="h-2.5 bg-[#e5e5e5]"
            />
            <div className="flex justify-between items-center text-xs font-albert">
              <span className="text-[#757575]">
                {Math.round(progressPercentage)}% complete
              </span>
              <span className="text-[#757575]">
                {formatTime(elapsedTime)} elapsed
              </span>
            </div>
          </div>

          {/* Current Step Indicator */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-[#fbf7f2] rounded-lg border border-[#e5e5e5]">
              {/* Step icon */}
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-[#1e1e1e] flex items-center justify-center">
                  <CurrentIcon className="w-5 h-5 text-white" />
                </div>
              </div>
              {/* Step text */}
              <div className="flex-1 min-w-0">
                <p className="font-albert font-medium text-sm text-[#1e1e1e]">
                  {currentStep.label}
                </p>
                <p className="font-albert text-xs text-[#757575] mt-0.5">
                  {currentStep.description}
                </p>
              </div>
            </div>

            {/* All steps indicator (shows progress through all steps) */}
            <div className="space-y-2">
              <p className="font-albert text-xs text-[#757575] mb-2">
                Progress:
              </p>
              <div className="space-y-1.5">
                {parsingSteps.map((step, index) => {
                  const StepIcon = step.icon;
                  const isCompleted = index < currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  const isPending = index > currentStepIndex;

                  return (
                    <div
                      key={step.id}
                      className={`flex items-center gap-2 text-xs font-albert transition-all duration-300 ${
                        isCompleted
                          ? 'text-[#1e1e1e]'
                          : isCurrent
                            ? 'text-[#1e1e1e] font-medium'
                            : 'text-[#999]'
                      }`}
                    >
                      {/* Step status indicator */}
                      <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                        {isCompleted ? (
                          <div className="w-5 h-5 rounded-full bg-[#1e1e1e] flex items-center justify-center">
                            <svg
                              className="w-3 h-3 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        ) : isCurrent ? (
                          <div className="w-5 h-5 rounded-full bg-[#1e1e1e] flex items-center justify-center">
                            <Loader2 className="w-3 h-3 text-white animate-spin" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-[#d9d9d9]" />
                        )}
                      </div>
                      {/* Step label */}
                      <span className="truncate">{step.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Helpful tip */}
          <div className="pt-2 border-t border-[#e5e5e5]">
            <p className="font-albert text-xs text-[#757575] text-center">
              💡 This usually takes 10-30 seconds depending on the recipe complexity
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

