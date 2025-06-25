// Mock Supabase client
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
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn().mockResolvedValue({
    data: {
      id: 'user-123',
      full_name: 'Test User',
      email: 'test@example.com',
      phone: '+1234567890',
      avatar: 'https://example.com/avatar.jpg',
    },
    error: null,
  }),
  update: jest.fn().mockReturnThis(),
  upsert: jest.fn().mockResolvedValue({ error: null }),
}));
