"use client";

import { useSession, signOut } from "next-auth/react";

export default function Dashboard() {
  const { data: session } = useSession();

  return (
    <div>
      <h1>繧医≧縺薙◎縲＋session?.user?.name ?? "繧ｲ繧ｹ繝・}縺輔ｓ</h1>
<button onClick={() => signOut({ callbackUrl: '/' })}>繝ｭ繧ｰ繧｢繧ｦ繝・/button>
    </div>
  );
}


