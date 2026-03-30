/**
 * data.js — Definición de hábitos por defecto y constantes globales
 *
 * Para agregar o quitar hábitos por defecto, edita HABIT_GROUPS.
 * Cada hábito tiene: id, name, emoji, color (hex).
 * La categoría (cat) se toma del grupo padre.
 */

const HABIT_GROUPS = [
  {
    cat: '🎯 Objetivos Principales',
    habits: [
      { id: 'tesis',     name: 'Tesis',     emoji: '📝', color: '#c8f135' },
      { id: 'ejercicio', name: 'Ejercicio', emoji: '💪', color: '#2de8b0' },
    ],
  },
  {
    cat: '😴 Sueño & Descanso',
    habits: [
      { id: 'dormir8',   name: 'Dormir 8 horas',                  emoji: '😴', color: '#36a8f0' },
      { id: 'temprano',  name: 'Acostarse temprano (antes 11pm)', emoji: '🌙', color: '#a036f0' },
      { id: 'despertar', name: 'Levantarse temprano (antes 6am)', emoji: '🌅', color: '#f0d836' },
    ],
  },
  {
    cat: '📚 Mente & Conocimiento',
    habits: [
      { id: 'leer',       name: 'Leer',                               emoji: '📖', color: '#36a8f0' },
      { id: 'meditacion', name: 'Meditación',                         emoji: '🧘', color: '#a036f0' },
      { id: 'proposito',  name: 'Propósito sólido (revisión de metas)', emoji: '🎯', color: '#c8f135' },
    ],
  },
  {
    cat: '💪 Disciplina & Control',
    habits: [
      { id: 'dieta',     name: 'No comer en exceso (dieta)',     emoji: '🥗', color: '#2de8b0' },
      { id: 'noporno',   name: 'No porno',                       emoji: '🚫', color: '#f03672' },
      { id: 'noentrete', name: 'No entretenimiento pasivo',      emoji: '📵', color: '#f09836' },
      { id: 'noalcohol', name: 'No alcohol',                     emoji: '🍃', color: '#2de8b0' },
    ],
  },
  {
    cat: '🌱 Entorno & Conexión',
    habits: [
      { id: 'circulo', name: 'Buen círculo (interacción positiva)', emoji: '🤝', color: '#f0d836' },
    ],
  },
];

/** Lista plana de hábitos con la categoría incluida en cada objeto */
const ALL_HABITS_DEF = [];
HABIT_GROUPS.forEach(g =>
  g.habits.forEach(h => ALL_HABITS_DEF.push({ ...h, cat: g.cat }))
);

/** Paleta de colores disponibles para hábitos personalizados */
const PALETTE = [
  '#c8f135', '#2de8b0', '#f03672', '#f09836',
  '#36a8f0', '#a036f0', '#f0d836', '#f03636',
];

/** Nombres de meses en español */
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

/** Abreviaciones de días (índice 0 = Domingo, igual que Date.getDay()) */
const DAYS_ES = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];
