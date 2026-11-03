# HTMLプレイヤー

ブラウザで動く、カートリッジ式の小さなゲームプレイヤーです。

カートリッジは「普通のHTMLファイル」です。専用の形式や専用のAPIに合わせて作り直す必要はありません。公開されたURLにあるHTMLページを、プレイヤーがそのまま読み込んで動かします。

- プレイヤー: https://oosawak.github.io/html-player/
- ライセンス: MIT（プレイヤー本体・収録カートリッジとも）

## 着想

北尾崇氏の Playload（ゲーム本体をURLに収めた小さなエンジン、MIT）に着想を得ました。こちらは「受け皿の方が、世の中にすでにあるHTMLに合わせる」設計にしています。作り手は、いつものHTMLを書くだけです。

## 実装について

本プロジェクトは独自実装です。Playloadのソースコードは使用していません（仕様を確認するために読んだだけです）。圧縮の形式も異なります（こちらは gzip）。借りているのは「URLにゲームを詰める」という発想だけです。

## 作るときの縛り

作り手が新しく覚える作法は、特にありません。残る縛りは、ほぼ「サイズ」だけです。

| 配り方 | 縛り |
|---|---|
| URL指定（?game=） | 実質なし。ブラウザで動くHTMLならそのまま使えます |
| URL埋め込み（#p=） | ゲーム本体を1ファイルに収め、圧縮して約3KBが目安（URL全体をXの4,096文字に収める場合）。ブラウザで開くだけなら、もう少し大きくても動きます |

## 共通部品はプレイヤー側が持つ

フォントやアイコン、共通のJavaScriptは、カートリッジには入れず、プレイヤー側が持ってゲームに渡します。そのためカートリッジは小さく作れます。代わりに、それらを使うゲームは単体ファイルだけでは完結しません（プレイヤー上で動かす前提です）。

プレイヤーが持っている共通部品:

- 標準フォント6種（HP Serif／HP Sans／HP Round／HP Mono／HP Dot／HP Denki）
- アイコンフォント RPG Awesome（モンスターや武器のアイコン）
- hp.js（2D向けの共通ライブラリー。下記）
- three.js（3D向けライブラリ、r128）

## 共通ライブラリー hp.js の使い方

2Dゲーム向けの小さな共通ライブラリーです。入力（十字キー／A／Bボタン）、ゲームループ、効果音をまとめています。カートリッジのHTMLから読み込むだけで使えます。

```html
<script src="https://oosawak.github.io/html-player/assets/hp.js"></script>
```

| 書き方 | 意味 |
|---|---|
| `HP.loop(function(dt){ ... })` | ゲームループを始める。dt は前フレームからの秒数 |
| `HP.left()` / `HP.right()` / `HP.up()` / `HP.down()` | 十字キーが押されている間 true |
| `HP.a()` / `HP.b()` | Aボタン（Space）／Bボタン（KeyX）が押されている間 true |
| `HP.aHit()` / `HP.bHit()` | 押した瞬間だけ true（タイトル画面の決定などに） |
| `HP.bar(g, x, y, w, h, ratio, color, bg)` | ゲージ（体力やエネルギーのバー）を描く。ratio は 0〜1 |
| `HP.text(g, s, x, y, size, color, align, font)` | 文字を描く。align は left／right／center |
| `HP.panel(g, x, y, w, h, fill, stroke)` | パネル（半透明の板）を描く |
| `HP.title(g, W, H, title, lines, color)` | タイトル画面を描く。lines は説明文の配列 |
| `HP.beep(freq, dur, type, vol)` | 効果音を鳴らす。freq=周波数、dur=長さ（秒）、type=波形（省略時 square）、vol=音量（省略時 0.04） |
| `HP.keys` | 押されているキーの一覧（キーコードを名前として持つオブジェクト） |

使用例（十字キーでキャラクターを動かす）:

```js
let x = 100, y = 100;
HP.loop(function(dt){
  if (HP.left())  x -= 200 * dt;
  if (HP.right()) x += 200 * dt;
  if (HP.up())    y -= 200 * dt;
  if (HP.down())  y += 200 * dt;
  if (HP.aHit())  HP.beep(880, 0.08);
  // ここで x, y にキャラクターを描く
});
```

キーボードで直接遊ぶ場合も、プレイヤーの画面コントローラーで遊ぶ場合も、同じ書き方で動きます（コントローラーはキー入力としてゲームに届くため）。

ライブラリーの使用は任意です。使わなくてもゲームは作れます。その場合は、入力の受け取りやゲームループ、効果音などをすべて自前のコードで実装してください。どちらの場合も、埋め込みURLが4,096文字以下に収まることが目標です（ライブラリーを使うと、その分だけゲーム本体を小さくできます）。

