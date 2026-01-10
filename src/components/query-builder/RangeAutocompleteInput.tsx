'use client';

import type { FilterField } from '@/commons/models/filter.model';
import { AutocompleteInput } from './AutocompleteInput';

interface RangeAutocompleteInputProps {
  value: [string, string] | [number, number] | null;
  onChange: (value: [string, string] | [number, number] | null) => void;
  property: FilterField;
  fieldType: 'text' | 'number' | 'date';
}

export function RangeAutocompleteInput({
  value,
  onChange,
  property,
  fieldType,
}: RangeAutocompleteInputProps) {
  const getDefaultValue = () => (fieldType === 'number' ? null : '');

  const values: [string | number | null, string | number | null] = Array.isArray(value)
    ? value
    : [getDefaultValue(), getDefaultValue()];

  const handleFirstChange = (newValue: string | number | (string | number)[] | null) => {
    const singleValue = Array.isArray(newValue) ? newValue[0] ?? null : newValue;
    const secondValue = values[1] ?? getDefaultValue();

    if (fieldType === 'number') {
      const num1 = typeof singleValue === 'number' ? singleValue : (singleValue ? Number(singleValue) : null);
      const num2 = typeof secondValue === 'number' ? secondValue : (secondValue ? Number(secondValue) : null);
      onChange([num1 ?? 0, num2 ?? 0] as [number, number]);
    } else {
      onChange([String(singleValue ?? ''), String(secondValue ?? '')] as [string, string]);
    }
  };

  const handleSecondChange = (newValue: string | number | (string | number)[] | null) => {
    const singleValue = Array.isArray(newValue) ? newValue[0] ?? null : newValue;
    const firstValue = values[0] ?? getDefaultValue();

    if (fieldType === 'number') {
      const num1 = typeof firstValue === 'number' ? firstValue : (firstValue ? Number(firstValue) : null);
      const num2 = typeof singleValue === 'number' ? singleValue : (singleValue ? Number(singleValue) : null);
      onChange([num1 ?? 0, num2 ?? 0] as [number, number]);
    } else {
      onChange([String(firstValue ?? ''), String(singleValue ?? '')] as [string, string]);
    }
  };

  const [firstPlaceholder, secondPlaceholder] = fieldType === 'number'
    ? ['Min', 'Max']
    : ['Start date', 'End date'];

  return (
    <div className="inline-flex items-center gap-2">
      <AutocompleteInput
        value={values[0] ?? null}
        onChange={handleFirstChange}
        property={property}
        fieldType={fieldType}
        placeholder={firstPlaceholder}
      />
      <span className="text-sm text-gray-400">and</span>
      <AutocompleteInput
        value={values[1] ?? null}
        onChange={handleSecondChange}
        property={property}
        fieldType={fieldType}
        placeholder={secondPlaceholder}
      />
    </div>
  );
}
