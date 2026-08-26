#!/usr/bin/env bash
# ============================================================
# lankHub 一键备份脚本（更新前调用）
# 备份内容：
#   1. dev.db          —— SQLite 数据库（文章/评论/账号/简历等全部记录）
#   2. data/uploads/   —— 用户上传的图片（相册/封面/简历 PDF）
#   3. git tag         —— 当前代码版本快照（用于代码回滚）
# 三者的时间戳一致，恢复时配套使用。
# 保留策略：最近 5 份，更旧的自动清理。
# ============================================================
set -e
cd "$(dirname "$0")/.."

TS=$(date +%Y%m%d%H%M%S)
echo "==> 开始备份 ($TS)"

# 1. 备份数据库
if [ -f dev.db ]; then
  cp dev.db "dev.db.bak.$TS"
  echo "    ✓ dev.db -> dev.db.bak.$TS"
else
  echo "    ⚠ dev.db 不存在，跳过数据库备份"
fi

# 2. 备份上传文件（压缩）
if [ -d data/uploads ]; then
  tar czf "uploads.bak.$TS.tar.gz" data/uploads
  echo "    ✓ data/uploads -> uploads.bak.$TS.tar.gz"
else
  echo "    ⚠ data/uploads 不存在，跳过图片备份"
fi

# 3. 代码版本快照（git tag，防止与已有 tag 重名）
TAG="backup/$TS"
if git rev-parse "$TAG" >/dev/null 2>&1; then
  echo "    ⚠ tag $TAG 已存在，跳过代码快照"
else
  git tag "$TAG"
  echo "    ✓ 代码快照 -> git tag $TAG"
fi

# 4. 清理旧备份（保留最近 5 份）
ls -t dev.db.bak.* 2>/dev/null | tail -n +6 | xargs -r rm -f
ls -t uploads.bak.*.tar.gz 2>/dev/null | tail -n +6 | xargs -r rm -f
echo "    ✓ 已清理 5 份之前的旧备份"

echo "==> 备份完成"
