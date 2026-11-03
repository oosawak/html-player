# カートリッジの作り方（AIに読ませる用仕様書）

これは HTMLプレイヤー（https://oosawak.github.io/html-player/ ）のカートリッジ（ゲーム）を作るための仕様書です。人間が読んでも、AIに読ませて作らせても、そのまま使えます。

## カートリッジとは

- 普通のHTMLファイル1枚で動くゲームです。専用のAPIや形式はありません。
- プレイヤーは iframe でそのHTMLを読み込んで実行します。
- 配り方は2形式あります。
  - URL指定: `https://oosawak.github.io/html-player/?game=<ゲームのURL>`
  - URL埋め込み: HTMLを gzip 圧縮して base64url 化し、`https://oosawak.github.io/html-player/#p=<文字列>` とする。ファイルの置き場所なしに、URLそのものがカートリッジになる。

## 必須の約束

1. **HTMLファイル1枚で完結すること。** 外部の画像・スクリプト・フォントに依存しない（埋め込み形式では外部ファイルは読み込まれません）。画像は Canvas 描画か、data URI か、絵文字・文字で表現する。
2. **単体で開いてもそのまま遊べること。** プレイヤー専用の初期化は不要な形にする。
3. **通信を前提にしないこと。** 外部サーバーへの fetch や WebSocket がなくても遊べること。記録の保存は localStorage を使う。
4. **`<meta name="viewport" content="width=device-width, initial-scale=1">` を入れること。** スマホで崩れないこと。画面は縦持ち・横持ちどちらでも遊べるのが理想。

## 入力（コントローラー仕様）

プレイヤーには画面コントローラーが付いています（十字キー＋A/Bボタン）。コントローラーは、以下のキーボードイベントとしてカートリッジに届きます。ゲームは通常の `keydown` / `keyup`（`e.code`）で受けてください。

| コントローラー | キー（e.code） | 用途の目安 |
|---|---|---|
| 十字キー | ArrowLeft / ArrowRight / ArrowUp / ArrowDown | 移動 |
| Aボタン | Space | 決定・攻撃・ジャンプなど主アクション |
| Bボタン | KeyX | キャンセル・副アクション |

- タップ／クリック（pointerdown）でも遊べるようにすると、コントローラーを出さなくても遊べて親切です。
- 他ドメインに置いたカートリッジにはキーイベントが直接届かない場合があります。その場合は postMessage でも同じ入力が送られます: `window.addEventListener("message", e => { if(e.data && e.data.t === "hp-key") { /* e.data.code, e.data.down */ } })`。対応は任意です。

## サイズの目安

- URL指定（?game=）で配るだけなら、サイズ制限は実質ありません。
- URL埋め込み（#p=）で、かつXのポストに収めたい場合は、**圧縮後 約3KB / URL全体 4,096文字以内** が目安です。
  - 測り方: プレイヤー内蔵ツール「カートリッジのURLを作る」で、元のサイズ・圧縮後サイズ・URLの文字数が出ます。
  - シェルでは `tools/make-url.sh <ファイル|URL>` でも作れます。
- 圧縮は gzip（ブラウザ標準の CompressionStream / DecompressionStream）です。

## 作り方の手順（AIに作らせる場合の型）

1. この仕様書を読ませる。
2. ゲームのルールを短く決める（1ゲーム＝1つの芯の遊び）。
3. 単一HTMLで実装する。見た目は Canvas か DOM、音は WebAudio の簡単な効果音まで。
4. プレイヤーのツールで埋め込みURLを作り、サイズを確認する。超える場合は、演出と文章から削る。
5. 実機（スマホ）で、タップとコントローラーの両方で遊べることを確認する。

## 収録済みカートリッジ（手本）

- 一騎討ち ― 刹那の一閃（反射神経、タップとSpace）: https://github.com/oosawak/ikkiuchi
- 一人麻雀（タップ操作）: https://github.com/oosawak/hitori-mahjong
- 上海 ― 牌消し（タップ操作）: https://github.com/oosawak/shanghai

## ライセンス

プレイヤー本体・収録カートリッジは MIT ライセンスです。自作カートリッジのライセンスは作者の自由です。
