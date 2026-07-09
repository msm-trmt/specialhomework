
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

## 機能

- **記録する**: 種目・重量・回数・セット数を日付ごとに記録（編集・削除もできる）
- **履歴**: 過去のトレーニングを日付ごとに一覧表示
- **グラフ**: 種目を選ぶと「最大重量」と「総ボリューム（重量×回数×セット）」の推移を折れ線グラフで表示
- **体重**: 体重の記録と推移グラフ

## 使い方

```bash
npm install   # 初回のみ
npm start     # サーバー起動
```

起動したらブラウザで http://localhost:3000 を開きます。
データは `data/` フォルダの JSON ファイルに保存されます。

## 技術構成

- サーバー: Node.js + Express（`server.js`）
- フロントエンド: 素の HTML / CSS / JavaScript（`public/`）。グラフは Canvas API で自前描画
- データ保存: JSON ファイル（`data/workouts.json`, `data/weights.json`）

## API 仕様（学習メモとの対応）

| メソッド | パス | 役割 | 返すステータスコード |
|---|---|---|---|
| GET | `/api/workouts` | 記録一覧の取得。**クエリ文字列** `?date=YYYY-MM-DD` や `?exercise=種目名` で絞り込みできる | 200 |
| POST | `/api/workouts` | 記録の追加（リクエストボディに JSON を入れて送る） | 201 / 400 |
| PUT | `/api/workouts/:id` | **パスパラメータ** `:id` で指定した記録をまるごと置き換えて更新 | 200 / 400 / 404 |
| DELETE | `/api/workouts/:id` | 記録の削除 | 200 / 404 |
| GET | `/api/weights` | 体重記録の一覧取得 | 200 |
| POST | `/api/weights` | 体重の追加（同じ日付があれば上書き） | 201 / 400 |
| DELETE | `/api/weights/:date` | 指定した日付の体重記録を削除 | 200 / 404 |

- **201**: リソースの作成に成功したとき（POST）
- **400**: 入力内容に問題があるとき（バリデーションエラー）
- **404**: 指定した ID・日付の記録が見つからないとき

`curl` での動作確認の例:

```bash
# 記録を追加（POST → 201）
curl -X POST http://localhost:3000/api/workouts \
  -H 'Content-Type: application/json' \
  -d '{"date":"2026-07-09","exercise":"ベンチプレス","weight":60,"reps":10,"sets":3}'

# クエリ文字列で日付を絞り込んで取得（GET → 200）
curl 'http://localhost:3000/api/workouts?date=2026-07-09'
```

