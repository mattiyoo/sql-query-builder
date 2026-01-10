'use client';

import { useState, useRef, useEffect } from 'react';
import type { OperatorSelectorProps } from 'react-querybuilder';
import clsx from 'clsx';
import { ChevronDown, Check } from 'lucide-react';
import { Option } from '@/commons/models/option.model'

export function OperatorSelector(props: OperatorSelectorProps) {
    const { value, handleOnChange, options, disabled, className } = props;

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => {
        if ('name' in opt) {
            return opt.name === value;
        }
        return false;
    });

    const selectedLabel = selectedOption && 'label' in selectedOption
        ? selectedOption.label
        : value;

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={dropdownRef} className={clsx('relative', className)}>
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={clsx(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border',
                    'text-sm font-medium min-w-[100px]',
                    'transition-all duration-150',
                    disabled
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                    isOpen && 'border-violet-500 ring-2 ring-violet-100'
                )}
            >
                <span className="text-gray-700">{selectedLabel}</span>
                <ChevronDown
                    className={clsx(
                        'ml-auto w-3.5 h-3.5 text-gray-400 transition-transform',
                        isOpen && 'rotate-180'
                    )}
                />
            </button>

            {isOpen && (
                <div className={clsx(
                    'absolute z-50 top-full left-0 mt-1',
                    'w-48 overflow-hidden',
                    'bg-white rounded-lg shadow-lg border border-gray-200',
                    'animate-in fade-in-0 zoom-in-95 duration-150'
                )}>
                    <div className="p-1 max-h-64 overflow-y-auto">
                        {options.map((option: any, index) => {
                            if ('options' in option) {
                                return (
                                    <div key={`group-${index}`} className="py-1">
                                        <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase">
                                            {option.label}
                                        </div>
                                        {option.options.map((subOption: Option) => (
                                            <OperatorOption
                                                key={subOption.name}
                                                name={subOption.name}
                                                label={subOption.label}
                                                isSelected={subOption.name === value}
                                                onClick={() => {
                                                    handleOnChange(subOption.name);
                                                    setIsOpen(false);
                                                }}
                                            />
                                        ))}
                                    </div>
                                );
                            }

                            return (
                                <OperatorOption
                                    key={option.name}
                                    name={option.name}
                                    label={option.label}
                                    isSelected={option.name === value}
                                    onClick={() => {
                                        handleOnChange(option.name);
                                        setIsOpen(false);
                                    }}
                                />
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

function OperatorOption({
    name,
    label,
    isSelected,
    onClick,
}: {
    name: string;
    label: string;
    isSelected: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={clsx(
                'w-full flex items-center gap-2 px-3 py-2 rounded-md text-left',
                'text-sm transition-colors',
                isSelected
                    ? 'bg-violet-50 text-violet-900'
                    : 'text-gray-700 hover:bg-gray-50'
            )}
        >
            <span>{label}</span>
            {isSelected && (
                <Check className="ml-auto w-4 h-4 text-violet-600" />
            )}
        </button>
    );
}
