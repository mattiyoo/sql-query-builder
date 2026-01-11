'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import clsx from 'clsx';
import { Search, Check, Clock, Zap, MoreVertical } from 'lucide-react';
import type { FilterField, FilterFieldMeta } from '@/commons/models/filter.model';
import { getDynamicFields, getDynamicFieldMeta } from '@/commons/models/filter.model';
import { users } from '@/lib/dummy-data';
import type { TableSchema } from '@/commons/models/database.model';

interface PropertySelectorDropdownProps {
  selectedValue?: FilterField;
  onPropertySelect: (property: FilterField) => void;
  isOpen?: boolean;
  initialCategory?: 'All' | 'User';
  autoFocus?: boolean;
  schema?: TableSchema;
}

export function PropertySelectorDropdown({
  selectedValue,
  onPropertySelect,
  isOpen = true,
  initialCategory = 'All',
  autoFocus = false,
  schema,
}: PropertySelectorDropdownProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'User'>(initialCategory);
  const [hoveredProperty, setHoveredProperty] = useState<FilterField | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const allFields = useMemo(() => {
    return getDynamicFields(schema).filter(f => f.value !== 'all');
  }, [schema]);

  const categories = useMemo(() => {
    const uniqueCategories = new Set(allFields.map(f => f.category));
    return [
      { value: 'All' as const, label: 'All', icon: 'Aa' },
      ...Array.from(uniqueCategories).map(cat => ({
        value: cat as 'All' | 'User',
        label: cat,
        icon: cat === 'User' ? '👤' : cat === 'Numeric' ? '🔢' : cat === 'Date' ? '📅' : 'Aa',
      })),
    ];
  }, [allFields]);

  const fieldsByCategory = useMemo(() => {
    if (selectedCategory === 'All') {
      return allFields;
    }
    return allFields.filter(f => f.category === selectedCategory);
  }, [selectedCategory, allFields]);

  const filteredFields = searchTerm
    ? fieldsByCategory.filter(f =>
      f.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.value.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : null;

  const displayFields = filteredFields || fieldsByCategory;

  const detailProperty = hoveredProperty || selectedValue || allFields[0]?.value || 'name';
  const detailField = useMemo(() => {
    return getDynamicFieldMeta(detailProperty, schema);
  }, [detailProperty, schema]);

  const exampleValue = useMemo(() => {
    if (!detailField || !users.length) return null;
    const firstUser = users[0];
    const fieldValue = firstUser[detailField.value as keyof typeof firstUser];
    return fieldValue ? String(fieldValue) : null;
  }, [detailField]);

  const groupedFields = useMemo(() => {
    if (filteredFields) return null;

    const groups: Record<string, FilterFieldMeta[]> = {};
    displayFields.forEach(field => {
      if (!groups[field.category]) {
        groups[field.category] = [];
      }
      groups[field.category].push(field);
    });
    return groups;
  }, [displayFields, filteredFields]);

  const handleSelect = (field: FilterField) => {
    if (field === 'all') return;
    onPropertySelect(field);
  };

  useEffect(() => {
    if (autoFocus && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    if (searchTerm) {
      setHoveredProperty(null);
    }
  }, [searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="w-[800px] bg-white rounded-lg shadow-lg border border-gray-200 z-9999 overflow-hidden">
      <div className="p-3 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            ref={searchInputRef}
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

      <div className="flex max-h-96 overflow-hidden">
        <div className="w-48 border-r border-gray-100 overflow-y-auto bg-gray-50">
          {categories.map((category) => (
            <button
              key={category.value}
              type="button"
              onClick={() => {
                setSelectedCategory(category.value);
                setSearchTerm('');
                setHoveredProperty(null);
              }}
              className={clsx(
                'w-full flex items-center gap-2 px-3 py-2.5 text-left',
                'text-sm transition-colors',
                selectedCategory === category.value
                  ? 'bg-violet-100 text-violet-900 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              <span className="text-xs font-medium w-6">{category.icon}</span>
              <span>{category.label}</span>
              {selectedCategory === category.value && (
                <Check className="ml-auto w-4 h-4 text-violet-600" />
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto min-w-0">
          {filteredFields ? (
            <div className="p-2">
              {filteredFields.length === 0 ? (
                <div className="px-3 py-4 text-sm text-gray-500 text-center">
                  No properties found
                </div>
              ) : (
                <>
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 mb-1">
                    Results
                  </div>
                  {filteredFields.map((field) => (
                    <PropertyOption
                      key={field.value}
                      field={field}
                      isSelected={field.value === selectedValue}
                      isHovered={field.value === hoveredProperty}
                      onClick={() => handleSelect(field.value)}
                      onMouseEnter={() => setHoveredProperty(field.value)}
                    />
                  ))}
                </>
              )}
            </div>
          ) : groupedFields ? (
            Object.entries(groupedFields).map(([category, fields]) => (
              <div key={category} className="p-2">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 mb-1">
                  {category === 'All' ? 'All Properties' : `${category} Properties`}
                </div>
                {fields.map((field) => (
                  <PropertyOption
                    key={field.value}
                    field={field}
                    isSelected={field.value === selectedValue}
                    isHovered={field.value === hoveredProperty}
                    onClick={() => handleSelect(field.value)}
                    onMouseEnter={() => setHoveredProperty(field.value)}
                  />
                ))}
              </div>
            ))
          ) : null}
        </div>

        {detailField && (
          <PropertyDetailsPanel field={detailField} exampleValue={exampleValue} />
        )}
      </div>
    </div>
  );
}

function PropertyOption({
  field,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
}: {
  field: FilterFieldMeta;
  isSelected: boolean;
  isHovered: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
}) {
  const typeIcon = field.type === 'number' ? '#' : field.type === 'date' ? '📅' : 'Aa';
  const iconColor = field.type === 'number' ? 'text-emerald-600' : field.type === 'date' ? 'text-amber-600' : 'text-blue-600';

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={clsx(
        'w-full flex items-center gap-2 px-3 py-2 rounded-md text-left',
        'text-sm transition-colors',
        isSelected
          ? 'bg-violet-50 text-violet-900'
          : isHovered
            ? 'bg-blue-50 text-gray-900'
            : 'text-gray-700 hover:bg-gray-50'
      )}
    >
      <span className={clsx('text-xs font-medium w-6', iconColor)}>{typeIcon}</span>
      <span>{field.label}</span>
      {isSelected && (
        <Check className="ml-auto w-4 h-4 text-violet-600" />
      )}
    </button>
  );
}

function PropertyDetailsPanel({ field, exampleValue }: { field: FilterFieldMeta; exampleValue: string | null }) {
  const getPropertyDescription = (field: FilterFieldMeta): string => {
    const descriptions: Record<string, string> = {
      name: 'The full name of the user.',
      email: 'The email address of the user.',
      company: 'The company name associated with the user.',
      country: 'The country where the user is located.',
      employees: 'The number of employees in the company.',
      age: 'The age of the user.',
      created: 'The date when the user was created.',
      lastActive: 'The last active date of the user.',
    };
    return descriptions[field.value] || `The ${field.label.toLowerCase()} property.`;
  };

  return (
    <div className="w-64 border-l border-gray-100 overflow-y-auto bg-gray-50">
      <div className="p-4 space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-blue-600">Aa</span>
            <span className="text-sm font-medium text-gray-900">
              {field.category} ▸ {field.label}
            </span>
          </div>
          <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium">
            <Check className="w-3 h-3" />
            Recently used by you
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-700">
            {getPropertyDescription(field)}
          </p>
        </div>

        <div className='flex items-center gap-2 m-0'>
          <div className="text-xs font-medium text-gray-500 min-w-[70px]">Tracked as</div>
          <div className="text-xs font-medium text-gray-700">
            ${field.value}
          </div>
        </div>

        <div className="border-b border-gray-300 my-1"></div>

        {exampleValue && (
          <div className='flex items-center gap-2'>
            <div className="text-xs font-medium text-gray-500 min-w-[70px]">Example</div>
            <div className="text-xs font-medium text-gray-700">
              {exampleValue}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

