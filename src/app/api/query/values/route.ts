import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function POST(request: NextRequest) {
    let pool: Pool | null = null;

    try {
        const body = await request.json();
        const { tableName, columnName, limit = 100 } = body;

        if (!tableName || !columnName) {
            return NextResponse.json(
                { error: 'tableName and columnName are required' },
                { status: 400 }
            );
        }

        const connectionString = body.connectionString ||
            process.env.SQB_POSTGRES_URL ||
            process.env.SQB_DATABASE_URL;

        if (!connectionString) {
            return NextResponse.json(
                { error: 'No database connection configured' },
                { status: 400 }
            );
        }

        pool = new Pool({
            connectionString,
            ssl: connectionString.includes('sslmode=require') ? {
                rejectUnauthorized: false
            } : undefined,
        });

        const validateTableResult = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
        `, [tableName]);

        if (validateTableResult.rows.length === 0) {
            return NextResponse.json(
                { error: `Table "${tableName}" not found` },
                { status: 404 }
            );
        }

        const validateColumnResult = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = $1 
            AND column_name = $2
        `, [tableName, columnName]);

        if (validateColumnResult.rows.length === 0) {
            return NextResponse.json(
                { error: `Column "${columnName}" not found in table "${tableName}"` },
                { status: 404 }
            );
        }

        const sql = `
            SELECT DISTINCT "${columnName}" as value
            FROM "${tableName}"
            WHERE "${columnName}" IS NOT NULL
            ORDER BY "${columnName}"
            LIMIT $1
        `;

        const result = await pool.query(sql, [limit]);

        const values = result.rows.map(row => row.value);

        return NextResponse.json({ values });
    } catch (error) {
        console.error('Error fetching column values:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch column values',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    } finally {
        if (pool) {
            await pool.end();
        }
    }
}
