'use client';

import { useMemo, useState, useCallback, useEffect } from 'react';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import type { SingleValue, MultiValue } from 'react-select';
import type { FilterField } from '@/commons/models/filter.model';
import { generateSelectOptions, getReactSelectStyles, commonSelectProps, type SelectOption } from './utils/react-select-utils';
import { CheckSquare, Square, Minus } from 'lucide-react';
import clsx from 'clsx';
import { ValueContainer } from 'react-select/animated';

interface AutocompleteInputProps {
  value: string | number | (string | number)[] | null;
  onChange: (value: string | number | (string | number)[] | null) => void;
  property: FilterField;
  fieldType: 'text' | 'number' | 'date';
  placeholder?: string;
  min?: number;
  isMulti?: boolean;
}

export function AutocompleteInput({
  value,
  onChange,
  property,
  fieldType,
  placeholder = 'Enter value...',
  isMulti = false,
}: AutocompleteInputProps) {
  const [searchInput, setSearchInput] = useState('');
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const [stagedValues, setStagedValues] = useState<(string | number)[]>([]);
  const [createdOptions, setCreatedOptions] = useState<SelectOption[]>([]);

  useEffect(() => {
    if (menuIsOpen && isMulti) {
      const currentValues = Array.isArray(value) ? value : [];
      setStagedValues(currentValues);
    }
  }, [menuIsOpen, isMulti, value]);

  const baseOptions = useMemo(
    () => generateSelectOptions(property, fieldType),
    [property, fieldType]
  );

  const [localOptions, setLocalOptions] = useState<SelectOption[]>(baseOptions);

  useEffect(() => {
    setLocalOptions(baseOptions);
  }, [baseOptions]);

  const options = useMemo(() => {
    const defaults = baseOptions;

    if (!isMulti) {
      return [...createdOptions, ...defaults];
    }

    const valuesToCheck = menuIsOpen
      ? stagedValues
      : Array.isArray(value) ? value : [];

    const selectedSet = new Set(valuesToCheck);

    const selectedDefaults = defaults.filter(opt =>
      selectedSet.has(opt.value)
    );

    const unselectedDefaults = defaults.filter(opt =>
      !selectedSet.has(opt.value)
    );

    return [
      ...createdOptions,
      ...selectedDefaults,
      ...unselectedDefaults,
    ];
  }, [
    baseOptions,
    createdOptions,
    isMulti,
    menuIsOpen,
    stagedValues,
    value,
  ]);

  const handleCreateOption = (inputValue: string) => {
    const newOption = { label: inputValue, value: inputValue };

    setCreatedOptions(prev => [newOption, ...prev]);

    if (isMulti) {
      setStagedValues(prev => [...prev, inputValue]);
    } else {
      onChange(inputValue);
      setMenuIsOpen(false);
    }

    if (!isMulti) {
      onChange(inputValue);
      setSearchInput('');
      setMenuIsOpen(false);
    }
  };



  const filteredOptions = useMemo(() => {
    if (!searchInput || !isMulti) return options;
    const searchLower = searchInput.toLowerCase();
    return options.filter(opt =>
      String(opt.label).toLowerCase().includes(searchLower)
    );
  }, [options, searchInput, isMulti]);

  const selectedOption = useMemo<SelectOption | null>(() => {
    if (isMulti || value == null || Array.isArray(value)) return null;

    return (
      createdOptions.find(opt => opt.value === value) ||
      baseOptions.find(opt => opt.value === value) ||
      null
    );
  }, [value, baseOptions, createdOptions, isMulti]);

  const selectedOptions = useMemo<SelectOption[]>(() => {
    if (!isMulti || value == null || !Array.isArray(value)) return [];

    return value
      .map(val => {
        return createdOptions.find(opt => opt.value === val)
          || baseOptions.find(opt => opt.value === val);
      })
      .filter((opt): opt is SelectOption => opt !== undefined);
  }, [value, baseOptions, createdOptions, isMulti]);

  const stagedOptions = useMemo<SelectOption[]>(() => {
    if (!isMulti) return [];

    return stagedValues
      .map(val =>
        createdOptions.find(opt => opt.value === val) ||
        baseOptions.find(opt => opt.value === val)
      )
      .filter((opt): opt is SelectOption => opt !== undefined);
  }, [stagedValues, baseOptions, createdOptions, isMulti]);

  const handleStagedChange = (newValue: SingleValue<SelectOption> | MultiValue<SelectOption>) => {
    if (isMulti) {
      const values = newValue as MultiValue<SelectOption>;
      setStagedValues(values.map(opt => opt.value));
    } else {
      const val = newValue as SingleValue<SelectOption>;
      onChange(val ? val.value : null);
    }
  };

  const handleApply = () => {
    onChange(stagedValues.length === 0 ? null : stagedValues);
    setMenuIsOpen(false);
    setSearchInput('');
  };

  const handleChange = (newValue: SingleValue<SelectOption> | MultiValue<SelectOption>) => {
    if (isMulti) {
      const values = newValue as MultiValue<SelectOption>;
      onChange(values.length === 0 ? null : values.map(opt => opt.value));
    } else {
      const value = newValue as SingleValue<SelectOption>;
      onChange(value ? value.value : null);
    }
  };

  const customStyles = useMemo(() => {
    if (!isMulti) return getReactSelectStyles();

    return {
      ...getReactSelectStyles(),
      multiValue: (provided: any) => ({
        ...provided,
        backgroundColor: 'transparent',
        padding: 0,
        margin: 0,
        border: 'none',
      }),
      multiValueLabel: (provided: any) => ({
        ...provided,
        color: 'var(--color-gray-900)',
        fontSize: '0.875rem',
        fontWeight: '500',
        padding: 0,
        paddingLeft: 0,
      }),
      multiValueRemove: (provided: any) => ({
        ...provided,
        display: 'none',
      }),
      valueContainer: (provided: any) => ({
        ...provided,
        padding: '2px 8px',
        gap: 0,
      }),
    } as any;
  }, [isMulti]);

  const Option = useCallback((props: any) => {
    const { children, data, isFocused, innerRef, innerProps } = props;

    if (!isMulti) {
      const isSelected = data.value === value;
      return (
        <div
          ref={innerRef}
          {...innerProps}
          className={clsx(
            'px-3 py-2 cursor-pointer text-sm text-gray-900 overflow-auto max-h-60',
            isSelected && 'bg-violet-50 text-violet-900',
            isFocused && !isSelected && 'bg-gray-50'
          )}
        >
          {children}
        </div>
      );
    }

    const isStaged = stagedValues.includes(data.value);

    return (
      <div
        ref={innerRef}
        {...innerProps}
        className={clsx(
          'px-3 py-2 cursor-pointer text-sm flex items-center gap-2 text-gray-900',
          isStaged && 'bg-violet-50',
          isFocused && !isStaged && 'bg-gray-50'
        )}
      >
        {isStaged ? (
          <CheckSquare className="w-4 h-4 text-violet-600 shrink-0" />
        ) : (
          <Square className="w-4 h-4 text-gray-400 shrink-0" />
        )}
        <span className={clsx(isStaged ? 'text-violet-900' : 'text-gray-700')}>
          {children}
        </span>
      </div>
    );
  }, [isMulti, stagedValues, value]);

  const MenuList = useCallback((props: any) => {
    const { children } = props;

    if (!isMulti) {
      return <div {...props.innerProps}>{children}</div>;
    }

    const allInListSelected = baseOptions.length > 0 && baseOptions.every(opt =>
      stagedValues.includes(opt.value)
    );
    const someInListSelected = baseOptions.some(opt =>
      stagedValues.includes(opt.value)
    );

    const allMatchingSelected = searchInput && filteredOptions.length > 0
      ? filteredOptions.every(opt => stagedValues.includes(opt.value))
      : false;
    const someMatchingSelected = searchInput && filteredOptions.length > 0
      ? filteredOptions.some(opt => stagedValues.includes(opt.value))
      : false;

    const handleSelectAllDefined = () => {
      if (allInListSelected) {
        setStagedValues([]);
      } else {
        const allValues = baseOptions.map(opt => opt.value);
        setStagedValues(allValues);
      }
    };

    const handleSelectAllMatching = () => {
      if (allMatchingSelected) {
        const newValues = stagedValues.filter((val: string | number) =>
          !filteredOptions.some(opt => opt.value === val)
        );
        setStagedValues(newValues);
      } else {
        const matchingValues = filteredOptions.map(opt => opt.value);
        const newValues = Array.from(new Set([...stagedValues, ...matchingValues]));
        setStagedValues(newValues);
      }
    };

    return (
      <div className="flex flex-col">
        <div
          onClick={handleSelectAllDefined}
          className={clsx(
            'px-3 py-2 cursor-pointer text-sm flex items-center gap-2 border-b border-gray-100',
            allInListSelected && 'bg-violet-50'
          )}
        >
          {allInListSelected ? (
            <CheckSquare className="w-4 h-4 text-violet-600 shrink-0" />
          ) : someInListSelected ? (
            <Minus className="w-4 h-4 text-violet-600 shrink-0" />
          ) : (
            <Square className="w-4 h-4 text-gray-400 shrink-0" />
          )}
          <span className={clsx(
            allInListSelected ? 'text-violet-900 font-medium' : 'text-gray-700'
          )}>
            Select all defined values
          </span>
        </div>

        <div
          onClick={handleSelectAllDefined}
          className={clsx(
            'px-3 py-2 cursor-pointer text-sm flex items-center gap-2 border-b border-gray-100',
            allInListSelected && 'bg-violet-50'
          )}
        >
          {allInListSelected ? (
            <CheckSquare className="w-4 h-4 text-violet-600 shrink-0" />
          ) : someInListSelected ? (
            <Minus className="w-4 h-4 text-violet-600 shrink-0" />
          ) : (
            <Square className="w-4 h-4 text-gray-400 shrink-0" />
          )}
          <span className={clsx(
            allInListSelected ? 'text-violet-900 font-medium' : 'text-gray-700'
          )}>
            Select all in list ({baseOptions.length})
          </span>
        </div>

        <div className="flex-1 overflow-auto max-h-60">
          {children}
        </div>

        <div className='pt-2'>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleApply();
            }}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium py-2 px-4 rounded-b-lg text-sm transition-colors cursor-pointer"
          >
            Add
          </button>
        </div>
      </div>
    );
  }, [isMulti, searchInput, filteredOptions, stagedValues, baseOptions, handleApply]);

  const SelectComponent = fieldType === 'text' || fieldType === 'date'
    ? CreatableSelect
    : Select;

  const instanceId = `autocomplete-${property}-${fieldType}-${isMulti}`;

  const selectKey = `${instanceId}-${JSON.stringify(value)}`;

  const NoRemove = () => null;

  const MultiValueLabel = useCallback((props: any) => {
    const { children, data, selectProps } = props;
    const values = selectProps.value || [];
    const index = values.findIndex((v: SelectOption) => v.value === data.value);
    const isLast = index === values.length - 1;
    const isFirst = index === 0;

    return (
      <div className="inline">
        <span className={clsx(
          isFirst ? '' : 'ml-1'
        )}>{children}</span>
        {!isLast && <span> or </span>}
      </div>
    );
  }, []);

  return (
    <SelectComponent
      key={selectKey}
      instanceId={instanceId}
      inputId={instanceId}
      value={isMulti
        ? stagedValues
          .map(val => createdOptions.find(o => o.value === val) || baseOptions.find(o => o.value === val))
          .filter((opt): opt is SelectOption => opt !== undefined)
        : selectedOption
      }
      onChange={isMulti ? handleStagedChange : handleChange}
      options={options}
      placeholder={placeholder}
      styles={customStyles}
      isMulti={isMulti}
      menuIsOpen={menuIsOpen}
      onMenuOpen={() => setMenuIsOpen(true)}
      onMenuClose={() => {
        setMenuIsOpen(false);
        setSearchInput('');
        if (isMulti) {
          const currentValues = Array.isArray(value) ? value : [];
          setStagedValues(currentValues);
        }
      }}
      closeMenuOnSelect={!isMulti}
      hideSelectedOptions={false}
      {...commonSelectProps}
      onCreateOption={handleCreateOption}
      formatCreateLabel={(inputValue: string) => `Use "${inputValue}"`}
      components={{ Option, MenuList, MultiValueRemove: NoRemove, MultiValueLabel }}
      onInputChange={(newValue) => {
        setSearchInput(newValue);
        return stagedValues;
      }}
      inputValue={searchInput}
    />
  );
}
