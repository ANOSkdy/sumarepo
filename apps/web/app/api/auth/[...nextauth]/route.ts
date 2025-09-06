import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import Airtable from "airtable";
import argon2 from "argon2";

import type { NextAuthOptions } from "next-auth";

// Airtableのレコードの型を定義（必要に応じて拡張）
type AirtableUserRecord = {
  id: string;
  fields: {
    userId: string;
    name: string;
    username: string;
    passwordHash: string;
    role: 'admin' | 'user';
    active: boolean;
  };
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
          throw new Error("Airtable environment variables not configured");
        }
        
        const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
          process.env.AIRTABLE_BASE_ID
        );

        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          const records = await base('Users').select({
            filterByFormula: `{username} = '${credentials.username}'`,
            maxRecords: 1
          }).firstPage();

          if (records.length === 0) {
            console.log("No user found with that username.");
            return null;
          }

          const userRecord = records[0].fields as AirtableUserRecord['fields'];

          if (!userRecord.passwordHash) {
            console.error("User record is missing passwordHash.");
            return null;
          }

          const isValidPassword = await argon2.verify(userRecord.passwordHash, credentials.password);

          if (isValidPassword) {
            // 認証成功
            return {
              id: userRecord.userId,
              name: userRecord.name,
            };
          } else {
            console.log("Password verification failed.");
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
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };