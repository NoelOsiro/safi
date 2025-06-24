import { logout } from "@/lib/server/appwrite"
import { NextResponse } from "next/server"

export async function POST() {
    try {
        const result = await logout()
        
        // Create response with success status
        const response = NextResponse.json({ success: result.success })
        
        // Clear the session cookie
        const sessionCookie = `a_session_${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID?.toLowerCase()}_legacy`
        response.cookies.set(sessionCookie, '', {
            expires: new Date(0), // Expire immediately
            path: '/',
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
        })
        
        return response
    } catch (error) {
        console.error('Logout error:', error)
        return NextResponse.json({ error: 'Failed to logout' }, { status: 500 })
    }
}