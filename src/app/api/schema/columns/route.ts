import { NextRequest, NextResponse } from 'next/server';
import { getTableSchema } from '@/lib/schema';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { tableName } = body;

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

        const schema = await getTableSchema(connectionString, tableName);

        return NextResponse.json(schema);
    } catch (error) {
        console.error('Error fetching table schema:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch table schema',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
