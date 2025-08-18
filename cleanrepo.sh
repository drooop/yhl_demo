#!/usr/bin/env bash
set -euo pipefail

main_branch="main"

git fetch --prune

echo "=== 删除本地分支(除 $main_branch)==="
git branch | grep -vE "^\*? *$main_branch$" | xargs git branch -D

echo "=== 删除远端分支(除 $main_branch) ==="
git branch -r \
  | grep -vE "origin/(HEAD|$main_branch)$" \
  | sed 's|origin/||' \
  | xargs -I {} git push origin --delete {}

git fetch --prune
echo "清理完成"
