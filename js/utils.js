/**
 * utils.js — Funciones utilitarias puras (sin efectos secundarios en el DOM)
 *
 * Todas estas funciones pueden ser testeadas de forma independiente.
 */

/** Días en el mes (year, month 0-indexed) */
function daysIn(y, m) {
  return new Date(y, m + 1, 0).getDate();
}

/** Día de la semana (0=Dom … 6=Sáb) */
function dow(y, m, d) {
  return new Date(y, m, d).getDay();
}

/** Genera la clave del localStorage para un check */
function ck(hi, d) {
  return `${vy}-${vm}-${hi}-${d}`;
}

/** ¿Está marcado el hábito hi en el día d del mes activo? */
function isChk(hi, d) {
  return !!checks[ck(hi, d)];
}

/**
 * Devuelve el día de hoy si estamos viendo el mes actual,
 * de lo contrario devuelve -1 (mes pasado o futuro).
 */
function todayD() {
  const n = new Date();
  return (n.getFullYear() === vy && n.getMonth() === vm)
    ? n.getDate()
    : -1;
}

/** Calcula porcentaje entero, evitando división por cero */
function pct(done, total) {
  return total ? Math.round((done / total) * 100) : 0;
}

/**
 * Progreso del hábito hi en el mes activo.
 * Usa solo los días transcurridos (o todos si es mes pasado).
 */
function habitPct(hi) {
  const days = daysIn(vy, vm);
  const td   = todayD();
  const past = td > 0 ? td : days;
  let done   = 0;
  for (let d = 1; d <= past; d++) if (isChk(hi, d)) done++;
  return pct(done, past);
}

/**
 * Racha actual del hábito hi: días consecutivos marcados
 * hacia atrás desde hoy.
 */
function habitStreak(hi) {
  let s = 0;
  const d = new Date();
  for (let i = 0; i < 120; i++) {
    const key = `${d.getFullYear()}-${d.getMonth()}-${hi}-${d.getDate()}`;
    if (checks[key]) s++;
    else if (i > 0) break;
    d.setDate(d.getDate() - 1);
  }
  return s;
}

/**
 * Racha global: días consecutivos en que ≥50% de los hábitos
 * fueron completados.
 */
function globalStreak() {
  if (!habits.length) return 0;
  let s = 0;
  const d = new Date();
  for (let i = 0; i < 90; i++) {
    const dy = d.getFullYear(), dm = d.getMonth(), dd = d.getDate();
    let done = 0;
    habits.forEach((_, hi) => {
      if (checks[`${dy}-${dm}-${hi}-${dd}`]) done++;
    });
    if (done / habits.length >= 0.5) s++;
    else if (i > 0) break;
    d.setDate(d.getDate() - 1);
  }
  return s;
}

/** Gradiente de color según porcentaje (para barras de progreso) */
function barGrad(p) {
  if (p >= 80) return 'linear-gradient(90deg,#2de8b0,#c8f135)';
  if (p >= 50) return 'linear-gradient(90deg,#f0d836,#c8f135)';
  return 'linear-gradient(90deg,#f03636,#f09836)';
}

/** Estilos inline para la píldora de porcentaje diario */
function pillStyle(p) {
  if (p >= 80) return 'background:rgba(200,241,53,.15);color:#c8f135';
  if (p >= 50) return 'background:rgba(240,216,54,.15);color:#f0d836';
  return 'background:rgba(240,54,54,.15);color:#f03636';
}

/** Muestra el toast con un mensaje */
function toast(msg) {
  document.getElementById('tMsg').textContent = msg;
  const t = document.getElementById('toast');
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), 2200);
}
