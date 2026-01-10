export type FilterField =
  | 'all'
  | 'name'
  | 'email'
  | 'company'
  | 'country'
  | 'employees'
  | 'age'
  | 'created'
  | 'lastActive';

export interface FilterFieldMeta {
  value: FilterField;
  label: string;
  type: 'text' | 'number' | 'date' | 'boolean';
  category: 'All' | 'User' | 'Company';
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

export function getFieldMeta(field: FilterField): FilterFieldMeta {
  return FILTER_FIELDS.find(f => f.value === field) || FILTER_FIELDS[0];
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
