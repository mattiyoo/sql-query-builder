import { Pool, QueryResult, QueryResultRow } from 'pg';

let pool: Pool | null = null;

export function getPool(): Pool {
    if (!pool) {
        const connectionString =
            process.env.SQB_POSTGRES_URL ||
            process.env.SQB_DATABASE_URL;

        if (!connectionString) {
            throw new Error('Database connection string not found. Please set SQB_POSTGRES_URL or DATABASE_URL environment variable');
        }

        pool = new Pool({
            connectionString,
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 10000,
            ssl: process.env.NODE_ENV === 'production' ? {
                rejectUnauthorized: false
            } : undefined,
        });

        pool.on('error', (err) => {
            console.error('Unexpected error on idle client', err);
            process.exit(-1);
        });
    }

    return pool;
}

export async function query<T extends QueryResultRow = any>(
    text: string,
    params?: any[]
): Promise<QueryResult<T>> {
    const pool = getPool();
    const start = Date.now();

    try {
        const res = await pool.query<T>(text, params);
        const duration = Date.now() - start;
        console.log('Executed query', { text, duration, rows: res.rowCount });
        return res;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}

export async function closePool(): Promise<void> {
    if (pool) {
        await pool.end();
        pool = null;
    }
}
