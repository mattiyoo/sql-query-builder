import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function POST(request: NextRequest) {
    let pool: Pool | null = null;

    try {
        const body = await request.json();
        const { tableName, limit, offset } = body;

        if (!tableName) {
            return NextResponse.json(
                { error: 'tableName is required' },
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

        const validateResult = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
        `, [tableName]);

        if (validateResult.rows.length === 0) {
            return NextResponse.json(
                { error: `Table "${tableName}" not found` },
                { status: 404 }
            );
        }

        let sql = `SELECT * FROM "${tableName}" ORDER BY 1`;
        const params: any[] = [];

        if (limit) {
            sql += ` LIMIT $${params.length + 1}`;
            params.push(parseInt(String(limit)));
        }

        if (offset) {
            sql += ` OFFSET $${params.length + 1}`;
            params.push(parseInt(String(offset)));
        }

        const result = await pool.query(sql, params);

        const rows = result.rows.map((row: any) => {
            const converted: any = { ...row };

            if (row.last_active !== undefined) {
                converted.lastActive = row.last_active;
            }
            if (row.created_at !== undefined) {
                converted.createdAt = row.created_at;
            }
            if (row.updated_at !== undefined) {
                converted.updatedAt = row.updated_at;
            }

            return converted;
        });

        return NextResponse.json({
            data: rows,
            total: result.rowCount,
            tableName,
        });
    } catch (error) {
        console.error('Error executing query:', error);
        return NextResponse.json(
            {
                error: 'Failed to execute query',
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
