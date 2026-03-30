/**
 * import-export.js — Exportación e importación de datos en formato CSV
 *
 * exportCSV()       → genera y descarga el archivo CSV del mes activo
 * openImport()      → abre el modal de importación
 * closeImport()     → cierra el modal
 * handleDrop()      → procesa drag & drop
 * handleFileSelect()→ procesa selección por click
 * parseCSV()        → parsea el contenido del archivo
 * confirmImport()   → aplica la importación (merge o replace)
 */

// ── EXPORT ─────────────────────────────────────────────────────

function exportCSV() {
  const days = daysIn(vy, vm);
  const td   = todayD();
  const past = td > 0 ? td : days;

  let csv = `HabitOS Export — ${MONTHS[vm]} ${vy}\n`;
  csv += `Hábito,Emoji,Color,Categoría,` +
    Array.from({ length: days }, (_, i) => i + 1).join(',') +
    `,Progreso%\n`;

  habits.forEach((h, hi) => {
    let done = 0;
    const row = [h.name, h.emoji, h.color, h.cat || ''];
    for (let d = 1; d <= days; d++) {
      const v = isChk(hi, d) ? 1 : 0;
      row.push(v);
      if (d <= past && v) done++;
    }
    row.push(pct(done, past) + '%');
    csv += row.map(v => `"${v}"`).join(',') + '\n';
  });

  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = `habitos_${MONTHS[vm].toLowerCase()}_${vy}.csv`;
  a.click();
  toast('📥 CSV exportado');
}

// ── IMPORT MODAL ───────────────────────────────────────────────

function openImport() {
  document.getElementById('importOverlay').classList.add('open');
  _resetImportUI();
}

function closeImport() {
  document.getElementById('importOverlay').classList.remove('open');
  pendingImport = null;
  document.getElementById('csvFileIn').value = '';
}

function _resetImportUI() {
  document.getElementById('importPreview').style.display = 'none';
  document.getElementById('importEmpty').style.display   = 'block';
  document.getElementById('importEmpty').style.color     = 'var(--muted2)';
  document.getElementById('importEmpty').textContent     = 'Sube un archivo para ver la vista previa';
  document.getElementById('dropZone').classList.remove('drag-over');
  pendingImport = null;
}

function handleDrop(e) {
  e.preventDefault();
  document.getElementById('dropZone').classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file && file.name.endsWith('.csv')) {
    _processFile(file);
  } else {
    toast('⚠️ Solo se aceptan archivos .csv');
  }
}

function handleFileSelect(e) {
  const file = e.target.files[0];
  if (file) _processFile(file);
}

function _processFile(file) {
  const reader  = new FileReader();
  reader.onload = e => parseCSV(e.target.result, file.name);
  reader.readAsText(file, 'UTF-8');
}

// ── CSV PARSER ─────────────────────────────────────────────────

/**
 * Parsea una sola línea CSV respetando comillas dobles y emojis.
 * @param {string} line
 * @returns {string[]}
 */
function parseCSVRow(line) {
  const result = [];
  let cur = '', inQ = false, i = 0;
  // Strip BOM
  if (line.charCodeAt(0) === 0xFEFF) line = line.slice(1);

  while (i < line.length) {
    const ch = line[i];
    if (ch === '"') {
      if (inQ && line[i + 1] === '"') { cur += '"'; i += 2; continue; }
      inQ = !inQ; i++; continue;
    }
    if (ch === ',' && !inQ) { result.push(cur); cur = ''; i++; continue; }
    cur += ch; i++;
  }
  result.push(cur);
  return result;
}

/**
 * Parsea el contenido completo del CSV y muestra la vista previa.
 * Maneja: BOM, diferentes encodings, archivos guardados por Excel/Sheets.
 *
 * @param {string} raw     - Contenido completo del archivo
 * @param {string} filename
 */
