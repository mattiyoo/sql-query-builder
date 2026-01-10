'use client';

import { Controller, type Control, type FieldValues, type Path, useFieldArray, useWatch } from 'react-hook-form';
import clsx from 'clsx';
import { Plus } from 'lucide-react';
import { FilterGroup } from './FilterGroup';
import { CombinatorSelector, CombinatorSelectorToggle } from './CombinatorSelector';
import { DEFAULT_FILTER_GROUP, type CombinatorType } from '@/commons/models/filter.model';
import type { SqlFormValues } from '@/commons/forms/sql.form';

interface MixpanelQueryBuilderProps<TFieldValues extends FieldValues = FieldValues> {
  control?: Control<TFieldValues>;
  name?: Path<TFieldValues>;
  numberOfUsers?: number;
  subtitle?: string;
}

export function MixpanelQueryBuilder<TFieldValues extends FieldValues = FieldValues>({
  control,
  name = 'filterGroups' as Path<TFieldValues>,
  numberOfUsers,
}: MixpanelQueryBuilderProps<TFieldValues>) {
  if (!control) {
    throw new Error('MixpanelQueryBuilder requires a control prop from react-hook-form');
  }

  const { fields, append, remove } = useFieldArray({
    control,
    name: name as any,
  });

  const handleAddGroup = () => {
    append(DEFAULT_FILTER_GROUP as any);
  };

  const handleRemoveGroup = (index: number) => {
    remove(index);
  };

  return (
    <div className="space-y-4">

      {fields.length === 0 ? (
        <></>
      ) : (
        <FilterGroupsList
          fields={fields}
          control={control}
          numberOfUsers={numberOfUsers || 0}
        />
      )}

      <div className="flex justify-start">
        <button
          type="button"
          onClick={handleAddGroup}
          className={clsx(
            'flex items-center justify-center gap-2',
            'p-2 rounded-lg',
            'text-sm font-medium',
            'transition-all duration-150',
            'cursor-pointer',
            'text-gray-600 hover:bg-gray-50 hover:text-violet-600'
          )}
        >
          <Plus className="w-4 h-4" />
          <span>Group</span>
        </button>
      </div>
    </div>
  );
}

function GroupCombinatorSelectorComponent<TFieldValues extends FieldValues = SqlFormValues>({
  groupIndex,
  control,
}: {
  groupIndex: number;
  control: Control<TFieldValues>;
}) {
  return (
    <Controller
      control={control}
      name={`filterGroups.${groupIndex}.combinator` as Path<TFieldValues>}
      render={({ field }) => (
        <CombinatorSelectorToggle
          value={(field.value || 'and') as CombinatorType}
          onChange={field.onChange}
        />
      )}
    />
  );
}

const GroupCombinatorSelector = GroupCombinatorSelectorComponent;

function FilterGroupsList<TFieldValues extends FieldValues = SqlFormValues>({
  fields,
  control,
  numberOfUsers,
}: {
  fields: Array<{ id: string }>;
  control: Control<TFieldValues>;
  numberOfUsers: number;
}) {
  const filterGroups = useWatch({
    control: control as any,
    name: 'filterGroups' as any,
    defaultValue: [],
  }) as Array<{ combinator?: CombinatorType }> | undefined;

  return (
    <div className="">
      {fields.map((group, index) => {
        const isFirst = index === 0;
        const combinator = filterGroups?.[index]?.combinator || 'and';
        const nextCombinator = index < fields.length - 1 ? (filterGroups?.[index + 1]?.combinator || 'and') : null;

        const isConnectedToPrev = index > 0 && combinator === 'and';

        const isConnectedToNext = index < fields.length - 1 && nextCombinator === 'and';
        const shouldStartNewContainer = index === 0 || combinator === 'or';
        const shouldEndContainer = index === fields.length - 1 ||
          (index < fields.length - 1 && (filterGroups?.[index + 1]?.combinator || 'and') === 'or');

        return (
          <div key={group.id}>
            {!isFirst && combinator === 'or' && (
              <div className="flex justify-center my-6">
                <GroupCombinatorSelector
                  groupIndex={index}
                  control={control}
                />
              </div>
            )}

            <div
              className={clsx(
                'bg-white border border-gray-200 shadow-sm',
                shouldStartNewContainer && 'rounded-t-xl',
                shouldEndContainer && 'rounded-b-xl',
                isConnectedToPrev && 'border-t-0'
              )}
            >
              {isConnectedToPrev && (
                <div className="relative h-0">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gray-200"></div>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="bg-white px-2">
                      <GroupCombinatorSelector
                        groupIndex={index}
                        control={control}
                      />
                    </div>
                  </div>
                </div>
              )}

              <FilterGroup
                groupIndex={index}
                isFirstGroup={isFirst}
                isConnected={true}
                isFirst={isFirst}
                isLast={index === fields.length - 1}
                isConnectedToNext={isConnectedToNext}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
