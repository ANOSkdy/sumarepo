"use client";

import { useSession, signOut } from "next-auth/react";

export default function Dashboard() {
  const { data: session } = useSession();

  return (
    <div>
      <h1>ようこそ、{session?.user?.name ?? "ゲスチE}さん</h1>
      <button onClick={() => signOut({ callbackUrl: '/' })}>ログアウチE/button>
    </div>
  );
}

