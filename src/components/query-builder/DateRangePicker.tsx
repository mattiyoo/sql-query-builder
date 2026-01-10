'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import clsx from 'clsx';
import { Calendar, ChevronLeft, ChevronRight, Settings, ChevronDown } from 'lucide-react';
import type { FilterField } from '@/commons/models/filter.model';

interface DateRangePickerProps {
  value: string | number | (string | number)[] | [string, string] | null;
  onChange: (value: string | number | [string, string] | null) => void;
  property: FilterField;
}

type DurationUnit = 'days' | 'weeks' | 'months';

export function DateRangePicker({ value, onChange, property }: DateRangePickerProps) {

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(today)
  const [appliedDurationValue, setAppliedDurationValue] = useState<number | null>(null);
  const [stagedStartDate, setStagedStartDate] = useState<Date | null>(null);
  const [stagedEndDate, setStagedEndDate] = useState<Date | null>(today);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [stagedDurationValue, setStagedDurationValue] = useState<number>(15);
  const [stagedDurationUnit, setStagedDurationUnit] = useState<DurationUnit>('days');
  const [showDurationSelector, setShowDurationSelector] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setStagedEndDate(today);
  }, [today]);

  const stagedDurationInDays = useMemo(() => {
    if (stagedStartDate && stagedEndDate) {
      const diffTime = Math.abs(stagedEndDate.getTime() - stagedStartDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    }
    return 0;
  }, [stagedStartDate, stagedEndDate]);

  useEffect(() => {
    if (typeof value === 'number' && value > 0) {
      setAppliedDurationValue(value);
    } else {
      setAppliedDurationValue(null);
    }
  }, [value]);

  useEffect(() => {
    if (isOpen) {
      if (appliedDurationValue) {
        setStagedDurationValue(appliedDurationValue);
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - appliedDurationValue + 1);
        setStagedStartDate(startDate);
        setStagedEndDate(today);
      } else {
        setStagedStartDate(null);
        setStagedEndDate(today);
        setStagedDurationValue(15);
      }
    }
  }, [isOpen, appliedDurationValue, today]);

  useEffect(() => {
    if (stagedStartDate && stagedEndDate && stagedDurationInDays > 0) {
      setStagedDurationValue(stagedDurationInDays);
    }
  }, [stagedStartDate, stagedEndDate, stagedDurationInDays]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        if (appliedDurationValue) {
          setStagedDurationValue(appliedDurationValue);
          const startDate = new Date(today);
          startDate.setDate(today.getDate() - appliedDurationValue + 1);
          setStagedStartDate(startDate);
          setStagedEndDate(today);
        } else {
          setStagedStartDate(null);
          setStagedEndDate(today);
          setStagedDurationValue(15);
        }
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, appliedDurationValue, today]);

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const handleDateClick = (date: Date) => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    setStagedStartDate(start);
    setStagedEndDate(today);
  };

  const handleDurationChange = (newDuration: number, unit: DurationUnit) => {
    setStagedDurationValue(newDuration);
    setStagedDurationUnit(unit);

    const startDate = new Date(today);

    switch (unit) {
      case 'days':
        startDate.setDate(today.getDate() - newDuration + 1);
        break;
      case 'weeks':
        startDate.setDate(today.getDate() - newDuration * 7 + 1);
        break;
      case 'months':
        startDate.setMonth(today.getMonth() - newDuration);
        startDate.setDate(1);
        break;
    }

    setStagedStartDate(startDate);
    setStagedEndDate(today);
  };

  const handleApply = () => {
    if (stagedStartDate && stagedEndDate) {
      onChange(stagedDurationValue);
      setAppliedDurationValue(stagedDurationValue);
    } else if (stagedStartDate) {
      onChange(stagedDurationValue);
      setAppliedDurationValue(stagedDurationValue);
    }
    setIsOpen(false);
  };

  const handleClear = () => {
    setStagedStartDate(null);
    setStagedEndDate(null);
    setAppliedDurationValue(null);
    onChange(null);
    setIsOpen(false);
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isDateInRange = (date: Date): boolean => {
    if (!stagedStartDate) return false;
    if (!stagedEndDate) {
      return formatDate(date) === formatDate(stagedStartDate);
    }
    const dateStr = formatDate(date);
    const startStr = formatDate(stagedStartDate);
    const endStr = formatDate(stagedEndDate);
    return dateStr >= startStr && dateStr <= endStr;
  };

  const isDateStart = (date: Date): boolean => {
    return stagedStartDate ? formatDate(date) === formatDate(stagedStartDate) : false;
  };

  const isDateEnd = (date: Date): boolean => {
    return stagedEndDate ? formatDate(date) === formatDate(stagedEndDate) : false;
  };

  const renderCalendar = (monthDate: Date) => {
    const daysInMonth = getDaysInMonth(monthDate);
    const firstDay = getFirstDayOfMonth(monthDate);
    const days: (Date | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(monthDate.getFullYear(), monthDate.getMonth(), i));
    }

    return (
      <div className="grid grid-cols-7 gap-1 p-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-xs font-medium text-gray-500 text-center py-1">
            {day}
          </div>
        ))}

        {days.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="h-8" />;
          }

          const isInRange = isDateInRange(date);
          const isStart = isDateStart(date);
          const isEnd = isDateEnd(date);
          const isToday = formatDate(date) === formatDate(new Date());

          return (
            <button
              key={formatDate(date)}
              type="button"
              onClick={() => handleDateClick(date)}
              onMouseEnter={() => setHoverDate(date)}
              onMouseLeave={() => setHoverDate(null)}
              className={clsx(
                'h-8 w-8 rounded text-sm transition-colors relative',
                isToday && 'font-bold',
                isInRange && !isStart && !isEnd && 'bg-violet-100 text-violet-900',
                isStart && 'bg-violet-600 text-white rounded-full',
                isEnd && 'bg-violet-600 text-white rounded-full',
                isInRange && (isStart || isEnd) && 'ring-2 ring-violet-600 ring-offset-1',
                !isInRange && 'hover:bg-gray-100 text-gray-700'
              )}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    );
  };

  const displayValue = () => {
    if (appliedDurationValue) {
      return `${appliedDurationValue} ${appliedDurationValue === 1 ? 'day' : 'days'}`;
    }
    return 'Select date range...';
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-900 cursor-pointer',
          'border border-gray-200 rounded-lg bg-white',
          'focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100',
          'hover:border-violet-500 transition-all duration-150',
          isOpen && 'border-violet-500 ring-2 ring-violet-100'
        )}
      >
        <span className={clsx('truncate', !appliedDurationValue && 'text-gray-400')}>
          {displayValue()}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-[420px] bg-white rounded-lg shadow-lg border border-gray-200 z-9999 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={stagedDurationValue}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  setStagedDurationValue(val);
                  if (val > 0) {
                    handleDurationChange(val, stagedDurationUnit);
                  }
                }}
                min={1}
                className={clsx(
                  'w-full px-3 py-1.5 rounded-sm text-sm font-medium text-gray-900',
                  'focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100',
                  'bg-gray-100 text-center'
                )}
              />
              <div className="relative w-full">
                <button
                  type="button"
                  onClick={() => setShowDurationSelector(!showDurationSelector)}
                  className={clsx(
                    'flex items-center gap-1 px-3 py-1.5 rounded-sm text-sm font-medium w-full text-gray-900',
                    'focus:outline-none focus:border-violet-500',
                    'bg-gray-100',
                    'min-w-[80px] justify-between'
                  )}
                >
                  <span>{stagedDurationUnit}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                {showDurationSelector && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-white rounded border border-gray-200 shadow-lg z-10">
                    {(['days', 'weeks', 'months'] as DurationUnit[]).map((unit) => (
                      <button
                        key={unit}
                        type="button"
                        onClick={() => {
                          setStagedDurationUnit(unit);
                          setShowDurationSelector(false);
                          if (stagedDurationValue > 0) {
                            handleDurationChange(stagedDurationValue, unit);
                          }
                        }}
                        className={clsx(
                          'w-full px-3 py-2 text-left text-sm',
                          stagedDurationUnit === unit
                            ? 'bg-violet-50 text-violet-900'
                            : 'text-gray-700 hover:bg-gray-50'
                        )}
                      >
                        {unit}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 max-h-[400px] overflow-y-auto">
            <div className="mb-4">
              <div className="text-xs font-medium text-gray-500 mb-2">
                {new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
              {renderCalendar(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-medium text-gray-500">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
              </div>
              {renderCalendar(currentMonth)}
            </div>
          </div>

          <div className="flex items-center justify-end p-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApply}
                disabled={!stagedStartDate}
                className={clsx(
                  'px-4 py-2 text-sm font-medium rounded',
                  stagedStartDate
                    ? 'bg-violet-600 text-white hover:bg-violet-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                )}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

