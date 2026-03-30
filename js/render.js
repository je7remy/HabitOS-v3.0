/**
 * render.js — Funciones de renderizado del DOM
 *
 * render()          → reconstruye el tracker (tabla + stats)
 * renderDashboard() → reconstruye el dashboard (chart + análisis)
 * buildColorPick()  → reconstruye el selector de color
 */

// ── COLOR PICKER ───────────────────────────────────────────────
function buildColorPick() {
  document.getElementById('colorPick').innerHTML = PALETTE.map(c => `
    <div class="cdot${c === selColor ? ' sel' : ''}"
      style="background:${c}"
      onclick="selColor='${c}';buildColorPick()">
    </div>
  `).join('');
}

// ── TRACKER ────────────────────────────────────────────────────
function render() {
  document.getElementById('mName').textContent  = MONTHS[vm];
  document.getElementById('yTag').textContent   = vy;
  document.getElementById('dTitle').textContent = `${MONTHS[vm]} ${vy}`;

  const days = daysIn(vy, vm);
  const td   = todayD();
  const past = td > 0 ? td : days;

  _renderTableHead(days, td);
  _renderTableBody(days, td, past);
  _renderTableFoot(days, td, past);
  _renderStats(past, td);

  // Refresh dashboard if it's visible
  if (document.getElementById('view-dashboard').classList.contains('active')) {
    renderDashboard();
  }
}

function _renderTableHead(days, td) {
  // Build week groups
  const weeks = [];
  let wk = [];
  for (let d = 1; d <= days; d++) {
    wk.push(d);
    if (dow(vy, vm, d) === 6 || d === days) { weeks.push(wk); wk = []; }
  }

  // Week group row
  let wgHtml = `<tr class="wk-row"><th class="wk-lbl-th">MI HÁBITO</th>`;
  weeks.forEach((w, i) => {
    const sep = i > 0 ? 'wk-sep-th' : '';
    wgHtml += `<th colspan="${w.length}" class="${sep}">
      <span class="wk-num">SEM ${i + 1}</span>
    </th>`;
  });
  wgHtml += `<th></th><th></th></tr>`;

  // Day header row
  let dhHtml = `<tr class="day-row"><th>Hábito / Día →</th>`;
  for (let d = 1; d <= days; d++) {
    const isT = d === td;
    const wd  = dow(vy, vm, d);
    const sep = wd === 0 && d > 1 ? 'wk-sep-col' : '';
    dhHtml += `<th class="${isT ? 'th-today' : ''} ${sep}" style="min-width:26px">
      ${d}<br><span style="font-size:.48rem;opacity:.6">${DAYS_ES[wd]}</span>
    </th>`;
  }
  dhHtml += `<th class="th-streak-h">🔥 Racha</th><th class="th-prog-h">Progreso</th></tr>`;

  document.getElementById('tHead').innerHTML = wgHtml + dhHtml;
}

function _renderTableBody(days, td, past) {
  // Group habits by category preserving original order
  const byGroup  = {};
  const catOrder = [];
  habits.forEach((h, hi) => {
    const cat = h.cat || '📋 Otros';
    if (!byGroup[cat]) { byGroup[cat] = []; catOrder.push(cat); }
    byGroup[cat].push({ h, hi });
  });

  let bHtml = '';
  const totalCols = days + 3;

  catOrder.forEach(cat => {
    bHtml += `<tr class="cat-row"><td colspan="${totalCols}">${cat}</td></tr>`;

    byGroup[cat].forEach(({ h, hi }) => {
      const hcolor      = h.color || '#c8f135';
      let done          = 0;
      for (let d = 1; d <= past; d++) if (isChk(hi, d)) done++;
      const hp          = pct(done, past);
      const hst         = habitStreak(hi);
      const streakColor = hst >= 7 ? '#c8f135' : hst >= 3 ? '#f09836' : '#3a3a5a';

      let row = `<tr id="hr-${hi}"><td>
        <div class="hname-cell">
          <span class="h-dot" style="background:${hcolor}"></span>
          <span class="h-emoji">${h.emoji}</span>
          <span class="h-name"
            contenteditable="true"
            onblur="renameH(${hi}, this)"
            onkeydown="if(event.key==='Enter'){event.preventDefault();this.blur();}"
          >${h.name}</span>
          <button class="del-btn" onclick="delH(${hi})">✕</button>
        </div>
      </td>`;

      for (let d = 1; d <= days; d++) {
        const isT   = d === td;
        const isFut = td > 0 && d > td;
        const chk   = isChk(hi, d);
        const wd    = dow(vy, vm, d);
        const sep   = wd === 0 && d > 1 ? 'wk-sep-col' : '';
        const cls   = ['cb', chk ? 'done' : '', isT ? 'is-today' : '', isFut ? 'is-future' : '']
          .filter(Boolean).join(' ');

        row += `<td class="check-cell ${sep}">
          <button class="${cls}"
            style="${chk ? `background:${hcolor};` : ''}"
            onclick="toggle(${hi}, ${d})"
            ${isFut ? 'disabled' : ''}
          ></button>
        </td>`;
      }

      row += `<td class="streak-cell">
        <span class="s-pill" style="background:${streakColor}22;color:${streakColor}">
          🔥 ${hst}d
        </span>
      </td>`;
      row += `<td class="rprog-cell">
        <div class="rb-track">
          <div class="rb-fill" style="width:${hp}%;background:${hcolor}"></div>
        </div>
        <div class="rb-pct">${hp}%</div>
      </td>`;
      row += '</tr>';
      bHtml += row;
    });
  });

  document.getElementById('tBody').innerHTML = bHtml;
}

