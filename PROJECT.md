# 專案：日語文法教室（jp_grammar）

**類型**：個人日語學習網站（純靜態，GitHub Pages 部署）
**建立**：2026-07-10
**目標使用者**：母語中文、看得懂漢字的日語學習者；**主要目的＝讀懂日文新聞與廣告**
**線上網址**：https://richyli.github.io/jp-grammar/
**GitHub**：https://github.com/richyli/jp-grammar （repo: richyli/jp-grammar）
**本地路徑**：d:/Dropbox/Zettel/projects/jp_grammar/

## 設計理念（不可偏離）

1. **系統性全觀，不按等級切碎**：17 章照文法系統邏輯排列，每點標 JLPT N5–N1 但只當「海拔標記」，學習主線照系統走。
2. **解決閱讀問題的文法教室**：每章從真實風格新聞/廣告「開場謎題」出發（先讀不懂）→ 系統展開文法點 → 章末逐句解碼（證明讀懂了）。
3. **視覺化解說**：六種圖解引擎（structure 句子解剖／timeline 時間軸／flow 方向流程／table 對照表／tree 巢狀樹／compare 並列比較）。
4. **大量互動練習與多樣例句**：例句涵蓋新聞/廣告/日常/告示/購物/用餐/生活多場景。
5. **中文母語者優化**：解說台灣繁中；日文漢字全附振假名（可一鍵開關）。

## 檔案結構

```
index.html          入口（引用 17 個 data + 17 個 quiz + app.js）
app.js              渲染引擎（路由/視覺化/練習/測驗頁/進度/搜尋/振假名）
styles.css          樣式
SCHEMA.md           內容模組資料格式合約
QUIZ_SCHEMA.md      章末綜合測驗資料格式合約
data/m01…m17.js     17 章教學內容（每章一個文法系統）
quiz/m01…m17.js     17 章綜合測驗（各 50 題，題目標等級）
_repair/            初版修復計畫（歷史紀錄）
```

## 目前狀態與里程碑

| 里程碑 | 狀態 |
|---|---|
| M1 初版網站（17 章 403 點 899 練習題） | ✅ 2026-07-10 完成、已上 GitHub Pages |
| M2 測驗頁架構（路由/渲染/計分/成績） | ✅ 2026-07-10 完成、m01 已驗證 |
| M3 逐章大幅擴充：每點 10 例句＋6 練習題 | 🔄 進行中，分 17 次一章一章做 |
| M4 逐章 50 題綜合測驗（quiz/mXX_quiz.js） | 🔄 與 M3 同批進行 |

**M3/M4 執行方式**：一次一章、一個 agent 同時做「擴充該章例句/練習」＋「寫該章 50 題測驗」；主 session 逐章推進、逐章 node --check + headless 驗證、逐章 commit。

## 關鍵數字（M1 完成時，會隨 M3/M4 增長）

- 17 模組、403 文法點（N5:46・N4:98・N3:90・N2:124・N1:45）
- 899 練習題（choice/cloze/reading）
- 1,282 例句（news:701・ad:310・daily:271）→ M3 目標約每點 10 例、涵蓋更多場景
- 預估學習時間約 54 小時

## 擴充規格速查

- 新增/改教學內容 → 遵 SCHEMA.md；新增測驗 → 遵 QUIZ_SCHEMA.md
- 改完必跑：`node --check` 各檔 ＋ headless Chrome dump `#validation-report`（目標 LOAD_ERRORS:0 SCHEMA_ISSUES:0）
- 部署：本地改完 `git push`，GitHub Pages 自動更新
- 學習進度存訪客瀏覽器 localStorage（多人分享不互相干擾）
