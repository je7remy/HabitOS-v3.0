/**
 * app.js — Inicialización y event listeners globales
 *
 * Este archivo se carga último (después de todos los módulos).
 * Su única responsabilidad es conectar el DOM con las funciones
 * definidas en los otros módulos.
 */

// ── MONTH NAVIGATION ───────────────────────────────────────────
document.getElementById('prevM').addEventListener('click', () => {
  vm--;
  if (vm < 0) { vm = 11; vy--; }
  render();
});

document.getElementById('nextM').addEventListener('click', () => {
  vm++;
  if (vm > 11) { vm = 0; vy++; }
  render();
});

// ── TAB NAVIGATION ─────────────────────────────────────────────
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('view-' + tab.dataset.tab).classList.add('active');
    if (tab.dataset.tab === 'dashboard') renderDashboard();
  });
});

// ── IMPORT MODAL — close on overlay click ─────────────────────
document.getElementById('importOverlay').addEventListener('click', function (e) {
  if (e.target === this) closeImport();
});

// ── KEYBOARD SHORTCUTS ─────────────────────────────────────────
document.getElementById('nameIn').addEventListener('keydown', e => {
  if (e.key === 'Enter') addHabit();
});

// ── INIT ───────────────────────────────────────────────────────
buildColorPick();
render();
