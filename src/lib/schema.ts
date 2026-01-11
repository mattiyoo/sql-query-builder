import { Pool } from 'pg';

export function mapPostgresToQueryBuilderType(pgType: string): 'text' | 'number' | 'date' | 'boolean' | 'select' {
    const type = pgType.toLowerCase();

    if (type.includes('int') || type.includes('serial') || type.includes('numeric') ||
        type.includes('decimal') || type.includes('real') || type.includes('double') ||
        type.includes('money')) {
        return 'number';
    }

    if (type.includes('date') || type.includes('time') || type.includes('timestamp')) {
        return 'date';
    }
    if (type.includes('bool')) {
        return 'boolean';
    }

    return 'text';
}

export interface ColumnDefinition {
    name: string;
    type: string;
    queryBuilderType: 'text' | 'number' | 'date' | 'boolean' | 'select';
    nullable: boolean;
    isPrimaryKey?: boolean;
}

export interface TableSchema {
    tableName: string;
    columns: ColumnDefinition[];
}

export async function getTables(connectionString: string): Promise<string[]> {
    const pool = new Pool({
        connectionString,
        ssl: connectionString.includes('sslmode=require') ? {
            rejectUnauthorized: false
        } : undefined,
    });

    try {
        const result = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
        `);

        return result.rows.map(row => row.table_name);
    } finally {
        await pool.end();
    }
}

export async function getTableSchema(connectionString: string, tableName: string): Promise<TableSchema> {
    const pool = new Pool({
        connectionString,
        ssl: connectionString.includes('sslmode=require') ? {
            rejectUnauthorized: false
        } : undefined,
    });

    try {
        const columnsResult = await pool.query(`
            SELECT 
                c.column_name,
                c.data_type,
                c.is_nullable,
                c.udt_name
            FROM information_schema.columns c
            WHERE c.table_schema = 'public' 
            AND c.table_name = $1
            ORDER BY c.ordinal_position
        `, [tableName]);

        const pkResult = await pool.query(`
            SELECT a.attname
            FROM pg_index i
            JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
            WHERE i.indrelid = $1::regclass
            AND i.indisprimary
        `, [tableName]);

        const primaryKeys = new Set(pkResult.rows.map(row => row.attname));

        const columns: ColumnDefinition[] = columnsResult.rows.map(row => ({
            name: row.column_name,
            type: row.data_type,
            queryBuilderType: mapPostgresToQueryBuilderType(row.udt_name || row.data_type),
            nullable: row.is_nullable === 'YES',
            isPrimaryKey: primaryKeys.has(row.column_name),
        }));

        return {
            tableName,
            columns,
        };
    } finally {
        await pool.end();
    }
}

export async function validateConnection(connectionString: string): Promise<{ valid: boolean; error?: string }> {
    const pool = new Pool({
        connectionString,
        ssl: connectionString.includes('sslmode=require') ? {
            rejectUnauthorized: false
        } : undefined,
    });

    try {
        await pool.query('SELECT 1');
        return { valid: true };
    } catch (error) {
        return {
            valid: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    } finally {
        await pool.end();
    }
}
