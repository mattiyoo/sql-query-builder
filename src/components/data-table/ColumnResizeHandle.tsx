'use client';

import { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';

interface ColumnResizeHandleProps {
    columnKey: string;
    onResize: (width: number) => void;
    minWidth?: number;
    maxWidth?: number;
}

export function ColumnResizeHandle({
    columnKey,
    onResize,
    minWidth = 80,
    maxWidth = 600,
}: ColumnResizeHandleProps) {
    const [isDragging, setIsDragging] = useState(false);
    const startXRef = useRef<number>(0);
    const startWidthRef = useRef<number>(0);

    useEffect(() => {
        if (!isDragging) return;

        const handleMouseMove = (e: MouseEvent) => {
            const deltaX = e.clientX - startXRef.current;
            const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidthRef.current + deltaX));
            onResize(newWidth);
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, minWidth, maxWidth, onResize]);

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const th = (e.target as HTMLElement).closest('th');
        if (th) {
            startXRef.current = e.clientX;
            startWidthRef.current = th.offsetWidth;
            setIsDragging(true);
        }
    };

    return (
        <div
            onMouseDown={handleMouseDown}
            className={clsx(
                'absolute right-0 top-0 bottom-0 w-1 cursor-col-resize group',
                'hover:bg-violet-400 transition-colors',
                isDragging && 'bg-violet-500'
            )}
        >
            <div className={clsx(
                'absolute right-0 top-0 bottom-0 w-1',
                'group-hover:w-1 transition-all',
                isDragging && 'w-1 bg-violet-500'
            )} />
        </div>
    );
}
