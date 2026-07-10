/* ===== 日語文法教室 app ===== */
(function () {
'use strict';

/* ---------- 資料 ---------- */
var MODULES = (window.GRAMMAR_MODULES || []).slice().sort(function (a, b) { return a.order - b.order; });
var POINT_INDEX = {};
var TOTAL_POINTS = 0;
MODULES.forEach(function (m) {
  (m.points || []).forEach(function (p) {
    POINT_INDEX[p.id] = { point: p, module: m };
    TOTAL_POINTS++;
  });
});
var LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];
var LEVEL_COLORS = { N5: '#10b981', N4: '#0ea5e9', N3: '#f59e0b', N2: '#f97316', N1: '#ef4444' };

/* ---------- 進度 ---------- */
var STORE_KEY = 'jpgc_progress_v1';
var progress = { done: {}, quiz: {} };
try {
  var raw = localStorage.getItem(STORE_KEY);
  if (raw) progress = JSON.parse(raw);
  progress.done = progress.done || {};
  progress.quiz = progress.quiz || {};
} catch (e) { /* localStorage 不可用時以記憶體運作 */ }
function saveProgress() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(progress)); } catch (e) {}
}
function doneCount(mod) {
  var n = 0;
  (mod.points || []).forEach(function (p) { if (progress.done[p.id]) n++; });
  return n;
}
function totalDone() {
  var n = 0;
  Object.keys(progress.done).forEach(function (k) { if (progress.done[k] && POINT_INDEX[k]) n++; });
  return n;
}
function quizStats() {
  var keys = Object.keys(progress.quiz), ok = 0;
  keys.forEach(function (k) { if (progress.quiz[k]) ok++; });
  return { total: keys.length, ok: ok };
}

/* ---------- 振假名 ---------- */
var RUBY_RE = /([一-鿿々-〇ヵヶ㐀-䶿々]+)\[([^\[\]]+)\]/g;
function furi(s) {
  if (s == null) return '';
  return String(s).replace(RUBY_RE, '<ruby>$1<rt>$2</rt></ruby>');
}
function plain(s) {
  if (s == null) return '';
  return String(s).replace(RUBY_RE, '$1').replace(/<[^>]*>/g, '');
}

/* ---------- DOM helpers ---------- */
function el(tag, cls, html) {
  var d = document.createElement(tag);
  if (cls) d.className = cls;
  if (html != null) d.innerHTML = html;
  return d;
}
var content = document.getElementById('content');

