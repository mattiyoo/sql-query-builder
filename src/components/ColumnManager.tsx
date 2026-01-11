'use client';

import { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { Columns3, Check, Eye, EyeOff, Search } from 'lucide-react';
import type { TableSchema } from '@/commons/models/database.model';
import { formatTableName } from '@/lib/table-utils';

interface ColumnManagerProps {
    schema: TableSchema | null;
    visibleColumns: string[];
    onVisibleColumnsChange: (columns: string[]) => void;
}

export function ColumnManager({
    schema,
    visibleColumns,
    onVisibleColumnsChange,
}: ColumnManagerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

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

    if (!schema) return null;

    const allColumns = schema.columns;
    const filteredColumns = searchTerm
        ? allColumns.filter(col =>
            col.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            formatTableName(col.name).toLowerCase().includes(searchTerm.toLowerCase())
        )
        : allColumns;

    const handleToggleColumn = (columnName: string) => {
        if (visibleColumns.includes(columnName)) {
            if (visibleColumns.length > 1) {
                onVisibleColumnsChange(visibleColumns.filter(c => c !== columnName));
            }
        } else {
            onVisibleColumnsChange([...visibleColumns, columnName]);
        }
    };

    const handleSelectAll = () => {
        onVisibleColumnsChange(allColumns.map(col => col.name));
    };

    const handleDeselectAll = () => {
        onVisibleColumnsChange([allColumns[0].name]);
    };

    const visibleCount = visibleColumns.length;
    const totalCount = allColumns.length;

    return (
        <div ref={dropdownRef} className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={clsx(
                    'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    isOpen
                        ? 'bg-violet-100 text-violet-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-violet-600'
                )}
            >
                <Columns3 className="w-4 h-4" />
                <span>Columns</span>
                <span className="text-xs text-gray-500">
                    ({visibleCount}/{totalCount})
                </span>
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
                    <div className="p-3 border-b border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-900">Manage Columns</span>
                            <span className="text-xs text-gray-500">
                                {visibleCount} of {totalCount} shown
                            </span>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search columns..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-gray-50">
                        <button
                            type="button"
                            onClick={handleSelectAll}
                            className="text-xs font-medium text-violet-600 hover:text-violet-700"
                        >
                            Select All
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                            type="button"
                            onClick={handleDeselectAll}
                            className="text-xs font-medium text-gray-600 hover:text-gray-700"
                        >
                            Deselect All
                        </button>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {filteredColumns.length === 0 ? (
                            <div className="px-3 py-4 text-sm text-gray-500 text-center">
                                No columns found
                            </div>
                        ) : (
                            <div className="p-2">
                                {filteredColumns.map((column) => {
                                    const isVisible = visibleColumns.includes(column.name);
                                    const isOnlyVisible = visibleColumns.length === 1 && isVisible;

                                    return (
                                        <button
                                            key={column.name}
                                            type="button"
                                            onClick={() => handleToggleColumn(column.name)}
                                            disabled={isOnlyVisible}
                                            className={clsx(
                                                'w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors',
                                                isVisible
                                                    ? 'bg-violet-50 text-violet-900'
                                                    : 'text-gray-700 hover:bg-gray-50',
                                                isOnlyVisible && 'opacity-50 cursor-not-allowed'
                                            )}
                                        >
                                            <div className={clsx(
                                                'w-4 h-4 rounded border flex items-center justify-center flex-shrink-0',
                                                isVisible
                                                    ? 'bg-violet-600 border-violet-600'
                                                    : 'border-gray-300'
                                            )}>
                                                {isVisible && <Check className="w-3 h-3 text-white" />}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium truncate">
                                                    {formatTableName(column.name)}
                                                </div>
                                                <div className="text-xs text-gray-500 truncate">
                                                    {column.name} • {column.type}
                                                </div>
                                            </div>

                                            {isVisible ? (
                                                <Eye className="w-4 h-4 text-violet-600 flex-shrink-0" />
                                            ) : (
                                                <EyeOff className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
