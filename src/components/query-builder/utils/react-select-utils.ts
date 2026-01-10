import type { StylesConfig } from 'react-select';
import { users } from '@/lib/dummy-data';
import type { FilterField } from '@/commons/models/filter.model';

export type SelectOption = {
  value: string | number;
  label: string;
};

export function generateSelectOptions(
  property: FilterField,
  fieldType: 'text' | 'number' | 'date'
): SelectOption[] {
  if (fieldType === 'date') {
    const today = new Date();
    const dateOptions: string[] = [];

    dateOptions.push(today.toISOString().split('T')[0]);

    const daysToGenerate = 30;
    for (let i = 1; i <= daysToGenerate; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dateOptions.push(date.toISOString().split('T')[0]);
    }

    for (let i = 0; i < 12; i++) {
      const date = new Date(today);
      date.setMonth(date.getMonth() - i);
      date.setDate(1);
      dateOptions.push(date.toISOString().split('T')[0]);
    }

    return Array.from(new Set(dateOptions))
      .sort()
      .reverse()
      .map(date => ({ value: date, label: date }));
  }

  if (fieldType === 'number') {
    const values = users
      .map(u => {
        if (property === 'age') return u.age;
        if (property === 'employees') return u.employees;
        return null;
      })
      .filter((v): v is number => v !== null)
      .sort((a, b) => a - b);

    const uniqueValues = Array.from(new Set(values));

    return uniqueValues.slice(0, 50).map(num => ({
      value: num,
      label: String(num),
    }));
  }

  const values = users
    .map(u => {
      if (property === 'name') return u.name;
      if (property === 'email') return u.email;
      if (property === 'company') return u.company;
      if (property === 'country') return u.country;
      return null;
    })
    .filter((v): v is string => v !== null);

  const uniqueValues = Array.from(new Set(values));

  return uniqueValues.slice(0, 50).map(str => ({
    value: str,
    label: str,
  }));
}

export function getReactSelectStyles(
  borderRadius: string = '0.5rem',
  minWidth: string = '120px'
): StylesConfig<SelectOption, false> {
  return {
    control: (provided, state) => ({
      ...provided,
      minWidth,
      borderColor: state.isFocused ? '#8b5cf6' : '#e5e7eb',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(139, 92, 246, 0.1)' : 'none',
      '&:hover': {
        border: 'solid',
        borderColor: '#8b5cf6',
        borderWidth: '1px',
      },
      borderRadius,
      border: 'none',
      fontSize: '0.875rem',
      fontWeight: '500',
      padding: '0.125rem 0.25rem',
      backgroundColor: 'var(--color-gray-100)',
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
      borderRadius: '0.5rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      border: '1px solid #e5e7eb',
      minWidth: '300px',
      maxWidth: '300px',
      overflow: 'auto',
      maxHeight: '400px',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? '#f3e8ff'
        : state.isFocused
          ? '#f9fafb'
          : 'white',
      color: state.isSelected ? '#581c87' : '#374151',
      fontSize: '0.875rem',
      padding: '0.5rem 0.75rem',
      cursor: 'pointer',
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#8b5cf6',
      fontSize: '0.875rem',
    }),
    singleValue: (provided) => ({
      ...provided,
      fontSize: '0.875rem',
      fontWeight: '500',
    }),
    input: (provided) => ({
      ...provided,
      fontSize: '0.875rem',
    }),
    indicatorsContainer: (provided) => ({
      ...provided,
      display: 'none',
    }),
  };
}

export const commonSelectProps = {
  isSearchable: true,
  isClearable: true,
  menuPortalTarget: typeof document !== 'undefined' ? document.body : undefined,
  menuPosition: 'fixed' as const,
} as const;