/* ---------- 視覺化引擎 ---------- */
function renderVisual(v) {
  if (!v || !v.type) return el('div');
  var box = el('div', 'visual');
  if (v.title) box.appendChild(el('div', 'v-title', '📊 ' + furi(v.title)));
  var body;
  switch (v.type) {
    case 'structure':
      body = el('div', 'v-structure');
      (v.chunks || []).forEach(function (c) {
        var role = c.role || '其他';
        var ch = el('div', 'v-chunk role-' + role);
        ch.appendChild(el('div', 'vc-role', role));
        ch.appendChild(el('div', 'vc-jp jp', furi(c.jp)));
        if (c.zh) ch.appendChild(el('div', 'vc-zh', c.zh));
        body.appendChild(ch);
      });
      break;
    case 'timeline':
      body = el('div', 'v-timeline');
      body.appendChild(el('div', 'v-tl-axis'));
      (v.spans || []).forEach(function (s) {
        var sp = el('div', 'v-tl-span');
        sp.style.left = s.from + '%';
        sp.style.width = Math.max(2, s.to - s.from) + '%';
        if (s.label) sp.appendChild(el('span', null, furi(s.label)));
        body.appendChild(sp);
      });
      (v.events || []).forEach(function (ev) {
        var e2 = el('div', 'v-tl-event jp', furi(ev.label));
        e2.style.left = ev.pos + '%';
        body.appendChild(e2);
      });
      if (typeof v.now === 'number') {
        var now = el('div', 'v-tl-now');
        now.style.left = v.now + '%';
        body.appendChild(now);
      }
      break;
    case 'flow':
      body = el('div', 'v-flow');
      (v.steps || []).forEach(function (s) {
        var isArrow = /^\s*[→←⇄⇒]/.test(plain(s.jp)) || /[→←⇄⇒]\s*$/.test(plain(s.jp));
        var st = el('div', isArrow ? 'vf-arrow' : 'vf-step');
        st.appendChild(el('div', 'vf-jp jp', furi(s.jp)));
        if (s.zh) st.appendChild(el('div', 'vf-zh', s.zh));
        body.appendChild(st);
      });
      break;
    case 'table':
      body = el('table', 'v-table');
      var thead = el('thead'), trh = el('tr');
      (v.headers || []).forEach(function (h) { trh.appendChild(el('th', null, furi(h))); });
      thead.appendChild(trh); body.appendChild(thead);
      var tb = el('tbody');
      (v.rows || []).forEach(function (r) {
        var tr = el('tr');
        r.forEach(function (c) { tr.appendChild(el('td', 'jp', furi(c))); });
        tb.appendChild(tr);
      });
      body.appendChild(tb);
      break;
    case 'tree':
      body = el('div', 'v-tree');
      body.appendChild(renderTreeNode(v.root || {}));
      break;
    case 'compare':
      body = el('div', 'v-compare');
      (v.columns || []).forEach(function (col) {
        var c = el('div', 'vc-col');
        c.appendChild(el('div', 'vc-header jp', furi(col.header)));
        (col.cells || []).forEach(function (cell) { c.appendChild(el('div', 'vc-cell jp', furi(cell))); });
        body.appendChild(c);
      });
      break;
    default:
      body = el('div', 'muted small', '（未知的視覺化型別：' + v.type + '）');
  }
  box.appendChild(body);
  return box;
}
function renderTreeNode(node) {
  var n = el('div', 'vt-node');
  n.appendChild(el('div', 'vt-label jp', furi(node.label || '')));
  if (node.note) n.appendChild(el('div', 'vt-note', furi(node.note)));
  if (node.children && node.children.length) {
    var kids = el('div', 'vt-children');
    node.children.forEach(function (c) { kids.appendChild(renderTreeNode(c)); });
    n.appendChild(kids);
  }
  return n;
}

