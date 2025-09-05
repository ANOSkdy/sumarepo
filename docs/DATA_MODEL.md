DATA_MODEL.md (データモデル / Airtableスキーマ)
テーブル一覧
Users (従業員マスタ)

Machines (機械マスタ)

Sites (現場マスタ)

WorkTypes (作業内容マスタ)

Logs (打刻ログ)

列定義
1. Users
フィールド名

型

制約/説明

userId

Text

Primary Key, user_001形式

name

Text

必須

username

Text

ログインID, 一意制約

passwordHash

Long Text

Argon2idハッシュ

role

Single Select

admin / user

active

Checkbox

trueのユーザーのみログイン可 (論理削除)

2. Machines
フィールド名

型

制約/説明

machineid

Text

Primary Key, NFCのURLパラメータと一致

name

Text

必須

active

Checkbox

trueの機械のみ打刻可 (論理削除)

3. Sites
フィールド名

型

制約/説明

siteId

Text

Primary Key, site_001形式

name

Text

必須

lat

Number

緯度 (Decimal, 6桁)

lon

Number

経度 (Decimal, 6桁)

active

Checkbox

trueの現場のみ最近傍判定の対象

4. WorkTypes
フィールド名

型

制約/説明

workId

Text

Primary Key, work_001形式

name

Text

必須

sortOrder

Number

表示順 (昇順)

active

Checkbox

trueの作業のみ選択肢に表示

5. Logs
フィールド名

型

制約/説明

timestamp

DateTime

打刻日時 (UTC)

date

Text

打刻日 (JST, YYYY-MM-DD形式)

user

Link to Users

参照整合性, 必須

machine

Link to Machines

参照整合性, 必須

lat

Number

緯度

lon

Number

経度

accuracy

Number

位置情報の誤差(m)

siteName

Text

最近傍計算で確定した現場名

workDescription

Text

作業内容

type

Single Select

IN / OUT, API側で自動判定

