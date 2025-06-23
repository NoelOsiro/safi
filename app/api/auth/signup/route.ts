import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { mockUsers } from "@/lib/mock-data"

interface UserProfile {
  id: string
  fullName: string
  email: string
  phone: string
  businessType: string
  location: string
  experience: string
  avatar: string
  createdAt: string
  onboardingCompleted: boolean
  progress: {
    modulesCompleted: number
    totalModules: number
    assessmentScore: number
    certificationReady: number
    studyTime: number
  }
}

export async function POST(request: NextRequest) {
  try {
    // First, verify the user is authenticated with Azure AD
    let session;
    try {
      session = await getServerSession(authOptions);
      if (!session?.user?.email) {
        return NextResponse.json(
          { 
            error: "Authentication required",
            authRequired: true,
            redirectUrl: "/api/auth/signin?callbackUrl=/auth/signup"
          },
          { status: 401 }
        );
      }
    } catch (error) {
      console.error('Session error:', error);
      return NextResponse.json(
        { 
          error: "Authentication error",
          details: error instanceof Error ? error.message : 'Unknown error',
          authRequired: true,
          redirectUrl: "/api/auth/signin?callbackUrl=/auth/signup"
        },
        { status: 500 }
      );
    }

    // Get additional profile data from the request body
    const userData = await request.json()
    
    // Validate required fields from the form
    const requiredFields = ['phone', 'businessType', 'location', 'experience']
    const missingFields = requiredFields.filter(field => !userData[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          error: `Missing required fields: ${missingFields.join(', ')}`,
          missingFields,
          authRequired: false
        },
        { status: 400 }
      )
    }

    // Check if user already exists in our system
    const existingUser = mockUsers.find((user) => user.email === session.user?.email);
    
    if (existingUser) {
      // User exists, return their profile
      return NextResponse.json({
        success: true,
        user: existingUser,
        isNewUser: false
      });
    }

    // Create new user with Azure AD data and form data
    const newUser: UserProfile = {
      id: session.user?.id || Date.now().toString(),
      fullName: session.user?.name || 'New User',
      email: session.user?.email || '',
      phone: userData.phone,
      businessType: userData.businessType,
      location: userData.location,
      experience: userData.experience,
      avatar: session.user?.image || `https://picsum.photos/80/80?random=${Date.now()}`,
      createdAt: new Date().toISOString(),
      onboardingCompleted: false,
      progress: {
        modulesCompleted: 0,
        totalModules: 5,
        assessmentScore: 0,
        certificationReady: 0,
        studyTime: 0,
      },
    };

    // In a real implementation, save to your database here
    mockUsers.push(newUser);

    return NextResponse.json({
      success: true,
      user: newUser,
      isNewUser: true
    });
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
