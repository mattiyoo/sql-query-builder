'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { FieldSelectorProps } from 'react-querybuilder';
import { fields, getFieldsByCategory, type MixpanelField } from '@/commons/models/query-model';
import clsx from 'clsx';
import { ChevronDown, Search, Check } from 'lucide-react';

function FieldTypeIcon({ type }: { type: 'text' | 'number' | 'date' }) {
    const iconClasses = 'w-4 h-4 flex items-center justify-center text-xs font-medium';

    switch (type) {
        case 'text':
            return <span className={clsx(iconClasses, 'text-blue-600')}>Aa</span>;
        case 'number':
            return <span className={clsx(iconClasses, 'text-emerald-600')}>#</span>;
        case 'date':
            return <span className={clsx(iconClasses, 'text-amber-600')}>📅</span>;
    }
}

export function FieldSelector(props: FieldSelectorProps<MixpanelField>) {
    const { value, handleOnChange, options, disabled, className } = props;

    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const selectedField = fields.find(f => f.name === value);

    const fieldsByCategory = getFieldsByCategory();

    const filteredFields = searchTerm
        ? fields.filter(f =>
            f.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : null;

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleSelect = useCallback((fieldName: string) => {
        handleOnChange(fieldName);
        setIsOpen(false);
        setSearchTerm('');
    }, [handleOnChange]);

    return (
        <div ref={dropdownRef} className={clsx('relative', className)}>
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={clsx(
                    'flex items-center gap-2 px-3 py-1.5 rounded-lg border',
                    'text-sm font-medium min-w-[120px]',
                    'transition-all duration-150',
                    disabled
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                    isOpen && 'border-violet-500 ring-2 ring-violet-100'
                )}
            >
                {selectedField ? (
                    <>
                        <FieldTypeIcon type={selectedField.fieldType} />
                        <span className="text-gray-900">{selectedField.label}</span>
                    </>
                ) : (
                    <span className="text-gray-400">Select field...</span>
                )}
                <ChevronDown className={clsx(
                    'ml-auto w-4 h-4 text-gray-400 transition-transform',
                    isOpen && 'rotate-180'
                )} />
            </button>

            {isOpen && (
                <div className={clsx(
                    'absolute z-50 top-full left-0 mt-1',
                    'w-72 max-h-96 overflow-hidden',
                    'bg-white rounded-lg shadow-lg border border-gray-200',
                    'animate-in fade-in-0 zoom-in-95 duration-150'
                )}>
                    <div className="p-2 border-b border-gray-100">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={clsx(
                                    'w-full pl-9 pr-3 py-2 text-sm',
                                    'border border-gray-200 rounded-md',
                                    'focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500'
                                )}
                            />
                        </div>
                    </div>

                    <div className="overflow-y-auto max-h-72">
                        {filteredFields ? (
                            <div className="p-1">
                                {filteredFields.length === 0 ? (
                                    <div className="px-3 py-4 text-sm text-gray-500 text-center">
                                        No fields found
                                    </div>
                                ) : (
                                    filteredFields.map(field => (
                                        <FieldOption
                                            key={field.name}
                                            field={field}
                                            isSelected={field.name === value}
                                            onClick={() => handleSelect(field.name)}
                                        />
                                    ))
                                )}
                            </div>
                        ) : (
                            Object.entries(fieldsByCategory).map(([category, categoryFields]) => (
                                <div key={category} className="p-1">
                                    <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        {category}
                                    </div>
                                    {categoryFields.map(field => (
                                        <FieldOption
                                            key={field.name}
                                            field={field}
                                            isSelected={field.name === value}
                                            onClick={() => handleSelect(field.name)}
                                        />
                                    ))}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function FieldOption({
    field,
    isSelected,
    onClick,
}: {
    field: MixpanelField;
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
            <FieldTypeIcon type={field.fieldType} />
            <span>{field.label}</span>
            {isSelected && (
                <Check className="ml-auto w-4 h-4 text-violet-600" />
            )}
        </button>
    );
}
