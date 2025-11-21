'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const TITLE_OPTIONS = [
  'Poultry BioLoop',
  'Poultry Circular Economy System',
  'The Phoenix Loop',
  'ChickenCycle™',
  'Circular Poultry Resource System',
  'Poultry Circle System™',
  'Carbon Harvest System',
  'Waste-to-Worth Poultry Platform',
  'Circular Poultry Biochar System',
  'Regenerative Poultry Circular System',
];

export function TitleDropdown() {
  const [selectedTitle, setSelectedTitle] = useState(TITLE_OPTIONS[0]);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Current Title */}
      <button
        className="flex items-center gap-2 text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedTitle}</span>
        <ChevronDown 
          size={20} 
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-80 bg-white border-2 border-blue-400 rounded-lg shadow-2xl z-50 animate-fade-in">
          <div className="py-2">
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 border-b border-gray-200">
              Choose a title:
            </div>
            {TITLE_OPTIONS.map((title, index) => (
              <button
                key={index}
                onClick={() => {
                  setSelectedTitle(title);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                  title === selectedTitle
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {title}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
