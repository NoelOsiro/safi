import { logout } from '@/components/dassboard/WelcomeHeader';
import { redirect } from 'next/navigation';

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

// Mock functions
const signOutMock = jest.fn();
const createClientMock = jest.fn();

jest.mock('@/lib/supabase/server', () => ({
  createClient: () => createClientMock(),
}));

describe('logout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    signOutMock.mockReset();
  });

  it('calls supabase.auth.signOut and redirects to /login', async () => {
    createClientMock.mockResolvedValueOnce({
      auth: {
        signOut: signOutMock.mockResolvedValueOnce(undefined),
      },
    });

    await logout();

    expect(createClientMock).toHaveBeenCalledTimes(1);
    expect(signOutMock).toHaveBeenCalledTimes(1);
    expect(redirect).toHaveBeenCalledWith('/login');
  });

  it('does not throw if signOut resolves', async () => {
    createClientMock.mockResolvedValueOnce({
      auth: {
        signOut: signOutMock.mockResolvedValueOnce(undefined),
      },
    });

    await expect(logout()).resolves.not.toThrow();
  });

  it('throws an error if signOut fails', async () => {
    // First set up the mock to reject
    const error = new Error('Sign out failed');
    signOutMock.mockRejectedValueOnce(error);
    
    // Then set up the client mock to return the signOut mock
    createClientMock.mockResolvedValueOnce({
      auth: {
        signOut: signOutMock,
      },
    });
  
    // The test expects the function to throw
    await expect(logout()).rejects.toThrow('Sign out failed');
  
    // Verify signOut was called
    expect(signOutMock).toHaveBeenCalled();
  });
  
});