/* ---------- 練習題引擎 ---------- */
function recordQuiz(key, correct) {
  if (progress.quiz[key] === undefined) {
    progress.quiz[key] = correct ? 1 : 0;
    saveProgress();
  }
}
function renderOptionRow(options, answer, key, onDone) {
  var row = el('div', 'ex-options');
  var answered = false;
  options.forEach(function (opt, i) {
    var b = el('button', 'ex-opt jp', furi(opt));
    b.addEventListener('click', function () {
      if (answered) return;
      answered = true;
      var correct = (i === answer);
      recordQuiz(key, correct);
      Array.prototype.forEach.call(row.children, function (btn, j) {
        btn.disabled = true;
        if (j === answer) btn.classList.add('correct');
        else if (j === i && !correct) btn.classList.add('wrong');
      });
      if (onDone) onDone(correct, opt);
    });
    row.appendChild(b);
  });
  return row;
}
function renderExercise(ex, key, num) {
  var box = el('div', 'exercise');
  var tag = num != null ? ('Q' + num + '　') : '';
  if (ex.type === 'choice') {
    box.appendChild(el('div', 'ex-q jp', tag + furi(ex.q)));
    var expl = el('div', 'ex-explain', furi(ex.explain || ''));
    expl.hidden = true;
    box.appendChild(renderOptionRow(ex.options || [], ex.answer, key, function (correct) {
      expl.hidden = false;
      if (!correct) expl.classList.add('was-wrong');
    }));
    box.appendChild(expl);
  } else if (ex.type === 'cloze') {
    box.appendChild(el('div', 'ex-q', tag + '克漏字：依序選出每個空格的答案'));
    var CIRCLED = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧'];
    var html = furi(ex.passage || '');
    (ex.blanks || []).forEach(function (b2, i) {
      var mark = CIRCLED[i];
      var re = new RegExp('（\\s*' + mark + '\\s*）|' + mark);
      html = html.replace(re, '<span class="cloze-blank" data-blank="' + i + '">' + mark + '</span>');
    });
    var pass = el('div', 'ex-passage jp', html);
    box.appendChild(pass);
    (ex.blanks || []).forEach(function (b2, i) {
      var sub = el('div', 'sub-q');
      sub.appendChild(el('div', 'small muted', '空格 ' + CIRCLED[i]));
      var expl = el('div', 'ex-explain', furi(b2.explain || ''));
      expl.hidden = true;
      sub.appendChild(renderOptionRow(b2.options || [], b2.answer, key + '#b' + i, function (correct, chosen) {
        expl.hidden = false;
        if (!correct) expl.classList.add('was-wrong');
        var blank = pass.querySelector('[data-blank="' + i + '"]');
        if (blank) {
          blank.innerHTML = furi((b2.options || [])[b2.answer]);
          blank.classList.add(correct ? 'filled-ok' : 'filled-no');
        }
      }));
      sub.appendChild(expl);
      box.appendChild(sub);
    });
  } else if (ex.type === 'reading') {
    box.appendChild(el('div', 'ex-q', tag + '閱讀理解'));
    box.appendChild(el('div', 'ex-passage jp', furi(ex.passage || '')));
    var zh = el('div', 'ex-passage-zh', '📖 ' + (ex.passageZh || ''));
    zh.hidden = true;
    var remaining = (ex.questions || []).length;
    (ex.questions || []).forEach(function (q, qi) {
      var sub = el('div', 'sub-q');
      sub.appendChild(el('div', 'ex-q jp', furi(q.q)));
      var expl = el('div', 'ex-explain', furi(q.explain || ''));
      expl.hidden = true;
      sub.appendChild(renderOptionRow(q.options || [], q.answer, key + '#q' + qi, function (correct) {
        expl.hidden = false;
        if (!correct) expl.classList.add('was-wrong');
        remaining--;
        if (remaining <= 0 && ex.passageZh) zh.hidden = false;
      }));
      sub.appendChild(expl);
      box.appendChild(sub);
    });
    box.appendChild(zh);
  }
  return box;
}

