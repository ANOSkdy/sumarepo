// apps/web/app/login/page.tsx 縺ｫ縺難ｿｽE繧ｳ繝ｼ繝峨ｒ雋ｼ繧贋ｻ倥￠縺ｦ縺上□縺輔＞

'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await signIn('credentials', {
      username,
      password,
      redirect: false, // 繝ｪ繝繧､繝ｬ繧ｯ繝茨ｿｽE謇句虚縺ｧ蛻ｶ蠕｡縺励∪縺・
    });

    if (result?.ok) {
      // 謌仙粥縺励◆繧峨ム繝・・ｽ・ｽ繝･繝懶ｿｽE繝峨∈
      router.push('/dashboard');
    } else {
      // 螟ｱ謨励＠縺溘ｉ繧｢繝ｩ繝ｼ繝医ｒ陦ｨ遉ｺ
      alert('ID縺ｾ縺滂ｿｽE繝代せ繝ｯ繝ｼ繝峨′豁｣縺励￥縺ゅｊ縺ｾ縺帙ｓ');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form onSubmit={handleSubmit}>
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">繝ｭ繧ｰ繧､繝ｳ</CardTitle>
            <CardDescription>
              ID縺ｨ繝代せ繝ｯ繝ｼ繝峨ｒ蜈･蜉帙＠縺ｦ繝ｭ繧ｰ繧､繝ｳ縺励※縺上□縺輔＞縲・
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
<Label htmlFor="username">繝ｦ繝ｼ繧ｶ繝ｼ蜷・/Label>
              <Input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">繝代せ繝ｯ繝ｼ繝・/Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit">
              繝ｭ繧ｰ繧､繝ｳ
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}



