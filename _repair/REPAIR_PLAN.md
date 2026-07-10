# jp_grammar 修復計畫（2026-07-10）

背景：17 個內容 agent 中 12 個因 API session limit（14:00 Asia/Taipei 重置）中斷。
稽核結果：15 檔存在且 node --check 通過、319 點可渲染；11 模組完整。
待修：m02（補尾）、m11（補章末）、m13（補尾）、m16（補中段）、m08（全新）、m10（全新）。

執行方式（14:00 後）：每個待修模組開一個 agent，prompt 就是「Read 本檔＋SCHEMA.md，執行你負責的那一節」。
所有 agent 共同鐵律（同 SCHEMA.md）：台灣繁體中文；日文漢字一律 `漢字[かな]` 標假名（送假名不入括號：読[よ]む）；字串內禁未跳脫英文雙引號、日文引用用「」；例句過半 source:"news"/"ad"；每點 explanation 200-450字、≥3例句、≥2練習題、1 visual；cloze 空格用（　①　）；compare 只填本模組 point id；改完跑 `node --check <檔案>` 修到通過；只動自己負責的檔案。

完成後總驗證（主 session 執行）：
1. `node --check` 全部 data/*.js
2. node 稽核腳本（模組級 openingPuzzle/closingDecode/finalExercises、每點 visual/examples>=3/exercises>=2）
3. headless Chrome：`chrome --headless --disable-gpu --dump-dom file:///D:/Dropbox/Zettel/projects/jp_grammar/index.html | grep -o 'MODULES:[^<]*'`
   目標：MODULES:17 POINTS:~400 LOAD_ERRORS:0 SCHEMA_ISSUES:0

---

## m02_repair — 檔案 data/m02_case_particles.js（已有 20 點，Edit 不要重寫全檔）

現況：points 陣列已有 20 點（が×2、を×3、に×8、で×6、へ×1），缺最後 6 點與 closingDecode、finalExercises。
工作：
1. 在 points 陣列尾端追加 6 點（id 用 m02- 開頭）：
   - と（共同動作）｜N5
   - と（引用）｜N4
   - から（起點）｜N5
   - から（原料）｜N4
   - まで vs までに｜N4
   - より（比較基準）｜N4
2. 在模組物件補 closingDecode（回頭逐句解碼 openingPuzzle，點名本章格助詞）與 finalExercises（4-6題，至少一題 reading）。
3. node --check 通過。

## m08_new — 檔案 data/m08_modality.js（全新撰寫）

模組 meta：id "m08"、order 8、title "推測・判斷・傳聞"、subtitle "だろう・はずだ・ようだ・らしい・そうだ…"、icon "🔮"、estMinutes 184、intro（150-300字：新聞最重要的能力是分辨「事實 vs 推測 vs 傳聞」——日文把消息可靠度全部編碼在句尾）。
文法點清單（名稱｜等級，全部要寫）：
1. だろう／でしょう｜N4
2. かもしれない｜N4
3. はずだ｜N4
4. はずがない｜N3
5. ようだ｜N4
6. みたいだ｜N4
7. らしい（推量・傳聞）｜N4
8. らしい（典型屬性：男らしい）｜N3
9. そうだ（樣態：落ちそうだ）｜N4
10. そうだ（傳聞：落ちたそうだ）｜N4
11. に違いない｜N3
12. に決まっている｜N2
13. まい（否定推量・否定意志）｜N1
14. のではないか／んじゃないか｜N3
15. 恐れがある｜N2（SCHEMA.md 內附完整範例可沿用擴充）
16. 見込みだ｜N2
17. 見通しだ・方針だ・構えだ（新聞預測名詞群）｜N1
18. とみられる／と見られている｜N2
19. 模様だ｜N1
20. と思われる／と考えられる｜N3
21. かねない（恐怕會）｜N2
22. そうにない／そうもない｜N3
23. っぽい｜N3
explanation 核心是「確信度光譜」與「消息來源」；visual 用 table 排確信度、ようだ/らしい/そうだ 用 compare、新聞句用 structure。
模組級：openingPuzzle（災害預測或政局新聞 2-4 句，多種推量表現）、closingDecode（逐句標確信度）、finalExercises（4-6題，至少一題 reading）。

## m10_new — 檔案 data/m10_connectives.js（全新撰寫）

模組 meta：id "m10"、order 10、title "接續與複句"、subtitle "から・ので・のに＋接續詞大全"、icon "🔗"、estMinutes 208、intro（150-300字：接續詞是文章的路標——靠路標預測下一句，閱讀速度倍增）。
文法點清單（名稱｜等級，全部要寫）：
1. から（原因）｜N5
2. ので｜N4
3. から vs ので（主觀 vs 客觀）｜N3
4. のに（逆接：明明…卻）｜N4
5. が（逆接・前置緩衝）｜N5
6. けれど／けど／けれども｜N4
7. て形連接（並列・順序）｜N5
8. て形連接（原因）｜N4
9. ながら（同時進行）｜N4
10. し（列舉理由）｜N4
11. ずに／ないで｜N3
12. なくて vs ないで｜N3
13. それで／だから／そのため｜N4
14. しかし／でも／だが｜N4
15. ところが（意外逆接）｜N2
16. ところで（轉換話題）｜N3
17. つまり／要するに／すなわち｜N3
18. なお（補充說明）｜N2
19. また／さらに／しかも（累加）｜N3
20. 一方（で）（對比接續詞）｜N2
21. したがって／よって（正式因果）｜N2
22. ちなみに｜N2
23. むしろ／かえって｜N2
24. ただし／もっとも（但書）｜N2
25. こうして／このように（總結）｜N3
26. 接續詞閱讀策略：用路標預測下一句｜N3
visual：接續邏輯用 flow「前句→接續詞→後句」、同類接續詞用 table 分組、句構用 structure；接續詞很適合出 cloze。
模組級：openingPuzzle（社論風格段落 3-4 句，多個接續詞）、closingDecode（標出每個路標功能）、finalExercises（4-6題，至少一題 reading）。

## m11_repair — 檔案 data/m11_keigo.js（已有 20 點完整，Edit 不要重寫全檔）

現況：20 點齊、openingPuzzle 在，缺 closingDecode 與 finalExercises。
工作：讀檔案內既有 openingPuzzle，補 closingDecode（逐句標出敬語種類與方向）與 finalExercises（4-6題，至少一題 reading）。node --check 通過。

## m13_repair — 檔案 data/m13_reason_purpose.js（已有 11 點，Edit 不要重寫全檔）

現況：已有點 1-11（ため原因/目的/判別、おかげで、せいで、せいか、につき、ことから、ことだから、あまり、ばかりに），缺以下 13 點與章末。
工作：
1. points 陣列尾端追加（id 用 m13- 開頭）：
   - 以上（は）｜N2
   - からには｜N2
   - 上は｜N1
   - 手前（礙於面子）｜N1
   - もので／ものだから（辯解）｜N2
   - ように（目的：非意志動詞前）｜N4
   - ために vs ように（目的用法對決）｜N3
   - のに使う（用途）｜N3
   - べく（書面目的）｜N1
   - んがため（に）（文語目的）｜N1
   - を目指して／を目標に｜N2
   - を目的として／を目的に｜N2
   - ゆえ（に）（文語因果）｜N1
2. 補 closingDecode 與 finalExercises（4-6題，至少一題 reading）。
3. node --check 通過。

## m16_repair — 檔案 data/m16_time_limit_degree.js（已有 12 點＋closingDecode＋finalExercises，Edit 不要重寫全檔）

現況：points 只有前 12 點（m16-toki…m16-tekaradenaito），closingDecode/finalExercises 已存在。
工作：
1. 在 points 陣列的 m16-tekaradenaito 之後、陣列結尾之前，插入 16 點（id 用 m16- 開頭）：
   - 次第（ます形＋：一…立刻）｜N2
   - や否や｜N1
   - が早いか｜N1
   - なり（一…就）｜N1
   - そばから（剛…就又）｜N1
   - かと思うと／かと思ったら｜N1
   - たとたん（に）｜N2
   - て以来｜N2
   - にわたって（範圍・期間）｜N2
   - だけに（正因為…更加）｜N2
   - だけあって（不愧是）｜N2
   - のみ（書面限定）｜N2
   - に限り／に限って｜N2
   - に限らず｜N2
   - ほど〜ない（比較否定）｜N3
   - くらい vs ほど（程度輕重對比）｜N3
   「一…就」家族（次第/や否や/が早いか/なり/そばから/たとたん）要互相對照分級；timeline 為主 visual。
2. 檢查既有 closingDecode/finalExercises 是否引用了未寫的點，必要時微調。
3. node --check 通過。
