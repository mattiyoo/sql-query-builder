'use client';

import type { ValueEditorProps } from 'react-querybuilder';
import { fields } from '@/commons/models/query-model';
import clsx from 'clsx';

export function ValueEditor(props: ValueEditorProps) {
    const {
        value,
        handleOnChange,
        field,
        operator,
        inputType,
        disabled,
        className,
    } = props;

    const fieldData = fields.find(f => f.name === field);
    const fieldType = fieldData?.fieldType || 'text';

    if (operator === 'last') {
        return (
            <div className={clsx('flex items-center gap-2', className)}>
                <input
                    type="number"
                    value={value ?? ''}
                    onChange={(e) => handleOnChange(e.target.value)}
                    disabled={disabled}
                    placeholder="7"
                    min={1}
                    className={clsx(
                        'w-16 px-3 py-1.5 rounded-lg border text-sm',
                        'focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100',
                        'transition-all duration-150',
                        disabled
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white border-gray-200'
                    )}
                />
                <span className="text-sm text-gray-500">days</span>
            </div>
        );
    }

    if (operator === 'between' || operator === 'notBetween') {
        const values = Array.isArray(value) ? value : (value ? String(value).split(',') : ['', '']);

        return (
            <div className={clsx('flex items-center gap-2', className)}>
                <input
                    type={fieldType === 'date' ? 'date' : 'number'}
                    value={values[0] ?? ''}
                    onChange={(e) => handleOnChange([e.target.value, values[1] ?? ''])}
                    disabled={disabled}
                    placeholder={fieldType === 'date' ? '' : 'Min'}
                    className={clsx(
                        'w-24 px-3 py-1.5 rounded-lg border text-sm',
                        'focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100',
                        'transition-all duration-150',
                        disabled
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white border-gray-200'
                    )}
                />
                <span className="text-sm text-gray-400">and</span>
                <input
                    type={fieldType === 'date' ? 'date' : 'number'}
                    value={values[1] ?? ''}
                    onChange={(e) => handleOnChange([values[0] ?? '', e.target.value])}
                    disabled={disabled}
                    placeholder={fieldType === 'date' ? '' : 'Max'}
                    className={clsx(
                        'w-24 px-3 py-1.5 rounded-lg border text-sm',
                        'focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100',
                        'transition-all duration-150',
                        disabled
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white border-gray-200'
                    )}
                />
            </div>
        );
    }

    if (operator === 'null' || operator === 'notNull') {
        return null;
    }
    const getInputType = () => {
        if (inputType) return inputType;
        if (fieldType === 'number') return 'number';
        if (fieldType === 'date') return 'date';
        return 'text';
    };

    const getPlaceholder = () => {
        if (fieldType === 'number') return 'Enter number...';
        if (fieldType === 'date') return '';
        return 'Enter value... ds';
    };

    return (
        <input
            type={getInputType()}
            value={value ?? ''}
            onChange={(e) => handleOnChange(e.target.value)}
            disabled={disabled}
            placeholder={getPlaceholder()}
            className={clsx(
                'min-w-[150px] px-3 py-1.5 rounded-lg border text-sm',
                'focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100',
                'transition-all duration-150',
                disabled
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white border-gray-200',
                className
            )}
        />
    );
}
