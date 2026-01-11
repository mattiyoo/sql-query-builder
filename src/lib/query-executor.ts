import type { User } from '@/commons/models/user.model';
import type { Filter, FilterGroup } from '@/commons/models/filter.model';
import { isAfter, isBefore, subDays, parseISO, isWithinInterval } from 'date-fns';

export function executeFilters(data: User[], filters: Filter[]): User[] {
  if (!filters || filters.length === 0) {
    return data;
  }
  return data.filter(user => {
    let result = evaluateFilter(user, filters[0]);
    for (let i = 1; i < filters.length; i++) {
      const filter = filters[i];
      const combinator = filter.combinator || 'and';
      const filterResult = evaluateFilter(user, filter);

      if (combinator === 'and') {
        result = result && filterResult;
      } else if (combinator === 'or') {
        result = result || filterResult;
      }
    }

    return result;
  });
}

function evaluateFilter(user: User, filter: Filter): boolean {
  const { property, operator, value } = filter;

  if (property === 'all') {
    return true;
  }

  const fieldValue = user[property as keyof User];

  switch (operator) {
    case 'null':
    case 'isNotSet':
      return fieldValue === null || fieldValue === undefined || fieldValue === '';
    case 'notNull':
    case 'isSet':
      return fieldValue !== null && fieldValue !== undefined && fieldValue !== '';
    case 'isNumeric':
      return !isNaN(Number(fieldValue)) && fieldValue !== null && fieldValue !== undefined;
    case 'isNotNumeric':
      return isNaN(Number(fieldValue)) || fieldValue === null || fieldValue === undefined;
  }

  if (value === undefined || value === null || value === '') {
    return true;
  }

  switch (operator) {
    // Equality operators
    case '=':
      if (Array.isArray(value)) {
        return value.some(v => String(fieldValue).toLowerCase() === String(v).toLowerCase());
      }
      return String(fieldValue).toLowerCase() === String(value).toLowerCase();
    case '!=':
      if (Array.isArray(value)) {
        return !value.some(v => String(fieldValue).toLowerCase() === String(v).toLowerCase());
      }
      return String(fieldValue).toLowerCase() !== String(value).toLowerCase();

    // String operators
    case 'contains':
      return String(fieldValue).toLowerCase().includes(String(value).toLowerCase());
    case 'doesNotContain':
      return !String(fieldValue).toLowerCase().includes(String(value).toLowerCase());

    // Numeric comparison operators
    case '<':
      return Number(fieldValue) < Number(value);
    case '<=':
      return Number(fieldValue) <= Number(value);
    case '>':
      return Number(fieldValue) > Number(value);
    case '>=':
      return Number(fieldValue) >= Number(value);

    // Range operators
    case 'between':
      return handleBetween(fieldValue, value);
    case 'notBetween':
      return !handleBetween(fieldValue, value);

    // Date operators
    case 'last':
      return handleLastDays(fieldValue as string, value, false);
    case 'notInTheLast':
      return !handleLastDays(fieldValue as string, value, false);
    case 'beforeTheLast':
      return handleLastDays(fieldValue as string, value, true);
    case 'on':
      return handleOnDate(fieldValue as string, value as string);
    case 'notOn':
      return !handleOnDate(fieldValue as string, value as string);
    case 'before':
      return handleBeforeDate(fieldValue as string, value as string);
    case 'since':
      return handleSinceDate(fieldValue as string, value as string);
    case 'inTheNext':
      return handleInTheNext(fieldValue as string, value);

    default:
      console.warn(`Unknown operator: ${operator}`);
      return true;
  }
}

function handleBetween(fieldValue: unknown, value: unknown): boolean {
  let min: number | string, max: number | string;

  if (Array.isArray(value) && value.length === 2) {
    [min, max] = value;
  } else {
    return true;
  }

  const fieldVal = typeof fieldValue === 'number' ? fieldValue : parseValue(fieldValue);
  const minVal = typeof min === 'number' ? min : parseValue(min);
  const maxVal = typeof max === 'number' ? max : parseValue(max);

  return fieldVal >= minVal && fieldVal <= maxVal;
}

function handleLastDays(fieldValue: string, value: unknown, before: boolean = false): boolean {
  try {
    const date = parseISO(fieldValue);
    const days = typeof value === 'number' ? value : Number(value);
    const cutoffDate = subDays(new Date(), days);

    if (before) {
      return isBefore(date, cutoffDate);
    }
    return isAfter(date, cutoffDate);
  } catch {
    return false;
  }
}

function handleOnDate(fieldValue: string, value: string): boolean {
  try {
    const date = parseISO(fieldValue);
    const targetDate = parseISO(value);
    return (
      date.getFullYear() === targetDate.getFullYear() &&
      date.getMonth() === targetDate.getMonth() &&
      date.getDate() === targetDate.getDate()
    );
  } catch {
    return false;
  }
}

function handleBeforeDate(fieldValue: string, value: string): boolean {
  try {
    const date = parseISO(fieldValue);
    const targetDate = parseISO(value);
    return isBefore(date, targetDate);
  } catch {
    return false;
  }
}

function handleSinceDate(fieldValue: string, value: string): boolean {
  try {
    const date = parseISO(fieldValue);
    const targetDate = parseISO(value);
    return isAfter(date, targetDate) || handleOnDate(fieldValue, value);
  } catch {
    return false;
  }
}

function handleInTheNext(fieldValue: string, value: unknown): boolean {
  try {
    const date = parseISO(fieldValue);
    const days = typeof value === 'number' ? value : Number(value);
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    return isWithinInterval(date, { start: today, end: futureDate });
  } catch {
    return false;
  }
}

