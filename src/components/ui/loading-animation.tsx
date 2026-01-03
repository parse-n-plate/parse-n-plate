'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { CUISINE_ICON_MAP } from '@/config/cuisineConfig';

interface LoadingAnimationProps {
  isVisible: boolean;
  cuisine?: string[];
}

type StepStatus = 'pending' | 'in_progress' | 'completed';

interface LoadingStep {
  title: string;
  subtitle: string;
  icon: string;
  status: StepStatus;
}

export default function LoadingAnimation({ isVisible, cuisine }: LoadingAnimationProps) {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [hasCuisine, setHasCuisine] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Define the 3 steps
  const initialSteps: LoadingStep[] = [
    {
      title: 'Gathering Resources',
      subtitle: 'Collecting ingredients and preparing workspace',
      icon: '/assets/Illustration Icons/Tomato_Icon.png',
      status: 'in_progress',
    },
    {
      title: 'Reading the Recipe',
      subtitle: 'Analyzing instructions and cooking times',
      icon: '/assets/Illustration Icons/Pan_Icon.png',
      status: 'pending',
    },
    {
      title: 'Plating',
      subtitle: 'Final touches and presentation',
      icon: '/assets/cusineIcons/Mexican_Icon.png', // Placeholder (Taco)
      status: 'pending',
    },
  ];

  const [steps, setSteps] = useState<LoadingStep[]>(initialSteps);

  // Manage step transitions and progress bar
  useEffect(() => {
    if (!isVisible) {
      // Reset when not visible
      setCurrentStepIdx(0);
      setProgress(0);
      setSteps(initialSteps);
      setHasCuisine(false);
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    // Auto-progress logic for Step 1 and 2
    const startSequence = async () => {
      // Step 1 is already in_progress
      setProgress(15);

      // Move to Step 2 after 2.5s if still loading
      timerRef.current = setTimeout(() => {
        setCurrentStepIdx(1);
        setProgress(45);
        setSteps(prev => prev.map((s, i) => {
          if (i === 0) return { ...s, status: 'completed' };
          if (i === 1) return { ...s, status: 'in_progress' };
          return s;
        }));
      }, 2500);
    };

    startSequence();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isVisible]);

  // Reactive logic for when cuisine is detected (Parsing Complete)
  useEffect(() => {
    if (isVisible && cuisine && cuisine.length > 0 && !hasCuisine) {
      setHasCuisine(true);
      if (timerRef.current) clearTimeout(timerRef.current);

      // Fast forward to Step 3 with reveal
      setCurrentStepIdx(2);
      setProgress(100);
      setSteps(prev => prev.map((s, i) => {
        if (i === 0 || i === 1) return { ...s, status: 'completed' };
        if (i === 2) {
          const cuisineIcon = CUISINE_ICON_MAP[cuisine[0]] || s.icon;
          return { ...s, icon: cuisineIcon, status: 'completed' };
        }
        return s;
      }));
    }
  }, [cuisine, isVisible, hasCuisine]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-[#FFF] z-[9999] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center space-y-3"
        >
          <h1 className="font-domine text-[32px] md:text-[40px] text-[#0C0A09] font-bold tracking-tight">
            Recipe in Progress
          </h1>
          <p className="font-albert text-[16px] md:text-[18px] text-stone-500 font-medium">
            Follow along as we prepare your request
          </p>
        </motion.div>

        {/* Step Card Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="loading-step-card space-y-2"
        >
          {steps.map((step, idx) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: -10 }}
              animate={{ 
                opacity: step.status === 'pending' ? 0.3 : 1,
                x: 0 
              }}
              transition={{ delay: 0.6 + (idx * 0.15), duration: 0.5 }}
              className="step-row"
            >
              <div className="step-icon-container">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step.icon}
                    initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 0.8, opacity: 0, rotate: 10 }}
                    transition={{ duration: 0.4, ease: "backOut" }}
                    className="relative w-10 h-10"
                  >
                    <Image
                      src={step.icon}
                      alt={step.title}
                      fill
                      className="object-contain"
                      priority
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="step-text">
                <span className={`step-title font-albert ${step.status === 'in_progress' || step.status === 'completed' ? 'text-black font-semibold' : 'text-stone-500'}`}>
                  {step.title}
                </span>
                <span className="step-subtitle font-albert text-stone-400">
                  {step.subtitle}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Progress Bar Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="space-y-4"
        >
          <div className="flex justify-between items-end">
            <span className="font-albert text-[14px] text-stone-500 font-semibold tracking-wide uppercase">
              Progress
            </span>
            <span className="font-albert text-[14px] text-stone-500 font-medium tabular-nums">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="loading-progress-container">
            <motion.div 
              className="loading-progress-bar"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "circOut" }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
