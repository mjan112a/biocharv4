'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has seen the modal before
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = (dontShowAgain: boolean = false) => {
    if (dontShowAgain) {
      localStorage.setItem('hasSeenWelcome', 'true');
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-hidden">
        {/* Full Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/modal-background.jpg"
            alt="Modal Background"
            fill
            className="object-cover rounded-2xl"
          />
          {/* No overlay - pure background visibility */}
        </div>

        {/* Content Container - Reduced padding */}
        <div className="relative p-6 space-y-4">
          {/* Close Button */}
          <button
            onClick={() => handleClose(false)}
            className="absolute top-3 right-3 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors z-10"
          >
            <X size={24} />
          </button>

          {/* Header Text - White on background */}
          <div className="mb-3">
            <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
              Welcome to the Biochar Circularity Tool
            </h2>
            <p className="text-white text-lg drop-shadow-md">
              Explore how poultry waste transforms into valuable biochar
            </p>
          </div>

          {/* Semi-Transparent Content Box with Backdrop Blur - Ultra transparent */}
          <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 space-y-5 border border-white/10">
            {/* Quick Tour Title */}
            <h3 className="text-2xl font-bold text-white mb-4 drop-shadow-lg">
              🚀 Quick Tour - 2 Ways to Explore
            </h3>
            
            {/* Step 1 */}
            <div className="flex gap-4 items-start bg-blue-500/10 backdrop-blur-sm p-4 rounded-lg border border-blue-300/10">
              <div className="flex-shrink-0 w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-base">
                1
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2 text-lg">
                  Toggle Between Systems
                </h4>
                <p className="text-base text-white/90">
                  Use the <strong>Current Practice / Proposed System</strong> switch at the top to compare the linear waste disposal approach vs. the circular biochar economy.
                </p>
              </div>
            </div>

            {/* Step 2 (was Step 3) */}
            <div className="flex gap-4 items-start bg-purple-500/10 backdrop-blur-sm p-4 rounded-lg border border-purple-300/10">
              <div className="flex-shrink-0 w-9 h-9 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-base">
                2
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2 text-lg">
                  Explore Components
                </h4>
                <p className="text-base text-white/90">
                  Click any <strong>component box</strong> in the diagram to view detailed inputs, outputs, and benefits for that part of the system.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => handleClose(true)}
                className="flex-1 bg-green-600 text-white py-2.5 px-5 rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm"
              >
                Got it! Don&apos;t show again
              </button>
              <button
                onClick={() => handleClose(false)}
                className="px-5 py-2.5 bg-white/20 backdrop-blur-sm border-2 border-white/40 text-white rounded-lg font-semibold hover:bg-white/30 transition-colors text-sm"
              >
                Remind me later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