function parseValue(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const date = parseISO(value);
    if (!isNaN(date.getTime())) {
      return date.getTime();
    }
    return Number(value) || 0;
  }
  return 0;
}

export function filtersToSql(filters: Filter[]): string {
  if (!filters || filters.length === 0) {
    return 'SELECT * FROM users';
  }

  const parts: string[] = [];

  filters.forEach((filter, index) => {
    if (filter.property === 'all') return;

    const sql = filterToSql(filter);
    if (!sql) return;

    if (index === 0) {
      parts.push(sql);
    } else {
      const combinator = filter.combinator || 'and';
      parts.push(combinator.toUpperCase(), sql);
    }
  });

  if (parts.length === 0) {
    return 'SELECT * FROM users';
  }

  return `SELECT * FROM users WHERE ${parts.join(' ')}`;
}

function filterToSql(filter: Filter): string {
  const { property, operator, value } = filter;

  if (property === 'all') return '';

  switch (operator) {
    case '=':
      if (Array.isArray(value)) {
        const values = value.map(v => `'${v}'`).join(', ');
        return `${property} IN (${values})`;
      }
      return `${property} = '${value}'`;
    case '!=':
      if (Array.isArray(value)) {
        const values = value.map(v => `'${v}'`).join(', ');
        return `${property} NOT IN (${values})`;
      }
      return `${property} != '${value}'`;
    case 'contains':
      return `${property} LIKE '%${value}%'`;
    case 'doesNotContain':
      return `${property} NOT LIKE '%${value}%'`;
    case '<':
    case '<=':
    case '>':
    case '>=':
      return `${property} ${operator} ${value}`;
    case 'null':
    case 'isNotSet':
      return `${property} IS NULL`;
    case 'notNull':
    case 'isSet':
      return `${property} IS NOT NULL`;
    case 'isNumeric':
      return `ISNUMERIC(${property}) = 1`;
    case 'isNotNumeric':
      return `ISNUMERIC(${property}) = 0`;
    case 'between':
      if (Array.isArray(value) && value.length === 2) {
        return `${property} BETWEEN '${value[0]}' AND '${value[1]}'`;
      }
      return '';
    case 'notBetween':
      if (Array.isArray(value) && value.length === 2) {
        return `${property} NOT BETWEEN '${value[0]}' AND '${value[1]}'`;
      }
      return '';
    case 'last':
      return `${property} > DATE_SUB(NOW(), INTERVAL ${value} DAY)`;
    case 'notInTheLast':
      return `${property} <= DATE_SUB(NOW(), INTERVAL ${value} DAY)`;
    case 'beforeTheLast':
      return `${property} < DATE_SUB(NOW(), INTERVAL ${value} DAY)`;
    case 'on':
      return `DATE(${property}) = DATE('${value}')`;
    case 'notOn':
      return `DATE(${property}) != DATE('${value}')`;
    case 'before':
      return `${property} < '${value}'`;
    case 'since':
      return `${property} >= '${value}'`;
    case 'inTheNext':
      return `${property} BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL ${value} DAY)`;
    default:
      return `${property} ${operator} '${value}'`;
  }
}

export function executeFilterGroups(data: User[], filterGroups: FilterGroup[]): User[] {
  if (!filterGroups || filterGroups.length === 0) {
    return data;
  }

  return data.filter(user => {
    let result = evaluateFilterGroup(user, filterGroups[0]);

    for (let i = 1; i < filterGroups.length; i++) {
      const group = filterGroups[i];
      const combinator = group.combinator || 'and';
      const groupResult = evaluateFilterGroup(user, group);

      if (combinator === 'and') {
        result = result && groupResult;
      } else if (combinator === 'or') {
        result = result || groupResult;
      }
    }

    return result;
  });
}

function evaluateFilterGroup(user: User, group: FilterGroup): boolean {
  const { filters } = group;

  if (!filters || filters.length === 0) {
    return true;
  }

  let result = evaluateFilter(user, filters[0]);

  for (let i = 1; i < filters.length; i++) {
    const filter = filters[i];
    const combinator = filter.combinator || 'and';
    const filterResult = evaluateFilter(user, filter);

    if (combinator === 'and') {
      result = result && filterResult;
    } else if (combinator === 'or') {
      result = result || filterResult;
    }
  }

  return result;
}

export function filterGroupsToSql(filterGroups: FilterGroup[]): string {
  if (!filterGroups || filterGroups.length === 0) {
    return '';
  }

  const groupSqls: string[] = [];

  filterGroups.forEach((group, groupIndex) => {
    const { filters } = group;

    if (!filters || filters.length === 0) return;

    const filterParts: string[] = [];

    filters.forEach((filter, filterIndex) => {
      if (filter.property === 'all') return;

      const sql = filterToSql(filter);
      if (!sql) return;

      if (filterIndex === 0) {
        filterParts.push(sql);
      } else {
        const combinator = filter.combinator || 'and';
        filterParts.push(combinator.toUpperCase(), sql);
      }
    });

    if (filterParts.length > 0) {
      groupSqls.push(`(${filterParts.join(' ')})`);

      if (groupIndex > 0) {
        const groupCombinator = group.combinator || 'and';
        groupSqls.splice(groupSqls.length - 1, 0, groupCombinator.toUpperCase());
      }
    }
  });

  if (groupSqls.length === 0) {
    return '';
  }

  if (groupSqls.length > 1 && (groupSqls[0] === 'AND' || groupSqls[0] === 'OR')) {
    groupSqls.shift();
  }

  return groupSqls.join(' ');
}

export { executeFilters as executeQuery };
export { filtersToSql as queryToSql };
