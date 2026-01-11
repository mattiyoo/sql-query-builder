import { NextRequest, NextResponse } from 'next/server';
import { getTables } from '@/lib/schema';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const connectionString = body.connectionString ||
            process.env.SQB_POSTGRES_URL ||
            process.env.SQB_DATABASE_URL;

        if (!connectionString) {
            return NextResponse.json(
                { error: 'No database connection configured' },
                { status: 400 }
            );
        }

        const tables = await getTables(connectionString);

        return NextResponse.json({ tables });
    } catch (error) {
        console.error('Error fetching tables:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch tables',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
