import { NextResponse } from "next/server"
import { mockAdminStats, mockRegionalData, mockUsers } from "@/lib/mock-data"

export async function GET() {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    return NextResponse.json({
      success: true,
      stats: mockAdminStats,
      regionalData: mockRegionalData,
      recentUsers: mockUsers.slice(0, 5),
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
