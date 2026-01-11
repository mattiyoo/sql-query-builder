import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { User } from '@/commons/models/user.model';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const limit = searchParams.get('limit');
        const offset = searchParams.get('offset');

        let sql = 'SELECT * FROM users ORDER BY id';
        const params: any[] = [];

        if (limit) {
            sql += ` LIMIT $${params.length + 1}`;
            params.push(parseInt(limit));
        }

        if (offset) {
            sql += ` OFFSET $${params.length + 1}`;
            params.push(parseInt(offset));
        }

        const result = await query<any>(sql, params);

        const users: User[] = result.rows.map((row: any) => ({
            ...row,
            lastActive: row.last_active,
        }));

        return NextResponse.json({
            users,
            total: result.rowCount,
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}
