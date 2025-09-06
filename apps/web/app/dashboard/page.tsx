"use client";

import { useSession, signOut } from "next-auth/react";

export default function Dashboard() {
  const { data: session } = useSession();

  return (
    <div>
      <h1>ようこそ、{session?.user?.name ?? "ゲスト"}さん</h1>
      <button onClick={() => signOut({ callbackUrl: '/' })}>ログアウト</button>
    </div>
  );
}