## 収録カートリッジ

| カートリッジ | 内容 | URL |
|---|---|---|
| 一騎討ち ― 刹那の一閃 | 「！」で斬る反射神経の決闘、5人抜き | https://oosawak.github.io/ikkiuchi/ |
| 一人麻雀 | ツモって切って和了を目指す一人打ち | https://oosawak.github.io/hitori-mahjong/ |
| 上海 ― 牌消し | 同じ牌のペアを消していくパズル | https://oosawak.github.io/shanghai/ |
| Cube Core Dungeon | 3Dダンジョン（約90KB）。埋め込みではなくURL指定で差す大型カートリッジの例 | https://oosawak.github.io/CubeCoreDungeon/ |
| DUNGEON//LOAD | Rust/WASMのダンジョン（外部ファイル・CDN併用の大型例、URL指定） | https://oosawak.github.io/rustgames/play/dungeonload/index.html |
| モンスターあわせ | アイコン神経衰弱。RPG Awesomeをプレイヤー供給で使い、埋め込みでもアイコンが出る例 | https://oosawak.github.io/monster-awase/ |
| モンスターハント | アイコン射撃場。タップと十字キー＋A/Bの両対応で、コントローラーの実験も兼ねる | https://oosawak.github.io/monster-hunt/ |
| スターブレイカー（共通Lib） | 全方位シューティング。敵が360度から寄ってきて、ショットは自動で一番近い敵を追尾する | https://oosawak.github.io/html-player/games/star-breaker/ |
| リングバースト（共通Lib） | 攻撃は自分の周りに広がる円だけ。ゲージが溜まったらタップで発動する | https://oosawak.github.io/html-player/games/ring-burst/ |

## カートリッジの配り方（2形式）

### 1. URL指定（?game=）

`https://oosawak.github.io/html-player/?game=<ゲームのURL>`

ゲーム本体は置かれた場所のまま、プレイヤーが読み込みます。サイズ制限はありません。

### 2. URL埋め込み（#p=）

ゲームのHTMLを gzip 圧縮し、base64url に変換して、プレイヤーのURLの `#p=` の後ろに付けます。ファイルの置き場所なしに、URLそのものがカートリッジになります。

`https://oosawak.github.io/html-player/#p=<base64url>`

圧縮後のサイズを約3KB以下に収めると、URL全体が4,096文字以下になり、Xのポストにも収まります（一騎討ちはこの形式でも配布できます）。

## カートリッジの作り方

1. HTMLファイル1枚で動くゲームを作る（外部ファイルに依存しない形が理想）
2. 公開できるURLに置く（GitHub Pages など）
3. プレイヤーの「URLを指定する」から読み込めば、その場で遊べます。共有は `?game=` 形式のURLで

プレイヤー左上のセレクトへの登録は、このリポジトリの index.html の選択肢への追加です。

カートリッジ作りの仕様書は [CARTRIDGE.md](CARTRIDGE.md) です。作りたいゲームを書くための雛形は [TEMPLATE.md](TEMPLATE.md) です（記入例つき）。AIに読ませて作らせる使い方を想定しています。入力の約束（十字キー＝矢印キー、A＝Space、B＝KeyX）と、プレイヤー内蔵の画面コントローラーの仕様もここにあります。

## 仕様メモ

- プレイヤーは iframe（sandbox 属性付き）でカートリッジを実行します
- `#p=` の解凍はブラウザ標準の DecompressionStream（gzip）を使います
- バージョン: v0.16（カートリッジ9本収録、URL作成ツール、画面コントローラー、標準フォント付き）

## URL作成ツール

プレイヤーのページ内に「カートリッジのURLを作る」ツールがあります。

- HTMLファイルのURLを入れると、中身を読み込んで埋め込みURL（#p=）を作ります（読み込みは相手サイトの許可範囲内。GitHub Pages などでは動作します）
- HTMLを直接貼り付けても作れます
- 圧縮はブラウザ標準の CompressionStream（gzip）で行い、サーバーには送りません
- URLを作ると、Xへの投稿文のたたき台（タイトル入り）が自動で入り、文字数（X換算）も表示されます。コピーしてそのまま投稿できます

### シェルスクリプト版

`tools/make-url.sh` ― 引数にHTMLファイルのパス、またはそのURLを渡すと、埋め込みURLを標準出力に出します（要: curl / python3）。

```
tools/make-url.sh game.html
tools/make-url.sh https://example.github.io/game/
```
