// Mock for @supabase/ssr
export const createClient = jest.fn(() => ({
  auth: {
    getSession: jest.fn().mockResolvedValue({
      data: {
        session: {
          user: {
            id: 'user-123',
            email: 'test@example.com',
            user_metadata: {
              name: 'Test User',
              full_name: 'Test User',
            },
          },
        },
      },
    }),
  },
}));
