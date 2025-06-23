import { type NextRequest, NextResponse } from "next/server"
import { mockReviews } from "@/lib/mock-data"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const moduleId = searchParams.get("moduleId")

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 400))

    let reviews = mockReviews
    if (moduleId) {
      reviews = mockReviews.filter((review) => review.moduleId === moduleId)
    }

    return NextResponse.json({
      success: true,
      reviews,
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const reviewData = await request.json()

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 600))

    const newReview = {
      id: Date.now().toString(),
      ...reviewData,
      date: new Date().toISOString(),
      helpful: 0,
      notHelpful: 0,
    }

    // In real implementation, save to database
    mockReviews.push(newReview)

    return NextResponse.json({
      success: true,
      review: newReview,
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
