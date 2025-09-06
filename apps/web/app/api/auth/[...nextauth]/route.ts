// apps/web/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import Airtable from "airtable";
import argon2 from "argon2";

import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID as string);

        if (!credentials) {
          return null;
        }

        try {
          const records = await base('Users').select({
            filterByFormula: `{username} = '${credentials.username}'`,
            maxRecords: 1
          }).firstPage();

          if (records.length === 0) {
            return null;
          }

          const user = records[0];
          const passwordHash = user.get('passwordHash') as string;

          if (await argon2.verify(passwordHash, credentials.password)) {
            return {
              id: user.get('userId') as string,
              name: user.get('name') as string,
            };
          } else {
            return null;
          }
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: '/login', // ログインページのパス
  },
  callbacks: {
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };