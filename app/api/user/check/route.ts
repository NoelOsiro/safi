import { NextResponse } from "next/server";
import { getLoggedInUser } from "@/lib/server/appwrite";

export async function GET() {
    const user = await getLoggedInUser();
    return NextResponse.json({ user });
}
