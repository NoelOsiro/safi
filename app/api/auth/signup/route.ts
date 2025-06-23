import { type NextRequest, NextResponse } from "next/server"
import { mockUsers } from "@/lib/mock-data"

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json()

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Check if user already exists
    const existingUser = mockUsers.find((user) => user.email === userData.email)
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      ...userData,
      avatar: `https://picsum.photos/80/80?random=${Date.now()}`,
      createdAt: new Date().toISOString(),
      onboardingCompleted: false,
      progress: {
        modulesCompleted: 0,
        totalModules: 5,
        assessmentScore: 0,
        certificationReady: 0,
        studyTime: 0,
      },
    }

    // In real implementation, save to database
    mockUsers.push(newUser)

    return NextResponse.json({
      success: true,
      user: newUser,
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
