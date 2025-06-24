import { NextRequest, NextResponse } from 'next/server';

// Mock the auth service
const mockGetCurrentSession = jest.fn();

jest.mock('@/lib/services/auth.service', () => ({
  authService: {
    getCurrentSession: () => mockGetCurrentSession(),
  },
}));

// Mock NextResponse
const mockNext = jest.fn().mockImplementation(() => ({
  request: { url: 'http://localhost:3000' },
}));

const mockRedirect = jest.fn().mockImplementation((url: string) => ({
  url,
  status: 307,
}));

jest.mock('next/server', () => ({
  NextResponse: {
    next: () => mockNext(),
    redirect: (url: string) => mockRedirect(url),
  },
}));

// Import the middleware after setting up mocks
const { middleware } = require('../../middleware');

describe('Middleware', () => {
  const mockRequest = (url: string, hasSession = false) => {
    // Reset mocks before each test
    mockGetCurrentSession.mockReset();
    mockNext.mockClear();
    mockRedirect.mockClear();
    
    // Setup mock response
    mockGetCurrentSession.mockResolvedValue(
      hasSession ? { $id: 'session-123', userId: 'user-123' } : null
    );
    
    const fullUrl = `http://localhost:3000${url}`;
    return {
      url: fullUrl,
      nextUrl: new URL(fullUrl),
      headers: new Headers(),
    } as NextRequest;
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should allow access to public routes', async () => {
    const req = mockRequest('/api/public');
    const response = await middleware(req);
    expect(mockNext).toHaveBeenCalled();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('should redirect to login for protected routes when not authenticated', async () => {
    const req = mockRequest('/dashboard');
    mockGetCurrentSession.mockResolvedValueOnce(null);
    
    const response = await middleware(req);
    
    expect(mockGetCurrentSession).toHaveBeenCalled();
    expect(mockRedirect).toHaveBeenCalledWith(new URL('/login', req.url));
  });

  it('should allow access to protected routes when authenticated', async () => {
    const req = mockRequest('/dashboard', true);
    mockGetCurrentSession.mockResolvedValueOnce({ $id: 'session-123', userId: 'user-123' });
    
    const response = await middleware(req);
    
    expect(mockGetCurrentSession).toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('should redirect to dashboard when accessing login while authenticated', async () => {
    const req = mockRequest('/login', true);
    mockGetCurrentSession.mockResolvedValueOnce({ $id: 'session-123', userId: 'user-123' });
    
    const response = await middleware(req);
    
    expect(mockGetCurrentSession).toHaveBeenCalled();
    expect(mockRedirect).toHaveBeenCalledWith(new URL('/dashboard', req.url));
  });
});
