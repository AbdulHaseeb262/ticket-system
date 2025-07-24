import NextAuth from 'next-auth';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import clientPromise from '@/lib/mongodb';
import EmailProvider from 'next-auth/providers/email';
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'E-Mail', type: 'email' },
        password: { label: 'Passwort', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials) return null;
        const client = await clientPromise;
        const db = client.db();
        let user = null;
        if (credentials.email && credentials.email.includes('@')) {
          user = await db.collection('users').findOne({ email: credentials.email.trim().toLowerCase() });
        } else if (credentials.email) {
          // Suche nach Name (case-insensitive, getrimmt)
          user = await db.collection('users').findOne({ name: { $regex: `^${credentials.email.trim()}$`, $options: 'i' } });
        }
        if (user && credentials.password && user.password) {
          if (user.active === false) {
            throw new Error('Dein Account ist deaktiviert. Bitte wende dich an einen Admin.');
          }
          const valid = await compare(credentials.password, user.password);
          if (valid) {
            return { id: user._id.toString(), name: user.name, email: user.email, role: user.role };
          }
        }
        return null;
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async session({ session, token, user }) {
      if (session?.user) {
        if (token?.sub) {
          (session.user as any).id = token.sub;
        } else if (session.user.email) {
          // Hole User-ID aus DB, falls sie fehlt
          const client = await clientPromise;
          const db = client.db();
          const dbUser = await db.collection('users').findOne({ email: session.user.email });
          if (dbUser && dbUser._id) (session.user as any).id = dbUser._id.toString();
        }
        if (token.role) (session.user as any).role = token.role;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user && (user as any).role) {
        token.role = (user as any).role;
      } else if (token.email) {
        // Hole User aus DB, falls user-Objekt nicht vorhanden (z.B. bei Session-Refresh)
        const client = await clientPromise;
        const db = client.db();
        const dbUser = await db.collection('users').findOne({ email: token.email });
        if (dbUser && dbUser.role) {
          token.role = dbUser.role;
        }
      }
      return token;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: undefined,
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 