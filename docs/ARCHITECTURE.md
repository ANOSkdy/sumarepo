ARCHITECTURE.md (基本設計書)
1. 全体構成図
本システムはNext.js App Routerをフレームワークとし、Vercel上でホスティングされる。データベースとしてAirtableを採用し、API経由でデータの永続化を行う。

graph TD
    subgraph "ユーザーデバイス"
        A[スマートフォンブラウザ]
    end

    subgraph "インフラ (Vercel)"
        B[Next.js Application]
        B -- "/app (SSR/RSC)" --> BA[Frontend UI]
        B -- "/api/auth" --> C{NextAuth.js}
        B -- "/api/nfc" --> D[API Route Handlers]
    end

    subgraph "外部サービス"
        E[Airtable API]
    end

    A -- "1. HTTPS Request" --> B
    C -- "3. 認証情報検証" --> E
    D -- "4. データ読み書き" --> E
    B -- "2. ページ/API処理" --> B

2. データフロー図 (打刻処理)
ユーザーの打刻アクションからデータがAirtableに記録されるまでの主要なデータフローを示す。

sequenceDiagram
    participant Browser as ブラウザ (FE)
    participant API as Next.js API
    participant Airtable

    Browser->>API: GET /api/nfc/config (machineid)
    API->>Airtable: 当日ログ件数を照会
    Airtable-->>API: ログ件数
    API-->>Browser: isClockedInフラグと関連情報を返却

    Note over Browser: 状態に応じて出勤/退勤画面を表示

    Browser->>Browser: 記録ボタン押下 → 位置情報取得
    Browser->>API: POST /api/nfc/record (位置情報など)
    API->>Airtable: Sitesマスタ全件取得
    API->>API: 最近傍現場を計算
    API->>Airtable: Logsテーブルにレコード作成
    Airtable-->>API: 作成成功
    API-->>Browser: 成功レスポンス

3. レイヤ分離方針
apps/web/app: ルーティングとUIの表示責務。React Server Components (RSC) を活用し、状態管理は最小限に留める。

apps/web/components: 再利用可能なUI部品。状態を持たないPresentational Componentを原則とする。

apps/web/lib: クライアントサイドのロジック。APIクライアント、Geolocationヘルパーなど。

packages/api: サーバーサイドのビジネスロジック。Airtableとの通信、ドメインロジックを集約。API Route Handlerはここを呼び出す。

packages/shared: 型定義など、クライアントとサーバーで共有するコード。

4. 依存方針
言語: TypeScript 5.0以降

ランタイム: Node.js 20.x

パッケージマネージャ: pnpm 9.x (monorepo構成)

フレームワーク: Next.js 14.x (App Router)

主要ライブラリ:

next-auth: 認証

airtable: Airtableクライアント

zod: スキーマバリデーション

argon2: パスワードハッシュ

5. セキュリティ設計
機微情報: AIRTABLE_API_KEY, NEXTAUTH_SECRET などの機密情報は、Vercelの環境変数として管理し、ソースコードには一切含めない。

CORS: vercel.jsonでAPIルート (/api/*) へのアクセス元を制御する。Preview環境では動的なオリジンを許可し、Production環境では本番ドメインのみを許可する。

認証: NextAuth.jsのセッション管理に準拠する。API Route Handlerの冒頭で必ずセッションの有無を検証する。

監査: 全ての永続化処理はpackages/api経由で行い、共通のロガーを用いて操作ログ（誰が、いつ、何を）を記録する。