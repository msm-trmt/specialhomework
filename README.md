
# 第５回特別課題
## URLとは  
・インターネット上の住所のようなもの。見たいホームページが「どこにあるファイルか」「どんな名前のファイルか」などを示す情報。  
[URLについて](https://wa3.i-3-i.info/word114.html)  

  ## クエリ文字列とは  
・クエリストリングは通常はURLの末尾に書かれ、最初に「?」をつける。その後は「変数名＝値」の形式で内容を記述していき、さらに変数や値が複数存在する場合は「&」を区切りとして使用する。クエリストリングを使用することで、Webページの表示内容を変化させたり、正確なアクセス解析を行うことが可能。  
[クエリ文字列について](https://ssaits.jp/promapedia/technology/query-string.html)  

## パスパラメーター（パス変数）とは　　
・URLの中の１部分。よくあるのがユーザーIDとか記事IDとか。世の中の様々なサービスでパスパラメータを指定することで特定のユーザーの情報だったり、記事の情報だったりを表示するために活用されている。特徴としてクエリ文字列とは違い**一意なリソースを指定する**/**省略はできない**といったものがある。  
[パスパラメータについて](https://zenn.dev/fujishiro/scraps/3a060b10b17a93)


## クエリ文字列との違いについて
・パスパラメータは特定のもの（画面など）を表示したいときに必要であり、クエリパラメータは特定のもの（画面など）に条件を加える場合に必要。
　つまり**パスパラメーターで表示したい情報を指定していき、更に条件を付け加えたいときはクエリパラメーターでフィルターをかけるようなイメージ**。  
 [パスパラメーターとクエリパラメーターの違いについて](https://zenn.dev/eri_agri/articles/859a3362db8386)  

   ## HTTPメソッドとは  
・ホームページを見るときに使うソフト（Webブラウザ）からホームページのファイルが置いてあるコンピュータ（Webサーバ）に対して出されるお願いの種類  
### GETとは  
WebブラウザからWebサーバに渡す値をURLの後ろにくっつけて送るやり方であり意味としては**このページをくれよというお願い**  

### POSTとは  
WebブラウザからWebサーバに渡す値を見えないところにくっつけて送るやり方であり意味としては**このデータをやるから追加しとけというお願い**  
※GETメソッドはページなどを受け取るために使う。POSTメソッドは会員登録の情報などをサーバーに送るために使う。  

### PUTとは  
**今、送ったファイルなんだけどさ。そっちになかったら置いてよ。すでにあったら置き換えてよというお願い**  
※POST違いデータが既存の場合上書きされていく  

### PATCHとは　　
データがすでに存在しているものに対して更新をかける処理。  
PUTはデータが存在する場合はデータが存在しない場合は新規作成を行う。PATCHはデータが存在している時のみ行える。  

### DELETEとは　　
**今、指定したファイルなんだけどさ。サクっと消しちゃってよ！なお願い**  
サーバー上のファイルなどの削除を行う操作。サーバがクライアントにデータやサービスを提供する一般的なWebサイトで使われることは稀。  

[GET/POST](https://wa3.i-3-i.info/word110431.html)・[PUT](https://e-words.jp/w/PUT%E3%83%A1%E3%82%BD%E3%83%83%E3%83%89.html)・[PATCH](https://omathin.com/http-method/)・[DELETE](https://e-words.jp/w/DELETE%E3%83%A1%E3%82%BD%E3%83%83%E3%83%89.html)  

  ## HTTPステータスコードとは  
・ホームページを見るときに使うソフト（Webブラウザ）からホームページのファイルが置いてあるコンピュータ（Webサーバ）に対して出される「このページをちょうだい」なお願いに対する**Webサーバさんからの返事を表した3桁の数字**  
[HTTPステータスコードについて](https://wa3.i-3-i.info/word166.html)  


| HTTPSステータスコード | ステータスコードの意味 |
| :-------------| :------------------|
|200            |リクエストが正常に処理できた|
|201            |リクエストが成功してリソースの作成が完了|
|400            |一般的なクライアントエラー|
|404            |Webページが見つからない|
|500            |何らかのサーバ内で起きたエラー|

## リクエストヘッダーとは・リクエストボディとは    
### リクエストヘッダー  
  ⇨ホームページを見るときに使うソフト（Webブラウザ）からホームページのファイルが置いてあるコンピュータ（Webサーバ）に伝えたい「お願いごとやお願い元に関するあれこれ」が書かれている場所  
### リクエストボディ    
  ⇨「補足のメモ書き情報」が書かれている場所

1. HTTPリクエストライン（リクエストライン）[^1]  
1. HTTPリクエストヘッダ（ヘッダ）[^2]  
1. HTTPリクエストメッセージボディ（メッセージボディ）[^3]  

[^1]:POST /search.html HTTP/1.1\r\n  
[^2]:Host: wa3.i-3-i.info\r\n   
Connection: keep-alive\r\n  
Content-Length: 38\r\n  
Cache-Control: max-age=0\r\n  
Origin: http://wa3.i-3-i.info\r\n  
Upgrade-Insecure-Requests: 1\r\n  
User-Agent: うんちゃら\r\n  
Content-Type: application/x-www-form-urlencoded\r\n  
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8\r\n  
Referer: http://wa3.i-3-i.info/index.html\r\n  
Accept-Encoding: gzip, deflate\r\n  
Accept-Language: ja,en-US;q=0.8,en;q=0.6\r\n 
[^3]:\r\n  
q=test&submitSearch=%E6%A4%9C%E7%B4%A2  

  
[HTTPステータスコードについて](https://www.itmanage.co.jp/column/http-www-request-response-statuscode/)  


  ## レスポンスヘッダー・ボディとは  
  ### レスポンスヘッダー  
  　　⇨「HTTPステータスラインに書ききれないレスポンスの情報」が書かれている場所  
  ### レスポンスボディ  
  　　⇨「相手が欲しがってたファイルの中身」が書かれている場所  

1. HTTPリクエストライン（ステータスライン）[^4]  
1. HTTPレスポンスヘッダ（ヘッダ）[^5]  
1. HTTPレスポンスボディ（レスポンスボディ）[^6]

[^4]:HTTP/1.1 200 OK\r\n  
[^5]:Server: nginx\r\n  
Date: Tue, 11 Jul 2017 09:23:07 GMT\r\n  
Content-Type: text/html\r\n  
Transfer-Encoding: chunked\r\n  
Connection: keep-alive\r\n  
\r\n  
[^6]:\r\n~


  
    
## JSONとは  
  ・JavaScriptと相性が良いファイルの書き方ルールのひとつ  

    
  ![image](https://github.com/yuu3415/specialhomework/assets/143332858/e2ac6c9e-555f-465f-bcdd-d40a080da3fc)  

  ```Swift
  {
  "color_list": [ "red", "green", "blue" ],
  "num_list": [ 123, 456, 789 ],
  "mix_list": [ "red", 456, null, true ],
  "array_list": [ [ 12, 23 ], [ 34, 45 ], [ 56, 67 ] ],
  "object_list": [
    { "name": "Tanaka", "age": 26 },
    { "name": "Suzuki", "age": 32 }
  ]
}
```

---

# 💪 筋トレ記録アプリ

上でまとめた HTTP の知識（HTTPメソッド・ステータスコード・クエリ文字列・パスパラメータ・JSON）を実際に使って作った Web アプリです。
インターネットに公開して、スマホから使うこともできます。

## 機能

- **記録する**: 種目・重量・回数・セット数を日付ごとに記録（編集・削除もできる）
- **履歴**: 過去のトレーニングを日付ごとに一覧表示
- **グラフ**: 種目を選ぶと「最大重量」と「総ボリューム（重量×回数×セット）」の推移を折れ線グラフで表示（タップで値を表示）
- **体重**: 体重の記録と推移グラフ
- **ログイン**: パスワードを設定すると、ログインした人だけが使える
- **ホーム画面に追加**: スマホのホーム画面に追加すると、アプリのように全画面で開ける

## 自分のパソコンで動かす

```bash
npm install   # 初回のみ
npm start     # サーバー起動
```

起動したらブラウザで http://localhost:3000 を開きます。
何も設定しなければ、データは `data/` フォルダの JSON ファイルに保存され、ログインなしで使えます。

## スマホから使う（インターネットに公開する）

無料で使える次の2つのサービスを組み合わせます。どちらも GitHub アカウントで登録できます。

- **[Neon](https://neon.com)**: データベース（PostgreSQL）を置く場所
- **[Render](https://render.com)**: サーバー（`server.js`）を動かす場所

### 1. Neon でデータベースを作る

1. https://neon.com でアカウントを作る
2. 「New Project」でプロジェクトを作る（リージョンは日本に近い **Singapore** がおすすめ）
3. ダッシュボードの「**Connect**」ボタンを押し、表示された接続文字列をコピーしておく
   （`postgresql://ユーザー名:パスワード@ep-xxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require` のような形）

テーブルはアプリの初回起動時に自動で作られるので、Neon 側での作業はこれだけです。

> Render のログに `SECURITY WARNING: The SSL modes 'prefer', 'require', and 'verify-ca' are treated as aliases for 'verify-full'` と出ることがありますが、「通信相手の証明書をいちばん厳しく確認している」という意味の通知なので問題ありません。消したい場合は、接続文字列の `sslmode=require` を `sslmode=verify-full` に書き換えてください。

### 2. Render にデプロイする

1. https://render.com に GitHub アカウントで登録する
2. ダッシュボードで「**New**」→「**Blueprint**」を選び、このリポジトリ（`specialhomework`）を選ぶ
   - リポジトリの `render.yaml` が読み込まれて、設定が自動で入ります
3. 入力を求められる2つの値を入れる
   - `DATABASE_URL`: 手順1でコピーした Neon の接続文字列
   - `APP_PASSWORD`: ログインに使うパスワード（**長めで、他で使っていないもの**にする）
4. 「Apply」（または「Deploy」）を押して数分待つ
5. 完了すると `https://workout-tracker-xxxx.onrender.com` のような URL が発行される

以降は、GitHub の `main` ブランチにプッシュするたびに自動でデプロイし直されます。

### 3. スマホで開く

1. 発行された URL をスマホのブラウザで開いて、パスワードでログインする
2. ホーム画面に追加する
   - **iPhone**（Safari）: 共有ボタン →「ホーム画面に追加」
   - **Android**（Chrome）: 右上のメニュー →「ホーム画面に追加」

一度ログインすれば、90日間はログインし直さなくて大丈夫です。

### 無料プランの注意点

- Render の無料プランは、**15分アクセスがないとサーバーが眠ります**。眠っているときに開くと、表示まで1分ほどかかります（2回目以降はすぐ開きます）
- Neon の無料プランの保存容量は 0.5〜1GB ほどです。筋トレ記録なら何年分でも十分収まります
- Render のサーバー上のファイルは再起動のたびに消えるので、データは必ず Neon に保存されるようにしています（`DATABASE_URL` を設定するとデータベースに保存されます）

## 環境変数

| 名前 | 役割 | 未設定のとき |
|---|---|---|
| `DATABASE_URL` | PostgreSQL の接続文字列 | `data/` の JSON ファイルに保存 |
| `APP_PASSWORD` | ログインパスワード | ログインなしで使える |
| `SESSION_SECRET` | ログイン状態を記録する Cookie の署名に使う秘密の鍵 | 起動のたびにランダムに作る（再起動でログアウトされる） |
| `NODE_ENV` | `production` にすると本番モード（HTTPS 用の Cookie 設定など） | 開発モード |
| `PORT` | 待ち受けるポート番号 | `3000` |

本番モードでは、`APP_PASSWORD` と `SESSION_SECRET` が設定されていないとサーバーが起動しないようにしています（パスワードなしで公開してしまう事故を防ぐため）。

## 技術構成

- サーバー: Node.js + Express 5（`server.js`）
- ログイン: パスワード1つ + 署名付き Cookie（`auth.js`）
- データ保存: `storage/` で切り替え
  - `DATABASE_URL` があれば PostgreSQL（`storage/pgStorage.js`）
  - なければ JSON ファイル（`storage/fileStorage.js`）
- フロントエンド: 素の HTML / CSS / JavaScript（`public/`）。グラフは Canvas API で自前描画

## API 仕様（学習メモとの対応）

`/api/session`・`/api/login`・`/api/logout` 以外は、ログインしていないと **401** が返ります。

| メソッド | パス | 役割 | 返すステータスコード |
|---|---|---|---|
| GET | `/api/session` | ログインが必要か・ログイン済みかを返す | 200 |
| POST | `/api/login` | パスワードを送ってログイン（成功すると Cookie が発行される） | 200 / 401 / 429 |
| POST | `/api/logout` | ログアウト（Cookie を消す） | 200 |
| GET | `/api/workouts` | 記録一覧の取得。**クエリ文字列** `?date=YYYY-MM-DD` や `?exercise=種目名` で絞り込みできる | 200 |
| POST | `/api/workouts` | 記録の追加（リクエストボディに JSON を入れて送る） | 201 / 400 |
| PUT | `/api/workouts/:id` | **パスパラメータ** `:id` で指定した記録をまるごと置き換えて更新 | 200 / 400 / 404 |
| DELETE | `/api/workouts/:id` | 記録の削除 | 200 / 404 |
| GET | `/api/weights` | 体重記録の一覧取得 | 200 |
| POST | `/api/weights` | 体重の追加（同じ日付があれば上書き） | 201 / 400 |
| DELETE | `/api/weights/:date` | 指定した日付の体重記録を削除 | 200 / 404 |

- **201**: リソースの作成に成功したとき（POST）
- **400**: 入力内容に問題があるとき（バリデーションエラー）
- **401**: ログインしていない・パスワードが違うとき
- **404**: 指定した ID・日付の記録が見つからないとき
- **429**: ログインの失敗が続いたとき（15分間に10回失敗すると、しばらく受け付けない）
- **500**: サーバー側の予期しないエラー（データベースに繋がらない等）

`curl` での動作確認の例（ローカルでパスワードなしの場合）:

```bash
# 記録を追加（POST → 201）
curl -X POST http://localhost:3000/api/workouts \
  -H 'Content-Type: application/json' \
  -d '{"date":"2026-07-09","exercise":"ベンチプレス","weight":60,"reps":10,"sets":3}'

# クエリ文字列で日付を絞り込んで取得（GET → 200）
curl 'http://localhost:3000/api/workouts?date=2026-07-09'
```
