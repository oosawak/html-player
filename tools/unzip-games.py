#!/usr/bin/env python3
"""games/*.zip をカセットとして展開する。

zip を games/ に置くと、games/<名前>/ へ展開し、game.md が無ければ作る。
index.html がサブフォルダの中にある場合は、そのフォルダをルートとして展開する。
展開先フォルダが既にある場合は何もしない（フォルダ側が正本）。
"""
import os
import sys
import zipfile

GAMES = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "games")


def safe_members(zf):
    out = []
    for info in zf.infolist():
        name = info.filename
        if name.endswith("/"):
            continue
        parts = [p for p in name.split("/") if p not in ("", ".", "..")]
        if len(parts) != len(name.split("/")) - (1 if name.endswith("/") else 0) and ".." in name.split("/"):
            continue
        if parts:
            out.append((info, "/".join(parts)))
    return out


def main():
    if not os.path.isdir(GAMES):
        return 0
    for fn in sorted(os.listdir(GAMES)):
        if not fn.lower().endswith(".zip"):
            continue
        stem = fn[:-4]
        target = os.path.join(GAMES, stem)
        if os.path.isdir(target):
            continue
        zpath = os.path.join(GAMES, fn)
        try:
            zf = zipfile.ZipFile(zpath)
        except Exception as e:
            print(f"skip {fn}: {e}")
            continue
        members = safe_members(zf)
        # index.html のある階層をルートにする（最浅のもの）
        roots = [p for _, p in members if p.split("/")[-1] == "index.html"]
        if not roots:
            print(f"skip {fn}: index.html が無い")
            continue
        root = min(roots, key=lambda p: p.count("/"))
        prefix = root[: -len("index.html")]
        os.makedirs(target, exist_ok=True)
        n = 0
        for info, path in members:
            if prefix and not path.startswith(prefix):
                continue
            rel = path[len(prefix):] if prefix else path
            if not rel:
                continue
            dest = os.path.join(target, rel)
            os.makedirs(os.path.dirname(dest), exist_ok=True)
            with zf.open(info) as src, open(dest, "wb") as out:
                out.write(src.read())
            n += 1
        md = os.path.join(target, "game.md")
        if not os.path.exists(md):
            with open(md, "w", encoding="utf-8") as f:
                f.write(f"---\ntitle: {stem}\nlib: none\ngenre: \norder: 900\n---\n\nzip から登録したカセット。\n")
        print(f"unzipped {fn} -> games/{stem}/ ({n} files)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