/* ---------- 文法點卡片 ---------- */
function lvBadge(level) { return '<span class="lv lv-' + level + '">' + level + '</span>'; }
function srcTag(src) {
  var map = { news: ['src-news', '新聞'], ad: ['src-ad', '廣告'], daily: ['src-daily', '日常'] };
  var m = map[src] || map.daily;
  return '<span class="src-tag ' + m[0] + '">' + m[1] + '</span>';
}
function renderPointCard(p, mod) {
  var card = el('div', 'point-card');
  card.id = 'pt-' + p.id;
  card.dataset.level = p.level;
  var head = el('div', 'point-head');
  head.innerHTML =
    lvBadge(p.level) +
    '<span class="p-name jp">' + furi(p.name) + '</span>' +
    '<span class="p-meaning">' + furi(p.meaning || '') + '</span>' +
    (p.category ? '<span class="p-cat">' + p.category + '</span>' : '') +
    '<span class="p-done">' + (progress.done[p.id] ? '✓' : '') + '</span>';
  card.appendChild(head);
  var body = null;
  head.addEventListener('click', function () {
    if (!body) {
      body = buildPointBody(p, mod, card);
      card.appendChild(body);
    } else {
      body.hidden = !body.hidden;
    }
  });
  return card;
}
function buildPointBody(p, mod, card) {
  var body = el('div', 'point-body');
  if (p.connection) body.appendChild(el('div', 'conn jp', '接続：<b>' + furi(p.connection) + '</b>'));
  if (p.explanation) body.appendChild(el('div', 'expl jp', furi(p.explanation)));
  if (p.visual) body.appendChild(renderVisual(p.visual));
  if (p.examples && p.examples.length) {
    body.appendChild(el('div', 'sec-label', '例句 Examples'));
    p.examples.forEach(function (ex) {
      var e2 = el('div', 'example');
      e2.appendChild(el('div', 'ex-jp jp', furi(ex.jp) + srcTag(ex.source)));
      if (ex.zh) e2.appendChild(el('div', 'ex-zh', ex.zh));
      if (ex.note) e2.appendChild(el('div', 'ex-note', '💡 ' + furi(ex.note)));
      body.appendChild(e2);
    });
  }
  if (p.exercises && p.exercises.length) {
    body.appendChild(el('div', 'sec-label', '互動練習 Practice'));
    p.exercises.forEach(function (ex, i) {
      body.appendChild(renderExercise(ex, p.id + '#' + i, i + 1));
    });
  }
  if (p.compare && p.compare.length) {
    var cl = el('div', 'compare-links');
    var html = '⚖️ 容易混淆，比較看看：';
    var links = el('div', 'compare-links');
    links.appendChild(el('span', 'small muted', '⚖️ 容易混淆，比較看看：'));
    p.compare.forEach(function (cid) {
      var t = POINT_INDEX[cid];
      if (!t) return;
      var a = el('a', null, furi(t.point.name));
      a.className = 'jp';
      a.addEventListener('click', function () { location.hash = '#p/' + cid; });
      links.appendChild(a);
    });
    body.appendChild(el('div', 'sec-label', '易混淆'));
    body.appendChild(links);
  }
  var btn = el('button', 'done-btn' + (progress.done[p.id] ? ' is-done' : ''),
    progress.done[p.id] ? '✓ 已完成' : '標記為已學會');
  btn.addEventListener('click', function () {
    progress.done[p.id] = !progress.done[p.id];
    saveProgress();
    btn.className = 'done-btn' + (progress.done[p.id] ? ' is-done' : '');
    btn.textContent = progress.done[p.id] ? '✓ 已完成' : '標記為已學會';
    card.querySelector('.p-done').textContent = progress.done[p.id] ? '✓' : '';
    renderSidebar();
  });
  body.appendChild(btn);
  return body;
}

