#!/bin/bash
# ============================================================
# Projects Hub 部署/更新脚本
# 用法：cd /opt/projects-hub && bash deploy/2_deploy.sh
# 每次代码更新后运行此脚本即可
# ============================================================
set -e

APP_DIR=/opt/projects-hub
cd "$APP_DIR"

echo "📥 拉取最新代码..."
git pull

echo "📦 安装依赖（生产模式）..."
pnpm install --frozen-lockfile

echo "🔨 构建 Next.js..."
pnpm build
echo "✅ 构建完成 → .next/"

# ── 配置 Nginx ──────────────────────────────────────────────
echo "⚙️  更新 Nginx 配置..."
cp "$APP_DIR/deploy/nginx.conf" /etc/nginx/sites-available/projects-hub
ln -sf /etc/nginx/sites-available/projects-hub /etc/nginx/sites-enabled/projects-hub
nginx -t && systemctl reload nginx
echo "✅ Nginx 已更新"

# ── 配置并重启 systemd 服务 ────────────────────────────────
echo "⚙️  更新服务..."
cp "$APP_DIR/deploy/projects-hub.service" /etc/systemd/system/projects-hub.service
systemctl daemon-reload
systemctl enable projects-hub
systemctl restart projects-hub
sleep 2

if systemctl is-active --quiet projects-hub; then
  echo "✅ 服务运行中"
else
  echo "❌ 服务启动失败，查看日志："
  journalctl -u projects-hub -n 30
  exit 1
fi

echo ""
echo "🎉 部署完成！"
echo "   访问地址：https://fysxq.lat"
echo ""
echo "💡 如果是第一次部署，还需要申请 SSL 证书："
echo "   certbot --nginx -d fysxq.lat -d www.fysxq.lat"
