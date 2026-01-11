import type { TableSchema } from './database.model';

export type FilterField = string;

export interface FilterFieldMeta {
  value: FilterField;
  label: string;
  type: 'text' | 'number' | 'date' | 'boolean';
  category: string;
}

export const FILTER_FIELDS: FilterFieldMeta[] = [
  { value: 'all', label: 'All', type: 'text', category: 'All' },
  { value: 'name', label: 'Name', type: 'text', category: 'User' },
  { value: 'email', label: 'Email', type: 'text', category: 'User' },
  { value: 'company', label: 'Company', type: 'text', category: 'Company' },
  { value: 'country', label: 'Country', type: 'text', category: 'User' },
  { value: 'employees', label: 'Employees', type: 'number', category: 'Company' },
  { value: 'age', label: 'Age', type: 'number', category: 'User' },
  { value: 'created', label: 'Created', type: 'date', category: 'User' },
  { value: 'lastActive', label: 'Last Active', type: 'date', category: 'User' },
];

export function getDynamicFieldMeta(field: FilterField, schema?: TableSchema): FilterFieldMeta {
  if (!schema) {
    return FILTER_FIELDS.find(f => f.value === field) || FILTER_FIELDS[1];
  }

  const column = schema.columns.find(col => col.name === field);
  if (!column) {
    const firstCol = schema.columns[0];
    return {
      value: firstCol.name,
      label: formatColumnLabel(firstCol.name),
      type: mapToFilterType(firstCol.queryBuilderType),
      category: 'Column',
    };
  }

  return {
    value: column.name,
    label: formatColumnLabel(column.name),
    type: mapToFilterType(column.queryBuilderType),
    category: getCategoryFromType(column.queryBuilderType),
  };
}

export function getDynamicFields(schema?: TableSchema): FilterFieldMeta[] {
  if (!schema) {
    return FILTER_FIELDS;
  }

  return schema.columns.map(col => ({
    value: col.name,
    label: formatColumnLabel(col.name),
    type: mapToFilterType(col.queryBuilderType),
    category: getCategoryFromType(col.queryBuilderType),
  }));
}

function mapToFilterType(dbType: string): 'text' | 'number' | 'date' | 'boolean' {
  if (dbType === 'select') return 'text';
  if (dbType === 'text' || dbType === 'number' || dbType === 'date' || dbType === 'boolean') {
    return dbType;
  }
  return 'text';
}

function formatColumnLabel(columnName: string): string {
  return columnName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getCategoryFromType(type: string): string {
  switch (type) {
    case 'number':
      return 'Numeric';
    case 'date':
      return 'Date';
    case 'boolean':
      return 'Boolean';
    default:
      return 'Text';
  }
}

export function getFieldMeta(field: FilterField, schema?: TableSchema): FilterFieldMeta {
  return getDynamicFieldMeta(field, schema);
}

export type FilterOperator =
  // String operators
  | '='
  | '!='
  | 'contains'
  | 'doesNotContain'
  | 'isSet'
  | 'isNotSet'
  // Number operators
  | '<'
  | '<='
  | '>'
  | '>='
  | 'between'
  | 'notBetween'
  | 'isNumeric'
  | 'isNotNumeric'
  // Date operators
  | 'last'
  | 'notInTheLast'
  | 'on'
  | 'notOn'
  | 'beforeTheLast'
  | 'before'
  | 'since'
  | 'inTheNext'
  // Null operators
  | 'null'
  | 'notNull'
  // Boolean operators
  | 'isTrue'
  | 'isFalse';

export interface OperatorMeta {
  value: FilterOperator;
  label: string;
}

export function getOperatorsForFieldType(fieldType: 'text' | 'number' | 'date' | 'boolean'): OperatorMeta[] {
  switch (fieldType) {
    case 'text':
      return [
        { value: '=', label: 'Is' },
        { value: '!=', label: 'Is not' },
        { value: 'contains', label: 'Contains' },
        { value: 'doesNotContain', label: 'Does not contain' },
        { value: 'isSet', label: 'Is set' },
        { value: 'isNotSet', label: 'Is not set' },
      ];
    case 'number':
      return [
        { value: '=', label: 'Equals' },
        { value: '!=', label: 'Not equal' },
        { value: '>', label: 'Greater than' },
        { value: '>=', label: 'Greater than or equal to' },
        { value: '<', label: 'Less than' },
        { value: '<=', label: 'Less than or equal to' },
        { value: 'between', label: 'Between' },
        { value: 'notBetween', label: 'Not between' },
        { value: 'isNumeric', label: 'Is numeric' },
        { value: 'isNotNumeric', label: 'Is not numeric' },
      ];
    case 'date':
      return [
        { value: 'last', label: 'Last' },
        { value: 'notInTheLast', label: 'Not in the last' },
        { value: 'between', label: 'Between' },
        { value: 'notBetween', label: 'Not between' },
        { value: 'on', label: 'On' },
        { value: 'notOn', label: 'Not on' },
        { value: 'beforeTheLast', label: 'Before the last' },
        { value: 'before', label: 'Before' },
        { value: 'since', label: 'Since' },
        { value: 'inTheNext', label: 'In the next' },
      ];
    case 'boolean':
      return [
        { value: 'isTrue', label: 'is True' },
        { value: 'isFalse', label: 'is False' },
      ];
  }
}

export function operatorRequiresValue(operator: FilterOperator): boolean {
  return ![
    'isSet',
    'isNotSet',
    'isNumeric',
    'isNotNumeric',
    'null',
    'notNull',
    'isTrue',
    'isFalse',
  ].includes(operator);
}

export type CombinatorType = 'and' | 'or';

export interface Filter {
  property: FilterField;
  operator: FilterOperator;
  value: string | number | [string, string] | null;
  combinator?: CombinatorType;
  overrideType?: 'text' | 'number' | 'date' | 'boolean';
}

export const DEFAULT_FILTER: Filter = {
  property: 'name',
  operator: '=',
  value: null,
};

export interface FilterGroup {
  filters: Filter[];
  combinator?: CombinatorType;
}

export const DEFAULT_FILTER_GROUP: FilterGroup = {
  filters: [],
  combinator: 'and',
};
