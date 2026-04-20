# Interval 🏋️

**Schedule-aware fitness for time-constrained university students.**

HCI Final Design Project · University of Birmingham Dubai · Group 4  
Ali Abdelbadie · Ayham Al Halabi · Mazen Salama · Takwa

---

## Running locally

You need [Node.js](https://nodejs.org) installed (v18 or higher).

```bash
# 1. Clone the repo
git clone https://github.com/YOUR-USERNAME/interval-hci-prototype.git
cd interval-hci-prototype

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Then open **http://localhost:5173** in your browser.

## Project structure

```
src/
  App.jsx       ← all prototype screens (edit this)
  main.jsx      ← entry point (don't touch)
  index.css     ← Tailwind base (don't touch)
```

## How to edit

All screens live in `src/App.jsx`. Each screen is its own function:

| Function | Screen |
|---|---|
| `Welcome` | Landing / splash screen |
| `ScheduleSetup` | Timetable import |
| `HomeScreen` | Main dashboard |
| `WorkoutList` | Workout picker |
| `WorkoutDetail` | Workout detail view |
| `ActiveWorkout` | Active session / timer |
| `Complete` | Post-workout summary |
| `Progress` | Consistency report |

Edit the relevant function and the dev server hot-reloads instantly.

## Colours

```js
bg:    '#F4F0E8'  // warm cream background
ink:   '#0F0F0E'  // near-black text
muted: '#8A857C'  // secondary text
soft:  '#E8E2D5'  // card background
lime:  '#D4FF00'  // accent / highlight
coral: '#FF5733'  // secondary accent
```
