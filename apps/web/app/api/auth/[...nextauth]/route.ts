// apps/web/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // ここにAirtableを使ったユーザー認証ロジックを後で追加します
        if (credentials?.username === "user" && credentials?.password === "password") {
          // 認証成功のダミーレスポンス
          return { id: "1", name: "Test User", email: "test@example.com" };
        }
        // 認証失敗
        return null;
      },
    }),
  ],
  pages: {
    signIn: '/login', // ログインページのパス
  }
});

export { handler as GET, handler as POST };