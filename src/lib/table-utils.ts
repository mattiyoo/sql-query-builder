export function formatTableName(tableName: string): string {
    return tableName
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export function singularizeTableName(tableName: string): string {
    const formatted = formatTableName(tableName);

    if (formatted.endsWith('ies')) {
        return formatted.slice(0, -3) + 'y';
    }
    if (formatted.endsWith('ses') || formatted.endsWith('ches') || formatted.endsWith('xes')) {
        return formatted.slice(0, -2);
    }
    if (formatted.endsWith('s')) {
        return formatted.slice(0, -1);
    }

    return formatted;
}

export function pluralizeTableName(tableName: string): string {
    return formatTableName(tableName);
}
