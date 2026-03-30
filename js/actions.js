/**
 * actions.js — Acciones del usuario que mutan el estado
 *
 * toggle()   → marcar/desmarcar un día
 * addHabit() → agregar hábito desde el formulario
 * delH()     → eliminar hábito por índice
 * renameH()  → renombrar hábito inline
 */

/**
 * Alterna el check del hábito hi en el día d del mes activo.
 * Llama desde el onclick del botón checkbox en la tabla.
 */
function toggle(hi, d) {
  const k = ck(hi, d);
  checks[k] = !checks[k];
  if (!checks[k]) delete checks[k];
  save();
  render();

  // Flash animation on the row
  const row = document.getElementById(`hr-${hi}`);
  if (row) {
    row.classList.remove('row-flash');
    void row.offsetWidth; // force reflow
    row.classList.add('row-flash');
  }
}

/** Lee el formulario de "Agregar hábito" y crea un nuevo hábito */
function addHabit() {
  const name  = document.getElementById('nameIn').value.trim();
  const emoji = document.getElementById('emojiIn').value.trim() || '⭐';

  if (!name) {
    toast('✏️ Escribe el nombre del hábito');
    return;
  }

  const idx = PALETTE.indexOf(selColor);
  habits.push({
    id:    `custom_${Date.now()}`,
    name,
    emoji,
    color: selColor,
    cat:   '📋 Personalizados',
  });

  save();
  document.getElementById('nameIn').value = '';

  // Rotate to the next color for the next habit
  selColor = PALETTE[(idx + 1) % PALETTE.length];
  buildColorPick();
  render();
  toast(`✓ "${name}" agregado`);
}

/**
 * Elimina el hábito en el índice idx.
 * Reasigna los índices de checks para los hábitos posteriores.
 */
function delH(idx) {
  const name = habits[idx].name;
  habits.splice(idx, 1);

  // Rebuild checks remapping indices
  const nc = {};
  Object.entries(checks).forEach(([k, v]) => {
    const parts = k.split('-');
    const hi    = parseInt(parts[2]);
    if (hi === idx) return; // drop checks for deleted habit
    const newHi = hi > idx ? hi - 1 : hi;
    nc[`${parts[0]}-${parts[1]}-${newHi}-${parts[3]}`] = v;
  });

  checks = nc;
  save();
  render();
  toast(`🗑 "${name}" eliminado`);
}

/**
 * Renombra el hábito idx con el texto del elemento editable.
 * Se llama en el evento onblur del span contenteditable.
 */
function renameH(idx, el) {
  const n = el.textContent.trim();
  if (n && n !== habits[idx].name) {
    habits[idx].name = n;
    save();
    render();
    toast(`✏️ Renombrado a "${n}"`);
  } else {
    // Restore original name if empty or unchanged
    el.textContent = habits[idx].name;
  }
}
