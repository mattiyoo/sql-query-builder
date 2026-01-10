'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import clsx from 'clsx';


export type CombinatorType = 'and' | 'or';

interface CombinatorSelectorProps {
  value: CombinatorType;
  onChange: (combinator: CombinatorType) => void;
  isToggle?: boolean;
}

export function CombinatorSelector({ value, onChange, isToggle = false }: CombinatorSelectorProps) {
  if (isToggle) {
    return <CombinatorSelectorToggle value={value} onChange={onChange} />;
  }
  return <CombinatorSelectorDropdown value={value} onChange={onChange} />;
}

export function CombinatorSelectorToggle({ value, onChange }: CombinatorSelectorProps) {
  const handleToggle = () => {
    onChange(value === 'and' ? 'or' : 'and');
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={clsx(
        'inline-flex items-center justify-center px-3 py-1 rounded-sm cursor-pointer',
        'text-xs font-semibold uppercase tracking-wide transition-all duration-150',
        'bg-violet-600 text-white hover:bg-violet-700',
      )}
    >
      <span>{value === 'and' ? 'AND' : 'OR'}</span>
    </button>
  );
}

function CombinatorSelectorDropdown({ value, onChange }: CombinatorSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const combinators: Array<{ value: CombinatorType; label: string }> = [
    { value: 'and', label: 'AND' },
    { value: 'or', label: 'OR' },
  ];

  const selectedCombinator = useMemo(() => {
    return combinators.find(c => c.value === value) || combinators[0];
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm',
          'text-xs font-semibold uppercase tracking-wide transition-all duration-150',
          'bg-violet-100 text-violet-700 hover:bg-violet-200'
        )}
      >
        <span>{selectedCombinator.label}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 z-9999 overflow-hidden">
          <div className="p-1">
            {combinators.map((combinator) => (
              <button
                key={combinator.value}
                type="button"
                onClick={() => {
                  onChange(combinator.value);
                  setIsOpen(false);
                }}
                className={clsx(
                  'w-full flex items-center gap-2 px-3 py-2 rounded-md text-left',
                  'text-xs font-semibold uppercase tracking-wide transition-colors',
                  combinator.value === value
                    ? 'bg-violet-50 text-violet-900'
                    : 'text-gray-700 hover:bg-gray-50'
                )}
              >
                <span>{combinator.label}</span>
                {combinator.value === value && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-violet-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
