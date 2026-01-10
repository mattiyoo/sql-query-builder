import * as yup from 'yup';
import { baseForm } from './base.form';
import type { Filter, FilterField, FilterOperator, FilterGroup, CombinatorType } from '@/commons/models/filter.model';
import { DEFAULT_FILTER_GROUP } from '@/commons/models/filter.model';

const filterSchema = yup.object({
  property: yup.string<FilterField>().required('Property is required'),
  operator: yup.string<FilterOperator>().required('Operator is required'),
  value: yup.mixed().nullable(),
  combinator: yup.string<'and' | 'or'>().optional(),
});

const filterGroupSchema = yup.object({
  filters: yup.array().of(filterSchema).default([]),
  combinator: yup.string<'and' | 'or'>().optional(),
});

export const sqlFormSchema = yup.object({
  search: yup.string().default(''),
  filterGroups: yup.array().of(filterGroupSchema).default([DEFAULT_FILTER_GROUP]),
});

export interface SqlFormValues {
  search: string;
  filterGroups: FilterGroup[];
}

export const sqlFormDefaults: SqlFormValues = {
  search: '',
  filterGroups: [DEFAULT_FILTER_GROUP],
};

export const sqlForm = baseForm<SqlFormValues>({
  schema: sqlFormSchema,
  defaultValues: sqlFormDefaults,
});
