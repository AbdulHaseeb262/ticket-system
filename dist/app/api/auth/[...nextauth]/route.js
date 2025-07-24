 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import NextAuth from 'next-auth';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import clientPromise from '@/lib/mongodb';

import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';

export const authOptions = {
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
      if (_optionalChain([session, 'optionalAccess', _ => _.user])) {
        if (_optionalChain([token, 'optionalAccess', _2 => _2.sub])) {
          (session.user ).id = token.sub;
        } else if (session.user.email) {
          // Hole User-ID aus DB, falls sie fehlt
          const client = await clientPromise;
          const db = client.db();
          const dbUser = await db.collection('users').findOne({ email: session.user.email });
          if (dbUser && dbUser._id) (session.user ).id = dbUser._id.toString();
        }
        if (token.role) (session.user ).role = token.role;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user && (user ).role) {
        token.role = (user ).role;
      } else if (token.email) {
        
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