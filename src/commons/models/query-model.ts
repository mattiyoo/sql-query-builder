import type { Field } from 'react-querybuilder';

export type FieldCategory = 'User' | 'Company' | 'Event' | 'Document';


export interface MixpanelField extends Field {
    value: string;
    category: FieldCategory;
    fieldType: 'text' | 'number' | 'date';
}

export const fields: MixpanelField[] = [
    // User fields (string)
    {
        name: 'name',
        value: 'name',
        label: 'Name',
        inputType: 'text',
        category: 'User',
        fieldType: 'text',
    },
    {
        name: 'email',
        value: 'email',
        label: 'Email',
        inputType: 'text',
        category: 'User',
        fieldType: 'text',
    },
    {
        name: 'country',
        value: 'country',
        label: 'Country',
        inputType: 'text',
        category: 'User',
        fieldType: 'text',
    },

    // Company fields
    {
        name: 'company',
        value: 'company',
        label: 'Company',
        inputType: 'text',
        category: 'Company',
        fieldType: 'text',
    },
    {
        name: 'employees',
        value: 'employees',
        label: '# employees',
        inputType: 'number',
        category: 'Company',
        fieldType: 'number',
    },
    {
        name: 'revenue',
        value: 'revenue',
        label: 'Revenue',
        inputType: 'number',
        category: 'Company',
        fieldType: 'number',
    },

    // User numeric fields
    {
        name: 'age',
        value: 'age',
        label: 'Age',
        inputType: 'number',
        category: 'User',
        fieldType: 'number',
    },

    // Date fields
    {
        name: 'created',
        value: 'created',
        label: 'Created',
        inputType: 'date',
        category: 'User',
        fieldType: 'date',
    },
    {
        name: 'lastActive',
        value: 'lastActive',
        label: 'Last Active',
        inputType: 'date',
        category: 'User',
        fieldType: 'date',
    },
];

export function getFieldsByCategory(): Record<FieldCategory, MixpanelField[]> {
    return fields.reduce((acc, field) => {
        if (!acc[field.category]) {
            acc[field.category] = [];
        }
        acc[field.category].push(field);
        return acc;
    }, {} as Record<FieldCategory, MixpanelField[]>);
}

export function getOperatorsForField(fieldName: string) {
    const field = fields.find(f => f.name === fieldName);

    if (!field) {
        return defaultOperators.text;
    }

    return defaultOperators[field.fieldType];
}

export const defaultOperators = {
    text: [
        { name: '=', label: 'is' },
        { name: '!=', label: 'is not' },
        { name: 'contains', label: 'contains' },
        { name: 'doesNotContain', label: 'does not contain' },
        { name: 'beginsWith', label: 'starts with' },
        { name: 'endsWith', label: 'ends with' },
        { name: 'null', label: 'is empty' },
        { name: 'notNull', label: 'is not empty' },
    ],
    number: [
        { name: '=', label: 'equals' },
        { name: '!=', label: 'does not equal' },
        { name: '<', label: 'less than' },
        { name: '<=', label: 'less than or equal' },
        { name: '>', label: 'greater than' },
        { name: '>=', label: 'greater than or equal' },
        { name: 'between', label: 'between' },
        { name: 'notBetween', label: 'not between' },
    ],
    date: [
        { name: '=', label: 'is' },
        { name: '!=', label: 'is not' },
        { name: '<', label: 'before' },
        { name: '>', label: 'after' },
        { name: 'between', label: 'between' },
        { name: 'last', label: 'in the last' },
        { name: 'null', label: 'is empty' },
        { name: 'notNull', label: 'is not empty' },
    ],
};
