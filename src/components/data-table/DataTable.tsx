'use client';

import type { User } from '@/commons/models/user.model';
import clsx from 'clsx';
import { Inbox } from 'lucide-react';

interface DataTableProps {
    data: User[];
    isLoading?: boolean;
}

export function DataTable({ data, isLoading }: DataTableProps) {
    const columns: { key: keyof User; label: string; width?: string }[] = [
        { key: 'name', label: 'Name', width: 'w-40' },
        { key: 'email', label: 'Email', width: 'w-48' },
        { key: 'company', label: 'Company', width: 'w-40' },
        { key: 'country', label: 'Country', width: 'w-24' },
        { key: 'employees', label: '# Employees', width: 'w-28' },
        { key: 'age', label: 'Age', width: 'w-16' },
        { key: 'created', label: 'Created', width: 'w-28' },
        { key: 'lastActive', label: 'Last Active', width: 'w-28' },
    ];

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto max-h-[calc(100vh-432px)]">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className={clsx(
                                        'px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider',
                                        column.width
                                    )}
                                >
                                    {column.label}
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
                                            className={clsx(
                                                'px-4 py-3 text-sm text-gray-900',
                                                column.width
                                            )}
                                        >
                                            {formatCellValue(column.key, user[column.key])}
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

function formatCellValue(key: keyof User, value: unknown): string {
    if (value === null || value === undefined) {
        return '—';
    }

    if (key === 'employees' || key === 'revenue') {
        return Number(value).toLocaleString();
    }

    if (key === 'created' || key === 'lastActive') {
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

    return String(value);
}