function parseCSV(raw, filename) {
  try {
    if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);

    const lines = raw.split(/\r?\n/).filter(l => l.trim());
    const MESES = [
      'ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO',
      'JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE',
    ];

    let exportYear  = null, exportMonth = null;
    let headerIdx   = -1,  dataStartIdx = -1;

    // Step 1: Find the header row (starts with "Hábito" or "Habito")
    for (let i = 0; i < Math.min(lines.length, 5); i++) {
      const row   = parseCSVRow(lines[i]);
      const first = (row[0] || '').trim().toLowerCase();
      if (first === 'hábito' || first === 'habito' || first === 'h\u00e1bito') {
        headerIdx    = i;
        dataStartIdx = i + 1;
        break;
      }
    }

    // Step 2: Extract month & year from any line before the header
    const scanLimit = headerIdx >= 0 ? headerIdx + 1 : 3;
    for (let i = 0; i < scanLimit; i++) {
      const m = lines[i].match(/([A-Za-z\u00e0-\u00ff]+)\s+(\d{4})/i);
      if (m) {
        const mn  = m[1].toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const idx = MESES.findIndex(mes =>
          mes.normalize('NFD').replace(/[\u0300-\u036f]/g, '') === mn
        );
        if (idx >= 0) { exportMonth = idx; exportYear = parseInt(m[2]); break; }
      }
    }

    if (headerIdx < 0) {
      throw new Error(
        'No se encontró la fila de encabezado (Hábito, Emoji, Color…). ' +
        '¿Es un CSV exportado por HabitOS?'
      );
    }

    // Step 3: Locate day columns (purely numeric 1–31)
    const headers  = parseCSVRow(lines[headerIdx]);
    let dayColStart = -1, dayColEnd = -1;
    for (let c = 0; c < headers.length; c++) {
      const h = headers[c].trim();
      if (/^\d+$/.test(h) && parseInt(h) >= 1 && parseInt(h) <= 31) {
        if (dayColStart < 0) dayColStart = c;
        dayColEnd = c;
      }
    }
    if (dayColStart < 0) {
      throw new Error(
        'No se encontraron columnas de días (1, 2, 3…). ' +
        'Verifica que el archivo no haya sido modificado.'
      );
    }
    const numDays = dayColEnd - dayColStart + 1;

    // Step 4: Parse each habit row
    const importedHabits = [];
    const importedChecks = {};

    for (let i = dataStartIdx; i < lines.length; i++) {
      const row  = parseCSVRow(lines[i]);
      const name = (row[0] || '').trim();
      if (!name || name.toLowerCase() === 'hábito' || name.toLowerCase() === 'habito') continue;

      const emoji = (row[1] || '⭐').trim() || '⭐';
      const color = /^#[0-9a-fA-F]{6}$/.test((row[2] || '').trim())
        ? row[2].trim() : '#c8f135';
      const cat   = (row[3] || '📋 Importados').trim() || '📋 Importados';

      const hi = importedHabits.length;
      importedHabits.push({ id: `imp_${Date.now()}_${hi}`, name, emoji, color, cat });

      for (let d = 0; d < numDays; d++) {
        if ((row[dayColStart + d] || '').trim() === '1') {
          const y = exportYear  ?? new Date().getFullYear();
          const m = exportMonth ?? new Date().getMonth();
          importedChecks[`${y}-${m}-${hi}-${d + 1}`] = true;
        }
      }
    }

    if (!importedHabits.length) {
      throw new Error('No se encontraron hábitos. Verifica que el archivo sea el CSV correcto de HabitOS.');
    }

    const totalChecks = Object.keys(importedChecks).length;
    const monthStr    = exportMonth !== null
      ? `${MONTHS[exportMonth]} ${exportYear}` : 'mes desconocido';

    pendingImport = {
      habits: importedHabits,
      checks: importedChecks,
      month:  exportMonth,
      year:   exportYear,
      numDays,
      filename,
    };

    // Show preview
    document.getElementById('previewContent').innerHTML = `
      <div style="display:flex;flex-direction:column;gap:0;">
        ${[
          ['Archivo',             filename,              'var(--teal)'],
          ['Mes exportado',       monthStr,              'var(--lime)'],
          ['Hábitos encontrados', importedHabits.length, 'var(--orange)'],
          ['Checks registrados',  totalChecks,           'var(--lime)'],
        ].map(([lbl, val, col]) => `
          <div style="display:flex;justify-content:space-between;align-items:center;
                      padding:7px 0;border-bottom:1px solid var(--border);">
            <span style="font-size:.7rem;color:var(--muted2);">${lbl}</span>
            <span style="font-size:.76rem;font-weight:700;color:${col};">${val}</span>
          </div>
        `).join('')}
        <div style="margin-top:10px;display:flex;flex-direction:column;gap:3px;">
          ${importedHabits.map(h => `
            <div style="display:flex;align-items:center;gap:7px;padding:3px 0;">
              <span style="width:6px;height:6px;border-radius:50%;background:${h.color};
                           flex-shrink:0;display:inline-block;"></span>
              <span style="font-size:.78rem;">${h.emoji}  ${h.name}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    document.getElementById('importWarning').innerHTML =
      `<b>Combinar</b>: agrega los datos de <b>${monthStr}</b> sin tocar otros meses.<br><br>` +
      `<b>Reemplazar todo</b>: borra todos los datos actuales y carga solo este CSV. Ideal si formateaste.`;

    document.getElementById('importPreview').style.display = 'block';
    document.getElementById('importEmpty').style.display   = 'none';

  } catch (err) {
    document.getElementById('importEmpty').style.display   = 'block';
    document.getElementById('importEmpty').style.color     = 'var(--pink)';
    document.getElementById('importEmpty').textContent     = '❌ ' + err.message;
    document.getElementById('dropZone').style.borderColor  = 'var(--pink)';
    pendingImport = null;
  }
}

// ── CONFIRM IMPORT ─────────────────────────────────────────────

/**
 * @param {'merge'|'replace'} mode
 */
function confirmImport(mode) {
  if (!pendingImport) {
    toast('⚠️ No hay datos listos para importar');
    return;
  }

  const { habits: impH, checks: impC, month: impM, year: impY } = pendingImport;

  if (mode === 'replace') {
    habits = impH;
    checks = impC;
    if (impM !== null) { vm = impM; vy = impY; }

  } else {
    // Merge by habit name (case-insensitive)
    const existingNames = habits.map(h => h.name.toLowerCase());

    impH.forEach((ih, oldHi) => {
      let targetHi = existingNames.indexOf(ih.name.toLowerCase());
      if (targetHi < 0) {
        targetHi = habits.length;
        habits.push({ ...ih });
        existingNames.push(ih.name.toLowerCase());
      }
      // Remap check keys to the target index
      Object.entries(impC).forEach(([k, v]) => {
        const parts = k.split('-');
        if (parseInt(parts[2]) === oldHi) {
          checks[`${parts[0]}-${parts[1]}-${targetHi}-${parts[3]}`] = v;
        }
      });
    });

    if (impM !== null) { vm = impM; vy = impY; }
  }

  save();
  render();
  closeImport();

  const mStr = impM !== null ? `${MONTHS[impM]} ${impY}` : 'datos';
  toast(`✅ ${mode === 'replace' ? 'Reemplazado' : 'Combinado'} — ${mStr} restaurado`);
}
