#!/usr/bin/env python3
"""games/*/game.md（登録情報）と payload-url.txt から games.json を生成する。

登録の正本は各ゲームフォルダの game.md（frontmatter: title / lib / order）。
このスクリプトは GitHub Actions から push のたびに実行され、
プレイヤーが読む games.json を作る。手元でも同じコマンドで生成できる。

使い方: python3 tools/build-games-json.py
"""
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GAMES_DIR = os.path.join(ROOT, "games")
OUT = os.path.join(ROOT, "games.json")


def parse_frontmatter(path):
    text = open(path, encoding="utf-8").read()
    if not text.startswith("---"):
        return {}
    end = text.find("\n---", 3)
    if end < 0:
        return {}
    data = {}
    for line in text[3:end].splitlines():
        if ":" in line:
            key, val = line.split(":", 1)
            data[key.strip()] = val.strip()
    return data


def main():
    games = []
    warnings = []
    for slug in sorted(os.listdir(GAMES_DIR)):
        gdir = os.path.join(GAMES_DIR, slug)
        if not os.path.isdir(gdir):
            continue
        if not os.path.isfile(os.path.join(gdir, "index.html")):
            continue
        md_path = os.path.join(gdir, "game.md")
        if not os.path.isfile(md_path):
            warnings.append(f"game.md がありません: games/{slug}/")
            continue
        fm = parse_frontmatter(md_path)
        title = fm.get("title", slug)
        lib = fm.get("lib", "false").lower() == "true"
        try:
            order = int(fm.get("order", "999"))
        except ValueError:
            order = 999
        payload = ""
        ppath = os.path.join(gdir, "payload-url.txt")
        if os.path.isfile(ppath):
            payload = open(ppath, encoding="utf-8").read().strip()
        games.append({
            "slug": slug,
            "title": title,
            "lib": lib,
            "genre": fm.get("genre", ""),
            "order": order,
            "path": f"games/{slug}/",
            "thumb": f"assets/thumbs/{slug}.jpg",
            "payload": payload,
            "chars": len(payload),
        })
    games.sort(key=lambda g: (g["order"], g["slug"]))
    for g in games:
        del g["order"]
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump({"games": games}, f, ensure_ascii=False, indent=1)
        f.write("\n")
    for w in warnings:
        print("警告:", w, file=sys.stderr)
    # オフライン保存用に、プレイヤー一式のファイル一覧を作る
    files = ["games.json", "sw.js"]
    for base in ("games", "assets"):
        for dirpath, _dirnames, filenames in os.walk(os.path.join(ROOT, base)):
            for fn in filenames:
                if fn in ("game.md", "payload-url.txt"):
                    continue
                rel = os.path.relpath(os.path.join(dirpath, fn), ROOT)
                files.append(rel.replace(os.sep, "/"))
    files = sorted(set(files))
    with open(os.path.join(ROOT, "sw-manifest.json"), "w", encoding="utf-8") as f:
        json.dump({"files": files}, f, ensure_ascii=False, indent=1)
        f.write("\n")
    print(f"sw-manifest.json を生成しました（{len(files)}ファイル）")
    print(f"games.json を生成しました（{len(games)}本）")
    for g in games:
        print(f"  {g['slug']}: {g['title']} / lib={g['lib']} / {g['chars']}文字")


if __name__ == "__main__":
    main()
