import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">AI日報「スマレポ」へようこそ</h1>
        <p className="mb-8 text-lg text-muted-foreground">
          NFCタグを使って簡単に出退勤を記録します。
        </p>
        <Button asChild>
          <Link href="/login">ログインページへ</Link>
        </Button>
      </div>
    </main>
  );
}