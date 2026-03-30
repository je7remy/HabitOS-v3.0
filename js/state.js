/**
 * state.js — Estado global de la aplicación y persistencia en localStorage
 *
 * Comparte las mismas claves (hos3_habits / hos3_checks) con la versión
 * móvil (mobile.html), así que los datos son compatibles entre ambas.
 */

const SK_HABITS = 'hos3_habits';
const SK_CHECKS = 'hos3_checks';

/** @type {Array<{id:string, name:string, emoji:string, color:string, cat:string}>} */
let habits = JSON.parse(localStorage.getItem(SK_HABITS) || 'null');

/** @type {Object<string, boolean>}  key = "year-month-habitIdx-day" */
let checks = JSON.parse(localStorage.getItem(SK_CHECKS) || '{}');

// Inicializar con hábitos por defecto si es la primera vez
if (!habits) {
  habits = ALL_HABITS_DEF.map(h => ({ ...h }));
  save();
}

// ── Mes/año actualmente visualizado ───────────────────────────
const _now = new Date();
let vy = _now.getFullYear();
let vm = _now.getMonth();

// ── Color seleccionado en el picker de agregar hábito ─────────
let selColor = PALETTE[0];

// ── Referencia al objeto Chart.js activo ──────────────────────
let lineChartObj = null;

// ── Importación pendiente de confirmar ────────────────────────
let pendingImport = null;

/**
 * Persiste habits y checks en localStorage.
 * Llama a esta función después de cualquier mutación de estado.
 */
function save() {
  localStorage.setItem(SK_HABITS, JSON.stringify(habits));
  localStorage.setItem(SK_CHECKS, JSON.stringify(checks));
}
