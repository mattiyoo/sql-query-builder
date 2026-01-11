'use client';

import { useState, useEffect } from 'react';
import { Table, ChevronDown } from 'lucide-react';
import type { DatabaseConnection } from '@/commons/models/database.model';

interface TableSelectorProps {
    connection: DatabaseConnection;
    selectedTable: string;
    onTableChange: (tableName: string) => void;
}

export function TableSelector({ connection, selectedTable, onTableChange }: TableSelectorProps) {
    const [tables, setTables] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchTables();
    }, [connection]);

    const fetchTables = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/schema/tables', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    connectionString: connection.type === 'custom' ? connection.connectionString : undefined,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setTables(data.tables);

                if (!selectedTable && data.tables.length > 0) {
                    onTableChange(data.tables[0]);
                }
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to fetch tables');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch tables');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isLoading}
                className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors min-w-[200px] disabled:opacity-50"
            >
                <Table className="w-4 h-4 text-gray-600" />
                <span className="flex-1 text-left text-sm font-medium text-gray-700">
                    {isLoading ? 'Loading tables...' : selectedTable || 'Select a table'}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && !isLoading && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />

                    <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto">
                        {error ? (
                            <div className="p-4 text-sm text-red-600">
                                {error}
                            </div>
                        ) : tables.length === 0 ? (
                            <div className="p-4 text-sm text-gray-500">
                                No tables found
                            </div>
                        ) : (
                            tables.map((table) => (
                                <button
                                    key={table}
                                    onClick={() => {
                                        onTableChange(table);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${table === selectedTable ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-700'
                                        }`}
                                >
                                    {table}
                                </button>
                            ))
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
