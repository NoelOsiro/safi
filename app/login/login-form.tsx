
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function LoginForm() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8 p-8 bg-white rounded-xl shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
          <p className="mt-2 text-gray-600">Sign in to your account to continue</p>
        </div>

        <div className="mt-8 space-y-4">
          <Button asChild>
            <Link
            href="/api/auth/login"
            className="w-full flex items-center justify-center gap-2 bg-[#2F2F2F] hover:bg-[#1F1F1F] text-white"
          >
              "Sign in with Microsoft"
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
