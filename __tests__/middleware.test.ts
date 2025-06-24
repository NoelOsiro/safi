import { middleware } from "@/middleware";
import { NextRequest, NextResponse } from "next/server";

// Mock the supabase client
const mockGetSession = jest.fn();
jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(() => ({
    auth: {
      getSession: mockGetSession,
    },
  })),
}));

// Mock NextResponse
const mockNext = jest.fn();
const mockRedirect = jest.fn();

jest.mock("next/server", () => ({
  NextResponse: {
    next: () => {
      mockNext();
      return { status: 200 };
    },
    redirect: (url: URL) => {
      mockRedirect(url);
      return { status: 307, url };
    },
  },
}));

// Helper to create a mock request
const createMockRequest = (path: string, method = "GET"): NextRequest => {
  const url = new URL(`http://localhost:3000${path}`);
  return {
    url: url.toString(),
    nextUrl: url,
    method,
    headers: new Headers(),
  } as unknown as NextRequest;
};

describe("Middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Public paths", () => {
    const publicPaths = [
      "/",
      "/login",
      "/signup",
      "/auth",
      "/_next/static/file.js",
      "/favicon.ico",
      "/images/logo.png",
      "/fonts/inter.woff2",
      "/manifest.json",
      "/public/asset.png",
      "/api/auth/callback",
    ];

    it.each(publicPaths)("allows access to public path: %s", async (path) => {
      const req = createMockRequest(path);
      await middleware(req);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe.skip("Protected paths", () => {
    const protectedPaths = [
      "/dashboard",
      "/profile",
      "/training",
      "/assessment",
      "/chat",
      "/admin",
      "/onboarding",
    ];

    it("redirects to login with redirect URL when no session exists", async () => {
      mockGetSession.mockResolvedValueOnce({ data: { session: null } });
      const req = createMockRequest("/dashboard");
      
      await middleware(req);

      expect(mockGetSession).toHaveBeenCalled();
      expect(mockRedirect).toHaveBeenCalledWith(
        new URL("/login?redirect=/dashboard", "http://localhost:3000")
      );
    });

    it("allows access when valid session exists", async () => {
      mockGetSession.mockResolvedValueOnce({
        data: { session: { user: { id: "user-123" } } },
      });
      const req = createMockRequest("/dashboard");

      await middleware(req);

      expect(mockGetSession).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });
  });

  // Add more test cases as needed
});