# MCP 控制台｜群眾致富引擎™ 🚀

你好，探索者！👨‍🚀  
歡迎登艦 MCP 致富推薦艦橋™，這是一套結合 AI 推薦、趨勢分析、語音迎賓、視覺動畫的加密貨幣控制系統。

---

## 📊 功能亮點

- 多幣種三層走勢圖：價格／成交量／AI 趨勢分數
- MCP 推薦艦橋™ 卡片模組：每日推薦 Top3 潛力幣種
- 登艦動畫與語音引導（Web Speech API）
- 首頁封面品牌動畫（LOGO 展開＋探索者歡迎詞）
- 模組化程式架構，易於擴充與部署

---

## 📁 專案結構

/src ├── chart-builder.js # 幣種分析資料生成器 ├── recommend.js # 推薦邏輯引擎 ├── welcome.js # 登艦語音模組 ├── homepage-branding.js # Hero 封面動畫模組 ├── chart-data/ # 幣種資料 JSON

/public ├── index.html # 推薦艦橋首頁模組 ├── token.html # 三圖表分析頁面 ├── style.css # UI 樣式與動畫設計

/assets ├── mcp-logo.svg # 品牌 LOGO

---

## 🚀 快速開始

1. 將本專案 fork 或 clone 至本地環境  
2. 開啟 `index.html` ➝ 渲染首頁推薦模組  
3. 每日執行 `recommend.js` ➝ 產出推薦 JSON  
4. 部署至 GitHub Pages / Vercel / Cloudflare 等靜態伺服環境

---

## 🧠 推薦 JSON 格式範例

```json
[
  {
    "symbol": "SOL",
    "score": 9.1,
    "volume": 1220000000,
    "trend": "技術強勁，短期看多",
    "persona": "🔥 火星衝刺型 · 高波動高分"
  }
]