/* ---------- 首頁 ---------- */
function levelCounts() {
  var c = { N5: 0, N4: 0, N3: 0, N2: 0, N1: 0 };
  Object.keys(POINT_INDEX).forEach(function (k) { c[POINT_INDEX[k].point.level] = (c[POINT_INDEX[k].point.level] || 0) + 1; });
  return c;
}
function renderHome() {
  content.innerHTML = '';
  if (window.__LOAD_ERRORS__ && window.__LOAD_ERRORS__.length) {
    content.appendChild(el('div', 'err-banner', '⚠️ 有 ' + window.__LOAD_ERRORS__.length + ' 個資料檔載入失敗：' + window.__LOAD_ERRORS__.join('；')));
  }
  var totalMin = 0;
  MODULES.forEach(function (m) { totalMin += m.estMinutes || (m.points || []).length * 8; });
  var hero = el('div', 'hero');
  hero.innerHTML =
    '<h1>日語文法教室</h1>' +
    '<div class="hero-sub">一套讓你<b>讀懂日文新聞與廣告</b>的系統文法課。' +
    '不按 JLPT 等級切碎，而是把日語文法當成一個完整的系統——從句子骨架、助詞、動詞引擎，一路到新聞文體與機能語。' +
    '每個文法點標示 N5〜N1 難度，但學習主線照「文法系統的邏輯」走，讓你建立全觀的地圖，而不是背零碎的句型。</div>' +
    '<div class="hero-sub" style="margin-top:10px">📚 ' + MODULES.length + ' 個模組 ・ ' + TOTAL_POINTS + ' 個文法點 ・ 預估 ' +
    Math.round(totalMin / 60) + ' 小時系統學習 ・ 每點皆附新聞/廣告例句與互動練習</div>';
  content.appendChild(hero);

  var qs = quizStats();
  var stats = el('div', 'stat-row');
  [
    [totalDone() + ' / ' + TOTAL_POINTS, '已學會的文法點'],
    [Math.round(totalMin / 60) + ' 小時', '預估總學習時間'],
    [qs.total ? Math.round(qs.ok / qs.total * 100) + '%' : '—', '練習首次答對率（' + qs.total + ' 題）'],
    [Math.round(totalDone() / Math.max(1, TOTAL_POINTS) * 100) + '%', '整體進度']
  ].forEach(function (s) {
    var d = el('div', 'stat');
    d.appendChild(el('div', 'stat-num', s[0]));
    d.appendChild(el('div', 'stat-label', s[1]));
    stats.appendChild(d);
  });
  content.appendChild(stats);

  var lc = levelCounts();
  var lvCard = el('div', 'card');
  lvCard.appendChild(el('div', null, '<b>難度分布</b><span class="small muted">　每個文法點都標了 JLPT 等級——但這只是「地圖上的海拔標記」，路線照系統走。</span>'));
  var bar = el('div', 'level-bar');
  LEVELS.forEach(function (lv) {
    var seg = el('div');
    seg.style.width = (lc[lv] / Math.max(1, TOTAL_POINTS) * 100) + '%';
    seg.style.background = LEVEL_COLORS[lv];
    seg.title = lv + '：' + lc[lv] + ' 點';
    bar.appendChild(seg);
  });
  lvCard.appendChild(bar);
  var legend = LEVELS.map(function (lv) { return lvBadge(lv) + ' ' + lc[lv]; }).join('　');
  lvCard.appendChild(el('div', 'small muted', legend));
  content.appendChild(lvCard);

  var how = el('div', 'card');
  how.innerHTML = '<b>這門課怎麼上</b><br>' +
    '① 每章從一段<b>真實風格的新聞或廣告</b>開場——你會先「讀不懂」，這正是本章要解決的閱讀問題。<br>' +
    '② 依系統順序展開文法點：視覺化圖解 → 新聞/廣告例句 → 互動練習。<br>' +
    '③ 章末回到開場那段文字，逐句解碼——證明你已經讀得懂了。<br>' +
    '④ 建議從第 1 章照順序走；已有基礎者可從任何一章切入，遇到不熟的概念再跳回去補。';
  content.appendChild(how);

  content.appendChild(el('h2', null, '學習地圖'));
  var grid = el('div', 'module-grid');
  MODULES.forEach(function (m) {
    var dc = doneCount(m), pc = (m.points || []).length;
    var card = el('div', 'card clickable module-card');
    card.innerHTML =
      '<div class="mc-head"><span class="mc-icon">' + (m.icon || '📘') + '</span>' +
      '<span class="mc-title">' + m.order + '. ' + m.title + '</span></div>' +
      '<div class="mc-sub">' + (m.subtitle || '') + '</div>' +
      '<div class="prog-track"><div class="prog-fill" style="width:' + (pc ? dc / pc * 100 : 0) + '%"></div></div>' +
      '<div class="mc-meta"><span>' + dc + '/' + pc + ' 點</span><span>約 ' + Math.round((m.estMinutes || pc * 8) / 60 * 10) / 10 + ' 小時</span></div>';
    card.addEventListener('click', function () { location.hash = '#m/' + m.id; });
    grid.appendChild(card);
  });
  content.appendChild(grid);
  window.scrollTo(0, 0);
}

