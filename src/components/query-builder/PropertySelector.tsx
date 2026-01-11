'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import clsx from 'clsx';
import type { FilterField } from '@/commons/models/filter.model';
import { getDynamicFields } from '@/commons/models/filter.model';
import { PropertySelectorDropdown } from './PropertySelectorDropdown';
import type { TableSchema } from '@/commons/models/database.model';

interface PropertySelectorProps {
  value: FilterField;
  onChange: (property: FilterField) => void;
  disabled?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  autoCloseOnSelect?: boolean;
  schema?: TableSchema;
}

export function PropertySelector({
  value,
  onChange,
  disabled,
  isOpen: controlledIsOpen,
  onClose,
  autoCloseOnSelect = true,
  schema,
}: PropertySelectorProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = (open: boolean) => {
    if (controlledIsOpen === undefined) {
      setInternalIsOpen(open);
    } else if (!open && onClose) {
      onClose();
    }
  };

  const availableFields = useMemo(() => {
    return getDynamicFields(schema);
  }, [schema]);

  const selectedField = useMemo(() => {
    return availableFields.find(f => f.value === value) || availableFields[0];
  }, [value, availableFields]);

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
  }, [isOpen, setIsOpen]);

  const handleSelect = useCallback(
    (field: FilterField) => {
      onChange(field);
      if (autoCloseOnSelect) {
        setIsOpen(false);
      }
    },
    [onChange, autoCloseOnSelect]
  );

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={clsx(
          'inline-flex items-center gap-2 px-3 py-1.5 rounded-sm cursor-pointer',
          'text-sm font-semibold transition-all duration-150',
          'bg-gray-100 text-gray-900 hover:text-violet-700 hover:bg-violet-200',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        {selectedField.label}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-9999">
          <PropertySelectorDropdown
            selectedValue={value}
            onPropertySelect={handleSelect}
            isOpen={true}
            initialCategory="All"
            autoFocus={true}
            schema={schema}
          />
        </div>
      )}
    </div>
  );
}
