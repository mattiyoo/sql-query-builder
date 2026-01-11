'use client';

import { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { useFormContext, Controller, useWatch } from 'react-hook-form';
import clsx from 'clsx';
import { X, ChevronDown, MoreVertical } from 'lucide-react';
import type { FilterField, FilterOperator } from '@/commons/models/filter.model';
import {
  getDynamicFieldMeta,
  getOperatorsForFieldType,
  operatorRequiresValue,
} from '@/commons/models/filter.model';
import type { SqlFormValues } from '@/commons/forms/sql.form';
import { PropertySelector } from './PropertySelector';
import { AutocompleteInput } from './AutocompleteInput';
import { RangeAutocompleteInput } from './RangeAutocompleteInput';
import { DateRangePicker } from './DateRangePicker';
import { DataTypeSelector } from './DataTypeSelector';
import type { TableSchema } from '@/commons/models/database.model';

interface FilterRowProps {
  index: number;
  onRemove: () => void;
  groupPath?: string;
  schema?: TableSchema;
}

export function FilterRow({ index, onRemove, groupPath = 'filters', schema }: FilterRowProps) {
  const { control, setValue } = useFormContext<SqlFormValues>();

  const basePath = `${groupPath}.${index}`;

  const property = useWatch({ control, name: `${basePath}.property` as any });
  const operator = useWatch({ control, name: `${basePath}.operator` as any });
  const value = useWatch({ control, name: `${basePath}.value` as any });
  const overrideType = useWatch({ control, name: `${basePath}.overrideType` as any });

  const propertyMeta = getDynamicFieldMeta(property || (schema?.columns[0]?.name || 'name'), schema);

  const effectiveType = overrideType || propertyMeta.type;
  const availableOperators = getOperatorsForFieldType(effectiveType);

  useEffect(() => {
    if (property) {
      const validOperatorValues = availableOperators.map(op => op.value);

      if (!validOperatorValues.includes(operator)) {
        const newOperator = availableOperators[0]?.value || '=';
        setValue(`${basePath}.operator` as any, newOperator, {
          shouldDirty: true,
          shouldValidate: true
        });
        setValue(`${basePath}.value` as any, null, { shouldDirty: true, shouldValidate: true });
      }
    }
  }, [property, availableOperators, basePath, setValue, operator]);

  const handlePropertyChange = useCallback(
    (newProperty: FilterField) => {
      const newMeta = getDynamicFieldMeta(newProperty, schema);
      const newOperators = getOperatorsForFieldType(newMeta.type);

      setValue(`${basePath}.value` as any, null, { shouldDirty: true, shouldValidate: true });
      setValue(`${basePath}.property` as any, newProperty, { shouldDirty: true, shouldValidate: true });
      setValue(`${basePath}.operator` as any, newOperators[0]?.value || '=', { shouldDirty: true, shouldValidate: true });
      setValue(`${basePath}.overrideType` as any, undefined, { shouldDirty: true, shouldValidate: true });
    },
    [basePath, setValue, schema]
  );

  const handleOperatorChange = useCallback(
    (newOperator: FilterOperator) => {
      setValue(`${basePath}.operator` as any, newOperator, { shouldDirty: true, shouldValidate: true });
      if (!operatorRequiresValue(newOperator)) {
        setValue(`${basePath}.value` as any, null, { shouldDirty: true, shouldValidate: true });
      }
    },
    [basePath, setValue]
  );

  const showValueInput = useMemo(() => {
    return operatorRequiresValue(operator);
  }, [operator]);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Controller
        control={control}
        name={`${basePath}.property` as any}
        render={({ field }) => (
          <PropertySelector
            value={field.value || (schema?.columns[0]?.name || 'name')}
            onChange={(newValue) => {
              field.onChange(newValue);
              handlePropertyChange(newValue);
            }}
            schema={schema}
          />
        )}
      />

      <Controller
        key={`operator-controller-${property}`}
        control={control}
        name={`${basePath}.operator` as any}
        render={({ field }) => {
          const currentPropertyMeta = getDynamicFieldMeta(property || (schema?.columns[0]?.name || 'name'), schema);
          const currentEffectiveType = overrideType || currentPropertyMeta.type;
          const currentAvailableOperators = getOperatorsForFieldType(currentEffectiveType);

          const validOperatorValues = currentAvailableOperators.map(op => op.value);
          const currentOperator = validOperatorValues.includes(field.value || '=')
            ? field.value
            : (currentAvailableOperators[0]?.value || '=');

          if (!validOperatorValues.includes(field.value || '=')) {
            if (currentOperator && field.value !== currentOperator) {
              field.onChange(currentOperator);
            }
          }

          const operatorsKey = `${property}-${currentEffectiveType}-${currentAvailableOperators.map(op => op.value).join(',')}`;

          return (
            <OperatorSelector
              key={`operator-${index}-${operatorsKey}`}
              value={currentOperator}
              onChange={(newValue) => {
                field.onChange(newValue);
                handleOperatorChange(newValue);
              }}
              operators={currentAvailableOperators}
            />
          );
        }}
      />

      {showValueInput && (
        <Controller
          control={control}
          name={`${basePath}.value` as any}
          render={({ field }) => {
            return (
              <FilterValueInput
                key={`value-${basePath}-${property}-${effectiveType}`}
                value={field.value}
                onChange={field.onChange}
                operator={operator || '='}
                fieldType={effectiveType}
                property={property || (schema?.columns[0]?.name || 'name')}
              />
            );
          }}
        />
      )}

      <div className="flex items-center gap-1">
        <Controller
          control={control}
          name={`${basePath}.overrideType` as any}
          render={({ field }) => (
            <DataTypeSelector
              detectedType={propertyMeta.type}
              overrideType={field.value}
              onTypeChange={(newType) => {
                field.onChange(newType);
                setValue(`${basePath}.value` as any, null, { shouldDirty: true });
                const newOperators = getOperatorsForFieldType(newType || propertyMeta.type);
                setValue(`${basePath}.operator` as any, newOperators[0]?.value || '=', { shouldDirty: true });
              }}
            />
          )}
        />
        <button
          type="button"
          onClick={onRemove}
          className={clsx(
            'w-6 h-6 flex items-center justify-center rounded',
            'text-gray-400 hover:text-red-600 hover:bg-red-50',
            'transition-colors'
          )}
          aria-label="Remove filter"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

interface OperatorSelectorProps {
  value: FilterOperator;
  onChange: (operator: FilterOperator) => void;
  operators: Array<{ value: FilterOperator; label: string }>;
}

function OperatorSelector({ value, onChange, operators }: OperatorSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const operatorsKey = useMemo(() => {
    return operators.map(op => op.value).join(',');
  }, [operators]);

  const selectedOperator = useMemo(() => {
    const found = operators.find(op => op.value === value);
    if (found) return found;
    return operators[0];
  }, [value, operatorsKey, operators]);

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
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm cursor-pointer',
          'text-sm font-semibold transition-all duration-150',
          'bg-gray-100 text-gray-900 hover:bg-gray-200'
        )}
      >
        <span>{selectedOperator?.label || operators[0]?.label}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-9999 overflow-hidden">
          <div className="p-1 max-h-64 overflow-y-auto">
            {operators.map((operator) => (
              <button
                key={operator.value}
                type="button"
                onClick={() => {
                  onChange(operator.value);
                  setIsOpen(false);
                }}
                className={clsx(
                  'w-full flex items-center gap-2 px-3 py-2 rounded-md text-left',
                  'text-sm transition-colors',
                  operator.value === value
                    ? 'bg-blue-50 text-blue-900'
                    : 'text-gray-700 hover:bg-gray-50'
                )}
              >
                <span>{operator.label}</span>
                {operator.value === value && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-blue-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface FilterValueInputProps {
  value: string | number | [string, string] | [number, number] | (string | number)[] | null;
  onChange: (value: string | number | [string, string] | [number, number] | (string | number)[] | null) => void;
  operator: FilterOperator;
  fieldType: 'text' | 'number' | 'date' | 'boolean';
  property: FilterField;
}

function FilterValueInput({ value, onChange, operator, fieldType, property }: FilterValueInputProps) {
  if (fieldType === 'date') {
    if (operator === 'last' || operator === 'notInTheLast' || operator === 'beforeTheLast') {
      return (
        <DateRangePicker
          value={value}
          onChange={onChange}
          property={property}
        />
      );
    }

    if (operator === 'between' || operator === 'notBetween') {
      const rangeValue: [string, string] | null = Array.isArray(value) && typeof value[0] === 'string'
        ? value as [string, string]
        : null;
      return (
        <RangeAutocompleteInput
          value={rangeValue}
          onChange={(val) => onChange(val)}
          property={property}
          fieldType="date"
        />
      );
    }

    return (
      <DateRangePicker
        value={value}
        onChange={onChange}
        property={property}
      />
    );
  }

  if (fieldType === 'number' && (operator === 'between' || operator === 'notBetween')) {
    const rangeValue: [number, number] | null = Array.isArray(value) && typeof value[0] === 'number'
      ? value as [number, number]
      : null;
    return (
      <RangeAutocompleteInput
        value={rangeValue}
        onChange={(val) => onChange(val)}
        property={property}
        fieldType="number"
      />
    );
  }

  if (fieldType === 'boolean') {
    return null;
  }
  if (fieldType === 'number') {
    return (
      <input
        type="number"
        value={value && typeof value === 'number' ? value : ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        placeholder="Enter number..."
        className={clsx(
          'px-3 py-1.5 rounded-sm border text-sm font-medium text-gray-900',
          'focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100',
          'bg-white border-gray-200 min-w-[120px]'
        )}
      />
    );
  }

  const isMulti = fieldType === 'text' && (operator === '=' || operator === '!=');

  const inputValue = Array.isArray(value) && !isMulti
    ? null
    : (isMulti
      ? (Array.isArray(value) ? value : value != null ? [value] : null)
      : (Array.isArray(value) ? null : value));

  return (
    <AutocompleteInput
      key={`autocomplete-${property}-${fieldType}-${isMulti}`}
      value={inputValue}
      onChange={onChange}
      property={property || 'name'}
      fieldType="text"
      placeholder="Enter value..."
      isMulti={isMulti}
    />
  );
}
