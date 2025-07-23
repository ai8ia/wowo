name: 🛠 Fix Tokens JSON Daily

on:
  schedule:
    - cron: '0 8 * * *'  # 每天上午 8:00 UTC（台灣時間下午 4:00）
  workflow_dispatch:      # 可手動啟動

jobs:
  fix-json:
    runs-on: ubuntu-latest
    steps:
      - name: 🔄 Checkout Repo
        uses: actions/checkout@v3

      - name: 🧰 Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: 📦 Install Dependencies
        run: npm install || echo "No packages needed"

      - name: 🔧 Run fixTokens.js
        run: node scripts/fixTokens.js

      - name: 📝 Commit & Push 修復結果
        run: |
          git config user.name "MCP AutoFix Bot"
          git config user.email "mcp@automation.win"
          git add public/tokens.json
          git commit -m "🛠 每日自動修復 tokens.json 結構"
          git push
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
