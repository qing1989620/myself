#!/usr/bin/env bash
# ============================================================
# QingHub 一键恢复脚本 —— 完美恢复到上一版
#
# 用法：
#   bash scripts/restore.sh              # 恢复到最近一份备份
#   bash scripts/restore.sh 20260819143000  # 恢复到指定时间戳的备份
#
# 恢复内容（与 backup.sh 的备份一一对应）：
#   1. dev.db 数据库
#   2. data/uploads 上传图片
#   3. 对应 git tag 的代码版本
# 然后重装依赖 → 构建 → 重启 PM2 服务。
#
# 注意：会覆盖当前 dev.db 和 data/uploads，执行前请确认。
# ============================================================
set -e
cd "$(dirname "$0")/.."

# 选择备份时间戳
if [ -n "$1" ]; then
  TS="$1"
else
  TS=$(ls -t dev.db.bak.* 2>/dev/null | head -1 | sed 's/^dev\.db\.bak\.//' || true)
fi

if [ -z "$TS" ]; then
  echo "错误：没有找到任何备份。可用备份列表："
  ls -t dev.db.bak.* 2>/dev/null || echo "（无）"
  exit 1
fi

echo "==> 准备恢复到备份 $TS"
echo "    数据库: dev.db.bak.$TS"
echo "    图片:   uploads.bak.$TS.tar.gz"
echo "    代码:   git tag backup/$TS"
echo ""
read -p "确认恢复？将覆盖当前数据 (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
  echo "已取消"
  exit 1
fi

# 1. 恢复数据库
if [ -f "dev.db.bak.$TS" ]; then
  cp "dev.db.bak.$TS" dev.db
  echo "    ✓ dev.db 已恢复"
else
  echo "    ⚠ dev.db.bak.$TS 不存在，跳过数据库恢复"
fi

# 2. 恢复上传图片
if [ -f "uploads.bak.$TS.tar.gz" ]; then
  rm -rf data/uploads
  mkdir -p data/uploads
  tar xzf "uploads.bak.$TS.tar.gz" -C .
  echo "    ✓ data/uploads 已恢复"
else
  echo "    ⚠ uploads.bak.$TS.tar.gz 不存在，跳过图片恢复"
fi

# 3. 恢复代码版本
if git rev-parse "backup/$TS" >/dev/null 2>&1; then
  git checkout -- .
  git checkout "backup/$TS"
  echo "    ✓ 代码已恢复到 tag backup/$TS ($(git log -1 --format=%h))"
else
  echo "    ⚠ 找不到 tag backup/$TS，保留当前代码（数据已恢复）"
fi

# 4. 重装依赖（国内镜像）
export better_sqlite3_binary_host=https://npmmirror.com/mirrors/better-sqlite3
export NODEJS_ORG_MIRROR=https://npmmirror.com/mirrors/node
export PRISMA_ENGINES_MIRROR=https://npmmirror.com/mirrors/prisma
npm ci --prefer-offline --ignore-scripts
npm rebuild better-sqlite3 --build-from-source

# 5. 同步数据库并构建
npm run db:push
npm run build

# 6. 重启服务
pm2 restart next-app

echo ""
echo "==> 恢复完成！服务已重启。"
echo "    验证：pm2 status && 浏览器访问网站确认数据正常"
