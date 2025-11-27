import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log('[AUTH] Authorize called with:', { 
          email: credentials?.email, 
          hasPassword: !!credentials?.password 
        });

        if (!credentials?.email || !credentials?.password) {
          console.log('[AUTH] Missing credentials');
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        console.log('[AUTH] User lookup result:', { 
          found: !!user, 
          email: user?.email 
        });

        if (!user) {
          console.log('[AUTH] User not found');
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        console.log('[AUTH] Password validation:', { isPasswordValid });

        if (!isPasswordValid) {
          console.log('[AUTH] Invalid password');
          return null;
        }

        console.log('[AUTH] Login successful for:', user.email);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },

    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
});
