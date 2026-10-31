#!/usr/bin/env bash
# 一鍵部署到 GitHub Pages：加密 → 建 repo（第一次）→ push → 開啟 Pages。
# 用法：./deploy.sh [repo 名稱，預設 life-game-guide]
# 需要：git、node 18+、gh（已 gh auth login）
set -euo pipefail
cd "$(dirname "$0")"
REPO="${1:-life-game-guide}"
VISIBILITY="${VISIBILITY:-public}"   # 免費帳號的 Pages 只能用 public repo；內容已加密。GitHub Pro 可設 VISIBILITY=private

for c in git node gh; do command -v "$c" >/dev/null || { echo "缺少 $c"; exit 1; }; done
gh auth status >/dev/null 2>&1 || { echo "請先執行 gh auth login"; exit 1; }
OWNER="$(gh api user --jq .login)"

node tools/encrypt.mjs

[ -d .git ] || git init -q -b main
git add -A
git commit -q -m "Update life game guide $(date +%Y-%m-%d)" || echo "沒有新變更"

if gh repo view "$OWNER/$REPO" >/dev/null 2>&1; then
  git remote get-url origin >/dev/null 2>&1 || git remote add origin "https://github.com/$OWNER/$REPO.git"
  git push -q -u origin main
else
  gh repo create "$OWNER/$REPO" --"$VISIBILITY" --source . --remote origin --push \
    --description "Personal app (encrypted)"
fi

if ! gh api "repos/$OWNER/$REPO/pages" >/dev/null 2>&1; then
  gh api -X POST "repos/$OWNER/$REPO/pages" -f "source[branch]=main" -f "source[path]=/" >/dev/null
  echo "已開啟 GitHub Pages，第一次上線約需 1–2 分鐘。"
fi
echo "網址：https://$OWNER.github.io/$REPO/"
