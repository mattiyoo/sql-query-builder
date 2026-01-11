'use client';

import { useMemo, useState, useEffect } from 'react';
import { FormProvider } from 'react-hook-form';
import { MixpanelQueryBuilder } from '@/components/query-builder';
import { DataTable } from '@/components/data-table';
import { DatabaseConnectionModal } from '@/components/DatabaseConnection';
import { TableSelector } from '@/components/TableSelector';
import { ColumnManager } from '@/components/ColumnManager';
import { executeFilterGroups, filterGroupsToSql } from '@/lib/query-executor';
import type { DatabaseConnection, TableSchema } from '@/commons/models/database.model';
import { LayoutGrid, Search, ChevronDown } from 'lucide-react';
import { useWatch } from 'react-hook-form';
import { sqlForm, type SqlFormValues } from '@/commons/forms/sql.form';
import { singularizeTableName } from '@/lib/table-utils';

export default function Home() {
  const { form } = sqlForm();

  const [connection, setConnection] = useState<DatabaseConnection>({ type: 'default' });
  const [selectedTable, setSelectedTable] = useState<string>('users');
  const [tableSchema, setTableSchema] = useState<TableSchema | null>(null);

  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('dbConnection');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConnection(parsed);
      } catch (e) {
        console.error('Failed to parse saved connection:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (!selectedTable) return;

    async function fetchSchema() {
      try {
        const response = await fetch('/api/schema/columns', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            connectionString: connection.type === 'custom' ? connection.connectionString : undefined,
            tableName: selectedTable,
          }),
        });

        if (response.ok) {
          const schema = await response.json();
          setTableSchema(schema);

          if (schema.columns && schema.columns.length > 0) {
            setVisibleColumns(schema.columns.map((col: any) => col.name));
          }
        } else {
          console.error('Failed to fetch schema');
        }
      } catch (err) {
        console.error('Error fetching schema:', err);
      }
    }

    fetchSchema();
  }, [connection, selectedTable]);


  useEffect(() => {
    if (!selectedTable) return;

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            connectionString: connection.type === 'custom' ? connection.connectionString : undefined,
            tableName: selectedTable,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const result = await response.json();
        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [connection, selectedTable]);

  const searchValue = useWatch({ control: form.control, name: 'search' });
  const filterGroups = useWatch({ control: form.control, name: 'filterGroups' }) || [];

  const filteredData = useMemo(() => {
    const filteredByGroups = executeFilterGroups(data, filterGroups);
    const term = String(searchValue ?? '').trim().toLowerCase();
    if (!term) return filteredByGroups;

    return filteredByGroups.filter((row: any) => {
      return Object.values(row).some(value =>
        String(value).toLowerCase().includes(term)
      );
    });
  }, [filterGroups, searchValue, data]);

  const sqlPreview = useMemo(() => {
    const whereClause = filterGroupsToSql(filterGroups);
    const columnsStr = visibleColumns.length > 0
      ? visibleColumns.join(', ')
      : '*';

    const baseQuery = `SELECT ${columnsStr} FROM ${selectedTable}`;
    return whereClause ? `${baseQuery} WHERE ${whereClause}` : baseQuery;
  }, [filterGroups, visibleColumns, selectedTable]);

  return (
    <FormProvider {...form}>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
                    <LayoutGrid className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold text-gray-900">Query Builder</span>
                </div>
              </div>

              <DatabaseConnectionModal
                connection={connection}
                onConnectionChange={setConnection}
              />
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Loading data...</div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">Error: {error}</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <TableSelector
                    connection={connection}
                    selectedTable={selectedTable}
                    onTableChange={setSelectedTable}
                  />

                  <div className="text-sm text-gray-500">
                    {tableSchema && `${tableSchema.columns.length} columns`}
                  </div>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 capitalize">
                  {selectedTable}
                </h1>
              </div>

              <div className="grid gap-6">
                <div className='flex items-center justify-between'>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {filteredData.length}
                      </span>
                      <span className="text-sm text-gray-400">
                        • {singularizeTableName(selectedTable || 'users')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search"
                        {...form.register('search')}
                        className="w-64 pl-9 pr-4 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                      />
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                        ⌘K
                      </span>
                    </div>

                    <ColumnManager
                      schema={tableSchema}
                      visibleColumns={visibleColumns}
                      onVisibleColumnsChange={setVisibleColumns}
                    />
                  </div>
                </div>

                <MixpanelQueryBuilder<SqlFormValues>
                  control={form.control}
                  name="filterGroups"
                  numberOfUsers={data.length}
                  schema={tableSchema || undefined}
                  tableName={selectedTable || 'users'}
                />

                {filterGroups.length > 0 && filterGroups.some(g => g.filters && g.filters.length > 0) && (
                  <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
                    <div className="text-xs text-gray-400 mb-2">Generated SQL:</div>
                    <code className="text-sm text-emerald-400 font-mono">
                      {sqlPreview}
                    </code>
                  </div>
                )}

                <DataTable
                  data={filteredData}
                  schema={tableSchema}
                  visibleColumns={visibleColumns}
                  columnWidths={columnWidths}
                  onColumnWidthChange={(columnKey, width) => {
                    setColumnWidths(prev => ({ ...prev, [columnKey]: width }));
                  }}
                />
              </div>
            </>
          )}
        </main>
      </div>
    </FormProvider>
  );
}
