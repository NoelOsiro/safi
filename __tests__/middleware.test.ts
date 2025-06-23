import { middleware } from '../middleware';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Mock next-auth/jwt
jest.mock('next-auth/jwt', () => ({
  getToken: jest.fn(),
}));

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    next: jest.fn().mockImplementation(() => ({
      request: { url: 'http://localhost:3000' },
    })),
    redirect: jest.fn().mockImplementation((url) => ({
      url,
      status: 307,
    })),
  },
}));

describe('Middleware', () => {
  const mockRequest = (url: string, token = null) => {
    (getToken as jest.Mock).mockResolvedValue(token);
    const fullUrl = `http://localhost:3000${url}`;
    return {
      url: fullUrl,
      nextUrl: new URL(fullUrl),
    } as any;
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should allow access to non-protected routes', async () => {
    const request = mockRequest('/public');
    await middleware(request);
    expect(NextResponse.next).toHaveBeenCalled();
  });

  it('should redirect to login for protected routes when not authenticated', async () => {
    const request = mockRequest('/dashboard');
    await middleware(request);
    expect(NextResponse.redirect).toHaveBeenCalledWith(new URL('/auth/signin?callbackUrl=http%3A%2F%2Flocalhost%3A3000%2Fdashboard', 'http://localhost:3000'));
  });

  it('should allow access to protected routes when authenticated', async () => {
    const request = mockRequest('/dashboard');
    (getToken as jest.Mock).mockResolvedValueOnce({ id: '123' }); // Mock the token response
    await middleware(request);
    expect(NextResponse.next).toHaveBeenCalled();
  });
});
