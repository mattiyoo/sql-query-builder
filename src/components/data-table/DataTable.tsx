'use client';

import { useMemo } from 'react';
import type { User } from '@/commons/models/user.model';
import type { TableSchema } from '@/commons/models/database.model';
import clsx from 'clsx';
import { Inbox } from 'lucide-react';
import { ColumnResizeHandle } from './ColumnResizeHandle';

interface DataTableProps {
    data: User[] | any[];
    isLoading?: boolean;
    schema?: TableSchema | null;
    visibleColumns?: string[];
    columnWidths?: Record<string, number>;
    onColumnWidthChange?: (columnKey: string, width: number) => void;
}

export function DataTable({ data, isLoading, schema, visibleColumns, columnWidths, onColumnWidthChange }: DataTableProps) {
    const allColumns = useMemo(() => {
        if (schema) {
            return schema.columns.map(col => ({
                key: col.name,
                label: col.name.split('_').map(word =>
                    word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' '),
                type: col.queryBuilderType,
            }));
        }

        if (data.length > 0) {
            return Object.keys(data[0]).map(key => ({
                key,
                label: key.split('_').map(word =>
                    word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' '),
                type: 'text' as const,
            }));
        }

        return [];
    }, [schema, data]);

    const columns = useMemo(() => {
        if (!visibleColumns || visibleColumns.length === 0) {
            return allColumns;
        }
        return allColumns.filter(col => visibleColumns.includes(col.key));
    }, [allColumns, visibleColumns]);

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto max-h-[calc(100vh-432px)]">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider relative"
                                    style={{
                                        width: columnWidths?.[column.key] || 'auto',
                                        minWidth: columnWidths?.[column.key] || 80,
                                    }}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-nowrap">{column.label}</span>
                                        {onColumnWidthChange && (
                                            <ColumnResizeHandle
                                                columnKey={column.key}
                                                onResize={(width) => onColumnWidthChange(column.key, width)}
                                            />
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={`skeleton-${i}`}>
                                    {columns.map((column) => (
                                        <td key={column.key} className="px-4 py-3">
                                            <div className="h-4 bg-gray-200 rounded animate-pulse" />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : data.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="px-4 py-12 text-center text-gray-500"
                                >
                                    <div className="flex flex-col items-center gap-2">
                                        <Inbox className="w-12 h-12 text-gray-300" />
                                        <p className="text-sm font-medium">No matching users</p>
                                        <p className="text-xs">Try adjusting your filters</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            data.map((user) => (
                                <tr
                                    key={user.id}
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    {columns.map((column) => (
                                        <td
                                            key={column.key}
                                            className="px-4 py-3 text-sm text-gray-900 text-nowrap"
                                        >
                                            {formatCellValue(column.key, column.type, user[column.key])}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function formatCellValue(key: string, type: string, value: unknown): string {
    if (value === null || value === undefined) {
        return '—';
    }

    if (type === 'number') {
        return Number(value).toLocaleString();
    }

    if (type === 'date') {
        try {
            return new Date(value as string).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch {
            return String(value);
        }
    }

    if (type === 'boolean') {
        return value ? 'Yes' : 'No';
    }

    return String(value);
}

