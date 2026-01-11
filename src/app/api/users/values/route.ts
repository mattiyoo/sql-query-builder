import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

const VALID_FIELDS = ['name', 'email', 'company', 'country'] as const;
type ValidField = typeof VALID_FIELDS[number];

function isValidField(field: string): field is ValidField {
    return VALID_FIELDS.includes(field as ValidField);
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const field = searchParams.get('field');

        if (!field || !isValidField(field)) {
            return NextResponse.json(
                { error: 'Invalid or missing field parameter. Valid fields: name, email, company, country' },
                { status: 400 }
            );
        }

        const sql = `SELECT DISTINCT ${field} FROM users WHERE ${field} IS NOT NULL ORDER BY ${field}`;

        const result = await query<{ [key: string]: string }>(sql);

        const values = result.rows.map(row => row[field]);

        return NextResponse.json({
            field,
            values,
            count: values.length,
        });
    } catch (error) {
        console.error('Error fetching distinct values:', error);
        return NextResponse.json(
            { error: 'Failed to fetch distinct values' },
            { status: 500 }
        );
    }
}
