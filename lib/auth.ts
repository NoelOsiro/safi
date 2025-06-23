import NextAuth, { type AuthOptions, type DefaultSession } from "next-auth"
import AzureADProvider from "next-auth/providers/azure-ad"

// Use a consistent secret for JWT encryption in development
const secret = process.env.NEXTAUTH_SECRET || 'your-secret-key-for-development'

declare module "next-auth" {
  interface Session extends DefaultSession {
    accessToken?: string;
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

const authOptions: AuthOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID,
      authorization: {
        params: {
          scope: "openid profile email User.Read"
        }
      },
      profile(profile) {
        return {
          id: profile.oid || profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture
        }
      }
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      // Initial sign in
      if (account && user) {
        token.id = user.id;
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub || token.id as string;
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  secret: secret,
  session: {
    strategy: "jwt",
  },
  jwt: {
    secret: secret,
    // You can also add encryption if needed
    // encryption: true,
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST, authOptions };