'use client';

import { useState, useRef, useEffect } from 'react';
import { useFormContext, useFieldArray, Controller } from 'react-hook-form';
import clsx from 'clsx';
import { Plus, GripVertical } from 'lucide-react';
import { FilterRow } from './FilterRow';
import { CombinatorSelector } from './CombinatorSelector';
import { PropertySelectorDropdown } from './PropertySelectorDropdown';
import { DEFAULT_FILTER, type FilterField, type CombinatorType } from '@/commons/models/filter.model';
import type { SqlFormValues } from '@/commons/forms/sql.form';

interface FilterGroupProps {
  groupIndex: number;
  isFirstGroup: boolean;
  onRemove?: () => void;
  isConnected?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  isConnectedToNext?: boolean;
}

export function FilterGroup({
  groupIndex,
  isFirstGroup,
  onRemove,
  isConnected = false,
  isFirst = false,
  isLast = false,
  isConnectedToNext = false,
}: FilterGroupProps) {
  const { control } = useFormContext<SqlFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `filterGroups.${groupIndex}.filters` as const,
  });

  const [isAddingFilter, setIsAddingFilter] = useState(false);
  const addFilterButtonRef = useRef<HTMLButtonElement>(null);

  const handleAddFilterClick = () => {
    setIsAddingFilter(true);
  };

  const handlePropertySelected = (property: FilterField) => {
    const newFilter = {
      ...DEFAULT_FILTER,
      property,
    };
    append(newFilter);
    setIsAddingFilter(false);
  };

  const handleCancelAddFilter = () => {
    setIsAddingFilter(false);
  };

  const handleRemoveFilter = (index: number) => {
    remove(index);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isAddingFilter &&
        addFilterButtonRef.current &&
        !addFilterButtonRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('[data-property-selector-dropdown]')
      ) {
        setIsAddingFilter(false);
      }
    }

    if (isAddingFilter) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isAddingFilter]);

  return (
    <div>
      <div className={clsx(
        'px-4 pt-4',
        isConnectedToNext ? 'pb-0' : 'pb-2'
      )}>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <GripVertical className="w-4 h-4" />
            All Users
          </span>
        </div>
      </div>

      <div className="p-2 relative">
        {fields.length > 0 && (
          <div className="space-y-2">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2 flex-wrap ms-6">
                {index === 0 && (
                  <span className="text-sm text-gray-500 font-medium">where</span>
                )}
                {index > 0 && (
                  <FilterCombinatorSelector
                    groupIndex={groupIndex}
                    filterIndex={index}
                  />
                )}
                <div className="flex-1">
                  <FilterRow
                    index={index}
                    onRemove={() => handleRemoveFilter(index)}
                    groupPath={`filterGroups.${groupIndex}.filters`}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="relative">
          <button
            ref={addFilterButtonRef}
            type="button"
            onClick={handleAddFilterClick}
            className={clsx(
              'w-auto flex items-center justify-center gap-2',
              'p-2 rounded-lg',
              'text-sm font-medium',
              'transition-all duration-150',
              'cursor-pointer',
              isAddingFilter
                ? 'bg-violet-100 text-violet-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-violet-600'
            )}
          >
            <Plus className="w-4 h-4" />
            <span>Filter</span>
          </button>

          {isAddingFilter && (
            <div
              data-property-selector-dropdown
              className="absolute top-full left-0 mt-2 z-50"
            >
              <AddFilterPropertySelector
                onPropertySelected={handlePropertySelected}
                onCancel={handleCancelAddFilter}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterCombinatorSelector({
  groupIndex,
  filterIndex,
}: {
  groupIndex: number;
  filterIndex: number;
}) {
  const { control } = useFormContext<SqlFormValues>();

  return (
    <Controller
      control={control}
      name={`filterGroups.${groupIndex}.filters.${filterIndex}.combinator` as const}
      render={({ field }) => (
        <CombinatorSelector
          value={(field.value || 'and') as CombinatorType}
          onChange={field.onChange}
        />
      )}
    />
  );
}

function AddFilterPropertySelector({
  onPropertySelected,
  onCancel,
}: {
  onPropertySelected: (property: FilterField) => void;
  onCancel: () => void;
}) {
  const handleSelect = (property: FilterField) => {
    if (property === 'all') return;
    onPropertySelected(property);
  };

  return (
    <PropertySelectorDropdown
      selectedValue={undefined}
      onPropertySelect={handleSelect}
      isOpen={true}
      initialCategory="All"
      autoFocus={true}
    />
  );
}

