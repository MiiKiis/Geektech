import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const data = await sql`SELECT * FROM home LIMIT 1`; // Get the first banner
        return NextResponse.json(data[0] || {});
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
