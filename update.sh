#!/bin/bash
# 船舶新能源手册 - 一键更新脚本

cd /Users/niuniubaba/Documents/船舶新能源手册

echo "📝 请输入本次更新说明："
read commit_msg

if [ -z "$commit_msg" ]; then
    commit_msg="更新内容 $(date '+%Y-%m-%d %H:%M')"
fi

echo ""
echo "🔄 正在提交更改..."
git add .
git commit -m "$commit_msg"

echo ""
echo "⬆️  正在推送到 GitHub..."
git push

echo ""
echo "🚀 正在部署到 GitHub Pages..."
python3 -m mkdocs gh-deploy --force

echo ""
echo "✅ 完成！"
echo "🌐 在线地址：https://hcbwsw.github.io/Marine/"
echo ""
echo "按任意键退出..."
read -n 1
