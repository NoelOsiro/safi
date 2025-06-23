import { type NextRequest, NextResponse } from "next/server"
import { mockUsers } from "@/lib/mock-data"

export async function PUT(request: NextRequest) {
  try {
    const { userId, progress } = await request.json()

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 400))

    const userIndex = mockUsers.findIndex((user) => user.id === userId)
    if (userIndex === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update user progress
    mockUsers[userIndex].progress = {
      ...mockUsers[userIndex].progress,
      ...progress,
    }

    return NextResponse.json({
      success: true,
      user: mockUsers[userIndex],
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
