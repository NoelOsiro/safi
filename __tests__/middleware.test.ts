import { middleware } from "@/middleware";
import { NextRequest } from "next/server";

// Mocks
const mockNext = jest.fn();
const mockRedirect = jest.fn();

jest.mock("next/server", () => ({
  NextResponse: {
    next: () => {
      mockNext();
      return { type: "next" };
    },
    redirect: (url: URL) => {
      mockRedirect(url);
      return { type: "redirect", url };
    },
  },
}));

// Create a mock request
const createMockRequest = (
  path: string,
  headers: Record<string, string> = { "accept-language": "en" }
): NextRequest => {
  const url = new URL(`http://localhost:3000${path}`);
  const requestHeaders = new Headers(headers);

  return {
    url: url.toString(),
    headers: requestHeaders,
    nextUrl: {
      pathname: url.pathname,
      searchParams: url.searchParams,
      toString: () => url.toString(),
      clone: () => ({ pathname: url.pathname, searchParams: url.searchParams }),
    },
  } as unknown as NextRequest;
};

describe("Middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Locale prefixing", () => {
    it("redirects to locale-prefixed path if no locale present", () => {
      const req = createMockRequest("/dashboard");
      middleware(req);
      // Get the URL object passed to mockRedirect
      const redirectUrl = mockRedirect.mock.calls[0][0];
      expect(redirectUrl.pathname).toBe("/en/dashboard");
    });
    

    it("does not redirect if path already has valid locale", async () => {
      const req = createMockRequest("/sw/profile");
      const res = await middleware(req);
      expect(mockNext).toHaveBeenCalled();
      expect(res.type).toBe("next");
    });
  });

  describe("Public paths", () => {
    const publicPaths = [
      "/",
      "/login",
      "/signup",
      "/auth",
      "/favicon.ico",
      "/manifest.json",
      "/images/logo.png",
      "/fonts/inter.woff2",
      "/public/asset.png",
    ];

    it.each(publicPaths)(
      "redirects to locale-prefixed path: %s",
      async (path) => {
        const req = createMockRequest(path);
        middleware(req);
        // Get the URL object passed to mockRedirect
        const redirectUrl = mockRedirect.mock.calls[0][0];
        expect(redirectUrl.pathname).toBe(`/en${path}`);
      }
    );

    it.each(publicPaths.map((p) => `/en${p}`))(
      "passes through already-prefixed public path: %s",
      async (path) => {
        const req = createMockRequest(path);
        const res = await middleware(req);
        expect(mockNext).toHaveBeenCalled();
        expect(res.type).toBe("next");
        expect(mockRedirect).not.toHaveBeenCalled();
      }
    );    
  });
});