/* ---------- 模組頁 ---------- */
var activeLevelFilter = null;
function renderModule(modId, scrollPointId) {
  var mod = null;
  MODULES.forEach(function (m) { if (m.id === modId) mod = m; });
  if (!mod) { renderHome(); return; }
  activeLevelFilter = null;
  content.innerHTML = '';

  var head = el('div', 'mod-header');
  head.innerHTML = '<span class="mod-icon">' + (mod.icon || '📘') + '</span>' +
    '<div><h1>' + mod.order + '. ' + mod.title + '</h1>' +
    '<div class="muted">' + (mod.subtitle || '') + '　・　' + (mod.points || []).length + ' 個文法點　・　約 ' +
    Math.round((mod.estMinutes || (mod.points || []).length * 8) / 60 * 10) / 10 + ' 小時</div></div>';
  content.appendChild(head);
  if (mod.intro) {
    var intro = el('div', 'card jp');
    intro.innerHTML = furi(mod.intro);
    content.appendChild(intro);
  }
  if (mod.openingPuzzle) {
    var pz = mod.openingPuzzle;
    var pzBox = el('div', 'puzzle');
    pzBox.appendChild(el('div', 'puzzle-tag', '🔍 開場閱讀謎題 ｜ ' + (pz.source || '')));
    pzBox.appendChild(el('div', 'puzzle-jp jp', furi(pz.jp)));
    if (pz.hook) pzBox.appendChild(el('div', 'small', '🤔 ' + furi(pz.hook)));
    if (pz.zh) {
      var zh = el('div', 'puzzle-zh', pz.zh);
      zh.hidden = true;
      var btn = el('button', 'reveal-btn', '顯示中文翻譯 ▾');
      btn.addEventListener('click', function () { zh.hidden = !zh.hidden; });
      pzBox.appendChild(btn);
      pzBox.appendChild(zh);
    }
    content.appendChild(pzBox);
  }

  var chips = el('div', 'chips');
  chips.appendChild(el('span', 'chip-label', '等級高亮（只是標記，建議照順序全部學）：'));
  var allChip = el('button', 'chip on', '全部');
  chips.appendChild(allChip);
  var chipEls = { all: allChip };
  LEVELS.forEach(function (lv) {
    var c = el('button', 'chip', lv);
    c.style.color = LEVEL_COLORS[lv];
    chipEls[lv] = c;
    chips.appendChild(c);
  });
  function applyFilter() {
    Object.keys(chipEls).forEach(function (k) { chipEls[k].classList.toggle('on', (activeLevelFilter || 'all') === k); });
    Array.prototype.forEach.call(content.querySelectorAll('.point-card'), function (pc) {
      pc.classList.toggle('dimmed', !!activeLevelFilter && pc.dataset.level !== activeLevelFilter);
    });
  }
  allChip.addEventListener('click', function () { activeLevelFilter = null; applyFilter(); });
  LEVELS.forEach(function (lv) {
    chipEls[lv].addEventListener('click', function () { activeLevelFilter = (activeLevelFilter === lv ? null : lv); applyFilter(); });
  });
  content.appendChild(chips);

  (mod.points || []).forEach(function (p) { content.appendChild(renderPointCard(p, mod)); });

  if (mod.closingDecode) {
    var dc = el('div', 'decode');
    dc.appendChild(el('div', 'puzzle-tag', '🔓 回到開場——現在你讀得懂了'));
    if (mod.closingDecode.jp) dc.appendChild(el('div', 'puzzle-jp jp', furi(mod.closingDecode.jp)));
    if (mod.closingDecode.walkthrough) dc.appendChild(el('div', 'jp', furi(mod.closingDecode.walkthrough)));
    content.appendChild(dc);
  }
  if (mod.finalExercises && mod.finalExercises.length) {
    content.appendChild(el('h2', null, '章末綜合練習'));
    mod.finalExercises.forEach(function (ex, i) {
      content.appendChild(renderExercise(ex, mod.id + '#final#' + i, i + 1));
    });
  }

  var nav = el('div', 'mod-nav');
  var idx = MODULES.indexOf(mod);
  var prev = el('button', null, idx > 0 ? '← ' + MODULES[idx - 1].title : '← 回首頁');
  prev.addEventListener('click', function () { location.hash = idx > 0 ? '#m/' + MODULES[idx - 1].id : '#home'; });
  var next = el('button', null, idx < MODULES.length - 1 ? MODULES[idx + 1].title + ' →' : '回首頁 →');
  next.addEventListener('click', function () { location.hash = idx < MODULES.length - 1 ? '#m/' + MODULES[idx + 1].id : '#home'; });
  nav.appendChild(prev); nav.appendChild(next);
  content.appendChild(nav);

  if (scrollPointId) {
    var target = document.getElementById('pt-' + scrollPointId);
    if (target) {
      target.querySelector('.point-head').click();
      setTimeout(function () { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 60);
    }
  } else {
    window.scrollTo(0, 0);
  }
  renderSidebar();
}

/* ---------- 依等級瀏覽 ---------- */
function renderLevelView() {
  content.innerHTML = '';
  content.appendChild(el('h1', null, '依等級瀏覽'));
  content.appendChild(el('div', 'notice', '這個頁面是「查閱視角」——考前想按等級複習時用。日常學習仍建議回到各章，照系統順序走，文法才會連成一張網。'));
  LEVELS.forEach(function (lv) {
    var pts = [];
    MODULES.forEach(function (m) {
      (m.points || []).forEach(function (p) { if (p.level === lv) pts.push({ p: p, m: m }); });
    });
    var g = el('div', 'level-group');
    g.appendChild(el('h2', null, lvBadge(lv) + ' <span class="muted small">' + pts.length + ' 點</span>'));
    var list = el('div', 'level-list');
    pts.forEach(function (it) {
      var item = el('div', 'level-item');
      item.innerHTML = '<span class="jp">' + (progress.done[it.p.id] ? '✓ ' : '') + furi(it.p.name) + '</span> <div class="li-mod">' + it.m.order + '. ' + it.m.title + '</div>';
      item.addEventListener('click', function () { location.hash = '#p/' + it.p.id; });
      list.appendChild(item);
    });
    g.appendChild(list);
    content.appendChild(g);
  });
  window.scrollTo(0, 0);
  renderSidebar();
}

/* ---------- 側欄 ---------- */
function renderSidebar() {
  var nav = document.getElementById('module-nav');
  nav.innerHTML = '';
  var current = location.hash.indexOf('#m/') === 0 ? location.hash.slice(3) : null;
  MODULES.forEach(function (m) {
    var dc = doneCount(m), pc = (m.points || []).length;
    var d = el('div', 'nav-module' + (m.id === current ? ' active' : ''));
    d.innerHTML = '<span class="nav-icon">' + (m.icon || '📘') + '</span><span>' + m.order + '. ' + m.title + '</span>' +
      '<span class="nav-prog">' + (dc === pc && pc > 0 ? '✓' : dc + '/' + pc) + '</span>';
    d.addEventListener('click', function () {
      location.hash = '#m/' + m.id;
      document.getElementById('sidebar').classList.remove('open');
    });
    nav.appendChild(d);
  });
  var gp = document.getElementById('global-progress');
  gp.innerHTML = '整體進度：' + totalDone() + ' / ' + TOTAL_POINTS + ' 點' +
    '<div class="prog-track" style="margin-top:6px"><div class="prog-fill" style="width:' + (totalDone() / Math.max(1, TOTAL_POINTS) * 100) + '%"></div></div>';
}

/* ---------- 搜尋 ---------- */
function initSearch() {
  var input = document.getElementById('search-input');
  var box = document.getElementById('search-results');
  input.addEventListener('input', function () {
    var q = input.value.trim().toLowerCase();
    if (!q) { box.hidden = true; box.innerHTML = ''; return; }
    var hits = [];
    Object.keys(POINT_INDEX).forEach(function (k) {
      var it = POINT_INDEX[k];
      var hay = (plain(it.point.name) + ' ' + plain(it.point.meaning) + ' ' + (it.point.category || '') + ' ' + plain(it.point.connection || '') + ' ' + it.point.level).toLowerCase();
      if (hay.indexOf(q) !== -1) hits.push(it);
    });
    box.innerHTML = '';
    hits.slice(0, 30).forEach(function (it) {
      var h = el('div', 'search-hit');
      h.innerHTML = '<span class="jp">' + furi(it.point.name) + '</span> <span class="lv lv-' + it.point.level + '">' + it.point.level + '</span>' +
        '<div class="hit-meta">' + it.module.order + '. ' + it.module.title + '　' + plain(it.point.meaning || '') + '</div>';
      h.addEventListener('click', function () {
        location.hash = '#p/' + it.point.id;
        box.hidden = true; input.value = '';
        document.getElementById('sidebar').classList.remove('open');
      });
      box.appendChild(h);
    });
    if (!hits.length) box.appendChild(el('div', 'search-hit muted', '找不到，試試別的關鍵字'));
    box.hidden = false;
  });
}

/* ---------- 振假名開關 ---------- */
function initFuriToggle() {
  var btn = document.getElementById('furi-toggle');
  var off = false;
  try { off = localStorage.getItem('jpgc_furi_off') === '1'; } catch (e) {}
  function apply() {
    document.body.classList.toggle('no-furi', off);
    btn.textContent = 'ふりがな：' + (off ? '關' : '開');
  }
  btn.addEventListener('click', function () {
    off = !off;
    try { localStorage.setItem('jpgc_furi_off', off ? '1' : '0'); } catch (e) {}
    apply();
  });
  apply();
}

/* ---------- 路由 ---------- */
function route() {
  var h = location.hash || '#home';
  if (h.indexOf('#m/') === 0) renderModule(h.slice(3));
  else if (h.indexOf('#p/') === 0) {
    var pid = h.slice(3);
    var it = POINT_INDEX[pid];
    if (it) renderModule(it.module.id, pid);
    else renderHome();
  }
  else if (h === '#level') renderLevelView();
  else renderHome();
  renderSidebar();
}
window.addEventListener('hashchange', route);
document.querySelector('.brand').addEventListener('click', function () { location.hash = '#home'; });
document.getElementById('nav-level').addEventListener('click', function () {
  location.hash = '#level';
  document.getElementById('sidebar').classList.remove('open');
});
document.getElementById('menu-toggle').addEventListener('click', function () {
  document.getElementById('sidebar').classList.toggle('open');
});

/* ---------- 驗證報告（headless 測試用） ---------- */
(function () {
  var rep = document.getElementById('validation-report');
  var issues = [];
  MODULES.forEach(function (m) {
    (m.points || []).forEach(function (p) {
      if (!p.id || !p.name || !p.level) issues.push(m.id + ':point-missing-fields');
      if (!p.visual) issues.push(p.id + ':no-visual');
      if (!p.examples || p.examples.length < 3) issues.push(p.id + ':examples<3');
      if (!p.exercises || p.exercises.length < 2) issues.push(p.id + ':exercises<2');
    });
    if (!m.openingPuzzle) issues.push(m.id + ':no-openingPuzzle');
    if (!m.closingDecode) issues.push(m.id + ':no-closingDecode');
  });
  rep.textContent = 'MODULES:' + MODULES.length + ' POINTS:' + TOTAL_POINTS +
    ' LOAD_ERRORS:' + (window.__LOAD_ERRORS__ || []).length +
    (window.__LOAD_ERRORS__.length ? ' [' + window.__LOAD_ERRORS__.join(' | ') + ']' : '') +
    ' SCHEMA_ISSUES:' + issues.length +
    (issues.length ? ' [' + issues.slice(0, 40).join(' | ') + ']' : '');
})();

/* ---------- 啟動 ---------- */
initSearch();
initFuriToggle();
route();

})();
