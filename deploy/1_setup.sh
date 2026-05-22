#!/bin/bash
# ============================================================
# Projects Hub 首次部署 - 一次性环境准备
# 用法：在服务器上执行 bash 1_setup.sh
# ============================================================
set -e

echo "🔧 检查 Node.js 与 pnpm..."
if ! command -v node >/dev/null 2>&1; then
  echo "❌ 未检测到 Node.js，请先安装 Node 20+ (推荐 22 LTS)"
  echo "   推荐用 nvm：https://github.com/nvm-sh/nvm"
  exit 1
fi

NODE_MAJOR=$(node -v | sed 's/v//;s/\..*//')
if [ "$NODE_MAJOR" -lt 20 ]; then
  echo "❌ Node 版本需要 >= 20，当前 $(node -v)"
  exit 1
fi

if ! command -v pnpm >/dev/null 2>&1; then
  echo "📦 安装 pnpm..."
  npm install -g pnpm
fi

echo "✅ Node $(node -v) · pnpm $(pnpm -v)"

echo ""
echo "下一步手动完成："
echo "  1. 到 Dynadot 把 fysxq.lat 的 A 记录指向本机 IP"
echo "  2. git clone <repo> /opt/projects-hub"
echo "  3. cd /opt/projects-hub && bash deploy/2_deploy.sh"
echo "  4. certbot --nginx -d fysxq.lat -d www.fysxq.lat   # 申请证书"
