API.md (I/F定義 & エンドポイント仕様)
共通仕様
認証: 全てのエンドポイントはNextAuth.jsによるセッショントークン認証を必須とする。未認証の場合はステータスコード 401 Unauthorized を返す。

ベースURL: /api

レート制限: Vercelの標準レート制限に従う。Airtable APIのレート制限 (5 req/sec) を超えた場合は、API側で指数バックオフリトライ（最大3回）を実装し、クライアントには正常なレスポンスを返すことを試みる。リトライに失敗した場合は 503 Service Unavailable を返す。

1. GET /nfc/config
ユーザーの現在の出退勤状態と、画面表示に必要な設定情報を取得する。

Method: GET

Path: /nfc/config

Query Parameters:

machineid (string, 必須): NFCタグから読み取った機械ID。

Success Response (200 OK):

未出勤の場合:

{
  "isClockedIn": false,
  "workOptions": ["作業A", "作業B", "作業C"]
}

出勤中の場合:

{
  "isClockedIn": true,
  "clockInInfo": {
    "userName": "山田 太郎",
    "siteName": "〇〇建設現場",
    "machineName": "PC200-10",
    "workDescription": "基礎掘削"
  }
}

Error Responses:

400 Bad Request: machineidが指定されていない。

401 Unauthorized: 未認証。

403 Forbidden: machineidがMachinesテーブルに存在しない。

2. POST /nfc/record
打刻情報をサーバーに送信し、ログとして記録する。

Method: POST

Path: /nfc/record

Request Body (application/json):

// Zod Schema
z.object({
  machineid: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  accuracy: z.number(),
  clientTimestamp: z.string().datetime(),
  workDescription: z.string().optional(), // 出勤時のみ必須
});

Success Response (200 OK):

{
  "id": "recXXXXXXXXXXXXXX", // 作成されたAirtableレコードID
  "siteName": "〇〇建設現場",
  "workDescription": "基礎掘削",
  "type": "IN" // "IN" (出勤) or "OUT" (退勤)
}

Error Responses:

400 Bad Request: リクエストボディのスキーマが無効。

401 Unauthorized: 未認証。

503 Service Unavailable: Airtable APIへのリトライが全て失敗した。