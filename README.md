# 日語文法教室

以「讀懂日文新聞與廣告」為目標的系統性日語文法學習網站。純靜態、零依賴，直接用瀏覽器開啟 `index.html` 即可使用。

## 設計理念

- **全觀系統，不按等級切碎**：17 個模組照文法系統邏輯排列（句子骨架 → 助詞 → 動詞引擎 → 時貌 → 語態 → … → 新聞文體 → 機能語）。每個文法點標 JLPT N5–N1 等級，但只作為「海拔標記」，學習主線不受等級打斷。
- **解決閱讀問題的文法教室**：每章由一段真實風格的新聞／廣告開場（先讀不懂），章末回頭逐句解碼（證明讀懂了）。
- **視覺化解說**：六種圖解引擎——句子解剖（structure）、時間軸（timeline）、方向流程（flow）、對照表（table）、巢狀樹（tree）、並列比較（compare）。
- **互動練習**：選擇題、克漏字、閱讀理解三種題型，作答即時回饋，成績與學習進度存 localStorage。
- **中文母語者優化**：解說為台灣繁體中文；所有日文漢字附振假名（可一鍵開關）。

## 檔案結構

```
index.html        入口（含 17 個 data script 引用）
app.js            渲染引擎（路由、視覺化、練習題、進度、搜尋、振假名）
styles.css        樣式
SCHEMA.md         資料格式合約（新增/修改模組前必讀）
data/m01…m17.js   17 個內容模組（每檔一個文法系統）
```

## 新增內容

照 `SCHEMA.md` 格式在 `data/` 新增模組檔，並在 `index.html` 加一行 `<script src="data/mXX_xxx.js"></script>`。改完用 `node --check` 驗語法。

## 驗證

頁面內建 `#validation-report`（hidden div），可用 headless Chrome 檢查：

```
chrome --headless --dump-dom index.html | grep -o 'MODULES:[^<]*'
```

會回報模組數、文法點數、載入錯誤、schema 缺漏。
