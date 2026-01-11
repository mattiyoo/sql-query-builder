'use client';

import { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { ChevronDown, Type } from 'lucide-react';

interface DataTypeSelectorProps {
    detectedType: 'text' | 'number' | 'date' | 'boolean';
    overrideType?: 'text' | 'number' | 'date' | 'boolean';
    onTypeChange: (type: 'text' | 'number' | 'date' | 'boolean' | undefined) => void;
}

const TYPE_OPTIONS = [
    { value: undefined, label: 'Auto', icon: '🔄' },
    { value: 'text' as const, label: 'Text', icon: '📝' },
    { value: 'number' as const, label: 'Number', icon: '🔢' },
    { value: 'date' as const, label: 'Date', icon: '📅' },
    { value: 'boolean' as const, label: 'Boolean', icon: '✓/✗' },
];

export function DataTypeSelector({ detectedType, overrideType, onTypeChange }: DataTypeSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const effectiveType = overrideType || detectedType;
    const isOverridden = overrideType !== undefined;

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

    const getTypeLabel = (type: string) => {
        return type.charAt(0).toUpperCase() + type.slice(1);
    };

    return (
        <div ref={dropdownRef} className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={clsx(
                    'w-6 h-6 flex items-center justify-center rounded',
                    'transition-colors',
                    isOverridden
                        ? 'text-violet-600 hover:text-violet-700 hover:bg-violet-50'
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                )}
                aria-label="Change data type"
                title={isOverridden ? `Type: ${getTypeLabel(effectiveType)} (Override)` : `Type: ${getTypeLabel(effectiveType)} (Auto)`}
            >
                <Type className="w-4 h-4" />
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-9999 overflow-hidden">
                    <div className="p-1">
                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                            Data Type
                        </div>
                        {TYPE_OPTIONS.map((option) => {
                            const isSelected = option.value === overrideType;
                            const isAuto = option.value === undefined;
                            const isCurrent = (isAuto && !isOverridden) || (option.value === effectiveType);

                            return (
                                <button
                                    key={option.label}
                                    type="button"
                                    onClick={() => {
                                        onTypeChange(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={clsx(
                                        'w-full flex items-center gap-2 px-3 py-2 rounded-md text-left',
                                        'text-sm transition-colors',
                                        isCurrent
                                            ? 'bg-violet-50 text-violet-900'
                                            : 'text-gray-700 hover:bg-gray-50'
                                    )}
                                >
                                    <span className="text-base">{option.icon}</span>
                                    <span className="flex-1">
                                        {option.label}
                                        {isAuto && (
                                            <span className="text-xs text-gray-500 ml-1">
                                                ({getTypeLabel(detectedType)})
                                            </span>
                                        )}
                                    </span>
                                    {isCurrent && (
                                        <div className="w-2 h-2 rounded-full bg-violet-600" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
