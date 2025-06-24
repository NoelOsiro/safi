import { NextResponse } from "next/server";
import { getLoggedInUser } from "@/lib/server/appwrite";

export async function GET() {
    try {
        const { user, error } = await getLoggedInUser();
        if (error) {
            return NextResponse.json({ success: false, user: null });
        }
        return NextResponse.json({ success: true, user });
    } catch (error) {
        console.error('Check auth error:', error);
        return NextResponse.json({ error: 'Failed to check authentication status' }, { status: 500 });
    }
}
