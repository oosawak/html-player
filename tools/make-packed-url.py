#!/usr/bin/env python3
# 使い方: tools/make-packed-url.py <HTMLファイル>
# HTMLを gzip 圧縮し、1文字15ビットのUnicode詰めで埋め込みURL（#u=）にして標準出力に出す。
# 復号は ptest.html（試作）／将来はプレイヤー本体で行う。
import sys, gzip

RANGES = [(0x3400, 0x4DBF), (0x4E00, 0x9FFF), (0xAC00, 0xBFFF), (0xC000, 0xC03F)]
ALPHA = [c for a, b in RANGES for c in range(a, b + 1)]
assert len(ALPHA) == 32768

def pack(data: bytes) -> str:
    gz = gzip.compress(data, compresslevel=9, mtime=0)
    n = len(gz)
    vals = [n >> 15, n & 0x7FFF]
    acc = 0; nbits = 0
    for byte in gz:
        acc = (acc << 8) | byte; nbits += 8
        while nbits >= 15:
            nbits -= 15
            vals.append((acc >> nbits) & 0x7FFF)
            acc &= (1 << nbits) - 1
    if nbits:
        vals.append((acc << (15 - nbits)) & 0x7FFF)
    return ''.join(chr(ALPHA[v]) for v in vals)

if __name__ == '__main__':
    data = open(sys.argv[1], 'rb').read()
    packed = pack(data)
    url = 'https://oosawak.github.io/html-player/ptest.html#u=' + packed
    print(url)
    print(f"# 元 {len(data)} バイト → 詰めたURL {len(url)} 文字", file=sys.stderr)
