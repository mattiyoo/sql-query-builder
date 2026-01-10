'use client';

import { useMemo } from 'react';
import { FormProvider } from 'react-hook-form';
import { MixpanelQueryBuilder } from '@/components/query-builder';
import { DataTable } from '@/components/data-table';
import { users } from '@/lib/dummy-data';
import { executeFilterGroups, filterGroupsToSql } from '@/lib/query-executor';
import type { User } from '@/commons/models/user.model';
import { LayoutGrid, Search, ChevronDown } from 'lucide-react';
import { useWatch } from 'react-hook-form';
import { sqlForm, type SqlFormValues } from '@/commons/forms/sql.form';

export default function Home() {
  const { form } = sqlForm();

  const searchValue = useWatch({ control: form.control, name: 'search' });
  const filterGroups = useWatch({ control: form.control, name: 'filterGroups' }) || [];

  const filteredData = useMemo(() => {
    const filteredByGroups = executeFilterGroups(users, filterGroups);
    const term = String(searchValue ?? '').trim().toLowerCase();
    if (!term) return filteredByGroups;

    return filteredByGroups.filter((u: User) => {
      return (
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.company.toLowerCase().includes(term) ||
        u.country.toLowerCase().includes(term)
      );
    });
  }, [filterGroups, searchValue]);

  const sqlPreview = useMemo(() => {
    return filterGroupsToSql(filterGroups);
  }, [filterGroups]);

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
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <span>Analyze Uniques by</span>
              <button className="flex items-center gap-1 text-gray-900 font-medium hover:text-violet-600">
                User
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          </div>

          <div className="grid gap-6">
            <div className='flex items-center justify-between'>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {filteredData.length}
                  </span>
                  <span className="text-sm text-gray-400">• Users with Profiles</span>
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
              </div>

            </div>
            <MixpanelQueryBuilder<SqlFormValues>
              control={form.control}
              name="filterGroups"
              numberOfUsers={users.length}
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
            />
          </div>
        </main>
      </div>
    </FormProvider>
  );
}
