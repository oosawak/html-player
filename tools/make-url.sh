#!/bin/sh
# 使い方: tools/make-url.sh <HTMLファイル または そのURL>
# HTMLを gzip 圧縮して、HTMLプレイヤーの埋め込みURL（#p=）を標準出力に出す。
set -eu
PLAYER="https://oosawak.github.io/html-player/"
SRC="${1:?使い方: make-url.sh <HTMLファイル|URL>}"
TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT
case "$SRC" in
  http://*|https://*) curl -fsSL "$SRC" -o "$TMP" ;;
  *) cp "$SRC" "$TMP" ;;
esac
python3 - "$TMP" "$PLAYER" <<'PY'
import sys, gzip, base64
data = open(sys.argv[1], 'rb').read()
gz = gzip.compress(data, compresslevel=9)
b64 = base64.urlsafe_b64encode(gz).decode().rstrip('=')
url = sys.argv[2] + "#p=" + b64
print(url)
print(f"# 元 {len(data)} バイト → gzip {len(gz)} バイト → URL {len(url)} 文字" +
      ("（Xの4,096文字に収まります）" if len(url) <= 4096 else "（Xの4,096文字を超えます）"), file=sys.stderr)
PY
