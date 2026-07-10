# 逐章擴充規格（EXPAND_SPEC）— M3 + M4

每個 agent 負責**一章**，同時做兩件事：
A. **擴充該章 data/mXX 每個文法點**的例句到 10 句、練習題到 6 題
B. **撰寫該章 quiz/mXX_quiz.js**（50 題綜合測驗）

先 Read：本檔、`SCHEMA.md`（教學內容格式）、`QUIZ_SCHEMA.md`（測驗格式）、以及你負責的 `data/mXX_*.js` 現況。

---

## A. 擴充教學內容 data/mXX_*.js

對該檔 `points` 陣列裡的**每一個文法點**：

1. **例句擴充到 10 句**（原本 3-4 句，保留原有、往上補到 10）：
   - `examples` 每個元素格式同 SCHEMA：`{ jp, zh, source, note? }`
   - **場景多樣**是本次重點——10 句要盡量涵蓋：新聞（政治/經濟/災害/社會）、廣告文案、車站/店頭/公共**告示**、**購物**對話、餐廳**用餐**、日常**生活**會話。不要 10 句全是新聞。
   - `source` 欄位擴充值域：除原本 `news`/`ad`/`daily`，**新增** `notice`（告示公告）、`shop`（購物）、`dining`（用餐）三種。app.js 已支援這三種標籤顯示。
   - 例句可以**短**（一句話、甚至半句），重點是多樣、好懂、貼近該文法點在真實場景怎麼用。
   - 每句都要標振假名（`漢字[かな]`，送假名不入括號），漢字不確定讀音時選常見讀法。
   - 適時用 `note` 加一句閱讀提示（非必每句）。

2. **練習題擴充到 6 題**（原本 2-3 題，保留原有、往上補到 6）：
   - `exercises` 用 SCHEMA 的三型（choice / cloze / reading）混合；choice 為主，每點至少穿插 1 題 cloze 或 reading。
   - 題目情境同樣要跨場景（不要全新聞）。
   - cloze 空格用（　①　）格式；每題 answer 在 options 範圍內、有 explain。

3. 模組級的 `openingPuzzle`、`closingDecode`、`finalExercises`、每點的 `visual`/`compare` **維持不動**（除非發現既有錯誤才修）。

## B. 撰寫測驗 quiz/mXX_quiz.js

- 全新 Write 該檔，格式嚴格遵 `QUIZ_SCHEMA.md`：`window.GRAMMAR_QUIZZES.push({ moduleId, title, questions: [...] })`。
- **恰 50 題**，choice（4選1）；**至少 15 題**帶 `passage`（閱讀導向）。
- 每題標 `level`；全章等級分布貼近該章文法點實際分布、涵蓋該章最低到最高等級。
- 覆蓋該章**所有主要文法點**，可設計近義文法鑑別題。
- 場景多樣（新聞/廣告/告示/購物/用餐/生活會話輪流），解說台灣繁中 1-3 句，振假名完整，正解位置打散。

## 交件前自查（務必逐項 node 驗證）

1. `node --check "data/mXX_*.js"` 與 `node --check "quiz/mXX_quiz.js"` 都通過。
2. 教學檔：該章每個 point 的 `examples.length >= 10` 且 `exercises.length >= 6`；至少半數點的例句 source 出現 news/ad 以外的場景。
3. 測驗檔：`questions.length === 50`；帶 passage 的題 >= 15；每題 level 為 N1-N5、answer 在 options 範圍。
4. 所有日文漢字皆 `漢字[かな]`；字串內無未跳脫英文雙引號。
5. 只動你負責的這兩個檔案（data/mXX 與 quiz/mXX）。

## 回報格式（純文字）

- 擴充後：該章 point 數、例句總數、練習題總數、例句 source 分布
- 測驗：題數、帶 passage 題數、等級分布
- 兩個 node --check 結果