function _renderTableFoot(days, td, past) {
  const N = habits.length;
  let pRow = `<tr><td>% del día</td>`;
  let dRow = `<tr><td>✓ Hecho</td>`;
  let nRow = `<tr><td>✗ Pendiente</td>`;

  for (let d = 1; d <= days; d++) {
    const isFut = td > 0 && d > td;
    let dn = 0;
    if (!isFut) habits.forEach((_, hi) => { if (isChk(hi, d)) dn++; });
    const dp  = pct(dn, N);
    const wd  = dow(vy, vm, d);
    const sep = wd === 0 && d > 1 ? 'wk-sep-col' : '';

    if (isFut || !N) {
      pRow += `<td class="${sep}"></td>`;
      dRow += `<td class="${sep}"></td>`;
      nRow += `<td class="${sep}"></td>`;
    } else {
      pRow += `<td class="${sep}"><span class="pct-pill" style="${pillStyle(dp)}">${dp}%</span></td>`;
      dRow += `<td class="${sep}" style="color:#2de8b0">${dn || ''}</td>`;
      nRow += `<td class="${sep}" style="color:#f03672">${N - dn || ''}</td>`;
    }
  }

  pRow += `<td></td><td></td></tr>`;
  dRow += `<td></td><td></td></tr>`;
  nRow += `<td></td><td></td></tr>`;
  document.getElementById('tFoot').innerHTML = pRow + dRow + nRow;
}

function _renderStats(past, td) {
  const N = habits.length;
  let totalDone = 0;
  habits.forEach((_, hi) => {
    for (let d = 1; d <= past; d++) if (isChk(hi, d)) totalDone++;
  });
  const gp = pct(totalDone, N * past);

  let bestIdx = -1, bestPctVal = 0;
  habits.forEach((_, hi) => {
    const p = habitPct(hi);
    if (p > bestPctVal) { bestPctVal = p; bestIdx = hi; }
  });

  let todayDone = 0;
  if (td > 0) habits.forEach((_, hi) => { if (isChk(hi, td)) todayDone++; });

  document.getElementById('sH').textContent   = N;
  document.getElementById('sT').textContent   = todayDone;
  document.getElementById('sTsub').textContent = `de ${N}`;
  document.getElementById('sB').textContent   = bestIdx >= 0
    ? habits[bestIdx].emoji + ' ' + habits[bestIdx].name : '—';
  document.getElementById('sBp').textContent  = bestIdx >= 0 ? bestPctVal + '%' : '';
  document.getElementById('sS').textContent   = globalStreak();
  document.getElementById('sCh').textContent  = totalDone;
  document.getElementById('gPct').textContent = gp + '%';
  document.getElementById('gBar').style.width = gp + '%';
}

// ── DASHBOARD ──────────────────────────────────────────────────
function renderDashboard() {
  const days = daysIn(vy, vm);
  const td   = todayD();
  const past = td > 0 ? td : days;

  _renderLineChart(past);
  _renderHabitBars();
  _renderHeatmap();
  _renderTopBottom();
}

