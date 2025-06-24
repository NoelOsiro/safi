import { type NextRequest, NextResponse } from "next/server"
import { mockModules } from "@/lib/mock-data"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the ID from params
    const { id } = await params;
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Ensure we have an ID before searching
    if (!id) {
      return NextResponse.json({ error: "Module ID is required" }, { status: 400 });
    }

    const module = mockModules.find((m) => m.id === id);

    if (!module) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      module,
    });
  } catch (error) {
    console.error("Error fetching module:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}
