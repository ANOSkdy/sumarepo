DEPLOY.md (運用・デプロイ)
1. Vercel環境
Production: mainブランチにマージされたコードが自動的にデプロイされる。

Preview: 各プルリクエストに対して、一意のプレビュー環境が自動的に構築される。QAやステークホルダーレビューに利用する。

2. 環境変数一覧
本システムは以下の環境変数を必要とする。これらの値はVercelのプロジェクト設定画面から登録する。

変数名

説明

設定先

AIRTABLE_API_KEY

Airtable APIキー

Production, Preview

AIRTABLE_BASE_ID

AirtableのBase ID

Production, Preview

NEXTAUTH_SECRET

NextAuth.jsのセッション暗号化キー

Production, Preview

NEXTAUTH_URL

アプリケーションの正規URL

Production, Preview

3. CIゲート
mainブランチへのマージには、プルリクエスト経由を必須とする。

プルリクエストは、以下のGitHub Actionsワークフローが全て成功（グリーン）にならない限り、マージをブロックする。

pnpm lint: ESLintによる静的解析

pnpm typecheck: TypeScriptによる型チェック

pnpm test: Vitestによる単体テスト

pnpm build: Next.jsアプリケーションのビルド

4. ロールバック手順
手順
Vercelのプロジェクトダッシュボードにアクセスする。

「Deployments」タブを開く。

ロールバックしたいデプロイ（通常は正常稼働していた一つ前のProductionデプロイ）を見つける。

右端の「...」メニューから「Redeploy」を選択し、デプロイを再実行する。

緊急時
上記手順で問題が解決しない場合、GitHub上で問題のあるコミットを git revert するプルリクエストを作成・マージし、再デプロイする。