// C:\Users\Admin\Desktop\sexp\app\api\ads\view\route.js
import { NextResponse } from 'next/server';

// In production, store this in a database
let adStats = {};

export async function POST(request) {
    try {
        const { adId } = await request.json();

        if (!adStats[adId]) {
            adStats[adId] = { views: 0, clicks: 0 };
        }
        adStats[adId].views += 1;

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false }, { status: 500 });
    }
}