function _renderLineChart(past) {
  const labels = [], data = [];
  for (let d = 1; d <= past; d++) {
    labels.push(d);
    let dn = 0;
    habits.forEach((_, hi) => { if (isChk(hi, d)) dn++; });
    data.push(habits.length ? pct(dn, habits.length) : 0);
  }

  if (lineChartObj) lineChartObj.destroy();
  const ctx  = document.getElementById('lineChart').getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, 200);
  grad.addColorStop(0, 'rgba(200,241,53,.22)');
  grad.addColorStop(1, 'rgba(200,241,53,.01)');

  Chart.defaults.color       = '#3a3a5a';
  Chart.defaults.borderColor = 'rgba(255,255,255,.04)';

  lineChartObj = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: '%',
        data,
        fill: true,
        backgroundColor: grad,
        borderColor: '#c8f135',
        borderWidth: 2,
        pointBackgroundColor: '#c8f135',
        pointRadius: 3,
        pointHoverRadius: 6,
        tension: .4,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#111120',
          borderColor: '#1e1e38',
          borderWidth: 1,
          titleColor: '#c8f135',
          bodyColor: '#d8daf0',
          callbacks: { label: c => `${c.parsed.y}% completado` },
        },
      },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,.02)' }, ticks: { font: { family: 'Space Mono', size: 9 } } },
        y: {
          min: 0, max: 100,
          grid: { color: 'rgba(255,255,255,.04)' },
          ticks: { font: { family: 'Space Mono', size: 9 }, callback: v => v + '%' },
        },
      },
    },
  });
}

function _renderHabitBars() {
  const haEl = document.getElementById('haRows');
  if (!habits.length) {
    haEl.innerHTML = '<div style="color:var(--muted);font-size:.8rem">Sin hábitos</div>';
    return;
  }
  const ranked = [...habits.map((h, hi) => ({ h, hi, p: habitPct(hi), st: habitStreak(hi) }))]
    .sort((a, b) => b.p - a.p);

  haEl.innerHTML = ranked.map(({ h, p, st }) => `
    <div class="ha-row">
      <div class="ha-emoji">${h.emoji}</div>
      <div class="ha-track">
        <div class="ha-fill" style="width:${p}%;background:${h.color || '#c8f135'}"></div>
      </div>
      <div class="ha-pct">${p}%</div>
      <div class="ha-streak">🔥${st}d</div>
    </div>
  `).join('');
}

function _renderHeatmap() {
  document.getElementById('hmDays').innerHTML =
    ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá']
      .map(d => `<div class="hm-dl">${d}</div>`)
      .join('');

  const start = new Date();
  start.setDate(start.getDate() - 34);
  const pad = start.getDay();
  let html = '';

  for (let p = 0; p < pad; p++) html += `<div></div>`;

  for (let i = 0; i < 35; i++) {
    const d2 = new Date(start);
    d2.setDate(d2.getDate() + i);
    const dy = d2.getFullYear(), dm = d2.getMonth(), dd = d2.getDate();
    let dn = 0;
    habits.forEach((_, hi) => { if (checks[`${dy}-${dm}-${hi}-${dd}`]) dn++; });
    const dp  = habits.length ? pct(dn, habits.length) : 0;
    let bg    = 'rgba(255,255,255,.03)';
    if      (dp >= 80) bg = '#c8f135';
    else if (dp >= 60) bg = '#86b020';
    else if (dp >= 40) bg = '#465c10';
    else if (dp > 0)   bg = '#252e08';
    html += `<div class="hm-cell" style="background:${bg}" data-tip="${dd}/${dm+1}: ${dp}%"></div>`;
  }

  document.getElementById('hmGrid').innerHTML = html;
}

function _renderTopBottom() {
  const sorted = [...habits.map((h, hi) => ({ h, hi, p: habitPct(hi) }))]
    .sort((a, b) => b.p - a.p);
  const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];

  function bwHtml(list, icons) {
    return list.map(({ h, p }, i) => `
      <div class="bw-item">
        <div class="bw-rank">${icons[i] || i + 1}</div>
        <div style="font-size:.88rem">${h.emoji}</div>
        <div class="bw-name" style="color:${h.color || '#c8f135'}">${h.name}</div>
        <div class="bw-pct" style="color:${h.color || '#c8f135'}">${p}%</div>
      </div>
    `).join('');
  }

  document.getElementById('topList').innerHTML = bwHtml(sorted.slice(0, 5), medals);
  document.getElementById('botList').innerHTML = bwHtml(
    [...sorted].reverse().slice(0, 5),
    ['⚠️', '⚠️', '⚠️', '⚠️', '⚠️']
  );
}
