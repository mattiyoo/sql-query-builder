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
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(today);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [durationValue, setDurationValue] = useState<number>(15);
  const [durationUnit, setDurationUnit] = useState<DurationUnit>('days');
  const [showDurationSelector, setShowDurationSelector] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedEndDate(today);
  }, [today]);

  const durationInDays = useMemo(() => {
    if (selectedStartDate && selectedEndDate) {
      const diffTime = Math.abs(selectedEndDate.getTime() - selectedStartDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    }
    return 0;
  }, [selectedStartDate, selectedEndDate]);

  useEffect(() => {
    if (value) {
      if (Array.isArray(value) && value.length === 2 && typeof value[0] === 'string') {
        const start = new Date(value[0]);
        if (!isNaN(start.getTime())) {
          setSelectedStartDate(start);
          setSelectedEndDate(today);
        }
      } else if (typeof value === 'string') {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          setSelectedStartDate(date);
          setSelectedEndDate(today);
        }
      }
    } else {
      setSelectedStartDate(null);
      setSelectedEndDate(today);
    }
  }, [value, today]);

  useEffect(() => {
    if (selectedStartDate && selectedEndDate && durationInDays > 0) {
      setDurationValue(durationInDays);
    }
  }, [selectedStartDate, selectedEndDate, durationInDays]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const handleDateClick = (date: Date) => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    setSelectedStartDate(start);
    setSelectedEndDate(today);
  };

  const handleDurationChange = (newDuration: number, unit: DurationUnit) => {
    setDurationValue(newDuration);
    setDurationUnit(unit);

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

    setSelectedStartDate(startDate);
    setSelectedEndDate(today);
  };

  const handleApply = () => {
    if (selectedStartDate && selectedEndDate) {
      onChange(durationValue);
    } else if (selectedStartDate) {
      onChange(durationValue);
    }
    setIsOpen(false);
  };

  const handleClear = () => {
    setSelectedStartDate(null);
    setSelectedEndDate(null);
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
    if (!selectedStartDate) return false;
    if (!selectedEndDate) {
      return formatDate(date) === formatDate(selectedStartDate);
    }
    const dateStr = formatDate(date);
    const startStr = formatDate(selectedStartDate);
    const endStr = formatDate(selectedEndDate);
    return dateStr >= startStr && dateStr <= endStr;
  };

  const isDateStart = (date: Date): boolean => {
    return selectedStartDate ? formatDate(date) === formatDate(selectedStartDate) : false;
  };

  const isDateEnd = (date: Date): boolean => {
    return selectedEndDate ? formatDate(date) === formatDate(selectedEndDate) : false;
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
    if (selectedStartDate && selectedEndDate && durationInDays) {
      return `${durationInDays} ${durationInDays === 1 ? 'day' : 'days'}`;
    }
    if (selectedStartDate) {
      return formatDate(selectedStartDate);
    }
    return 'Select date range...';
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-900',
          'focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100',
          'bg-gray-100 rounded-sm',
          'hover:border-gray-300 transition-colors',
          isOpen && 'border-violet-500 ring-2 ring-violet-100'
        )}
      >
        <span className={clsx('truncate', !selectedStartDate && 'text-gray-400')}>
          {displayValue()}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-[420px] bg-white rounded-lg shadow-lg border border-gray-200 z-9999 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={durationValue}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  setDurationValue(val);
                  if (val > 0) {
                    handleDurationChange(val, durationUnit);
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
                  <span>{durationUnit}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                {showDurationSelector && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-white rounded border border-gray-200 shadow-lg z-10">
                    {(['days', 'weeks', 'months'] as DurationUnit[]).map((unit) => (
                      <button
                        key={unit}
                        type="button"
                        onClick={() => {
                          setDurationUnit(unit);
                          setShowDurationSelector(false);
                          if (durationValue > 0) {
                            handleDurationChange(durationValue, unit);
                          }
                        }}
                        className={clsx(
                          'w-full px-3 py-2 text-left text-sm',
                          durationUnit === unit
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
                disabled={!selectedStartDate}
                className={clsx(
                  'px-4 py-2 text-sm font-medium rounded',
                  selectedStartDate
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

