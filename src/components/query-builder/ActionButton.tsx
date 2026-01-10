'use client';

import type { ActionProps } from 'react-querybuilder';
import clsx from 'clsx';
import { Plus, Trash2, MoreVertical } from 'lucide-react';

export function ActionButton(props: ActionProps) {
    const { label, handleOnClick, disabled, className, title } = props;

    const isAddButton = title?.toLowerCase().includes('add') ||
        String(label).toLowerCase().includes('add') ||
        String(label).toLowerCase().includes('filter') ||
        String(label) === '+';

    const isRemoveButton = title?.toLowerCase().includes('remove') ||
        title?.toLowerCase().includes('delete') ||
        String(label).toLowerCase().includes('remove') ||
        String(label).toLowerCase().includes('delete') ||
        String(label) === '×' ||
        String(label) === 'x';

    if (isAddButton) {
        return (
            <button
                type="button"
                onClick={(e) => handleOnClick(e)}
                disabled={disabled}
                title={title}
                className={clsx(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg',
                    'text-sm font-medium',
                    'transition-all duration-150',
                    disabled
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-violet-600 hover:bg-violet-50 hover:text-violet-700',
                    className
                )}
            >
                <Plus className='w-4 h-4' />
                <span>{typeof label === 'string' && label !== '+' ? label : 'Filter'}</span>
            </button>
        );
    }

    if (isRemoveButton) {
        return (
            <button
                type="button"
                onClick={(e) => handleOnClick(e)}
                disabled={disabled}
                title={title || 'Remove'}
                className={clsx(
                    'flex items-center justify-center w-8 h-8 rounded-lg',
                    'transition-all duration-150',
                    disabled
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-400 hover:bg-red-50 hover:text-red-500',
                    className
                )}
            >
                <Trash2 className='w-4 h-4' />
            </button>
        );
    }

    return (
        <button
            type="button"
            onClick={(e) => handleOnClick(e)}
            disabled={disabled}
            title={title}
            className={clsx(
                'flex items-center gap-1 px-3 py-1.5 rounded-lg',
                'text-sm font-medium',
                'transition-all duration-150',
                disabled
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-100',
                className
            )}
        >
            {label}
        </button>
    );
}

export function MoreOptionsButton({ onClick }: { onClick?: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={clsx(
                'flex items-center justify-center w-8 h-8 rounded-lg',
                'text-gray-400 hover:bg-gray-100 hover:text-gray-600',
                'transition-all duration-150'
            )}
            title="More options"
        >
            <MoreVertical className='w-4 h-4' />
        </button>
    );
}
