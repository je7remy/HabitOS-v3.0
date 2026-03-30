# HabitOS v3.0

Tracker de hábitos personal — dark/cyberpunk, sin servidor, sin dependencias locales.

## ✨ Características

- **13 hábitos** organizados en 5 categorías (Objetivos, Sueño, Mente, Disciplina, Entorno)
- **Tracker mensual** con tabla semanal, racha por hábito y progreso %
- **Dashboard** con gráfica de línea, mapa de calor y ranking
- **Importar / Exportar CSV** — tus datos siempre seguros en la nube
- **Persistencia local** — todo se guarda en `localStorage`, sin backend
- **Versión móvil** — `mobile.html`, mismos datos, diseño tipo app nativa

## 🗂 Estructura del proyecto

```
habitos-os/
├── index.html          # App de escritorio
├── mobile.html         # App móvil (bottom nav, cards táctiles)
├── css/
│   └── style.css       # Todos los estilos
└── js/
    ├── data.js         # Definición de hábitos y constantes
    ├── state.js        # Estado global y persistencia localStorage
    ├── utils.js        # Funciones puras (pct, streak, daysIn…)
    ├── render.js       # Renderizado del DOM (tabla, dashboard)
    ├── actions.js      # Acciones del usuario (toggle, add, delete)
    ├── import-export.js# CSV parser y exportador
    └── app.js          # Init y event listeners
```

## 🚀 Uso

Clona el repo y abre `index.html` directamente en el navegador — no necesita servidor.

```bash
git clone https://github.com/tu-usuario/habitos-os.git
cd habitos-os
open index.html   # macOS
# o simplemente arrastra el archivo al navegador
```

### Versión móvil

Abre `mobile.html` en el navegador del móvil y usa **"Agregar a pantalla de inicio"** para instalarlo como app.

> Los datos de `index.html` y `mobile.html` se comparten automáticamente si se abren en el mismo navegador, porque usan las mismas claves de `localStorage` (`hos3_habits` / `hos3_checks`).

## 📤 Exportar / Importar datos

- **Exportar**: botón `↓ Exportar CSV` en el header → descarga un `.csv` del mes activo
- **Importar**: botón `↑ Importar CSV` → sube el archivo → elige *Combinar* o *Reemplazar*

El formato CSV es compatible con Excel y Google Sheets. Guarda el CSV en Google Drive, iCloud o cualquier nube antes de formatear el equipo.

## 🎨 Personalizar hábitos por defecto

Edita `js/data.js` — solo cambia el array `HABIT_GROUPS`:

```js
{
  cat: '🎯 Mis objetivos',
  habits: [
    { id: 'mi-habito', name: 'Mi hábito', emoji: '🔥', color: '#c8f135' },
  ],
},
```

## 📦 Dependencias externas

Solo una, cargada desde CDN:

- [Chart.js 4.4.1](https://www.chartjs.org/) — gráfica de línea del dashboard

## 📄 Licencia

MIT — úsalo, fórkalo, modifícalo libremente.
