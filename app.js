// app.js — Main application logic for Tropical Workout Tracker
// ═══════════════════════════════════════════════════════════════

const APP_VERSION = 'v73';

// ─── Built-in exercise → muscle group lookup (no API needed) ───
const MUSCLE_GROUPS = ['Chest','Back','Shoulders','Biceps','Triceps','Forearms',
  'Quads','Hamstrings','Glutes','Calves','Abs','Traps','Lats','Full Body','Cardio'];

const EXERCISE_MUSCLE_MAP = {
  // Chest
  'bench press':['Chest','Triceps','Shoulders'],'incline bench press':['Chest','Shoulders','Triceps'],
  'decline bench press':['Chest','Triceps'],'dumbbell bench press':['Chest','Triceps','Shoulders'],
  'incline dumbbell press':['Chest','Shoulders'],'dumbbell fly':['Chest'],'cable fly':['Chest'],
  'chest fly':['Chest'],'pec deck':['Chest'],'push up':['Chest','Triceps','Shoulders'],
  'push-up':['Chest','Triceps','Shoulders'],'pushup':['Chest','Triceps','Shoulders'],
  'dips':['Triceps','Chest'],'chest dips':['Chest','Triceps'],
  // Back
  'pull up':['Lats','Biceps','Back'],'pull-up':['Lats','Biceps','Back'],'pullup':['Lats','Biceps','Back'],
  'chin up':['Lats','Biceps'],'chin-up':['Lats','Biceps'],'chinup':['Lats','Biceps'],
  'lat pulldown':['Lats','Biceps'],'seated row':['Back','Biceps'],'cable row':['Back','Biceps'],
  'bent over row':['Back','Biceps'],'barbell row':['Back','Biceps'],'dumbbell row':['Back','Biceps'],
  't-bar row':['Back','Biceps'],'deadlift':['Back','Glutes','Hamstrings','Traps'],
  'romanian deadlift':['Hamstrings','Glutes','Back'],'rdl':['Hamstrings','Glutes','Back'],
  'stiff leg deadlift':['Hamstrings','Glutes'],'sumo deadlift':['Glutes','Hamstrings','Back'],
  'good morning':['Hamstrings','Back','Glutes'],'back extension':['Back','Glutes'],
  'hyperextension':['Back','Glutes'],'face pull':['Shoulders','Traps','Back'],
  'shrug':['Traps'],'barbell shrug':['Traps'],'dumbbell shrug':['Traps'],
  // Shoulders
  'overhead press':['Shoulders','Triceps'],'military press':['Shoulders','Triceps'],
  'shoulder press':['Shoulders','Triceps'],'dumbbell shoulder press':['Shoulders','Triceps'],
  'ohp':['Shoulders','Triceps'],'arnold press':['Shoulders','Triceps'],
  'lateral raise':['Shoulders'],'side raise':['Shoulders'],'front raise':['Shoulders'],
  'rear delt fly':['Shoulders','Back'],'reverse fly':['Shoulders','Back'],
  'upright row':['Shoulders','Traps'],
  // Biceps
  'bicep curl':['Biceps'],'biceps curl':['Biceps'],'barbell curl':['Biceps'],
  'dumbbell curl':['Biceps'],'hammer curl':['Biceps','Forearms'],
  'concentration curl':['Biceps'],'preacher curl':['Biceps'],'cable curl':['Biceps'],
  'incline dumbbell curl':['Biceps'],'zottman curl':['Biceps','Forearms'],
  // Triceps
  'tricep pushdown':['Triceps'],'triceps pushdown':['Triceps'],'rope pushdown':['Triceps'],
  'overhead tricep extension':['Triceps'],'skull crusher':['Triceps'],'skullcrusher':['Triceps'],
  'close grip bench press':['Triceps','Chest'],'tricep dip':['Triceps','Chest'],
  'triceps dip':['Triceps','Chest'],'diamond push up':['Triceps','Chest'],
  // Legs — quads
  'squat':['Quads','Glutes','Hamstrings'],'back squat':['Quads','Glutes','Hamstrings'],
  'front squat':['Quads','Glutes'],'goblet squat':['Quads','Glutes'],
  'leg press':['Quads','Glutes','Hamstrings'],'hack squat':['Quads','Glutes'],
  'leg extension':['Quads'],'lunges':['Quads','Glutes','Hamstrings'],
  'lunge':['Quads','Glutes','Hamstrings'],'walking lunge':['Quads','Glutes'],
  'split squat':['Quads','Glutes'],'bulgarian split squat':['Quads','Glutes'],
  'step up':['Quads','Glutes'],'wall sit':['Quads'],
  // Legs — posterior
  'leg curl':['Hamstrings'],'lying leg curl':['Hamstrings'],'seated leg curl':['Hamstrings'],
  'hip thrust':['Glutes','Hamstrings'],'barbell hip thrust':['Glutes','Hamstrings'],
  'glute bridge':['Glutes','Hamstrings'],'cable kickback':['Glutes'],'donkey kick':['Glutes'],
  // Calves
  'calf raise':['Calves'],'standing calf raise':['Calves'],'seated calf raise':['Calves'],
  'donkey calf raise':['Calves'],
  // Core
  'crunch':['Abs'],'sit up':['Abs'],'sit-up':['Abs'],'situp':['Abs'],
  'plank':['Abs','Full Body'],'ab rollout':['Abs'],'cable crunch':['Abs'],
  'leg raise':['Abs'],'hanging leg raise':['Abs'],'russian twist':['Abs'],
  'mountain climber':['Abs','Full Body'],'bicycle crunch':['Abs'],'side plank':['Abs'],
  'hollow hold':['Abs'],'toe touch':['Abs'],'v-up':['Abs'],
  // Cardio
  'treadmill':['Cardio'],'running':['Cardio'],'cycling':['Cardio'],'bike':['Cardio'],
  'rowing':['Cardio','Back'],'rowing machine':['Cardio','Back'],'elliptical':['Cardio'],
  'jump rope':['Cardio','Calves'],'stair climber':['Cardio','Quads','Glutes'],
  'swimming':['Full Body','Cardio'],
  // Full body
  'clean':['Full Body'],'clean and press':['Full Body'],'snatch':['Full Body'],
  'thruster':['Full Body'],'burpee':['Full Body','Cardio'],
  'kettlebell swing':['Glutes','Hamstrings','Back'],'turkish get up':['Full Body'],
  'farmer carry':['Forearms','Traps','Full Body'],'farmer walk':['Forearms','Traps','Full Body'],
  'box jump':['Quads','Glutes','Calves'],'jump squat':['Quads','Glutes'],
};

// ─── Known bilateral dumbbell exercises (weight entered = per-hand) ───────────
// Any exercise here automatically gets bilateral=true (weight×2 in volume).
// "Unilateral" words in the name (single, one arm) bypass this and prompt user.
const BILATERAL_EXERCISES = new Set([
  // Chest
  'dumbbell bench press','incline dumbbell press','incline dumbbell bench press',
  'decline dumbbell press','decline dumbbell bench press','dumbbell fly',
  'incline dumbbell fly','decline dumbbell fly','chest fly',
  // Shoulders
  'dumbbell shoulder press','dumbbell overhead press','arnold press',
  'lateral raise','side lateral raise','dumbbell lateral raise',
  'front raise','dumbbell front raise',
  'rear delt fly','reverse fly','dumbbell rear delt fly','dumbbell reverse fly',
  // Biceps / Triceps
  'hammer curl','dumbbell curl','dumbbell bicep curl','dumbbell biceps curl',
  'incline dumbbell curl','zottman curl',
  'dumbbell skullcrusher','dumbbell overhead extension',
  'dumbbell tricep extension','dumbbell overhead tricep extension',
  // Back (bilateral variants)
  'dumbbell shrug','dumbbell deadlift',
  // Legs
  'dumbbell squat','dumbbell goblet squat','dumbbell lunge','dumbbell step up',
  'dumbbell calf raise','dumbbell romanian deadlift','dumbbell rdl',
]);

// Unilateral keywords — if the name contains these, skip bilateral auto-detect
const UNILATERAL_KEYWORDS = ['single','one arm','one-arm','unilateral','single-arm'];


const App = {
  currentScreen: 'home',
  activeWorkout: null,
  profile: null,
  settings: null,
  exercises: [],
  workouts: [],

  /* ─── ICONS (Florida Keys Style) ────────────────────────── */
  Icons: {
    home: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
    history: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="9"/></svg>`,
    coach: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 9h8"/><path d="M8 13h6"/></svg>`,
    settings: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
    plus: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
    dumbbell: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6.5 6.5 11 11"/><path d="m21 21-1.5-1.5"/><path d="m3 3 1.5 1.5"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/></svg>`,
    stats: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
    profile: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    back: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>`,
    check: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    chevronRight: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`,
    palm: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 8c0-2.76-2.46-5-5.5-5S2 5.24 2 8c0 2.21 1.79 4 4 4"/><path d="M13 7.14A5.82 5.82 0 0 1 16.5 6c3.04 0 5.5 2.24 5.5 5 0 2.47-1.96 4.54-4.5 4.93"/><path d="M5.89 12c-.41 1.33-.76 2.87-.72 4.4a16.63 16.63 0 0 0 1.63 7.6"/><path d="M17.15 15.82c-.52 1.33-1.07 2.76-1.55 4.18"/><path d="M12 11c0 2.76-1.34 5-3 5s-3-2.24-3-5"/></svg>`,
    sun: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`,
    moon: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,
    anchor: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/><path d="M9 20 5 12"/><path d="m15 20 4-8"/></svg>`,
    trash: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`,
    notes: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
    sparkle: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364-.707.707M6.343 17.657l-.707.707m0-12.728.707.707m11.314 11.314.707.707"/></svg>`,
    up: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>`,
    down: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`,
    person: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>`,
    trophy: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3h10L15 12a3 3 0 0 1-6 0L7 3z"/><path d="M7 6H4a2 2 0 0 0 0 4h3"/><path d="M17 6h3a2 2 0 0 1 0 4h-3"/><line x1="12" y1="15" x2="12" y2="20"/><line x1="9" y1="20" x2="15" y2="20"/></svg>`,
    cameraIcon: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
    flame: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2c0 6-6 8-6 13a6 6 0 0 0 12 0c0-5-6-7-6-13z"/><path d="M12 9c0 3-3 4.5-3 7.5a3 3 0 0 0 6 0C15 13.5 12 12 12 9z"/></svg>`,
    waveCheck: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m4 12 4 4 8-9"/><path d="M2 20c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/></svg>`,
    islandIcon: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="21" rx="8" ry="2"/><line x1="12" y1="21" x2="12" y2="13"/><path d="M8 7c0-2.5 2-5 4-7 2 2 4 4.5 4 7a4 4 0 0 1-8 0z"/><path d="M10 8c.7-1 2-2 2-2s1.3 1 2 2"/></svg>`,
    calendarWave: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M7 15c1-1 2-1 3 0s2 1 3 0 2-1 3 0"/></svg>`,
    bellWave: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/><path d="M6 17c1.3-1.3 2.7-1.3 4 0s2.7 1.3 4 0"/></svg>`,
    beachUmbrella: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2c-5 0-9 3.6-9 8h18c0-4.4-4-8-9-8z"/><line x1="12" y1="2" x2="7" y2="22"/><path d="M2 18c2.5-2.5 5-2.5 7.5 0"/></svg>`,
    selfieIcon: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="3"/><path d="M3 18c0-3 2-5 5-5"/><rect x="13" y="10" width="9" height="7" rx="1.5"/><circle cx="17.5" cy="13.5" r="1.5"/></svg>`,
    warningIcon: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m10.29 3.86-8 13.86A1 1 0 0 0 3.15 19.5h17.7a1 1 0 0 0 .86-1.5l-8-13.86a1 1 0 0 0-1.72 0z"/><line x1="12" y1="9" x2="12" y2="13"/><circle cx="12" cy="17" r=".5" fill="currentColor" stroke="none"/></svg>`,
    hourglassIcon: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 22h14M5 2h14"/><path d="M17 22v-4a2 2 0 0 0-.586-1.414L12 12l-4.414 4.586A2 2 0 0 0 7 18v4"/><path d="M7 2v4a2 2 0 0 0 .586 1.414L12 12l4.414-4.586A2 2 0 0 0 17 6V2"/><path d="M9 20h6"/></svg>`,
    robotIcon: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="12" rx="2"/><circle cx="9" cy="14" r="2"/><circle cx="15" cy="14" r="2"/><line x1="12" y1="8" x2="12" y2="4"/><line x1="10" y1="4" x2="14" y2="4"/><line x1="7" y1="20" x2="7" y2="22"/><line x1="17" y1="20" x2="17" y2="22"/></svg>`,
    refreshIcon: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 15-6.7L21 3"/><path d="M21 3v6h-6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 21"/><path d="M3 21v-6h6"/></svg>`
  },

  // ─── Level System ──────────────────────────────────────────
  LEVELS: [
    { title: 'Beach Bum', xp: 0 },
    { title: 'Wave Wader', xp: 100 },
    { title: 'Shell Collector', xp: 300 },
    { title: 'Reef Paddler', xp: 600 },
    { title: 'Reef Diver', xp: 1000 },
    { title: 'Wave Rider', xp: 1600 },
    { title: 'Dolphin Trainer', xp: 2400 },
    { title: 'Tide Turner', xp: 3500 },
    { title: 'Ocean Beast', xp: 5000 },
    { title: 'Reef King', xp: 7000 },
    { title: 'Island Warrior', xp: 9500 },
    { title: 'Storm Surfer', xp: 12500 },
    { title: 'Volcano Forged', xp: 16000 },
    { title: 'Island Legend', xp: 20000 },
    { title: 'Tsunami King', xp: 25000 },
    { title: 'Island Deity', xp: 35000 },
  ],

  DEFAULT_SETTINGS: {
    defaultSetsPerExercise: 3,
    defaultRestBetweenSets: 120,
    defaultRestBetweenExercises: 180,
    defaultWeightUnit: 'lbs',
    geminiApiKey: '',
    customFieldTemplates: [],
    aiSystemPrompt: '',
    theme: 'auto',
    batterySaver: false,
    username: '',
    avatarStyle: 'avataaars',
    avatarSeed: '',
    avatarSkinColor: 'f5cba7',
    avatarHairStyle: 'shortHairShortFlat',
    avatarFacialHair: '',
    avatarEyeType: 'default',
    avatarClothes: 'hoodie',
    notificationsEnabled: true,
    notifDailyReminder: true,
    notifDailyReminderTime: '08:00',
    notifStreakAtRisk: true,
    notifChatMessages: false,
    notifBoardReset: true,
    notifPromptDismissed: false,
    socialPrivacyVolume: true,
    socialPrivacyFeed: true,
    pollinationsPortrait: '',
    selfieDescription: '',
    portraitCustomText: '',
    portraitStyle: 'photorealistic',
    serverId: ''
  },

  DEFAULT_PROFILE: {
    key: 'main',
    xp: 0,
    level: 0,
    levelTitle: 'Beach Bum',
    currentStreak: 0,
    longestStreak: 0,
    lastWorkoutDate: null,
    personalRecords: {},
    totalWorkouts: 0,
    totalVolume: 0,
    joinDate: new Date().toISOString()
  },

  // ─── Initialize ────────────────────────────────────────────
  async init() {
    await this.loadData();
    this.setupNavigation();
    this.showScreen('home');
    this.registerSW();
    this.registerWithServer();
    this._scheduleLocalNotifications();
    // Auto-prompt for notifications after 2s if permission not yet decided
    setTimeout(() => this._maybeAskNotifPermission(), 2000);
    // Re-apply theme if OS dark/light preference changes while app is open
    window.matchMedia('(prefers-color-scheme: light)')
      .addEventListener('change', () => this.applyTheme());
  },

  async loadData() {
    this.profile = await DB.getProfile() || { ...this.DEFAULT_PROFILE };
    this.exercises = await DB.getAllExercises();
    this.workouts = await DB.getAllWorkouts();
    // Silently fill in missing muscle groups from local map (no API call)
    setTimeout(() => this._autoFillMissingMuscleGroups(), 500);
    this.chatLogs = await DB.getAllChatLogs();

    // Load bilateral preferences (persisted across sessions)
    try { this._bilateralCache = JSON.parse(localStorage.getItem('bilateralCache') || '{}'); }
    catch { this._bilateralCache = {}; }

    // Restore most recent chat session into memory
    if (this.chatLogs && this.chatLogs.length > 0) {
      const sorted = [...this.chatLogs].sort((a, b) => new Date(b.date) - new Date(a.date));
      const latest = sorted[0];
      this._currentChatId = latest.id;
      this._currentChatMessages = latest.messages || [];
    }

    // Load settings
    this.settings = {};
    for (const [key, defaultVal] of Object.entries(this.DEFAULT_SETTINGS)) {
      const saved = await DB.getSetting(key);
      let val = saved !== null ? saved : defaultVal;
      // Ensure array fields are always arrays
      if (Array.isArray(defaultVal) && !Array.isArray(val)) {
        try { val = JSON.parse(val); } catch(e) { val = defaultVal; }
        if (!Array.isArray(val)) val = defaultVal;
      }
      this.settings[key] = val;
    }
    this.applyTheme();
  },

  applyTheme() {
    const theme = this.settings.theme || 'auto';
    document.body.classList.remove('theme-light', 'theme-dark', 'battery-saver');
    if (theme === 'light') document.body.classList.add('theme-light');
    if (theme === 'dark') document.body.classList.add('theme-dark');

    // Swap background video between night (default) and daytime (light mode)
    if (window.setBgVideo) {
      const isLight = theme === 'light' ||
        (theme === 'auto' && window.matchMedia('(prefers-color-scheme: light)').matches);
      window.setBgVideo(isLight ? 'bg-day.mp4' : 'bg.mp4');
    }

    if (this.settings.batterySaver) {
      document.body.classList.add('battery-saver');
      // Pause video; CSS will show the still image instead
      const vid = document.getElementById('bg-video');
      if (vid) { vid.pause(); }
      if (window.oceanShader) window.oceanShader.stop();
      if (window.palmTree) window.palmTree.stop();
    } else {
      // Resume video
      const vid = document.getElementById('bg-video');
      if (vid) { vid.play().catch(() => {}); }
      if (!window.oceanShader && window.OceanShaderEngine) {
        window.oceanShader = new window.OceanShaderEngine('ocean-shader');
      }
      if (!window.palmTree && window.PalmTreeEngine) {
        window.palmTree = new window.PalmTreeEngine('palm-canvas');
      }
      if (window.oceanShader) window.oceanShader.start();
      if (window.palmTree) window.palmTree.start();
    }
  },

  registerSW() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(err => {
        console.warn('SW registration failed:', err);
      });
    }
  },

  // ─── Backend API ───────────────────────────────────────────
  API_BASE: 'https://tropicalfit.gameassassin777.workers.dev',
  VAPID_PUBLIC_KEY: 'BP5CbqNNLT8fhZBOsBUiHI6Gss731N84mpJXUNn3VHfcXmCuaipY8p30424hB1PGXaru7nqMQzVuKrqFLszRdIc',

  async apiPost(path, body) {
    try {
      const res = await fetch(this.API_BASE + path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      return await res.json();
    } catch (e) {
      console.warn('API error:', e);
      return { error: e.message };
    }
  },

  async apiGet(path) {
    try {
      const res = await fetch(this.API_BASE + path);
      return await res.json();
    } catch (e) {
      console.warn('API error:', e);
      return { error: e.message };
    }
  },

  // Register user on first launch; if already registered, sync username/avatar
  async registerWithServer() {
    if (!this.settings.username) return;
    if (this.settings.serverId) {
      // Already registered — push latest username/avatar in case they changed
      this._syncProfileToServer();
      return;
    }
    const result = await this.apiPost('/api/user/register', {
      username: this.settings.username,
      avatar_url: this._getAvatarUrl(),
    });
    if (result.id) {
      this.settings.serverId = result.id;
      DB.saveSetting('serverId', result.id);
      // Ensure push subscription is registered now that we have a server ID
      if (this.settings.notificationsEnabled && Notification.permission === 'granted') {
        this.subscribeToPush().catch(() => {});
      }
    }
  },

  async _syncProfileToServer() {
    if (!this.settings.serverId) return;
    this.apiPost('/api/user/update', {
      user_id: this.settings.serverId,
      username: this.settings.username,
      avatar_url: this._getAvatarUrl(),
    }).catch(() => {});
  },

  // Subscribe to Web Push and send subscription to server
  async subscribeToPush() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this._urlB64ToUint8Array(this.VAPID_PUBLIC_KEY),
      });
      if (this.settings.serverId) {
        await this.apiPost('/api/push/subscribe', {
          user_id: this.settings.serverId,
          subscription: sub.toJSON(),
        });
      }
    } catch (e) {
      console.warn('Push subscribe failed:', e);
    }
  },

  _urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw     = atob(base64);
    return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
  },

  // ─── LOCAL NOTIFICATION SCHEDULING ───────────────────────
  _scheduleLocalNotifications() {
    if (!this.settings.notificationsEnabled) return;
    // Clear any existing timers
    if (this._notifTimers) this._notifTimers.forEach(t => clearTimeout(t));
    this._notifTimers = [];

    const now = new Date();

    // Daily reminder
    if (this.settings.notifDailyReminder && this.settings.notifDailyReminderTime) {
      const [hh, mm] = (this.settings.notifDailyReminderTime || '08:00').split(':').map(Number);
      const fire = new Date(now);
      fire.setHours(hh, mm, 0, 0);
      if (fire <= now) fire.setDate(fire.getDate() + 1); // if past today, schedule tomorrow
      const delay = fire - now;
      this._notifTimers.push(setTimeout(() => {
        // Only fire if no workout today
        const todayStr = new Date().toDateString();
        const workedOutToday = this.workouts.some(w => new Date(w.date).toDateString() === todayStr);
        if (!workedOutToday) {
          this._fireLocalNotif('Time to Hit the Shore', 'No session logged yet today. Keep that streak alive.', 'daily-reminder');
        }
        // Re-schedule for tomorrow
        this._scheduleLocalNotifications();
      }, delay));
    }

    // Streak at risk — fires at 8pm when you're on day 3 of 4-day grace window
    if (this.settings.notifStreakAtRisk && (this.profile?.currentStreak || 0) > 0) {
      const fire = new Date(now);
      fire.setHours(20, 0, 0, 0);
      if (fire <= now) fire.setDate(fire.getDate() + 1);
      const delay = fire - now;
      this._notifTimers.push(setTimeout(() => {
        const lastWO = this.profile?.lastWorkoutDate;
        if (!lastWO) return;
        const daysSince = (Date.now() - new Date(lastWO).getTime()) / 86400000;
        // Warn when you have exactly 1 day left (3-4 days since last session)
        if (daysSince >= 3 && daysSince < 4 && (this.profile?.currentStreak || 0) > 0) {
          const streak = this.profile.currentStreak;
          this._fireLocalNotif(
            'Streak on the Line',
            `${streak}-session streak expires tomorrow. Get a rep in before it drops.`,
            'streak-risk'
          );
        }
      }, delay));
    }

    // Board Reset — fires Sunday at 9pm (weekly board resets Monday morning)
    if (this.settings.notifBoardReset) {
      const fire = new Date(now);
      // Find next Sunday at 21:00
      const daysUntilSunday = (7 - fire.getDay()) % 7; // 0 = already Sunday
      fire.setDate(fire.getDate() + daysUntilSunday);
      fire.setHours(21, 0, 0, 0);
      if (fire <= now) fire.setDate(fire.getDate() + 7); // already past — wait a week
      const delay = fire - now;
      this._notifTimers.push(setTimeout(() => {
        this._fireLocalNotif(
          'Board Resets Tonight',
          'Weekly rankings lock at midnight. Log a session to defend your spot.',
          'board-reset'
        );
        // Re-schedule for next Sunday
        this._scheduleLocalNotifications();
      }, delay));
    }
  },

  async _fireLocalNotif(title, body, tag = 'tf') {
    if (!('serviceWorker' in navigator)) return;
    // Hard guard: browser permission must be explicitly granted
    if (Notification.permission !== 'granted') return;
    try {
      const reg = await navigator.serviceWorker.ready;
      reg.showNotification(title, {
        body,
        icon: '/workoutlog/icons/icon-192.png',
        badge: '/workoutlog/icons/icon-192.png',
        tag,
        data: { url: '/workoutlog/' },
        vibrate: [100, 50, 100],
      });
    } catch (e) { /* SW not ready */ }
  },

  // ─── NOTIFICATION PERMISSION PROMPT ───────────────────
  async _maybeAskNotifPermission() {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return;
    const perm = Notification.permission;
    if (perm === 'granted') {
      // Already have permission — ensure we're subscribed to push
      this.settings.notificationsEnabled = true;
      DB.saveSetting('notificationsEnabled', true);
      this.subscribeToPush();
      return;
    }
    if (perm === 'denied') return; // user blocked it — nothing to do
    // 'default' — check if dismiss timestamp is stale (>30 days) and reset it
    if (this.settings.notifPromptDismissed) {
      const dismissedAt = await DB.getSetting('notifPromptDismissedAt');
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;
      if (!dismissedAt || (Date.now() - Number(dismissedAt)) > thirtyDays) {
        this.settings.notifPromptDismissed = false;
        DB.saveSetting('notifPromptDismissed', false);
      }
    }
    if (!this.settings.notifPromptDismissed) {
      this._showNotifPromptCard();
    }
  },

  _showNotifPromptCard() {
    if (document.getElementById('notif-prompt-card')) return;
    if (Notification.permission !== 'default') return;
    const card = document.createElement('div');
    card.id = 'notif-prompt-card';
    card.style.cssText = `position:fixed;bottom:calc(72px + var(--safe-bottom,0px));left:16px;right:16px;background:linear-gradient(135deg,rgba(0,25,60,0.97),rgba(0,12,35,0.97));border:1.5px solid rgba(0,200,255,0.30);border-radius:var(--radius-lg);padding:16px 16px 14px;box-shadow:0 8px 40px rgba(0,0,0,0.65),0 0 30px rgba(0,200,255,0.12);z-index:300;backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);animation:slideUp 0.32s ease;`;
    card.innerHTML = `
      <div style="display:flex;align-items:flex-start;gap:12px;">
        <div style="flex-shrink:0;color:var(--aqua);">${this.Icons.bellWave.replace('width="20" height="20"','width="32" height="32"')}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:0.95rem;font-weight:800;color:var(--text-main);margin-bottom:3px;">Stay on the Island</div>
          <div style="font-size:0.76rem;color:var(--text-sub);line-height:1.5;">Streak alerts before they die, PR celebrations, and daily nudges so you never miss a session.</div>
          <div style="display:flex;gap:8px;margin-top:12px;">
            <button id="notif-allow-btn" style="flex:1;padding:11px;background:linear-gradient(135deg,var(--teal),var(--lagoon));border:none;border-radius:var(--radius-md);font-weight:800;font-size:0.85rem;color:#021628;cursor:pointer;font-family:inherit;">Allow Notifications</button>
            <button id="notif-skip-btn" style="padding:11px 16px;background:transparent;border:1px solid var(--glass-border);border-radius:var(--radius-md);font-size:0.80rem;color:var(--text-muted);cursor:pointer;font-family:inherit;">Not now</button>
          </div>
        </div>
        <button id="notif-close-btn" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:1.1rem;padding:0 0 0 4px;flex-shrink:0;line-height:1;">✕</button>
      </div>`;
    document.body.appendChild(card);

    const dismiss = (permanent) => {
      card.remove();
      if (permanent) {
        this.settings.notifPromptDismissed = true;
        DB.saveSetting('notifPromptDismissed', true);
        DB.saveSetting('notifPromptDismissedAt', Date.now());
      }
    };

    document.getElementById('notif-allow-btn')?.addEventListener('click', async () => {
      dismiss(true);
      const granted = await Notification.requestPermission();
      if (granted === 'granted') {
        this.settings.notificationsEnabled = true;
        this.settings.notifDailyReminder = true;
        DB.saveSetting('notificationsEnabled', true);
        DB.saveSetting('notifDailyReminder', true);
        await this.subscribeToPush();
        this._scheduleLocalNotifications();
        this.showToast('Notifications enabled — you\'re locked in.');
      } else {
        this.settings.notificationsEnabled = false;
        DB.saveSetting('notificationsEnabled', false);
      }
    });
    document.getElementById('notif-skip-btn')?.addEventListener('click', () => dismiss(true));
    document.getElementById('notif-close-btn')?.addEventListener('click', () => dismiss(false));
  },

  // ─── BILATERAL DUMBBELL VOLUME HELPERS ────────────────────
  // Returns effective volume for one set (bilateral multiplies weight × 2)
  _setVol(ex, set) {
    return (set.weight || 0) * (ex?.bilateral ? 2 : 1) * (set.reps || 0);
  },

  // Total volume for one exercise block
  _exVol(ex) {
    return ex.sets.reduce((s, set) => s + this._setVol(ex, set), 0);
  },

  // Total volume for a whole workout object
  _workoutVol(w) {
    return w.exercises.reduce((sum, ex) => sum + this._exVol(ex), 0);
  },

  // Detect bilateral status for an exercise name.
  // Returns: true = definitely bilateral, false = definitely not, null = unknown (prompt user)
  _detectBilateral(name) {
    const key = name.toLowerCase().trim();
    // 1. Cached user preference wins
    if (key in this._bilateralCache) return this._bilateralCache[key];
    // 2. Contains unilateral keyword → not bilateral
    if (UNILATERAL_KEYWORDS.some(w => key.includes(w))) return false;
    // 3. Explicit lookup
    if (BILATERAL_EXERCISES.has(key)) return true;
    // 4. Heuristic: contains "dumbbell" or " db " or starts with "db " → ask
    if (/\bdumbbells?\b|\bdb\b/.test(key)) return null; // unknown, prompt
    // 5. No dumbbell indicator → assume not bilateral (barbell, cable, machine, bodyweight)
    return false;
  },

  _saveBilateralPref(name, val) {
    this._bilateralCache[name.toLowerCase().trim()] = val;
    try { localStorage.setItem('bilateralCache', JSON.stringify(this._bilateralCache)); } catch {}
  },

  // Shows a quick "two dumbbells?" modal for ambiguous exercises, then resolves
  _promptBilateral(workoutEx) {
    return new Promise(resolve => {
      const mc = document.getElementById('modal-container');
      if (!mc) { resolve(false); return; }
      mc.innerHTML = `
        <div class="modal-overlay" id="bilateral-overlay" style="align-items:center;">
          <div class="modal-sheet" style="border-radius:var(--radius-xl);max-width:340px;margin:auto;text-align:center;">
            <div style="width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,var(--aqua),var(--teal));display:flex;align-items:center;justify-content:center;margin:0 auto 14px;">
              ${this.Icons.dumbbell}
            </div>
            <div class="text-bold text-white" style="font-size:1.05rem;margin-bottom:6px;">${this.escapeHtml(workoutEx.name)}</div>
            <div class="text-xs text-sea" style="margin-bottom:20px;line-height:1.5;">Are you using <strong>two dumbbells</strong> (one in each hand)?<br>If yes, weight you enter counts ×2 in your volume.</div>
            <div style="display:flex;gap:10px;">
              <button class="btn btn-ghost flex-1" id="btn-bilateral-no">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                One hand
              </button>
              <button class="btn btn-primary flex-1" id="btn-bilateral-yes">
                ${this.Icons.dumbbell} Both hands ×2
              </button>
            </div>
            <button style="background:none;border:none;color:var(--text-muted);font-size:0.75rem;margin-top:12px;cursor:pointer;" id="btn-bilateral-skip">Ask me every time</button>
          </div>
        </div>
      `;

      const close = (val, save) => {
        mc.innerHTML = '';
        if (save && val !== null) this._saveBilateralPref(workoutEx.name, val);
        resolve(val ?? false);
      };

      document.getElementById('btn-bilateral-yes').addEventListener('click', () => {
        workoutEx.bilateral = true; close(true, true);
      });
      document.getElementById('btn-bilateral-no').addEventListener('click', () => {
        workoutEx.bilateral = false; close(false, true);
      });
      document.getElementById('btn-bilateral-skip').addEventListener('click', () => close(null, false));
    });
  },

  // Update live header stats during workout without a full re-render
  _updateLiveStats() {
    if (!this.activeWorkout) return;
    const vol = this._workoutVol(this.activeWorkout);
    const volEl = document.getElementById('workout-volume');
    if (volEl) volEl.textContent = vol.toLocaleString();
    const sets = this.activeWorkout.exercises.reduce((s, e) => s + e.sets.filter(st => st.completed).length, 0);
    const setsEl = document.getElementById('workout-sets');
    if (setsEl) setsEl.textContent = sets;
  },

  async _logWorkoutToServer(w) {
    if (!this.settings.serverId || !this.API_BASE.startsWith('http')) return;
    const totalVolume = w.exercises.reduce((sum, ex) =>
      sum + this._exVol(ex), 0);
    const totalSets = w.exercises.reduce((s, e) => s + e.sets.length, 0);

    // Collect any PRs set during this workout
    const prs = [];
    w.exercises.forEach(ex => {
      const pr = this.profile.personalRecords?.[ex.name];
      if (pr?.maxWeight) {
        const latestSet = ex.sets.reduce((best, s) =>
          (s.weight || 0) > (best.weight || 0) ? s : best, {});
        // Only report if the PR was set in this workout (within last 5 min)
        if (pr.maxWeight.date && (Date.now() - new Date(pr.maxWeight.date)) < 300000) {
          prs.push({ exercise: ex.name, weight: pr.maxWeight.value,
                     reps: pr.maxWeight.reps, unit: pr.maxWeight.unit || this.settings.defaultWeightUnit });
        }
      }
    });

    await this.apiPost('/api/workout/log', {
      user_id: this.settings.serverId,
      title: w.title,
      volume: totalVolume,
      sets_completed: totalSets,
      exercises: w.exercises.map(ex => ({ name: ex.name, sets: ex.sets.length })),
      prs,
    });
  },

  // Fetch real leaderboard from server
  async _fetchLeaderboard() {
    if (!this.API_BASE.startsWith('http')) return null;
    return await this.apiGet('/api/leaderboard');
  },

  // Fetch real feed from server
  async _fetchFeed() {
    if (!this.API_BASE.startsWith('http')) return null;
    return await this.apiGet('/api/feed');
  },

  // Fetch chat messages since a timestamp
  async _fetchChat(since = null) {
    if (!this.API_BASE.startsWith('http')) return null;
    const qs = since ? `?since=${encodeURIComponent(since)}` : '';
    return await this.apiGet(`/api/chat${qs}`);
  },

  // Post a chat message to server
  async _postChatMessage(text) {
    if (!this.settings.serverId || !this.API_BASE.startsWith('http')) return null;
    return await this.apiPost('/api/chat', {
      user_id: this.settings.serverId,
      text,
    });
  },

  // ─── Navigation ────────────────────────────────────────────
  setupNavigation() {
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const screen = btn.dataset.screen;
        // Navigation Fail-safe
        if (screen === 'settings') {
          this.showScreen('settings');
        } else if (screen === 'workout') {
          if (this.activeWorkout) {
            this.showScreen('activeWorkout');
          } else {
            this.showScreen('home'); // Redirect to Shore to start workout
          }
        } else {
          this.showScreen(screen);
        }
      });
    });
  },

  setActiveNav(screen) {
    const navMap = {
      home: 'home', history: 'logs', logs: 'logs',
      startWorkout: 'home', activeWorkout: 'home',
      restTimer: 'home', workoutComplete: 'home',
      stats: 'logs', chat: 'chat', settings: 'settings',
      social: 'social',
      exerciseLibrary: 'home', workoutDetail: 'logs',
      profile: 'settings', fileUpload: 'chat'
    };
    const activeKey = navMap[screen] || 'home';
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.screen === activeKey);
    });
  },

  // ─── Screen Router ─────────────────────────────────────────
  async showScreen(name, data = {}) {
    // Kill background timers when navigating away
    if (this._chatPollTimer) { clearInterval(this._chatPollTimer); this._chatPollTimer = null; }
    if (this._chatVisibilityHandler) { document.removeEventListener('visibilitychange', this._chatVisibilityHandler); this._chatVisibilityHandler = null; }
    this._teardownChatVV();
    // Restore scroll that _positionChatFrame locks down for the social chat frame
    const container = document.getElementById('screen-container');
    if (container) container.style.overflow = '';
    this.currentScreen = name;
    this.setActiveNav(name);

    const renderers = {
      home: () => this.renderHome(),
      startWorkout: () => this.renderStartWorkout(),
      activeWorkout: () => this.renderActiveWorkout(),
      restTimer: () => this.renderRestTimer(data),
      workoutComplete: () => this.renderWorkoutComplete(),
      chat: () => this.renderCoachChat(data),
      settings: () => this.renderSettings(),
      exerciseLibrary: () => this.renderExerciseLibrary(),
      workoutDetail: () => this.renderWorkoutDetail(data),
      profile: () => this.renderProfile(),
      userProfile: () => this.renderUserProfile(data),
      fileUpload: () => this.renderFileUpload(),
      logs: () => this.renderLogs(),
      social: () => this.renderSocial(),
    };

    const renderer = renderers[name];
    if (renderer) {
      const renderNext = async () => {
        container.innerHTML = await renderer();
        const screenHeader = document.getElementById('screen-header');
        if (screenHeader) {
          const h = container.querySelector('.header');
          screenHeader.innerHTML = '';
          if (h) screenHeader.appendChild(h);
        }
        // Chat manages its own internal scroll — lock the outer container and kill padding
        if (name === 'chat') {
          container.style.overflow = 'hidden';
          container.style.paddingBottom = '0';
        } else {
          container.style.overflow = '';
          container.style.paddingBottom = '';
        }
        this.bindScreenEvents(name, data);
      };

      await renderNext();
    }
  },

  // ─── HOME SCREEN — Hero Dashboard ─────────────────────────
  renderHome() {
    const p = this.profile;
    const levelInfo = this.getLevelInfo(p.xp);
    const greeting = this.getGreeting();
    const username = this.settings.username || 'Athlete';
    const avatarUrl = this._getAvatarUrl();
    const avatarRingClass = this._getAvatarRingClass(levelInfo.level);

    return `
      <div class="header">
        <span class="header-title">TropicalFit</span>
        <div style="display:flex; gap:8px; margin-left:auto;">
          <button class="header-back notif-bell-wrap" id="btn-notif" style="color:var(--text-sub);">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            ${this._hasUnreadNotifs() ? '<span class="notif-badge"></span>' : ''}
          </button>
          <button class="header-back" id="btn-go-profile" style="overflow:hidden; padding:0;">
            <img src="${avatarUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" onerror="this.style.display='none'">
          </button>
        </div>
      </div>
      <div class="fade-in">
        <div class="hero-greeting">
          <div class="hero-greeting-sub">${greeting}</div>
          <div class="hero-greeting-name">${username}</div>
        </div>

        <div class="hero-level-pill">
          <span class="hero-level-text">Lv ${levelInfo.level} · ${levelInfo.title}</span>
          <div class="hero-xp-bar">
            <div class="hero-xp-fill" style="width:${levelInfo.progress}%"></div>
          </div>
          <span class="hero-xp-label">${p.xp}/${levelInfo.nextXp}</span>
        </div>

        <div class="character-container">
          <div class="character-wrap">
            <img class="character-avatar ${avatarRingClass}" src="${avatarUrl}"
                 alt="Your character" id="btn-go-profile-char"
                 onerror="this.style.opacity='0'">
            <div class="character-level-badge">Lv ${levelInfo.level}</div>
          </div>
        </div>

        <div class="hero-stat-row">
          <div class="hero-stat-pill">
            <div class="hero-stat-pill-icon">${this.Icons.palm}</div>
            <span class="hero-stat-pill-val">${p.currentStreak}</span>
            <div class="hero-stat-pill-label">Streak</div>
          </div>
          <div class="hero-stat-pill">
            <div class="hero-stat-pill-icon">${this.Icons.dumbbell}</div>
            <span class="hero-stat-pill-val">${p.totalWorkouts || 0}</span>
            <div class="hero-stat-pill-label">Sessions</div>
          </div>
          <div class="hero-stat-pill">
            <div class="hero-stat-pill-icon">${this.Icons.stats}</div>
            <span class="hero-stat-pill-val">${this.formatVolume(p.totalVolume || 0)}</span>
            <div class="hero-stat-pill-label">Volume</div>
          </div>
        </div>

        ${this.activeWorkout ? `
        <div style="margin:0 16px 8px; padding:12px 16px;
             background:linear-gradient(135deg,rgba(255,94,58,0.18),rgba(255,150,50,0.12));
             border:1px solid rgba(255,94,58,0.35); border-radius:var(--radius-md);
             display:flex; align-items:center; justify-content:space-between;">
          <div>
            <div class="text-bold text-white" style="font-size:0.88rem;">Session in progress</div>
            <div class="text-xs text-sea mt-2">${this.activeWorkout.title || 'Unnamed session'} · ${this.activeWorkout.exercises.length} exercise${this.activeWorkout.exercises.length !== 1 ? 's' : ''}</div>
          </div>
          <button class="btn btn-small" style="background:rgba(255,94,58,0.25);border:1px solid rgba(255,94,58,0.5);color:#ff9060;font-weight:800;" id="btn-resume-workout">
            Resume
          </button>
        </div>` : ''}
        <button class="hero-start-btn" id="btn-start-workout" ${this.activeWorkout ? 'style="background:var(--glass-mid);color:var(--text-muted);box-shadow:none;animation:none;"' : ''}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m6.5 6.5 11 11"/><path d="m21 21-1.5-1.5"/><path d="m3 3 1.5 1.5"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/></svg>
          ${this.activeWorkout ? 'NEW SESSION' : 'START SESSION'}
        </button>

        <div class="section-header" style="padding-top:16px;">
          <span class="section-title" style="display:flex;align-items:center;gap:6px;">${this.Icons.trophy} This Week's Leaders</span>
          <button class="section-action" id="btn-go-chat">Chat →</button>
        </div>
        <div id="home-lb-list" style="margin:0 16px;">
          <div class="card" style="padding:14px 16px;text-align:center;margin:0;">
            <div class="text-xs text-muted">Loading rankings...</div>
          </div>
        </div>

        <div class="section-header" style="padding-top:10px;">
          <span class="section-title" style="display:flex;align-items:center;gap:6px;">${this.Icons.cameraIcon} Recent Activity</span>
        </div>
        <div id="home-feed-list" style="margin:0 16px;">
          <div class="card" style="padding:14px 16px;text-align:center;margin:0;">
            <div class="text-xs text-muted">Loading feed...</div>
          </div>
        </div>

        <div style="height: 24px;"></div>
      </div>
    `;
  },

  _getAvatarUrl() {
    if (this.settings.pollinationsPortrait) return this.settings.pollinationsPortrait;
    const seed = this.settings.avatarSeed || this.settings.username || 'tropicalfit';
    const style = this.settings.avatarStyle || 'avataaars';
    if (style === 'avataaars') {
      const skin  = this.settings.avatarSkinColor  || 'f5cba7';
      const hair  = this.settings.avatarHairStyle  || 'shortHairShortFlat';
      const fhair = this.settings.avatarFacialHair || '';
      const eyes  = this.settings.avatarEyeType    || 'default';
      const top   = hair;
      const facialHairParam = fhair ? `&facialHair=${fhair}` : '&facialHair=';
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=0a1628,0d2340&skinColor=${skin}&top=${top}${facialHairParam}&eyes=${eyes}&mouth=smile,twinkle&eyebrows=default,defaultNatural`;
    }
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=0a1628,0d2340`;
  },

  // ─── EXERCISE ICON VIA POLLINATIONS ───────────────────────
  _getExerciseIconUrl(name) {
    // Deterministic seed from name so same name = same icon every time
    const seed = name.toLowerCase().split('').reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 0);
    const safeSeed = Math.abs(seed) % 999983;
    const prompt = encodeURIComponent(`minimalist flat icon ${name} exercise gym fitness white background simple vector clean`);
    return `https://image.pollinations.ai/prompt/${prompt}?width=128&height=128&nologo=true&model=flux-schnell&seed=${safeSeed}`;
  },

  // Auto-description string from level + training (shown in UI and used as base prompt)
  _buildAutoPortraitDesc() {
    const levelInfo = this.getLevelInfo(this.profile.xp);
    const muscleData = this.getMuscleHeatmapData();
    const topMuscle = Object.entries(muscleData)
      .filter(([, v]) => v > 0)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'strength';
    const streak = this.profile.currentStreak || 0;
    const streakDesc = streak >= 10 ? 'elite athlete' : streak >= 5 ? 'dedicated athlete' : 'aspiring athlete';
    return `${streakDesc}, Level ${levelInfo.level} ${levelInfo.title}, specializes in ${topMuscle.toLowerCase()} training, tropical beach warrior`;
  },

  // Build Pollinations URL — seed is provided by caller (random per-generation + user-specific)
  _buildPollinationsUrlFromDescription(description, style = 'photorealistic', customText = '', seed = null) {
    const combined = [description, customText].filter(Boolean).join(', ');
    // If no seed supplied, derive a stable one from content (backwards-compat for saved URLs)
    const finalSeed = seed !== null ? seed
      : Math.abs(combined.split('').reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 0)) % 999983;
    const styleClause = style === 'photorealistic'
      ? 'photorealistic portrait, cinematic lighting, ultra detailed face'
      : style === 'anime'
        ? 'anime art style, vibrant colors, detailed anime face'
        : style === 'watercolor'
          ? 'watercolor painting, artistic, soft blended colors'
          : style === 'oil painting'
            ? 'oil painting, rich textures, classical portrait style'
            : 'cartoon style, bold outlines, expressive character art';
    const prompt = encodeURIComponent(
      `${combined}, tropical beach warrior athlete portrait, ${styleClause}, vibrant ocean sunset background, confident expression, no text, no watermark`
    );
    return `https://image.pollinations.ai/prompt/${prompt}?width=512&height=512&nologo=true&seed=${finalSeed}&model=flux`;
  },

  // Full selfie → portrait flow
  async _generatePortraitFromSelfie(file) {
    const status = document.getElementById('portrait-status');
    const setStatus = (msg) => { if (status) { status.style.display = ''; status.textContent = msg; } };

    // Show selfie preview immediately in upload area
    const uploadArea = document.getElementById('selfie-upload-area');
    if (uploadArea && file) {
      const reader2 = new FileReader();
      reader2.onload = (e) => {
        uploadArea.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">
          <div id="selfie-upload-overlay" style="position:absolute;inset:0;background:rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.2s;border-radius:50%;">
            <div class="text-xs text-white" style="text-align:center;"><div style="color:#fff;margin-bottom:4px;">${this.Icons.cameraIcon.replace('width="20" height="20"','width="28" height="28"')}</div><div>Change selfie</div></div>
          </div>`;
      };
      reader2.readAsDataURL(file);
    }

    setStatus('Reading your selfie...');

    try {
      // Read file as base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const mimeType = file.type || 'image/jpeg';

      setStatus('AI is reading your features...');
      const result = await AI.describeSelfie(base64, mimeType);
      if (result.error) throw new Error(result.error);

      const description = result.description;
      // Show description in the auto-desc box
      const descBox = document.getElementById('portrait-auto-desc');
      if (descBox) descBox.innerHTML = `<span style="display:inline-flex;align-items:center;gap:4px;vertical-align:middle;">${this.Icons.selfieIcon}</span> <strong>Selfie:</strong> ${description}`;
      DB.saveSetting('selfieDescription', description);
      this.settings.selfieDescription = description;

      setStatus('Features captured — generating portrait...');
      await this._doGeneratePortrait(description);

    } catch (err) {
      setStatus(`Could not generate: ${err.message}`);
    }
  },

  // Core portrait generation (used by both selfie flow and manual generate button)
  async _doGeneratePortrait(selfieDesc = null) {
    const status = document.getElementById('portrait-status');
    const genBtn = document.getElementById('btn-generate-portrait');
    const setStatus = (msg) => { if (status) { status.style.display = ''; status.textContent = msg; } };

    const customText = document.getElementById('portrait-custom-text')?.value?.trim() || this.settings.portraitCustomText || '';
    const style = document.getElementById('portrait-style-select')?.value || this.settings.portraitStyle || 'photorealistic';

    // Save custom text + style
    this.settings.portraitCustomText = customText;
    this.settings.portraitStyle = style;
    DB.saveSetting('portraitCustomText', customText);
    DB.saveSetting('portraitStyle', style);

    // Base description: selfie desc if available, otherwise auto
    const baseDesc = selfieDesc || this.settings.selfieDescription || this._buildAutoPortraitDesc();

    // Each generation gets a fresh seed so regenerate always produces a new image.
    // Mix username into the seed offset so two users with the same description diverge.
    const userOffset = Math.abs((this.settings.username || 'warrior').split('')
      .reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 0)) % 100000;
    const freshSeed = (userOffset + Math.floor(Math.random() * 900000)) % 999983;

    if (genBtn) { genBtn.disabled = true; genBtn.textContent = 'Generating…'; }

    try {
      const url = this._buildPollinationsUrlFromDescription(baseDesc, style, customText, freshSeed);
      setStatus('Generating your portrait… this takes a moment');

      // Preload image
      await new Promise((resolve) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = resolve; // proceed even if load fails
        img.src = url;
      });

      // Save and sync to server so other users see the updated avatar
      this.settings.pollinationsPortrait = url;
      DB.saveSetting('pollinationsPortrait', url);
      this._syncProfileToServer();

      // Update upload area preview
      const uploadArea = document.getElementById('selfie-upload-area');
      if (uploadArea) {
        const existing = uploadArea.querySelector('#portrait-preview');
        if (existing) { existing.src = url; }
        else {
          uploadArea.innerHTML = `<img id="portrait-preview" src="${url}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">
            <div id="selfie-upload-overlay" style="position:absolute;inset:0;background:rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.2s;border-radius:50%;">
              <div class="text-xs text-white" style="text-align:center;"><div style="color:#fff;margin-bottom:4px;">${this.Icons.cameraIcon.replace('width="20" height="20"','width="28" height="28"')}</div><div>Change selfie</div></div>
            </div>`;
        }
      }
      // Also update the avatar preview in settings header
      const headerAv = document.getElementById('avatar-preview-img');
      if (headerAv) headerAv.src = url;

      this._syncAvatarToServer(url);
      setStatus('Looking sharp! Tap Regenerate any time for a fresh look.');
      if (genBtn) { genBtn.disabled = false; genBtn.innerHTML = `<span style="display:inline-flex;align-items:center;gap:6px;">${this.Icons.refreshIcon.replace('width="20" height="20"','width="16" height="16"')} Regenerate</span>`; }

      // Show clear button if not already there
      if (!document.getElementById('btn-clear-portrait') && genBtn) {
        const clearBtn = document.createElement('button');
        clearBtn.id = 'btn-clear-portrait';
        clearBtn.className = 'btn btn-ghost';
        clearBtn.style.cssText = 'font-size:0.82rem;color:var(--coral);';
        clearBtn.textContent = 'Clear';
        clearBtn.addEventListener('click', () => {
          this.settings.pollinationsPortrait = '';
          DB.saveSetting('pollinationsPortrait', '');
          this._syncProfileToServer();
          this.showScreen('settings');
        });
        genBtn.parentElement.appendChild(clearBtn);
      }

    } catch (err) {
      setStatus(`Could not generate: ${err.message}`);
      if (genBtn) { genBtn.disabled = false; genBtn.textContent = 'Retry'; }
    }
  },

  async _syncAvatarToServer(avatarUrl) {
    if (!this.settings.serverId) return;
    this.apiPost('/api/user/avatar', {
      user_id: this.settings.serverId,
      avatar_url: avatarUrl,
    }).catch(() => {});
  },

  _hasUnreadNotifs() {
    // Show badge when the user hasn't worked out today and has a streak to protect
    const streak = this.profile?.currentStreak || 0;
    if (streak === 0) return false;
    const todayStr = new Date().toDateString();
    const workedOutToday = (this.workouts || []).some(w => new Date(w.date).toDateString() === todayStr);
    return !workedOutToday;
  },

  _showNotifPanel() {
    const streak = this.profile?.currentStreak || 0;
    const todayStr = new Date().toDateString();
    const workedOutToday = (this.workouts || []).some(w => new Date(w.date).toDateString() === todayStr);
    const lastWO = this.profile?.lastWorkoutDate;
    const daysSince = lastWO ? (Date.now() - new Date(lastWO).getTime()) / 86400000 : 99;
    const permLabel = !('Notification' in window) ? 'Unavailable'
      : Notification.permission === 'granted' ? 'Enabled ✓'
      : Notification.permission === 'denied' ? 'Blocked'
      : 'Not set';

    const items = [];
    if (!workedOutToday && streak > 0) {
      items.push({ icon: this.Icons.flame, text: `${streak}-day streak at risk — log a session today!`, cta: 'Log Workout', action: 'home' });
    } else if (workedOutToday) {
      items.push({ icon: this.Icons.waveCheck, text: "Today's session is logged. Streak safe!", cta: null });
    } else {
      items.push({ icon: this.Icons.islandIcon, text: 'No active streak. Start one today!', cta: 'Start Session', action: 'home' });
    }
    if (daysSince >= 2 && daysSince < 90) {
      items.push({ icon: this.Icons.calendarWave, text: `Last workout was ${Math.floor(daysSince)} day${daysSince >= 2 ? 's' : ''} ago`, cta: null });
    }
    items.push({ icon: this.Icons.bellWave, text: `Push notifications: ${permLabel}`, cta: permLabel === 'Not set' ? 'Enable' : null, action: 'enable-notif' });

    const panel = document.createElement('div');
    panel.id = 'notif-panel-overlay';
    panel.style.cssText = 'position:fixed;inset:0;z-index:400;display:flex;flex-direction:column;justify-content:flex-end;';
    panel.innerHTML = `
      <div style="position:absolute;inset:0;background:rgba(0,0,0,0.5);" id="notif-panel-backdrop"></div>
      <div style="position:relative;background:linear-gradient(180deg,rgba(5,20,50,0.98),rgba(2,10,28,0.99));border-radius:var(--radius-lg) var(--radius-lg) 0 0;padding:20px 16px calc(20px + var(--safe-bottom,0px));border-top:1.5px solid rgba(0,200,255,0.2);box-shadow:0 -8px 40px rgba(0,0,0,0.6);max-height:60vh;overflow-y:auto;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <span style="font-weight:700;font-size:1rem;color:var(--text-main);">Notifications</span>
          <button id="btn-close-notif-panel" style="background:none;border:none;padding:4px;cursor:pointer;color:var(--text-muted);">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        ${items.map(item => `
          <div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
            <span style="min-width:28px;display:flex;align-items:center;justify-content:center;color:var(--aqua);">${item.icon}</span>
            <span style="flex:1;font-size:0.875rem;color:var(--text-sub);">${item.text}</span>
            ${item.cta ? `<button data-notif-action="${item.action || ''}" style="background:var(--lagoon);border:none;border-radius:8px;padding:6px 12px;font-size:0.75rem;font-weight:600;color:#fff;cursor:pointer;white-space:nowrap;">${item.cta}</button>` : ''}
          </div>
        `).join('')}
      </div>`;

    document.body.appendChild(panel);

    const close = () => panel.remove();
    document.getElementById('notif-panel-backdrop').addEventListener('click', close);
    document.getElementById('btn-close-notif-panel').addEventListener('click', close);
    panel.querySelectorAll('[data-notif-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.notifAction;
        close();
        if (action === 'home') this.showScreen('home');
        else if (action === 'enable-notif') this._showNotifPromptCard();
      });
    });
  },


  _REST_QUOTES: [
    ["The last three or four reps is what makes the muscle grow.", "Arnold Schwarzenegger"],
    ["The pain you feel today will be the strength you feel tomorrow.", "Arnold Schwarzenegger"],
    ["No pain, no gain. Shut up and train.", "Ronnie Coleman"],
    ["The clock is ticking. Are you becoming the person you want to be?", "Greg Plitt"],
    ["Rest is not quitting. Rest is repair.", "Unknown"],
    ["Champions are made in the rest between the reps.", "Unknown"],
    ["Your body can stand almost anything. It's your mind you have to convince.", "Unknown"],
    ["One more set. One more rep. That is how legends are made.", "Unknown"],
    ["The only bad workout is the one that did not happen.", "Unknown"],
    ["Iron never lies to you.", "Henry Rollins"],
    ["There are no shortcuts. The road is paved with effort.", "Unknown"],
    ["Sweat is just weakness leaving the body.", "Unknown"],
  ],
  _getRestQuote() {
    const q = this._REST_QUOTES;
    return q[Math.floor(Date.now() / 60000) % q.length][0];
  },
  _getRestQuoteAuthor() {
    const q = this._REST_QUOTES;
    return q[Math.floor(Date.now() / 60000) % q.length][1];
  },

  // ── Muscle group helpers ──────────────────────────────────
  // Lookup muscle groups from built-in map (fuzzy + keyword fallback)
  _muscleGroupsFromMap(name) {
    const lower = name.toLowerCase().trim();
    // 1. Exact match
    if (EXERCISE_MUSCLE_MAP[lower]) return [...EXERCISE_MUSCLE_MAP[lower]];
    // 2. Substring match — try longest matching key first so "romanian deadlift" beats "deadlift"
    const keys = Object.keys(EXERCISE_MUSCLE_MAP).sort((a, b) => b.length - a.length);
    for (const key of keys) {
      if (lower.includes(key)) return [...EXERCISE_MUSCLE_MAP[key]];
    }
    // 3. Keyword token fallback — handles "inclined rows", "cable chest press", etc.
    const has = (...words) => words.some(w => lower.includes(w));
    if (has('row', 'rows', 'pulldown', 'pull-down')) return ['Back','Biceps'];
    if (has('curl','curls') && !has('leg')) return ['Biceps'];
    if (has('curl') && has('leg')) return ['Hamstrings'];
    if (has('press') && has('chest','bench','pec')) return ['Chest','Triceps','Shoulders'];
    if (has('press') && has('shoulder','overhead','military','ohp')) return ['Shoulders','Triceps'];
    if (has('press') && has('incline')) return ['Chest','Shoulders','Triceps'];
    if (has('fly','flye','flies')) return ['Chest'];
    if (has('squat','squats')) return ['Quads','Glutes','Hamstrings'];
    if (has('lunge','lunges')) return ['Quads','Glutes'];
    if (has('deadlift')) return ['Back','Glutes','Hamstrings'];
    if (has('extension') && has('leg')) return ['Quads'];
    if (has('extension') && has('tricep','triceps')) return ['Triceps'];
    if (has('raise') && has('calf','calves')) return ['Calves'];
    if (has('raise') && has('lateral','side','front')) return ['Shoulders'];
    if (has('hip thrust','glute bridge','kickback')) return ['Glutes'];
    if (has('push') && has('chest','bench')) return ['Chest','Triceps'];
    if (has('dip','dips')) return ['Triceps','Chest'];
    if (has('pull up','pull-up','pullup','chin')) return ['Lats','Biceps'];
    if (has('shrug')) return ['Traps'];
    if (has('plank','hollow','crunch','sit-up','situp')) return ['Abs'];
    if (has('run','jog','sprint','treadmill','bike','cycling','cardio','elliptical','rowing','swim')) return ['Cardio'];
    return [];
  },

  // Best-effort muscle groups for an exercise: library → map
  _getMuscleGroups(name, exerciseId) {
    const lib = this.exercises.find(e => e.id === exerciseId || e.name.toLowerCase() === name?.toLowerCase());
    if (lib?.muscleGroups?.length) return lib.muscleGroups;
    return this._muscleGroupsFromMap(name || '');
  },

  // Collect unique muscle groups across all exercises in a workout
  _workoutMuscleGroups(workout) {
    const seen = new Set();
    workout.exercises.forEach(ex => {
      this._getMuscleGroups(ex.name, ex.exerciseId).forEach(m => seen.add(m));
    });
    return Array.from(seen);
  },

  // Silently classify exercises with no muscle groups
  // Uses local map first; falls back to AI if available and map has no result
  async _autoFillMissingMuscleGroups() {
    const missing = this.exercises.filter(ex => !ex.muscleGroups?.length);
    if (!missing.length) return;
    const canUseAI = !!(this.settings.geminiApiKey || this.settings.serverId);
    for (const ex of missing) {
      const local = this._muscleGroupsFromMap(ex.name);
      if (local.length) {
        ex.muscleGroups = local;
        await DB.saveExercise(ex);
      } else if (canUseAI) {
        // Small delay between AI calls to avoid rate-limiting
        await new Promise(r => setTimeout(r, 800));
        const groups = await this._aiSuggestMuscleGroups(ex.name);
        if (groups.length) {
          ex.muscleGroups = groups;
          await DB.saveExercise(ex);
        }
      }
    }
  },

  // AI suggest muscle groups for one exercise (used by edit modal button)
  async _aiSuggestMuscleGroups(name) {
    // Try local map first — no API call if we know it
    const local = this._muscleGroupsFromMap(name);
    if (local.length) return local;
    // Ask AI
    try {
      const result = await AI.backendChat([{
        role: 'user',
        content: `What muscle groups does "${name}" primarily work? Reply ONLY with a comma-separated list using ONLY these exact words: Chest, Back, Shoulders, Biceps, Triceps, Forearms, Quads, Hamstrings, Glutes, Calves, Abs, Traps, Lats, Full Body, Cardio. No other text, no explanation.`
      }]);
      if (result.text) {
        return result.text.split(',').map(s => s.trim()).filter(s => MUSCLE_GROUPS.includes(s));
      }
    } catch (e) {}
    return [];
  },

  renderWorkoutCard(w) {
    const date = new Date(w.date);
    const dateStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const totalSets = w.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
    const totalVolume = w.exercises.reduce((sum, ex) =>
      sum + ex.sets.reduce((s, set) => s + (set.weight * set.reps), 0), 0);
    const durationStr = w.duration ? `${Math.round(w.duration / 60)}min` : '';

    return `
      <div class="card card-tappable" data-workout-id="${w.id}">
        <div class="flex flex-between" style="align-items: flex-start;">
          <div>
            <div class="text-bold text-white">${w.title || dateStr}</div>
            <div class="text-xs text-sea mt-4">${dateStr} • ${timeStr} ${durationStr ? '• ' + durationStr : ''}</div>
          </div>
          ${w.score ? `<div class="text-lg text-extra-bold text-sunset">${w.score}</div>` : ''}
        </div>
        <div class="flex gap-8 mt-8 flex-wrap">
          ${w.exercises.map(ex => `<span class="tag">${ex.name}</span>`).join('')}
        </div>
        <div class="flex gap-16 mt-8">
          <span class="text-xs text-sea">${w.exercises.length} exercise${w.exercises.length !== 1 ? 's' : ''}</span>
          <span class="text-xs text-sea">${totalSets} sets</span>
          <span class="text-xs text-sunset">${totalVolume.toLocaleString()} ${this.settings.defaultWeightUnit}</span>
        </div>
        ${(() => {
          const muscles = w.muscleGroups?.length
            ? w.muscleGroups
            : this._workoutMuscleGroups(w);
          return muscles.length ? `
            <div class="flex gap-4 mt-8 flex-wrap">
              ${muscles.slice(0, 5).map(m => `<span style="background:rgba(0,180,180,0.15);color:var(--aqua);border:1px solid rgba(0,200,200,0.25);border-radius:12px;padding:2px 8px;font-size:0.62rem;font-weight:600;">${m}</span>`).join('')}
              ${muscles.length > 5 ? `<span style="color:var(--text-muted);font-size:0.62rem;padding:2px 4px;">+${muscles.length-5}</span>` : ''}
            </div>` : '';
        })()}
        ${w.tags?.length ? `
          <div class="flex gap-4 mt-4 flex-wrap">
            ${w.tags.map(t => `<span class="tag" style="font-size:0.65rem;">#${t}</span>`).join('')}
          </div>
        ` : ''}
      </div>
    `;
  },

  // ─── LOGS SCREEN — Combined History + Stats ────────────────
  renderLogs(activeTab = 'stats') {
    return `
      <div class="header">
        <span class="header-title">Tide Logs</span>
        <button class="header-action" id="btn-export-history">Export</button>
      </div>
      <div class="tab-pill">
        <button class="tab-pill-item ${activeTab === 'history' ? 'active' : ''}" data-tab="history">History</button>
        <button class="tab-pill-item ${activeTab === 'stats' ? 'active' : ''}" data-tab="stats">Stats</button>
      </div>
      <div id="logs-tab-content">
        ${activeTab === 'history' ? this._renderLogsHistory() : this._renderLogsStats()}
      </div>
    `;
  },

  _renderLogsHistory() {
    const sorted = [...this.workouts].sort((a, b) => new Date(b.date) - new Date(a.date));
    if (sorted.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-state-icon" style="background:var(--clear-water);border:2px solid var(--aqua);color:var(--lagoon);">${this.Icons.dumbbell}</div>
          <div class="empty-state-title">No Logs Yet</div>
          <div class="empty-state-text">Hit the shore and start lifting!<br>Your journey begins with one rep.</div>
          <button class="btn btn-accent mt-24" id="btn-start-from-logs">Start First Session</button>
        </div>`;
    }
    return `
      <div class="search-bar">
        <input type="text" class="input" placeholder="Search logs, exercises..." id="history-search" style="padding-left:16px;">
      </div>
      <div id="history-list">
        ${sorted.map(w => this.renderWorkoutCard(w)).join('')}
      </div>
      <div style="height:20px;"></div>`;
  },

  _renderLogsStats() {
    const p = this.profile;
    let muscleData = this.getMuscleHeatmapData(7);
    let muscleWindow = '7 days';
    if (!Object.keys(muscleData).length) {
      muscleData = this.getMuscleHeatmapData(30);
      muscleWindow = '30 days';
    }

    // ── Overview numbers ──────────────────────────────────────
    const totalSessions = this.workouts.length;
    const sorted = [...this.workouts].sort((a, b) => new Date(a.date) - new Date(b.date));
    const firstDate = sorted.length ? new Date(sorted[0].date) : new Date();
    const weeksSinceFirst = Math.max(1, (Date.now() - firstDate.getTime()) / (7 * 86400000));
    const avgPerWeek = (totalSessions / weeksSinceFirst).toFixed(1);
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonth  = this.workouts.filter(w => new Date(w.date) >= thisMonthStart).length;
    const lastMonth  = this.workouts.filter(w => new Date(w.date) >= lastMonthStart && new Date(w.date) < thisMonthStart).length;
    const monthColor = thisMonth >= lastMonth ? 'var(--sea-foam)' : 'var(--coral)';

    // ── Most-trained muscle this month ───────────────────────
    const monthMuscles = {};
    this.workouts.filter(w => new Date(w.date) >= thisMonthStart).forEach(w => {
      w.exercises.forEach(ex => {
        const lib = this.exercises.find(e => e.id === ex.exerciseId || e.name === ex.name);
        (lib?.muscleGroups || []).forEach(m => { monthMuscles[m] = (monthMuscles[m] || 0) + 1; });
      });
    });
    const topMuscle = Object.entries(monthMuscles).sort((a,b) => b[1]-a[1])[0]?.[0] || '—';

    return `
      <div class="fade-in">

        <!-- Overview chips -->
        <div class="section-header"><span class="section-title">Overview</span></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:0 16px 4px;">
          <div class="card" style="padding:14px 12px;text-align:center;">
            <div style="font-size:1.5rem;font-weight:800;color:var(--aqua);line-height:1;">${totalSessions}</div>
            <div class="text-xs text-sea mt-4">Total Sessions</div>
          </div>
          <div class="card" style="padding:14px 12px;text-align:center;">
            <div style="font-size:1.5rem;font-weight:800;color:var(--aqua);line-height:1;">${avgPerWeek}</div>
            <div class="text-xs text-sea mt-4">Avg / Week</div>
          </div>
          <div class="card" style="padding:14px 12px;text-align:center;">
            <div style="font-size:1.5rem;font-weight:800;color:${monthColor};line-height:1;">${thisMonth} <span style="font-size:0.8rem;color:var(--text-sea);">/ ${lastMonth}</span></div>
            <div class="text-xs text-sea mt-4">This Month / Last</div>
          </div>
          <div class="card" style="padding:14px 12px;text-align:center;">
            <div style="font-size:1rem;font-weight:700;color:var(--sea-foam);line-height:1.2;">${topMuscle}</div>
            <div class="text-xs text-sea mt-4">Top Muscle (Month)</div>
          </div>
        </div>

        <!-- Volume per session line graph -->
        <div class="section-header" style="display:flex;justify-content:space-between;align-items:center;">
          <span class="section-title">Volume per Session</span>
          <button id="btn-toggle-graph" data-mode="recent"
            style="background:none;border:none;color:var(--aqua);font-size:0.75rem;font-weight:600;cursor:pointer;padding:0 16px 0 0;">
            All time ▾
          </button>
        </div>
        <div class="card" id="vol-graph-card">
          ${this._buildVolumeLineGraph(14)}
        </div>

        <!-- Weekly volume bars -->
        <div class="section-header" style="display:flex;justify-content:space-between;align-items:center;">
          <span class="section-title">Weekly Volume</span>
          <button id="btn-toggle-weekly" data-weeks="4"
            style="background:none;border:none;color:var(--aqua);font-size:0.75rem;font-weight:600;cursor:pointer;padding:0 16px 0 0;">
            12 weeks ▾
          </button>
        </div>
        <div class="card" id="weekly-vol-card">
          ${this._buildWeeklyVolBars(4)}
        </div>

        <!-- Consistency calendar -->
        <div class="section-header" style="display:flex;justify-content:space-between;align-items:center;">
          <span class="section-title">Consistency</span>
          <button id="btn-toggle-calendar" data-mode="recent"
            style="background:none;border:none;color:var(--aqua);font-size:0.75rem;font-weight:600;cursor:pointer;padding:0 16px 0 0;">
            Full history ▾
          </button>
        </div>
        <div class="card" id="cal-card" style="overflow:hidden;">
          ${this._buildCalendarHTML(false)}
        </div>

        <!-- Muscle activity heatmap -->
        <div class="section-header"><span class="section-title">Muscle Heatmap</span></div>
        <div class="card" style="padding:16px 12px;">
          ${Object.keys(muscleData).length === 0 ? `
            <div class="text-sm text-sea" style="padding:8px;text-align:center;">No workouts in the last 30 days</div>
          ` : `
            <div class="text-xs text-sea" style="margin-bottom:12px;">Last ${muscleWindow} · brighter = more sets</div>
            ${this._buildBodyHeatmap(muscleData)}
          `}
        </div>

        <!-- PRs -->
        <div class="section-header"><span class="section-title">Personal Records</span></div>
        ${Object.entries(p.personalRecords || {}).length === 0 ? `
          <div class="empty-state" style="padding:30px;">
            <div class="empty-state-text">Complete workouts to set PRs!</div>
          </div>` :
          Object.entries(p.personalRecords || {}).map(([name, pr]) => `
            <div class="card card-tappable" data-pr-exercise="${name}">
              <div class="flex flex-between" style="align-items:center;">
                <div>
                  <div class="text-bold text-white">${name}</div>
                  <div class="text-xs text-sea">${pr.maxWeight ? pr.maxWeight.value + ' ' + (pr.maxWeight.unit || this.settings.defaultWeightUnit) : ''}</div>
                </div>
                <div class="text-sunset text-bold">${this.Icons.anchor}</div>
              </div>
            </div>
          `).join('')}
        <div style="height:20px;"></div>
      </div>`;
  },

  // ── Volume per-session SVG line graph ─────────────────────
  _buildVolumeLineGraph(limit) {
    const allSorted = [...this.workouts].sort((a, b) => new Date(a.date) - new Date(b.date));
    if (allSorted.length === 0) {
      return `<div class="text-sm text-sea" style="padding:20px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:8px;"><span style="color:var(--aqua);">${this.Icons.beachUmbrella}</span>No sessions yet — get lifting!</div>`;
    }

    const pool = limit > 0 ? allSorted.slice(-limit) : allSorted;
    const unit = this.settings?.defaultWeightUnit || 'lbs';
    const data = pool.map(w => ({
      date: new Date(w.date),
      vol: w.exercises.reduce((s, ex) =>
        s + ex.sets.reduce((ss, set) => ss + ((set.weight||0)*(set.reps||0)), 0), 0)
    }));

    if (data.length < 2) {
      const v = data[0]?.vol || 0;
      return `<div class="text-sm text-sea" style="padding:16px;text-align:center;">
        Only 1 session recorded (${Math.round(v).toLocaleString()} ${unit}). Come back after your next workout!
      </div>`;
    }

    const maxV = Math.max(...data.map(d => d.vol));
    const minV = Math.min(...data.map(d => d.vol));
    const range = maxV - minV || 1;
    const W = 300, H = 90, PL = 4, PR = 4, PT = 10, PB = 20;
    const iW = W - PL - PR, iH = H - PT - PB;
    const n = data.length - 1;

    const pts = data.map((d, i) => ({
      x: PL + (i / n) * iW,
      y: PT + (1 - (d.vol - minV) / range) * iH,
      d,
    }));

    const line = pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    const area = `M${pts[0].x.toFixed(1)},${(PT+iH).toFixed(1)} ` +
      pts.map(p => `L${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') +
      ` L${pts[n].x.toFixed(1)},${(PT+iH).toFixed(1)} Z`;

    // Label first, last, and midpoint
    const labelIdx = new Set([0, Math.floor(n/2), n]);
    const xLabels = [...labelIdx].map(i => {
      const p = pts[i];
      const lbl = p.d.date.toLocaleDateString('en-US', { month:'short', day:'numeric' });
      return `<text x="${p.x.toFixed(1)}" y="${H-1}" text-anchor="middle" fill="rgba(130,190,210,0.75)" font-size="7.5" font-family="-apple-system,sans-serif">${lbl}</text>`;
    }).join('');

    const latest = data[n].vol;
    const prev   = data[n-1].vol;
    const delta  = latest - prev;
    const dStr   = (delta >= 0 ? '+' : '') + Math.round(delta).toLocaleString();
    const dColor = delta >= 0 ? 'var(--sea-foam)' : 'var(--coral)';
    const fmt    = v => v >= 1000 ? (v/1000).toFixed(1)+'k' : Math.round(v).toLocaleString();

    return `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;">
        <div>
          <div style="font-size:1.15rem;font-weight:800;color:var(--text-main);">
            ${fmt(latest)} <span style="font-size:0.72rem;font-weight:500;color:var(--text-sea);">${unit}</span>
          </div>
          <div style="font-size:0.75rem;color:${dColor};">${dStr} from last session</div>
        </div>
        <div style="font-size:0.68rem;color:var(--text-muted);padding-top:2px;">
          ${limit > 0 ? `Last ${data.length}` : `All ${data.length}`} sessions
        </div>
      </div>
      <svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block;overflow:visible;">
        <defs>
          <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#00c8cc" stop-opacity="0.28"/>
            <stop offset="100%" stop-color="#00c8cc" stop-opacity="0.02"/>
          </linearGradient>
        </defs>
        <path d="${area}" fill="url(#volGrad)"/>
        <polyline points="${line}" fill="none" stroke="#00d4e0" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
        ${pts.map((p, i) => {
          const isLast = i === n;
          return `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}"
            r="${isLast ? 4 : 2.5}"
            fill="${isLast ? '#00d4e0' : '#4ee8c8'}"
            stroke="rgba(2,22,40,0.85)" stroke-width="1.5"/>`;
        }).join('')}
        ${xLabels}
      </svg>`;
  },

  // ── Weekly volume bar chart ───────────────────────────────
  _buildWeeklyVolBars(weeks) {
    const data = this.getVolumeHistory(weeks);
    const unit = this.settings?.defaultWeightUnit || 'lbs';
    const fmt  = v => v >= 1000 ? (v/1000).toFixed(1)+'k' : Math.round(v).toLocaleString();
    return `
      <div class="text-xs text-sea" style="margin-bottom:8px;">Last ${weeks} weeks</div>
      <div class="flex gap-4" style="align-items:flex-end;height:80px;">
        ${data.map(v => `
          <div class="flex-1 flex flex-col" style="align-items:center;justify-content:flex-end;height:100%;">
            ${v.volume > 0 ? `<div style="font-size:0.55rem;color:var(--text-sea);margin-bottom:2px;">${fmt(v.volume)}</div>` : ''}
            <div style="width:100%;background:linear-gradient(to top,var(--teal),var(--sea-foam));border-radius:4px 4px 0 0;min-height:${v.volume>0?4:2}px;height:${Math.max(v.percent,v.volume>0?5:2)}%;opacity:${v.volume>0?1:0.25};"></div>
            <div class="text-xs text-sea mt-4">${v.label}</div>
          </div>
        `).join('')}
      </div>`;
  },

  // ── Consistency calendar HTML (reusable) ─────────────────
  _buildCalendarHTML(showAll = false, customDates = null) {
    const cells = this._buildStreakCalendar(showAll, customDates);
    return `
      <div style="display:flex;justify-content:space-around;margin-bottom:5px;">
        ${['S','M','T','W','T','F','S'].map(d =>
          `<div style="flex:1;text-align:center;font-size:0.6rem;color:var(--text-sea);font-weight:700;">${d}</div>`
        ).join('')}
      </div>
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px;">
        ${cells.map(c => {
          if (c.pad) return `<div style="aspect-ratio:1;"></div>`;
          const bg = c.worked ? 'var(--lagoon)'
            : c.isToday ? 'rgba(0,200,255,0.18)'
            : 'rgba(255,255,255,0.07)';
          const ring = c.isToday ? 'outline:1.5px solid var(--aqua);outline-offset:-1px;' : '';
          return `<div style="aspect-ratio:1;border-radius:3px;background:${bg};${ring}" title="${c.date?c.date.toLocaleDateString():''}"></div>`;
        }).join('')}
      </div>
      <div class="flex gap-6 mt-10" style="align-items:center;justify-content:flex-end;">
        <span class="text-xs text-sea">Less</span>
        <div style="width:9px;height:9px;border-radius:2px;background:rgba(255,255,255,0.07);"></div>
        <div style="width:9px;height:9px;border-radius:2px;background:rgba(0,160,140,0.45);"></div>
        <div style="width:9px;height:9px;border-radius:2px;background:var(--lagoon);"></div>
        <span class="text-xs text-sea">More</span>
      </div>`;
  },

  _buildStreakCalendar(showAll = false, customDates = null) {
    const datesArray = customDates || this.workouts.map(w => w.date);
    const workoutDates = new Set(datesArray.map(d => new Date(d).toDateString()));
    const today = new Date();
    let startDate;

    if (showAll && datesArray.length > 0) {
      // Start from first workout date (capped at 90 days back)
      const earliest = new Date(Math.min(...datesArray.map(d => new Date(d).getTime())));
      startDate = new Date(earliest);
      startDate.setDate(startDate.getDate() - startDate.getDay()); // align to Sunday
      const cap = new Date(today);
      cap.setDate(cap.getDate() - 90);
      cap.setDate(cap.getDate() - cap.getDay());
      if (startDate < cap) startDate = cap;
    } else {
      // Default: last 2 weeks, aligned to Sunday
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 13);
      startDate.setDate(startDate.getDate() - startDate.getDay());
    }

    const cells = [];
    const cursor = new Date(startDate);
    while (cursor <= today) {
      cells.push({
        date: new Date(cursor),
        worked: workoutDates.has(cursor.toDateString()),
        isToday: cursor.toDateString() === today.toDateString(),
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    const remaining = 7 - (cells.length % 7 || 7);
    if (remaining < 7) {
      for (let i = 0; i < remaining; i++) cells.push({ pad: true });
    }
    return cells;
  },

  // ─── START WORKOUT SCREEN ─────────────────────────────────
  renderStartWorkout() {
    return `
      <div class="header">
        <button class="header-back" id="btn-back-home">${this.Icons.back}</button>
        <span class="header-title">New Session</span>
      </div>
      <div class="p-16 fade-in">
        <div class="input-group">
          <label class="input-label">Workout Title (optional)</label>
          <input type="text" class="input" placeholder="e.g. Push Day, Leg Day..." id="workout-title-input">
        </div>
        <div class="input-group">
          <label class="input-label">Notes (optional)</label>
          <textarea class="input" placeholder="How are you feeling? Any goals for today?" id="workout-notes-input"></textarea>
        </div>
        <div class="input-group">
          <label class="input-label">Tags (optional)</label>
          <input type="text" class="input" placeholder="Type and press Enter to add tags" id="workout-tags-input">
          <div class="flex gap-4 flex-wrap mt-8" id="workout-tags-container"></div>
        </div>

        <!-- Custom Fields -->
        ${this.settings.customFieldTemplates && this.settings.customFieldTemplates.length > 0 ? `
          <div class="section-header" style="padding-left:0;">
            <span class="section-title">Custom Fields</span>
          </div>
          ${this.settings.customFieldTemplates.map(f => `
            <div class="input-group">
              <label class="input-label">${f.name}</label>
              ${f.type === 'select' ? `
                <select class="input" data-custom-field="${f.name}">
                  <option value="">Select...</option>
                  ${(f.options || []).map(o => `<option value="${o}">${o}</option>`).join('')}
                </select>
              ` : `
                <input type="${f.type === 'number' ? 'number' : 'text'}" class="input"
                       placeholder="${f.name}" data-custom-field="${f.name}">
              `}
            </div>
          `).join('')}
        ` : ''}

        <button class="btn btn-accent btn-large mt-16" id="btn-begin-workout">
          Lets Go!
        </button>
      </div>
    `;
  },

  // ─── ACTIVE WORKOUT SCREEN ────────────────────────────────
  renderActiveWorkout() {
    if (!this.activeWorkout) return this.renderStartWorkout();

    const w = this.activeWorkout;
    const elapsed = Math.round((Date.now() - new Date(w.date).getTime()) / 1000);
    const totalVolume = w.exercises.reduce((sum, ex) =>
      sum + this._exVol(ex), 0);

    return `
      <div class="header">
        <button class="header-back" id="btn-cancel-workout">✕</button>
        <span class="header-title">${w.title || 'Workout'}</span>
        <button class="header-action" id="btn-finish-workout">Finish</button>
      </div>

      <!-- Live Stats Bar -->
      <div class="flex gap-8 p-16" style="padding-top:8px; padding-bottom:8px; background:var(--glass-deep); backdrop-filter:var(--blur-md); -webkit-backdrop-filter:var(--blur-md); border-bottom:1px solid var(--glass-border);">
        <div class="flex-1 text-center">
          <div class="text-xs text-sea">Duration</div>
          <div class="text-bold text-white" id="workout-elapsed">${Timer.formatTime(elapsed)}</div>
        </div>
        <div class="flex-1 text-center">
          <div class="text-xs text-sea">Volume</div>
          <div class="text-bold text-sunset" id="workout-volume">${totalVolume.toLocaleString()}</div>
        </div>
        <div class="flex-1 text-center">
          <div class="text-xs text-sea">Sets</div>
          <div class="text-bold text-white" id="workout-sets">${w.exercises.reduce((s, e) => s + e.sets.filter(st => st.completed).length, 0)}</div>
        </div>
      </div>

      <div id="exercises-container">
        ${w.exercises.map((ex, exIdx) => this.renderExerciseBlock(ex, exIdx)).join('')}
      </div>

      <!-- Add Exercise Button -->
      <div class="p-16">
        <button class="btn btn-primary btn-large" id="btn-add-exercise">
          ${this.Icons.plus} Add Exercise
        </button>
      </div>

      <!-- Workout Notes -->
      <div class="p-16" style="padding-top: 0;">
        <button class="btn btn-ghost btn-large" id="btn-workout-notes">
          ${this.Icons.notes} Workout Notes
        </button>
      </div>

      <div style="height: 40px;"></div>
    `;
  },

  renderExerciseBlock(ex, exIdx) {
    const setsTotal = this.settings.defaultSetsPerExercise;
    const iconUrl = this._getExerciseIconUrl(ex.name);
    return `
      <div class="card slide-up" style="animation-delay: ${exIdx * 0.05}s">
        <div class="flex flex-between" style="align-items: center; margin-bottom: 12px;">
          <div style="display:flex;align-items:center;gap:8px;">
            <div style="width:36px;height:36px;border-radius:8px;background:var(--glass-mid);display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;position:relative;color:var(--text-muted);">
              ${this.Icons.person}
              ${iconUrl ? `<img src="${iconUrl}" alt="${ex.name}" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity 0.3s;border-radius:8px;" onload="this.style.opacity=1" onerror="this.remove()">` : ''}
            </div>
            <div class="text-bold text-white" style="font-size: 1.05rem;" data-rename-ex="${exIdx}">${ex.name}</div>
            ${ex.bilateral ? `<span style="font-size:0.65rem;font-weight:800;letter-spacing:0.04em;color:#021628;background:var(--aqua);border-radius:4px;padding:2px 5px;flex-shrink:0;">×2</span>` : ''}
          </div>
          <button class="btn btn-small btn-ghost" data-exercise-menu="${exIdx}" style="padding: 4px;">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
          </button>
        </div>

        <!-- Set Headers -->
        <div class="set-row" style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 6px;">
          <div class="set-number" style="background:none; color: var(--sea-foam); font-size: 0.7rem;">SET</div>
          <div class="set-input" style="gap: 4px;">
            <span class="flex-1 text-center text-xs text-sea">PREV</span>
            <span class="flex-1 text-center text-xs text-sea">${ex.bilateral ? 'EACH HAND' : this.settings.defaultWeightUnit.toUpperCase()}</span>
            <span class="flex-1 text-center text-xs text-sea">REPS</span>
          </div>
          <div style="width:44px; text-align:center;" class="text-xs text-sea">${this.Icons.check}</div>
          <div style="width:30px;"></div>
        </div>

        <!-- Sets -->
        ${ex.sets.map((set, setIdx) => this.renderSetRow(set, setIdx, exIdx, ex)).join('')}

        <!-- Add Set -->
        <button class="btn btn-ghost btn-small w-full mt-8" data-add-set="${exIdx}">
          ${this.Icons.plus} Add Set
        </button>
      </div>
    `;
  },

  renderSetRow(set, setIdx, exIdx, ex) {
    const prevSet = this.getPreviousSet(ex.name, setIdx);
    const prevText = prevSet ? `${prevSet.weight}×${prevSet.reps}` : '—';
    const isCompleted = set.completed;

    return `
      <div class="set-row ${isCompleted ? 'completed' : ''}" data-ex="${exIdx}" data-set="${setIdx}">
        <div class="set-number ${isCompleted ? 'completed' : setIdx === ex.sets.findIndex(s => !s.completed) ? 'current' : 'pending'}">
          ${setIdx + 1}
        </div>
        <div class="set-input">
          <span class="flex-1 text-center text-xs text-sea" style="opacity: 0.6;">${prevText}</span>
          <input type="number" class="input input-number flex-1" placeholder="0"
                 value="${set.weight || ''}"
                 data-field="weight" data-ex="${exIdx}" data-set="${setIdx}"
                 ${isCompleted ? 'readonly style="opacity:0.7;"' : ''}>
          <input type="number" class="input input-number flex-1" placeholder="0"
                 value="${set.reps || ''}"
                 data-field="reps" data-ex="${exIdx}" data-set="${setIdx}"
                 ${isCompleted ? 'readonly style="opacity:0.7;"' : ''}>
        </div>
        <button class="set-check ${isCompleted ? 'done' : (set.weight && set.reps ? 'ready' : '')}"
                data-complete-set data-ex="${exIdx}" data-set="${setIdx}">
          ${isCompleted ? this.Icons.check : ''}
        </button>
      </div>
    `;
  },

  // ─── REST TIMER SCREEN ────────────────────────────────────
  renderRestTimer(data) {
    const seconds = data.seconds || this.settings.defaultRestBetweenSets;
    const label = data.label || 'Rest Time';
    const circumference = 2 * Math.PI * 95;

    return `
      <div class="fade-in" style="text-align: center; padding-top: 40px;">
        <div class="text-sm text-sea mb-8">${label}</div>

        <div class="timer-display">
          <div class="timer-ring">
            <svg viewBox="0 0 200 200">
              <circle class="timer-ring-bg" cx="100" cy="100" r="95"/>
              <circle class="timer-ring-progress" cx="100" cy="100" r="95"
                      stroke-dasharray="${circumference}"
                      stroke-dashoffset="0"
                      id="timer-ring-circle"/>
            </svg>
            <div class="timer-time" id="timer-display">${Timer.formatTime(seconds)}</div>
          </div>
        </div>

        <div class="timer-label" id="timer-label">${seconds}s remaining</div>

        <div class="flex gap-12 mx-16 mt-16">
          <button class="btn btn-ghost flex-1" id="btn-timer-minus15">-15s</button>
          <button class="btn btn-accent flex-1" id="btn-timer-skip">Skip →</button>
          <button class="btn btn-ghost flex-1" id="btn-timer-plus15">+15s</button>
        </div>

        <div class="card mt-24 mx-16">
          <div class="text-sm text-sand" style="font-style: italic;">
            "${this._getRestQuote()}"
          </div>
          <div class="text-xs text-sea mt-4">— ${this._getRestQuoteAuthor()}</div>
        </div>
      </div>
    `;
  },

  // ─── WORKOUT COMPLETE SCREEN ──────────────────────────────
  renderWorkoutComplete() {
    const w = this.lastCompletedWorkout;
    if (!w) return this.renderHome();

    const totalVolume = w.exercises.reduce((sum, ex) =>
      sum + this._exVol(ex), 0);
    const totalSets = w.exercises.reduce((s, e) => s + e.sets.length, 0);
    const durationMin = w.duration ? Math.round(w.duration / 60) : 0;

    return `
      <div class="fade-in text-center" style="padding-top: 40px;">
        <div style="width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,var(--teal),var(--aqua));display:flex;align-items:center;justify-content:center;margin:0 auto;box-shadow:0 0 32px rgba(0,200,255,0.45);">
          ${this.Icons.anchor}
        </div>
        <div class="text-xl text-extra-bold text-sunset mt-16">Session Complete</div>
        <div class="text-sm text-sea mt-4">Keep riding those waves.</div>

        ${w.xpEarned ? `
          <div class="card card-highlight mx-16 mt-16">
            <div class="text-xs text-sea">XP EARNED</div>
            <div class="text-xl text-extra-bold text-sunset">+${w.xpEarned} XP</div>
          </div>
        ` : ''}

        <div class="hero-stat-row mt-16">
          <div class="hero-stat-pill">
            <div class="hero-stat-pill-icon">${this.Icons.sun}</div>
            <span class="hero-stat-pill-val">${durationMin}m</span>
            <div class="hero-stat-pill-label">Duration</div>
          </div>
          <div class="hero-stat-pill">
            <div class="hero-stat-pill-icon">${this.Icons.stats}</div>
            <span class="hero-stat-pill-val">${this.formatVolume(totalVolume)}</span>
            <div class="hero-stat-pill-label">Volume</div>
          </div>
          <div class="hero-stat-pill">
            <div class="hero-stat-pill-icon">${this.Icons.check}</div>
            <span class="hero-stat-pill-val">${totalSets}</span>
            <div class="hero-stat-pill-label">Sets</div>
          </div>
        </div>

        <!-- Exercises Summary -->
        ${w.exercises.map(ex => `
          <div class="card" style="text-align: left;">
            <div class="text-bold text-white">${ex.name}</div>
            ${ex.sets.map((s, i) => `
              <div class="text-xs text-sea mt-4">
                Set ${i + 1}: ${s.weight} ${s.weightUnit || this.settings.defaultWeightUnit} × ${s.reps}${s.rpe ? ' @ RPE ' + s.rpe : ''}
              </div>
            `).join('')}
          </div>
        `).join('')}

        <!-- Post-Workout Actions -->
        <div class="p-16">
          <button class="btn btn-primary btn-large mb-8" id="btn-ai-analyze">
            Coach Review
          </button>
          <button class="btn btn-ghost btn-large mb-8" id="btn-add-post-notes">
            ${this.Icons.notes} Add Notes
          </button>
          <button class="btn btn-accent btn-large" id="btn-back-home-complete">
            Back to Shore
          </button>
        </div>

        <div style="height: 20px;"></div>
      </div>
    `;
  },

  // ─── SOCIAL SCREEN ────────────────────────────────────────
  renderSocial() {
    const hasUsername = !!this.settings.username;
    if (!hasUsername) {
      return this._renderSocialSetup();
    }
    return `
      <div class="header">
        <span class="header-title">The Board</span>
      </div>
      <div id="social-tab-content">
        ${this._renderGlobalChat()}
      </div>
    `;
  },

  _renderSocialSetup() {
    return `
      <div class="header"><span class="header-title">The Board</span></div>
      <div class="username-setup-card">
        <div style="margin-bottom:12px;">${this.Icons.anchor}</div>
        <div class="text-lg text-extra-bold text-main">Join the Community</div>
        <div class="text-sm text-sea mt-8 mb-16">Pick a handle to ride the leaderboard, share sessions, and talk shop with the tribe.</div>
        <div class="input-group">
          <input type="text" class="input" placeholder="Your username" id="social-username-input" maxlength="20" autocomplete="off">
        </div>
        <div class="text-xs text-muted mt-8 mb-16">This is public. Paddle in — no email needed.</div>
        <button class="btn btn-accent btn-large w-full" id="btn-social-join">Join the Board →</button>
      </div>
    `;
  },

  _renderSocialTab(tab) {
    if (tab === 'leaderboard') return this._renderLeaderboard();
    if (tab === 'feed')        return this._renderFeed();
    if (tab === 'chat')        return this._renderGlobalChat();
    return '';
  },

  _renderLeaderboard() {
    const myVolume = this.getWeekVolume();
    const fmt = (v) => v >= 1000 ? (v/1000).toFixed(1)+'k' : v;
    const now = new Date();
    // Days until next Monday (0 = Sun, 1 = Mon ... 6 = Sat)
    const daysLeft = (8 - now.getDay()) % 7 || 7;
    const hoursLeft = 24 - now.getHours();
    return `
      <div class="social-reset-timer">Resets in ${daysLeft}d ${hoursLeft}h</div>
      <div id="leaderboard-list">
        <div class="card" style="padding:24px 16px;text-align:center;">
          <div class="text-sm text-muted">Loading rankings...</div>
        </div>
      </div>
      ${myVolume > 0 ? `
        <div class="card leaderboard-you" style="padding:0;overflow:hidden;margin-top:4px;" id="leaderboard-you-row">
          <div class="leaderboard-row">
            <div class="leaderboard-rank you" id="my-rank-badge">—</div>
            <img class="leaderboard-avatar" src="${this._getAvatarUrl()}" alt="you">
            <div class="leaderboard-info">
              <div class="leaderboard-name">${this.settings.username} <span style="font-size:0.65rem;color:var(--aqua);">(you)</span></div>
              <div class="leaderboard-sub">Lv ${this.getLevelInfo(this.profile.xp).level}</div>
            </div>
            <div class="leaderboard-volume">${fmt(myVolume)} lbs</div>
          </div>
        </div>` : ''}
      <div style="height:20px;"></div>`;
  },

  _populateLeaderboard(users) {
    const list = document.getElementById('leaderboard-list');
    if (!list) return;
    const myVolume = this.getWeekVolume();
    const fmt = (v) => v >= 1000 ? (v/1000).toFixed(1)+'k' : v;
    const rankClass = (r) => r === 1 ? 'gold' : r === 2 ? 'silver' : r === 3 ? 'bronze' : '';
    if (!users || !users.length) {
      list.innerHTML = `<div class="card" style="padding:24px 16px;text-align:center;">
        <div class="text-sm text-muted">${myVolume > 0 ? "You're first on the board this week!" : 'No sessions logged this week — log one to rank up!'}</div>
      </div>`;
      if (myVolume > 0) {
        const badge = document.getElementById('my-rank-badge');
        if (badge) badge.textContent = '1';
      }
      return;
    }
    const myRank = myVolume > 0 ? users.filter(u => u.volume > myVolume).length + 1 : '—';
    const badge = document.getElementById('my-rank-badge');
    if (badge) badge.textContent = myRank;
    list.innerHTML = `<div class="card" style="padding:0;overflow:hidden;">
      ${users.map(u => {
        const av = u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.user_id}&backgroundColor=b6e3f4,c0aede,d1d4f9&mouth=smile,twinkle&top=shortHair,shortHairShortFlat`;
        return `
          <div class="leaderboard-row card-tappable" data-lb-username="${u.username}" data-lb-avatar="${encodeURIComponent(av)}" data-lb-level="${u.level || 1}" data-lb-volume="${u.volume}" data-lb-rank="${u.rank}">
            <div class="leaderboard-rank ${rankClass(u.rank)}">${u.rank}</div>
            <img class="leaderboard-avatar" src="${av}" alt="${u.username}">
            <div class="leaderboard-info">
              <div class="leaderboard-name">${u.username}</div>
              <div class="leaderboard-sub">Lv ${u.level || 1}</div>
            </div>
            <div class="leaderboard-volume">${fmt(u.volume)} lbs</div>
          </div>`;
      }).join('')}
    </div>`;
    // Rebind row taps
    document.querySelectorAll('[data-lb-username]').forEach(el => {
      el.addEventListener('click', () => {
        const av = el.dataset.lbAvatar
          ? decodeURIComponent(el.dataset.lbAvatar)
          : `https://api.dicebear.com/7.x/avataaars/svg?seed=user`;
        this.showScreen('userProfile', {
          user: {
            username: el.dataset.lbUsername, avatarUrl: av,
            level: parseInt(el.dataset.lbLevel) || 1,
            volume: parseInt(el.dataset.lbVolume) || 0,
            rank: parseInt(el.dataset.lbRank) || null,
            streak: null, sessions: null,
          }
        });
      });
    });
  },

  REACTION_EMOJIS: ['🔥', '💪', '🤙', '😂', '🌊'],

  _reactionBarHtml(itemId, itemType) {
    const myReactions = this._localReactions?.[itemId] || {};
    const activeEmojis = this.REACTION_EMOJIS.filter(e => (this._reactionCounts?.[itemId]?.[e] || 0) > 0 || myReactions[e]);
    return `<div class="reaction-bar${activeEmojis.length ? ' has-reactions' : ''}" data-item-id="${itemId}" data-item-type="${itemType}">
      ${activeEmojis.map(e => {
        const count = this._reactionCounts?.[itemId]?.[e] || 0;
        const mine  = myReactions[e];
        return `<button class="reaction-btn ${mine ? 'reacted' : ''}" data-emoji="${e}" data-item-id="${itemId}" data-item-type="${itemType}">${e}${count > 0 ? `<span>${count}</span>` : ''}</button>`;
      }).join('')}
    </div>`;
  },

  async _toggleReaction(itemId, itemType, emoji, posterUserId) {
    if (!this._localReactions)  this._localReactions  = {};
    if (!this._reactionCounts)  this._reactionCounts  = {};
    if (!this._localReactions[itemId])  this._localReactions[itemId]  = {};
    if (!this._reactionCounts[itemId])  this._reactionCounts[itemId]  = {};

    const already = this._localReactions[itemId][emoji];
    if (already) {
      delete this._localReactions[itemId][emoji];
      this._reactionCounts[itemId][emoji] = Math.max(0, (this._reactionCounts[itemId][emoji] || 1) - 1);
    } else {
      this._localReactions[itemId][emoji] = true;
      this._reactionCounts[itemId][emoji] = (this._reactionCounts[itemId][emoji] || 0) + 1;
    }

    // Refresh just the reaction bar in the DOM
    const bar = document.querySelector(`.reaction-bar[data-item-id="${itemId}"]`);
    if (bar) bar.outerHTML = this._reactionBarHtml(itemId, itemType);
    // Re-bind the new bar
    this._bindReactionBars();

    // Always sync to server (handles both add and remove — server toggles)
    if (this.settings.serverId) {
      this.apiPost('/api/react', {
        item_id: itemId, item_type: itemType,
        user_id: this.settings.serverId, emoji,
        poster_user_id: posterUserId || null,
      }).then(data => {
        if (data?.counts) {
          if (!this._reactionCounts) this._reactionCounts = {};
          if (!this._reactionCounts[itemId]) this._reactionCounts[itemId] = {};
          data.counts.forEach(c => { this._reactionCounts[itemId][c.emoji] = c.count; });
          // Re-render bar with confirmed counts
          const bar = document.querySelector(`.reaction-bar[data-item-id="${itemId}"]`);
          if (bar) bar.outerHTML = this._reactionBarHtml(itemId, itemType);
          this._bindReactionBars();
        }
      }).catch(() => {});
    }
  },

  _bindReactionBars() {
    document.querySelectorAll('.reaction-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const { emoji, itemId, itemType } = btn.dataset;
        const bar = btn.closest('.reaction-bar');
        const posterId = bar?.dataset.posterUserId || null;
        this._toggleReaction(itemId, itemType, emoji, posterId);
      });
    });
  },

  _showBubbleActions(x, y, itemId, itemType, text) {
    document.getElementById('bubble-actions-popup')?.remove();
    const el = document.createElement('div');
    el.id = 'bubble-actions-popup';
    el.className = 'bubble-actions';
    const emojiRow = itemId ? this.REACTION_EMOJIS.map(e => {
      const mine = this._localReactions?.[itemId]?.[e];
      return `<button class="bap-emoji${mine ? ' reacted' : ''}" data-emoji="${e}" data-item-id="${itemId}" data-item-type="${itemType}">${e}</button>`;
    }).join('') : '';
    el.innerHTML = `<button class="bap-copy" id="bap-copy-btn">Copy</button>${emojiRow ? '<div class="bap-sep"></div>' + emojiRow : ''}`;
    document.body.appendChild(el);
    const pw = el.offsetWidth || 240;
    const ph = el.offsetHeight || 48;
    let left = Math.max(8, Math.min(window.innerWidth - pw - 8, x - pw / 2));
    let top = Math.max(8, y - ph - 16);
    el.style.cssText += `position:fixed;left:${left}px;top:${top}px;`;
    document.getElementById('bap-copy-btn')?.addEventListener('click', () => {
      navigator.clipboard.writeText(text).then(() => this.showToast('Copied'));
      el.remove();
    });
    el.querySelectorAll('.bap-emoji').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        this._toggleReaction(btn.dataset.itemId, btn.dataset.itemType, btn.dataset.emoji, null);
        el.remove();
      });
    });
    const dismiss = e => {
      if (!el.contains(e.target)) { el.remove(); document.removeEventListener('touchstart', dismiss); document.removeEventListener('mousedown', dismiss); }
    };
    setTimeout(() => { document.addEventListener('touchstart', dismiss, { passive: true }); document.addEventListener('mousedown', dismiss); }, 100);
  },

  _bindBubbleInteractions(container) {
    container.querySelectorAll('.chat-global-bubble, .feed-item').forEach(bubble => {
      if (bubble.dataset.interBound) return;
      bubble.dataset.interBound = '1';
      let startX, startY, moved;
      bubble.addEventListener('touchstart', e => {
        if (e.target.closest('.reaction-btn, .reaction-bar, .bubble-avatar, a')) return;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        moved = false;
      }, { passive: true });
      bubble.addEventListener('touchmove', e => {
        if (Math.abs(e.touches[0].clientX - startX) > 8 || Math.abs(e.touches[0].clientY - startY) > 8) moved = true;
      }, { passive: true });
      bubble.addEventListener('touchend', e => {
        if (moved) return;
        if (e.target.closest('.reaction-btn, .reaction-bar, .bubble-avatar, a')) return;
        const textEl = bubble.querySelector('.bubble-text, .feed-text');
        const text = textEl?.textContent?.trim() || '';
        const barEl = bubble.querySelector('.reaction-bar');
        this._showBubbleActions(startX, startY, barEl?.dataset.itemId, barEl?.dataset.itemType, text);
      }, { passive: true });
    });
  },

  _bindAiChatCopy(container) {
    container.querySelectorAll('.chat-bubble').forEach(el => {
      if (el.dataset.interBound) return;
      el.dataset.interBound = '1';
      let startX, startY, moved;
      el.addEventListener('touchstart', e => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        moved = false;
      }, { passive: true });
      el.addEventListener('touchmove', e => {
        if (Math.abs(e.touches[0].clientX - startX) > 8 || Math.abs(e.touches[0].clientY - startY) > 8) moved = true;
      }, { passive: true });
      el.addEventListener('touchend', e => {
        if (moved) return;
        const text = el.textContent?.trim() || '';
        this._showBubbleActions(startX, startY, null, null, text);
      }, { passive: true });
    });
  },

  // Fetch reaction counts + current user's reactions for a batch of items
  async _fetchReactionsBulk(itemIds) {
    if (!itemIds?.length) return;
    try {
      const data = await this.apiPost('/api/reactions/bulk', {
        item_ids: itemIds,
        user_id: this.settings.serverId || null,
      });
      if (!data) return;
      if (!this._reactionCounts) this._reactionCounts = {};
      if (!this._localReactions) this._localReactions = {};
      // Merge server counts
      Object.entries(data.counts || {}).forEach(([id, emojiCounts]) => {
        this._reactionCounts[id] = { ...(this._reactionCounts[id] || {}), ...emojiCounts };
      });
      // Merge "my reactions" from server
      Object.entries(data.mine || {}).forEach(([id, emojis]) => {
        this._localReactions[id] = { ...(this._localReactions[id] || {}), ...emojis };
      });
      // Re-render all reaction bars now that we have real data
      document.querySelectorAll('.reaction-bar').forEach(bar => {
        const id = bar.dataset.itemId;
        const type = bar.dataset.itemType;
        if (id) bar.outerHTML = this._reactionBarHtml(id, type);
      });
      this._bindReactionBars();
    } catch (e) { /* non-critical */ }
  },

  _renderFeed() {
    return `
      <div id="feed-list">
        <div class="card" style="padding:24px 16px;text-align:center;">
          <div class="text-sm text-muted">Loading feed...</div>
        </div>
      </div>
      <div style="height:20px;"></div>`;
  },

  _populateFeed(items) {
    const list = document.getElementById('feed-list');
    if (!list) return;
    const makeAv = (url, seed) => url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed || 'user'}&backgroundColor=b6e3f4,c0aede,d1d4f9&mouth=smile,twinkle&top=shortHair,shortHairShortFlat`;
    if (!items || !items.length) {
      list.innerHTML = `<div class="card" style="padding:24px 16px;text-align:center;">
        <div class="text-sm text-muted" style="margin-bottom:8px;">No sessions shared yet.</div>
        <div class="text-xs text-muted">Complete a workout to post to the board!</div>
      </div>`;
      return;
    }
    list.innerHTML = `<div class="card" style="padding:0;overflow:hidden;">
      ${items.map((f, i) => `
        <div class="feed-item" style="flex-direction:column;align-items:flex-start;gap:6px;">
          <div style="display:flex;align-items:center;gap:10px;width:100%;">
            <img class="feed-avatar" src="${makeAv(f.avatar_url, f.user_id)}" alt="${f.username || 'athlete'}">
            <div class="feed-content" style="flex:1;">
              <div class="feed-user">${f.username || 'athlete'}</div>
              <div class="feed-text">${f.text || f.description || ''}</div>
              <div class="feed-time">${f.time_ago || ''}</div>
            </div>
          </div>
          ${this._reactionBarHtml(f.id || `feed-srv-${i}`, 'feed')}
        </div>`).join('')}
    </div>`;
    this._bindReactionBars();
    this._bindBubbleInteractions(list);
    const feedIds = items.map(f => f.id).filter(Boolean);
    if (feedIds.length) this._fetchReactionsBulk(feedIds);
  },

  // ─── HOME MINI LEADERBOARD ────────────────────────────────
  _populateHomeLb(users) {
    const list = document.getElementById('home-lb-list');
    if (!list) return;
    const fmt = (v) => v >= 1000 ? (v/1000).toFixed(1)+'k' : v;
    const rankClass = (r) => r === 1 ? 'gold' : r === 2 ? 'silver' : r === 3 ? 'bronze' : '';
    const makeAv = (url, seed) => url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed || 'user'}&backgroundColor=b6e3f4,c0aede,d1d4f9&mouth=smile,twinkle&top=shortHair,shortHairShortFlat`;
    const myVolume = this.getWeekVolume();
    const top3 = (users || []).slice(0, 3);
    const myRank = myVolume > 0 && users.length
      ? users.filter(u => u.volume > myVolume).length + 1
      : (myVolume > 0 ? 1 : null);

    if (!top3.length && !myRank) {
      list.innerHTML = `<div class="card" style="padding:14px 16px;text-align:center;margin:0;">
        <div class="text-xs text-muted" style="display:flex;align-items:center;gap:6px;"><span style="color:var(--aqua);">${this.Icons.islandIcon}</span>No sessions this week — log one to rank up!</div>
      </div>`;
      return;
    }
    let html = `<div class="card" style="padding:0;overflow:hidden;margin:0;">`;
    top3.forEach(u => {
      const av = makeAv(u.avatar_url, u.user_id);
      html += `<div class="leaderboard-row card-tappable" style="padding:10px 14px;"
          data-lb-username="${u.username}" data-lb-avatar="${encodeURIComponent(av)}"
          data-lb-level="${u.level||1}" data-lb-volume="${u.volume}" data-lb-rank="${u.rank}">
        <div class="leaderboard-rank ${rankClass(u.rank)}">${u.rank}</div>
        <img class="leaderboard-avatar" src="${av}" alt="${u.username}">
        <div class="leaderboard-info">
          <div class="leaderboard-name">${u.username}</div>
          <div class="leaderboard-sub">Lv ${u.level||1}</div>
        </div>
        <div class="leaderboard-volume">${fmt(u.volume)} lbs</div>
      </div>`;
    });
    if (myRank) {
      html += `<div class="leaderboard-row" style="padding:10px 14px;background:rgba(0,180,255,0.06);">
        <div class="leaderboard-rank you">${myRank}</div>
        <img class="leaderboard-avatar" src="${this._getAvatarUrl()}" alt="you">
        <div class="leaderboard-info">
          <div class="leaderboard-name">${this.settings.username||'You'} <span style="font-size:0.62rem;color:var(--aqua);">(you)</span></div>
        </div>
        <div class="leaderboard-volume">${fmt(myVolume)} lbs</div>
      </div>`;
    }
    html += '</div>';
    list.innerHTML = html;
    // Bind row taps → user profile
    list.querySelectorAll('[data-lb-username]').forEach(el => {
      el.addEventListener('click', () => {
        const av = el.dataset.lbAvatar
          ? decodeURIComponent(el.dataset.lbAvatar)
          : `https://api.dicebear.com/7.x/avataaars/svg?seed=user`;
        this.showScreen('userProfile', {
          user: { username: el.dataset.lbUsername, avatarUrl: av,
            level: parseInt(el.dataset.lbLevel)||1, volume: parseInt(el.dataset.lbVolume)||0,
            rank: parseInt(el.dataset.lbRank)||null, streak: null, sessions: null }
        });
      });
    });
  },

  // ─── HOME MINI FEED ────────────────────────────────────────
  _populateHomeFeed(items) {
    const list = document.getElementById('home-feed-list');
    if (!list) return;
    const recent = (items || []).slice(0, 3);
    if (!recent.length) {
      list.innerHTML = `<div class="card" style="padding:14px 16px;text-align:center;margin:0;">
        <div class="text-xs text-muted">No activity yet — finish a workout to appear here!</div>
      </div>`;
      return;
    }
    const makeAv = (url, seed) => url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed||'user'}&backgroundColor=b6e3f4,c0aede,d1d4f9&mouth=smile,twinkle&top=shortHair,shortHairShortFlat`;
    list.innerHTML = `<div class="card" style="padding:0;overflow:hidden;margin:0;">
      ${recent.map(f => `
        <div class="feed-item" style="padding:10px 14px;gap:10px;">
          <img class="feed-avatar" style="width:30px;height:30px;flex-shrink:0;" src="${makeAv(f.avatar_url, f.user_id)}" alt="${f.username||'athlete'}">
          <div class="feed-content" style="flex:1;min-width:0;">
            <div class="feed-user">${f.username||'athlete'}</div>
            <div class="feed-text">${f.text||f.description||''}</div>
          </div>
          <div class="feed-time" style="font-size:0.62rem;flex-shrink:0;">${f.time_ago||''}</div>
        </div>`).join('')}
    </div>`;
  },

  _renderGlobalChat() {
    return `
      <div id="chat-fixed-frame" style="position:fixed; left:0; right:0; bottom:calc(56px + var(--safe-bottom,0px)); display:flex; flex-direction:column; z-index:5; top:60px;">
        <div class="chat-global-messages" id="global-chat-messages">
          <div class="text-center text-xs text-muted" style="padding:20px 16px;" id="chat-status-hint">Loading messages...</div>
        </div>
        <div class="chat-global-input-bar">
          <input class="chat-global-input" type="text" placeholder="Say something..." id="global-chat-input" autocomplete="off">
          <button class="chat-global-send" id="btn-global-chat-send">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>`;
  },

  _positionChatFrame() {
    const frame = document.getElementById('chat-fixed-frame');
    if (!frame) return;
    // Measure where the tab content begins so the fixed frame aligns perfectly
    const tabContent = document.getElementById('social-tab-content');
    if (tabContent) {
      const rect = tabContent.getBoundingClientRect();
      frame.style.top = Math.round(rect.top) + 'px';
    }
    // Prevent container from scrolling (which would shift the header/tab pills out of view)
    const sc = document.getElementById('screen-container');
    if (sc) sc.style.overflow = 'hidden';

    // iOS keyboard: use visualViewport to keep the input bar above the keyboard
    if (window.visualViewport && !this._chatVVHandler) {
      this._chatVVHandler = () => {
        const f = document.getElementById('chat-fixed-frame');
        if (!f) return;
        const vv = window.visualViewport;
        // How far the keyboard is pushing up the visual viewport
        const keyboardH = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
        const safeBottom = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--safe-bottom')) || 0;
        f.style.bottom = (56 + safeBottom + keyboardH) + 'px';
      };
      window.visualViewport.addEventListener('resize', this._chatVVHandler);
      window.visualViewport.addEventListener('scroll', this._chatVVHandler);
    }
  },

  _teardownChatVV() {
    if (this._chatVVHandler && window.visualViewport) {
      window.visualViewport.removeEventListener('resize', this._chatVVHandler);
      window.visualViewport.removeEventListener('scroll', this._chatVVHandler);
      this._chatVVHandler = null;
    }
  },

  // ─── CHAT SCREEN ──────────────────────────────────────────
  renderCoachChat(data) {
    const prefilledMsg = data.prefill || '';

    const noHistory = !this._currentChatMessages || this._currentChatMessages.length === 0;
    return `
      <div style="display:flex; flex-direction:column; height:100%; overflow:hidden;">
        <div class="header" style="flex-shrink:0;">
          <button class="header-back" id="btn-back-home">${this.Icons.back}</button>
          <span class="header-title">Coach</span>
        </div>
        <div class="chat-messages" id="chat-messages" style="flex:1; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:10px; -webkit-overflow-scrolling:touch;">
          <div class="chat-bubble ai">
            What's the move today? Ask me anything — training, nutrition, recovery. Or hit a quick prompt.
          </div>
          ${this._currentChatMessages && this._currentChatMessages.length > 0 ? this._currentChatMessages.map(m => `
            <div class="chat-bubble ${m.role === 'ai' ? 'ai' : 'user'}">
              <div class="chat-content">${this.escapeHtml(m.content || '')}</div>
            </div>
          `).join('') : ''}
        </div>
        ${noHistory ? `
          <div class="ai-chips">
            <button class="ai-chip" data-chip="Analyze my last workout">Last workout</button>
            <button class="ai-chip" data-chip="What should I train today?">What to train</button>
            <button class="ai-chip" data-chip="Help me hit a new PR">Hit a PR</button>
            <button class="ai-chip" data-chip="Give me recovery advice">Recovery</button>
          </div>` : ''}
        <div class="chat-input-bar" style="flex-shrink:0; padding-bottom:calc(12px + var(--safe-bottom));">
          <input type="text" class="chat-input" placeholder="Ask Coach anything..."
                 id="chat-input" value="${this.escapeHtml(prefilledMsg)}">
          <button class="chat-send" id="btn-chat-send">${this.Icons.check}</button>
        </div>
      </div>
    `;
  },

  // ─── SETTINGS SCREEN ──────────────────────────────────────
  renderSettings() {
    const s = this.settings;

    return `
      <div class="header">
        <button class="header-back" id="btn-back-home">${this.Icons.back}</button>
        <span class="header-title">Config</span>
      </div>
      <div class="fade-in">
        <!-- Profile -->
        <div class="section-header">
          <span class="section-title">Profile</span>
        </div>
        <div class="card">
          <div style="display:flex;align-items:center;gap:14px;margin-bottom:12px;">
            <img src="${this._getAvatarUrl()}" id="avatar-preview-img" style="width:64px;height:64px;border-radius:50%;border:2px solid var(--aqua);box-shadow:0 0 16px rgba(0,200,220,0.25);" alt="avatar">
            <div style="flex:1;">
              <div class="text-bold text-white">${this.settings.username || 'No username set'}</div>
              <div class="text-xs text-sea mt-2">Lv ${this.getLevelInfo(this.profile.xp).level} · ${this.getLevelInfo(this.profile.xp).title}</div>
            </div>
          </div>
          <div class="input-group">
            <label class="input-label">Username</label>
            <input type="text" class="input" placeholder="Choose a username" id="setting-username" value="${s.username || ''}" maxlength="20">
          </div>
          <div class="input-group" style="margin-top:12px;">
            <label class="input-label">Avatar Style</label>
            <select class="input" id="setting-avatar-style">
              <option value="avataaars"  ${s.avatarStyle === 'avataaars'  ? 'selected' : ''}>Custom Character</option>
              <option value="adventurer" ${s.avatarStyle === 'adventurer' ? 'selected' : ''}>Adventurer</option>
              <option value="pixel-art"  ${s.avatarStyle === 'pixel-art'  ? 'selected' : ''}>Pixel Art</option>
              <option value="fun-emoji"  ${s.avatarStyle === 'fun-emoji'  ? 'selected' : ''}>Fun Emoji</option>
              <option value="bottts"     ${s.avatarStyle === 'bottts'     ? 'selected' : ''}>Robot</option>
              <option value="lorelei"    ${s.avatarStyle === 'lorelei'    ? 'selected' : ''}>Lorelei</option>
            </select>
          </div>

          <!-- Character builder (avataaars only) -->
          <div id="avatar-builder" style="${(s.avatarStyle || 'avataaars') === 'avataaars' ? '' : 'display:none;'}">
            <div class="input-group" style="margin-top:12px;">
              <label class="input-label">Skin Tone</label>
              <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:6px;" id="skin-swatches">
                ${[
                  { hex:'fde8d0', label:'Porcelain' },
                  { hex:'f5cba7', label:'Fair'      },
                  { hex:'e8b48a', label:'Light'     },
                  { hex:'d4956a', label:'Medium'    },
                  { hex:'c0784e', label:'Tan'       },
                ].map(sw => `
                  <div data-skin="${sw.hex}" style="width:32px;height:32px;border-radius:50%;background:#${sw.hex};cursor:pointer;border:3px solid ${(s.avatarSkinColor || 'f5cba7') === sw.hex ? 'var(--aqua)' : 'transparent'};box-shadow:0 0 0 1px rgba(255,255,255,0.2);" title="${sw.label}"></div>
                `).join('')}
              </div>
            </div>

            <div class="input-group" style="margin-top:12px;">
              <label class="input-label">Hair Style</label>
              <select class="input" id="setting-hair-style">
                <option value="shortHairShortFlat"   ${s.avatarHairStyle === 'shortHairShortFlat'   ? 'selected' : ''}>Short Flat</option>
                <option value="shortHairShortWaved"  ${s.avatarHairStyle === 'shortHairShortWaved'  ? 'selected' : ''}>Short Wavy</option>
                <option value="shortHairShortCurly"  ${s.avatarHairStyle === 'shortHairShortCurly'  ? 'selected' : ''}>Short Curly</option>
                <option value="shortHairSides"       ${s.avatarHairStyle === 'shortHairSides'       ? 'selected' : ''}>Sides</option>
                <option value="shortHairDreads01"    ${s.avatarHairStyle === 'shortHairDreads01'    ? 'selected' : ''}>Dreads</option>
                <option value="hat"                  ${s.avatarHairStyle === 'hat'                  ? 'selected' : ''}>Cap</option>
              </select>
            </div>

            <div class="input-group" style="margin-top:12px;">
              <label class="input-label">Facial Hair</label>
              <select class="input" id="setting-facial-hair">
                <option value=""          ${!s.avatarFacialHair                 ? 'selected' : ''}>None</option>
                <option value="light"     ${s.avatarFacialHair === 'light'     ? 'selected' : ''}>Stubble</option>
                <option value="medium"    ${s.avatarFacialHair === 'medium'    ? 'selected' : ''}>Beard</option>
                <option value="majestic"  ${s.avatarFacialHair === 'majestic'  ? 'selected' : ''}>Majestic Beard</option>
                <option value="moustache" ${s.avatarFacialHair === 'moustache' ? 'selected' : ''}>Moustache</option>
              </select>
            </div>

            <div class="input-group" style="margin-top:12px;">
              <label class="input-label">Eyes</label>
              <select class="input" id="setting-eye-type">
                <option value="default"   ${s.avatarEyeType === 'default'   ? 'selected' : ''}>Default</option>
                <option value="happy"     ${s.avatarEyeType === 'happy'     ? 'selected' : ''}>Happy</option>
                <option value="squint"    ${s.avatarEyeType === 'squint'    ? 'selected' : ''}>Squint</option>
                <option value="wink"      ${s.avatarEyeType === 'wink'      ? 'selected' : ''}>Wink</option>
                <option value="surprised" ${s.avatarEyeType === 'surprised' ? 'selected' : ''}>Surprised</option>
                <option value="side"      ${s.avatarEyeType === 'side'      ? 'selected' : ''}>Side Eye</option>
              </select>
            </div>
          </div>
          <div class="input-group" style="margin-top:12px;">
            <label class="input-label">AI Portrait</label>
            <div class="text-xs text-sea mb-8">Generate your own unique beach warrior portrait — every result is different. Upload a selfie for a personalized look, or auto-generate from your stats. Regenerate as many times as you want.</div>

            <!-- Upload tap area -->
            <div id="selfie-upload-area" style="
              position:relative; width:100%; aspect-ratio:1/1; max-width:200px; margin:0 auto 14px;
              border-radius:50%; overflow:hidden; cursor:pointer;
              border:2px dashed var(--glass-border-hi);
              background:var(--glass-mid);
              display:flex; align-items:center; justify-content:center;
              transition:border-color 0.2s, box-shadow 0.2s;
            ">
              ${s.pollinationsPortrait
                ? `<img id="portrait-preview" src="${s.pollinationsPortrait}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
                : `<div style="text-align:center;padding:16px;">
                    <div style="margin-bottom:8px;color:var(--aqua);">${this.Icons.beachUmbrella.replace('width="24" height="24"','width="42" height="42"')}</div>
                    <div class="text-xs text-muted">Tap to upload selfie</div>
                  </div>`
              }
              <div id="selfie-upload-overlay" style="
                position:absolute;inset:0;background:rgba(0,0,0,0.45);
                display:flex;align-items:center;justify-content:center;
                opacity:0;transition:opacity 0.2s;border-radius:50%;
              ">
                <div class="text-xs text-white" style="text-align:center;">
                  <div style="color:#fff;margin-bottom:4px;">${this.Icons.cameraIcon.replace('width="20" height="20"','width="28" height="28"')}</div>
                  <div>Change selfie</div>
                </div>
              </div>
            </div>
            <input type="file" id="selfie-file-input" accept="image/*" capture="user" style="position:absolute;opacity:0;width:0;height:0;pointer-events:none;">

            <!-- Auto-description -->
            <div style="margin-bottom:10px;">
              <div class="text-xs text-muted mb-4" style="font-weight:600;">Auto description (from your stats)</div>
              <div id="portrait-auto-desc" class="text-xs text-sea" style="
                background:var(--glass-light); border:1px solid var(--glass-border);
                border-radius:8px; padding:8px 10px; line-height:1.5; font-style:italic;
              ">${s.selfieDescription ? `<span style="display:inline-flex;align-items:center;gap:4px;vertical-align:middle;">${this.Icons.selfieIcon}</span> <strong>Selfie:</strong> ${s.selfieDescription.substring(0,80)}...` : this._buildAutoPortraitDesc()}</div>
            </div>

            <!-- Custom additions -->
            <div class="input-group" style="margin-bottom:10px;">
              <label class="input-label">Custom additions to prompt</label>
              <input type="text" class="input" id="portrait-custom-text"
                placeholder="e.g. holding a surfboard, sunset background, tattooed…"
                value="${this.escapeHtml(s.portraitCustomText || '')}">
            </div>

            <!-- Style selector -->
            <div class="input-group" style="margin-bottom:12px;">
              <label class="input-label">Portrait style</label>
              <select class="input" id="portrait-style-select">
                <option value="photorealistic" ${(s.portraitStyle||'photorealistic')==='photorealistic'?'selected':''}>Photorealistic</option>
                <option value="anime"          ${s.portraitStyle==='anime'?'selected':''}>Anime</option>
                <option value="watercolor"     ${s.portraitStyle==='watercolor'?'selected':''}>Watercolor</option>
                <option value="oil painting"   ${s.portraitStyle==='oil painting'?'selected':''}>Oil Painting</option>
                <option value="cartoon"        ${s.portraitStyle==='cartoon'?'selected':''}>Cartoon</option>
              </select>
            </div>

            <!-- Actions -->
            <div class="flex gap-8 flex-wrap">
              <button class="btn btn-accent flex-1" id="btn-generate-portrait" style="font-size:0.85rem;font-weight:800;">
                ${s.pollinationsPortrait
                  ? `<span style="display:inline-flex;align-items:center;gap:6px;">${this.Icons.refreshIcon.replace('width="20" height="20"','width="16" height="16"')} Regenerate</span>`
                  : `<span style="display:inline-flex;align-items:center;gap:6px;">${this.Icons.sparkle.replace('width="20" height="20"','width="16" height="16"')} Generate Portrait</span>`}
              </button>
              ${s.pollinationsPortrait ? `
                <button class="btn btn-ghost" id="btn-clear-portrait" style="font-size:0.82rem;color:var(--coral);">Clear</button>
              ` : ''}
            </div>
            <div id="portrait-status" class="text-xs text-sea mt-8" style="display:none;"></div>
          </div>
        </div>

        <!-- Notifications -->
        <div class="section-header">
          <span class="section-title">Notifications</span>
        </div>
        <div class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
            <div>
              <div class="text-sm text-white text-bold">Push Notifications</div>
              <div class="text-xs text-sea mt-2">Allow alerts from TropicalFit</div>
            </div>
            <input type="checkbox" id="setting-notifications" ${s.notificationsEnabled ? 'checked' : ''} style="width:20px;height:20px;accent-color:var(--lagoon);">
          </div>

          <!-- Browser permission status pill -->
          <div id="notif-permission-pill" style="margin-bottom:12px;">
            ${(() => {
              const perm = ('Notification' in window) ? Notification.permission : 'unsupported';
              if (perm === 'granted') return `<span style="display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:20px;background:rgba(0,220,120,0.15);border:1px solid rgba(0,220,120,0.35);font-size:0.72rem;color:#00dc78;font-weight:700;">✓ Browser permission granted</span>`;
              if (perm === 'denied') return `<span style="display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:20px;background:rgba(255,80,60,0.15);border:1px solid rgba(255,80,60,0.35);font-size:0.72rem;color:#ff6050;font-weight:700;">✗ Blocked — enable in browser/OS settings</span>`;
              if (perm === 'unsupported') return `<span style="display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:20px;background:rgba(100,100,100,0.15);border:1px solid rgba(100,100,100,0.35);font-size:0.72rem;color:var(--text-muted);font-weight:700;">Not supported in this browser</span>`;
              return `<span style="display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:20px;background:rgba(255,200,60,0.15);border:1px solid rgba(255,200,60,0.35);font-size:0.72rem;color:#ffc83c;font-weight:700;">⚠ Permission not yet granted — tap the toggle</span>`;
            })()}
          </div>

          <div id="notif-detail-rows" style="${s.notificationsEnabled ? '' : 'opacity:0.4;pointer-events:none;'}">
            <div style="height:1px;background:var(--glass-border);margin:14px 0;"></div>

            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
              <div>
                <div class="text-sm text-white">Daily Reminder</div>
                <div class="text-xs text-sea mt-1">Nudge if you haven't logged yet</div>
              </div>
              <input type="checkbox" id="notif-daily" ${s.notifDailyReminder ? 'checked' : ''} style="width:20px;height:20px;accent-color:var(--lagoon);">
            </div>
            <div id="notif-time-row" style="${s.notifDailyReminder ? '' : 'display:none;'}margin-bottom:12px;">
              <label class="input-label">Reminder Time</label>
              <input type="time" class="input" id="notif-time" value="${s.notifDailyReminderTime || '08:00'}" style="width:140px;">
            </div>

            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
              <div>
                <div class="text-sm text-white">Streak at Risk</div>
                <div class="text-xs text-sea mt-1">Alert at 8pm if your streak is in danger</div>
              </div>
              <input type="checkbox" id="notif-streak" ${s.notifStreakAtRisk ? 'checked' : ''} style="width:20px;height:20px;accent-color:var(--lagoon);">
            </div>

            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
              <div>
                <div class="text-sm text-white">Board Reset</div>
                <div class="text-xs text-sea mt-1">Alert Sunday 9pm before weekly rankings lock</div>
              </div>
              <input type="checkbox" id="notif-board" ${s.notifBoardReset ? 'checked' : ''} style="width:20px;height:20px;accent-color:var(--lagoon);">
            </div>

            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
              <div>
                <div class="text-sm text-white">Chat Messages</div>
                <div class="text-xs text-sea mt-1">Push when someone drops in the chat</div>
              </div>
              <input type="checkbox" id="notif-chat" ${s.notifChatMessages ? 'checked' : ''} style="width:20px;height:20px;accent-color:var(--lagoon);">
            </div>

            <button id="btn-test-notif" style="width:100%;padding:10px;background:rgba(0,200,255,0.1);border:1px solid rgba(0,200,255,0.25);border-radius:var(--radius-md);color:var(--aqua);font-size:0.8rem;font-weight:700;cursor:pointer;font-family:inherit;">
              🔔 Send Test Notification
            </button>
          </div>
        </div>

        <!-- Appearance -->
        <div class="section-header">
          <span class="section-title">Appearance</span>
        </div>
        <div class="card">
          <div class="input-group">
            <label class="input-label">Color Scheme</label>
            <select class="input" id="setting-theme">
              <option value="auto" ${s.theme === 'auto' ? 'selected' : ''}>Auto (System Default)</option>
              <option value="light" ${s.theme === 'light' ? 'selected' : ''}>Bright Beach Day (Light)</option>
              <option value="dark" ${s.theme === 'dark' ? 'selected' : ''}>Sunset Ocean (Dark)</option>
            </select>
          </div>
          <div class="input-group" style="margin-top: 16px;">
            <label class="input-label" style="display:flex; justify-content:space-between; align-items:center;">
              <span>Battery Saver (Disable Animations)</span>
              <input type="checkbox" id="setting-battery-saver" ${s.batterySaver ? 'checked' : ''} style="width:20px;height:20px; accent-color: var(--lagoon);">
            </label>
          </div>
        </div>

        <!-- Workout Defaults -->
        <div class="section-header">
          <span class="section-title">Workout Defaults</span>
        </div>

        <div class="card">
          <div class="input-group">
            <label class="input-label">Sets Per Exercise</label>
            <div class="flex gap-8" style="align-items: center;">
              <button class="btn btn-small btn-ghost" data-adjust="defaultSetsPerExercise" data-dir="-1">−</button>
              <span class="text-lg text-extra-bold text-white flex-1 text-center" id="val-defaultSetsPerExercise">${s.defaultSetsPerExercise}</span>
              <button class="btn btn-small btn-ghost" data-adjust="defaultSetsPerExercise" data-dir="1">+</button>
            </div>
          </div>

          <div class="input-group">
            <label class="input-label">Rest Between Sets (seconds)</label>
            <div class="flex gap-8" style="align-items: center;">
              <button class="btn btn-small btn-ghost" data-adjust="defaultRestBetweenSets" data-dir="-15">−15</button>
              <span class="text-lg text-extra-bold text-white flex-1 text-center" id="val-defaultRestBetweenSets">${s.defaultRestBetweenSets}s</span>
              <button class="btn btn-small btn-ghost" data-adjust="defaultRestBetweenSets" data-dir="15">+15</button>
            </div>
          </div>

          <div class="input-group">
            <label class="input-label">Rest Between Exercises (seconds)</label>
            <div class="flex gap-8" style="align-items: center;">
              <button class="btn btn-small btn-ghost" data-adjust="defaultRestBetweenExercises" data-dir="-15">−15</button>
              <span class="text-lg text-extra-bold text-white flex-1 text-center" id="val-defaultRestBetweenExercises">${s.defaultRestBetweenExercises}s</span>
              <button class="btn btn-small btn-ghost" data-adjust="defaultRestBetweenExercises" data-dir="15">+15</button>
            </div>
          </div>

          <div class="input-group">
            <label class="input-label">Weight Unit</label>
            <select class="input" id="setting-weight-unit">
              <option value="lbs" ${s.defaultWeightUnit === 'lbs' ? 'selected' : ''}>Pounds (lbs)</option>
              <option value="kg" ${s.defaultWeightUnit === 'kg' ? 'selected' : ''}>Kilograms (kg)</option>
            </select>
          </div>
        </div>

        <!-- AI Setup -->
        <div class="section-header">
          <span class="section-title">AI Setup</span>
        </div>
        <div class="card">
          <div class="input-group">
            <label class="input-label">Gemini API Key</label>
            <input type="password" class="input" placeholder="Paste your key from aistudio.google.com"
                   id="setting-api-key" value="${s.geminiApiKey || ''}">
            <div class="text-xs text-sea mt-4">Free at aistudio.google.com → Get API Key</div>
          </div>
        </div>

        <!-- Exercise Library -->
        <div class="section-header">
          <span class="section-title">Exercise Library</span>
        </div>
        <div class="card">
          <div class="flex flex-between" style="align-items: center; margin-bottom: 12px;">
            <div class="text-sm text-sea">${this.exercises.length} exercises saved</div>
            <button class="btn btn-small btn-ghost" id="btn-manage-exercises" style="color: var(--aqua); border: 1px solid var(--aqua-dim);">Combine Duplicates</button>
          </div>
          <div class="text-xs text-muted">Merge duplicate exercises to clean up your history and stats.</div>
        </div>

        <!-- Custom Fields -->
        <div class="section-header">
          <span class="section-title">Custom Fields</span>
          <button class="section-action" id="btn-add-custom-field">Add Field</button>
        </div>
        <div class="card">
          ${s.customFieldTemplates && s.customFieldTemplates.length > 0 ? `
            ${s.customFieldTemplates.map((f, i) => `
              <div class="flex flex-between mb-8" style="align-items: center;">
                <div>
                  <div class="text-sm text-white">${f.name}</div>
                  <div class="text-xs text-sea">${f.type}${f.options ? ': ' + f.options.join(', ') : ''}</div>
                </div>
                <button class="btn btn-small btn-ghost" data-remove-field="${i}">✕</button>
              </div>
            `).join('')}
          ` : `
            <div class="text-sm text-sea">No custom fields. Add fields like Tempo, Grip, Mood, etc.</div>
          `}
        </div>

        <!-- Data -->
        <div class="section-header">
          <span class="section-title">Data</span>
        </div>
        <div class="card">
          <button class="btn btn-ghost w-full mb-8" id="btn-export-json">Export All Data (JSON)</button>
          <button class="btn btn-ghost w-full mb-8" id="btn-export-csv">Export Workouts (CSV)</button>
          <button class="btn btn-ghost w-full mb-8" id="btn-import-data">Import Data</button>
          <input type="file" id="import-file-input" accept=".json" style="position:absolute;opacity:0;width:0;height:0;pointer-events:none;">
          <button class="btn btn-ghost w-full mb-8" id="btn-upload-workout-file" style="display:flex; justify-content:center; align-items:center; gap:8px;">
            ${this.Icons.plus} Import images or other files for workout logs
          </button>
          <input type="file" id="workout-file-input" accept=".txt,.csv,.json,image/*" style="position:absolute;opacity:0;width:0;height:0;pointer-events:none;">
          <div class="divider"></div>
          <button class="btn btn-danger btn-small w-full mt-8" id="btn-clear-all-data">Clear All Data</button>
        </div>

        <div style="padding: 16px;">
          <button class="btn btn-ghost w-full" id="btn-save-settings">Save Settings</button>
        </div>

        <div style="text-align:center; padding: 8px 16px 8px; color: var(--text-muted); font-size: 0.72rem; letter-spacing: 0.05em;">
          TropicalFit ${APP_VERSION}
        </div>
        <div style="padding: 0 16px 32px;">
          <button class="btn btn-ghost w-full" id="btn-force-update" style="font-size:0.82rem;opacity:0.7;display:flex;align-items:center;justify-content:center;gap:8px;">
            ${this.Icons.refreshIcon} Force Update App
          </button>
        </div>
      </div>
    `;
  },

  // ─── EXERCISE LIBRARY SCREEN ──────────────────────────────
  renderExerciseLibrary() {
    const sorted = [...this.exercises].sort((a, b) => (b.timesUsed || 0) - (a.timesUsed || 0));

    return `
      <div class="header">
        <button class="header-back" id="btn-back-settings">${this.Icons.back}</button>
        <span class="header-title">Exercise Library</span>
        <button class="header-action" id="btn-add-exercise-lib">${this.Icons.plus}</button>
      </div>
      <div class="search-bar">
        <span class="search-bar-icon" style="padding-left:12px;">${this.Icons.stats}</span>
        <input type="text" class="input" placeholder="Search exercises..." id="exercise-search">
      </div>
      <div id="exercise-list">
        ${sorted.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state-icon">${this.Icons.dumbbell}</div>
            <div class="empty-state-title">No Exercises Yet</div>
            <div class="empty-state-text">Exercises are added automatically when you work out, or add them manually.</div>
          </div>
        ` : sorted.map(ex => `
          <div class="exercise-item" data-exercise-id="${ex.id}">
            <div class="exercise-item-icon" id="icon-${ex.id}">
              ${ex.icon ? `<img src="${ex.icon}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">` : this.Icons.person}
            </div>
            <div class="exercise-item-info">
              <div class="exercise-item-name">${ex.name}</div>
              <div class="exercise-item-meta">
                ${ex.muscleGroups ? ex.muscleGroups.join(', ') : 'No muscle group'}
                ${ex.timesUsed ? ' • Used ' + ex.timesUsed + 'x' : ''}
              </div>
            </div>
            <span class="exercise-item-arrow">›</span>
          </div>
        `).join('')}
      </div>
    `;
  },

  // ─── WORKOUT DETAIL SCREEN ────────────────────────────────
  renderWorkoutDetail(data) {
    const w = data.workout;
    if (!w) return this.renderLogs();

    const date = new Date(w.date);
    const dateStr = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const totalVolume = w.exercises.reduce((sum, ex) =>
      sum + this._exVol(ex), 0);

    return `
      <div class="header">
        <button class="header-back" id="btn-back-history">${this.Icons.back}</button>
        <span class="header-title">${w.title || dateStr}</span>
        <div style="display:flex;gap:6px;">
          <button class="header-action" id="btn-edit-workout" data-id="${w.id}" style="color:var(--aqua);" title="Edit workout">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="header-action" id="btn-delete-workout" data-id="${w.id}">${this.Icons.trash}</button>
        </div>
      </div>
      <div class="fade-in">
        <div class="p-16">
          <div class="text-sm text-sea">${dateStr} • ${timeStr}</div>
          ${w.duration ? `<div class="text-sm text-sea">Duration: ${Math.round(w.duration / 60)} minutes</div>` : ''}
          <div class="text-sm text-sunset mt-4">Total Volume: ${totalVolume.toLocaleString()} ${this.settings.defaultWeightUnit}</div>
        </div>

        ${w.notes ? `
          <div class="card">
            <div class="card-title">Notes</div>
            <div class="text-sm text-sand">${this.escapeHtml(w.notes)}</div>
          </div>
        ` : ''}

        ${w.tags && w.tags.length > 0 ? `
          <div class="flex gap-4 mx-16 mb-8 flex-wrap">
            ${w.tags.map(t => `<span class="tag">#${t}</span>`).join('')}
          </div>
        ` : ''}

        ${w.exercises.map(ex => `
          <div class="card card-tappable" data-tap-exercise="${ex.name}">
            <div class="text-bold text-white mb-8">${ex.name}</div>
            ${ex.notes ? `<div class="text-xs text-sea mb-8">${this.escapeHtml(ex.notes)}</div>` : ''}
            ${ex.sets.map((s, i) => `
              <div class="flex gap-8 mb-4" style="align-items: center;">
                <div class="set-number completed" style="width:24px; height:24px; font-size:0.7rem;">${i + 1}</div>
                <span class="text-sm text-white">${s.weight} ${s.weightUnit || this.settings.defaultWeightUnit} × ${s.reps}</span>
                ${s.rpe ? `<span class="text-xs text-sunset">RPE ${s.rpe}</span>` : ''}
                ${s.notes ? `<span class="text-xs text-sea">${s.notes}</span>` : ''}
              </div>
            `).join('')}
          </div>
        `).join('')}

        ${w.aiAnalysis ? `
          <div class="card card-highlight">
            <div class="card-title">Coach Analysis</div>
            <div class="text-sm text-sand" style="white-space: pre-wrap;">${this.escapeHtml(w.aiAnalysis)}</div>
          </div>
        ` : ''}

        <div class="p-16">
          <button class="btn btn-primary btn-large mb-8" id="btn-analyze-detail" data-id="${w.id}">
            ${w.aiAnalysis ? 'Re-Analyze' : 'Coach Analysis'}
          </button>
          <button class="btn btn-ghost btn-large" id="btn-back-history-2">${this.Icons.back} Back</button>
        </div>

        <div style="height: 20px;"></div>
      </div>
    `;
  },

  // ─── PROFILE SCREEN ───────────────────────────────────────
  renderProfile() {
    const p = this.profile;
    const s = this.settings;
    const levelInfo = this.getLevelInfo(p.xp);
    const avatarSrc = s.pollinationsPortrait || this._getAvatarUrl();
    const weekVol = this.getWeekVolume();
    const prCount = Object.keys(p.personalRecords || {}).length;
    const topPRs = Object.entries(p.personalRecords || {})
      .slice(0, 5)
      .map(([name, pr]) => ({ name, weight: pr.maxWeight?.value || 0, unit: pr.maxWeight?.unit || s.defaultWeightUnit }));

    return `
      <div class="header">
        <button class="header-back" id="btn-back-home">${this.Icons.back}</button>
        <span class="header-title">Island Profile</span>
        <button class="header-action" id="btn-edit-profile">Edit</button>
      </div>
      <div class="fade-in">

        <!-- Hero -->
        <div style="display:flex;flex-direction:column;align-items:center;padding:28px 16px 20px;gap:12px;">
          <div class="character-wrap" style="width:96px;height:96px;">
            <img src="${avatarSrc}" alt="avatar"
              class="character-avatar ${this._getAvatarRingClass(levelInfo.level)}"
              style="width:96px;height:96px;object-fit:cover;">
            <div class="character-level-badge">Lv ${levelInfo.level}</div>
          </div>
          <div style="text-align:center;">
            <div class="text-xl text-extra-bold text-white">${s.username || 'Island Warrior'}</div>
            <div class="text-sm text-aqua mt-2">${levelInfo.title}</div>
          </div>
        </div>

        <!-- XP Bar -->
        <div style="padding:0 16px 16px;">
          <div class="xp-bar-container" style="margin:0;">
            <div class="xp-bar-header">
              <span class="text-xs text-sea">${p.xp} XP</span>
              <span class="text-xs text-sea">${levelInfo.nextXp} XP to Lv ${levelInfo.level + 1}</span>
            </div>
            <div class="xp-bar">
              <div class="xp-bar-fill" style="width: ${levelInfo.progress}%"></div>
            </div>
          </div>
        </div>

        <!-- Hero Stats -->
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:0 16px 16px;">
          <div class="card" style="padding:12px 8px;text-align:center;">
            <div class="text-xl text-extra-bold text-white">${p.totalWorkouts}</div>
            <div class="text-xs text-sea mt-2">Sessions</div>
          </div>
          <div class="card" style="padding:12px 8px;text-align:center;">
            <div class="text-xl text-extra-bold text-aqua">${p.currentStreak}</div>
            <div class="text-xs text-sea mt-2">Streak</div>
          </div>
          <div class="card" style="padding:12px 8px;text-align:center;">
            <div class="text-xl text-extra-bold text-sunset">${prCount}</div>
            <div class="text-xs text-sea mt-2">PRs Set</div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;padding:0 16px 16px;">
          <div class="card" style="padding:12px;text-align:center;">
            <div class="text-bold text-white">${this.formatVolume(weekVol)}</div>
            <div class="text-xs text-sea mt-2">${s.defaultWeightUnit} this week</div>
          </div>
          <div class="card" style="padding:12px;text-align:center;">
            <div class="text-bold text-white">${this.formatVolume(p.totalVolume)}</div>
            <div class="text-xs text-sea mt-2">${s.defaultWeightUnit} all time</div>
          </div>
        </div>

        <!-- Personal Records -->
        ${prCount > 0 ? `
          <div class="section-header">
            <span class="section-title">Top PRs</span>
          </div>
          <div class="card" style="padding:0;overflow:hidden;">
            ${topPRs.map(pr => `
              <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid var(--glass-border);">
                <div class="text-sm text-white text-bold">${pr.name}</div>
                <div class="text-sm text-aqua text-bold">${pr.weight} ${pr.unit}</div>
              </div>
            `).join('')}
            ${prCount > 5 ? `<div class="text-center text-xs text-sea" style="padding:10px;">+${prCount - 5} more in logs</div>` : ''}
          </div>
        ` : `
          <div class="card" style="text-align:center;padding:24px;">
            <div class="text-sm text-sea">Complete workouts to start setting PRs</div>
          </div>
        `}

        <!-- Member Since -->
        <div class="text-center text-xs text-muted" style="padding:20px 0 8px;">
          Riding the island since ${new Date(p.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>
        <div style="height:24px;"></div>
      </div>
    `;
  },

  // ─── USER PROFILE VIEWER (other users) ────────────────────
  renderUserProfile(data = {}) {
    const u = data.user || {};
    const av = u.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username || 'unknown'}&backgroundColor=b6e3f4,c0aede,d1d4f9&mouth=smile,twinkle&top=shortHair,shortHairShortFlat`;
    const levelInfo = this.getLevelInfo((u.level || 1) * 500); // Or use their actual XP if we passed it
    const totalVol = u.totalVolume || 0;
    const fmt = (v) => v >= 1000 ? (v / 1000).toFixed(1) + 'k' : String(v);
    
    // Calculate their streak
    let streak = 0;
    const history = u.history || [];
    if (history.length > 0) {
      const dates = [...new Set(history.map(d => new Date(d).toDateString()))].sort((a,b) => new Date(b) - new Date(a));
      let current = new Date();
      current.setHours(0,0,0,0);
      let dayCheck = new Date(dates[0]);
      dayCheck.setHours(0,0,0,0);
      
      const diff = (current - dayCheck) / 86400000;
      if (diff <= 4) { // allow grace period
        streak = 1;
        for (let i = 1; i < dates.length; i++) {
          const d1 = new Date(dates[i-1]); d1.setHours(0,0,0,0);
          const d2 = new Date(dates[i]);   d2.setHours(0,0,0,0);
          if ((d1 - d2) / 86400000 <= 4) streak++;
          else break;
        }
      }
    }

    // Compute their muscle heatmap data
    let muscleData = {};
    const recentExercises = u.recentExercises || [];
    recentExercises.forEach(jsonStr => {
      try {
        const exercises = JSON.parse(jsonStr);
        exercises.forEach(ex => {
          const mg = this.getMuscleGroupsForExercise(ex);
          // Only count sets that have data, or all if we can't tell easily
          const count = ex.sets ? (ex.sets.filter(s => s.completed || s.weight || s.reps).length || ex.sets.length) : 0;
          if (count > 0) {
            mg.forEach(m => {
              if (!muscleData[m]) muscleData[m] = 0;
              muscleData[m] += count;
            });
          }
        });
      } catch(e) {}
    });

    return `
      <div class="header">
        <button class="header-back" id="btn-back-social">${this.Icons.back}</button>
        <span class="header-title">${u.username || 'Unknown'}</span>
      </div>
      <div class="fade-in">

        <!-- Hero -->
        <div style="display:flex;flex-direction:column;align-items:center;padding:28px 16px 20px;gap:12px;">
          <div class="character-wrap" style="width:88px;height:88px;">
            <img src="${av}" alt="${u.username || 'user'}"
              class="character-avatar ${this._getAvatarRingClass(u.level || 1)}"
              style="width:88px;height:88px;object-fit:cover;">
            <div class="character-level-badge">Lv ${u.level || 1}</div>
          </div>
          <div style="text-align:center;">
            <div class="text-xl text-extra-bold text-white">${u.username || 'Unknown'}</div>
            <div class="text-sm text-aqua mt-2">${u.levelTitle || levelInfo.title}</div>
          </div>
        </div>

        <!-- Stats -->
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:0 16px 16px;">
          <div class="card" style="padding:12px 8px;text-align:center;">
            <div class="text-xl text-extra-bold text-white">${fmt(totalVol)}</div>
            <div class="text-xs text-sea mt-2">Lifetime Lbs</div>
          </div>
          <div class="card" style="padding:12px 8px;text-align:center;">
            <div class="text-xl text-extra-bold text-aqua">${u.sessions || 0}</div>
            <div class="text-xs text-sea mt-2">Sessions</div>
          </div>
          <div class="card" style="padding:12px 8px;text-align:center;">
            <div class="text-xl text-extra-bold text-sunset">${streak}</div>
            <div class="text-xs text-sea mt-2">Streak</div>
          </div>
        </div>

        <!-- Muscle activity heatmap -->
        <div class="section-header"><span class="section-title">Muscle Heatmap</span></div>
        <div class="card" style="padding:16px 12px;margin-bottom:16px;">
          ${Object.keys(muscleData).length === 0 ? `
            <div class="text-sm text-sea" style="padding:8px;text-align:center;">No workouts in the last 30 days</div>
          ` : `
            <div class="text-xs text-sea" style="margin-bottom:12px;">Last 30 days · brighter = more sets</div>
            ${this._buildBodyHeatmap(muscleData)}
          `}
        </div>

        <!-- Heatmap -->
        <div class="section-header" style="margin-top:8px;"><span class="section-title">Consistency Heatmap</span></div>
        <div class="card" style="overflow:hidden;margin-bottom:24px;">
          ${this._buildCalendarHTML(true, history)}
        </div>
        
        <!-- Nudge -->
        ${streak === 0 && history.length > 0 && ((new Date() - new Date(history[0])) / 86400000 > 2) ? `
          <div style="padding: 0 16px 16px;">
            <button id="btn-nudge-user" class="btn btn-accent" style="width:100%;">
              Nudge to Workout
            </button>
            <div class="text-xs text-center text-sea mt-8">Send them a push notification to get back in the gym.</div>
          </div>
        ` : ''}

        <div style="height:24px;"></div>
      </div>
    `;
  },

  // ─── FILE UPLOAD SCREEN ───────────────────────────────────
  renderFileUpload() {
    return `
      <div class="header">
        <button class="header-back" id="btn-back-chat">${this.Icons.back}</button>
        <span class="header-title">Upload Workout Log</span>
      </div>
      <div class="fade-in p-16">
        <div class="text-center mb-16">
          <div style="font-size: 3rem;">Logs</div>
          <div class="text-bold text-white mt-8">Upload a Workout Log</div>
          <div class="text-sm text-sea mt-4">
            Upload a text file, CSV, JSON, or photo of a handwritten log.
            AI will parse it and add workouts to your history.
          </div>
        </div>

        <button class="btn btn-accent btn-large mb-8" id="btn-select-file-upload">
          Select File
        </button>
        <input type="file" id="ai-file-input" accept=".txt,.csv,.json,.md,image/*" style="position:absolute;opacity:0;width:0;height:0;pointer-events:none;">

        <div id="file-upload-status" class="hidden">
          <div class="card mt-16">
            <div class="flex gap-8" style="align-items: center;">
              <div class="spinner"></div>
              <div class="text-sm text-sand">AI is reading your file...</div>
            </div>
          </div>
        </div>

        <div id="file-upload-result" class="hidden"></div>
      </div>
    `;
  },

  // ─── EVENT BINDING ─────────────────────────────────────────
  bindScreenEvents(screen, data) {
    // Universal back buttons
    this.bindClick('btn-back-home', () => this.showScreen('home'));
    this.bindClick('btn-back-settings', () => this.showScreen('settings'));
    this.bindClick('btn-back-history', () => this.showScreen('logs'));
    this.bindClick('btn-back-history-2', () => this.showScreen('logs'));
    this.bindClick('btn-back-chat', () => this.showScreen('chat'));
    this.bindClick('btn-back-social', () => this.showScreen('social'));

    switch (screen) {
      case 'home':
        this.bindClick('btn-start-workout', () => this.showScreen('startWorkout'));
        this.bindClick('btn-settings', () => this.showScreen('settings'));
        this.bindClick('btn-profile', () => this.showScreen('profile'));
        this.bindClick('btn-go-social', () => this.showScreen('social'));
        this.bindClick('btn-go-chat', () => this.showScreen('social'));
        this.bindClick('btn-resume-workout', () => this.showScreen('activeWorkout'));
        this.bindClick('btn-go-profile-char', () => this.showScreen('settings'));
        this.bindClick('btn-go-profile', () => this.showScreen('settings'));
        this.bindClick('btn-notif', () => this._showNotifPanel());

        // Load mini leaderboard + feed for home screen
        this._fetchLeaderboard().then(d => this._populateHomeLb(d?.users || d || []));
        this._fetchFeed().then(d => this._populateHomeFeed(d?.items || d || []));

        // Tappable stats → AI chat
        this.bindClick('tap-streak', () => this.openAIChat(`I have a ${this.profile.currentStreak} day workout streak. Give me motivation and evidence-based recovery tips to keep going!`));
        this.bindClick('tap-xp', () => this.openAIChat(`I'm level ${this.getLevelInfo(this.profile.xp).level} with ${this.profile.xp} XP. Here's my workout summary: ${this.profile.totalWorkouts} total workouts, ${this.profile.totalVolume} total volume. How am I progressing overall?`));
        this.bindClick('tap-total-workouts', () => this.openAIChat(`I've completed ${this.profile.totalWorkouts} workouts total. Analyze my consistency and give evidence-based advice.`));
        this.bindClick('tap-total-volume', () => this.openAIChat(`My total lifetime volume is ${this.profile.totalVolume} ${this.settings.defaultWeightUnit}. What does this mean for my progress?`));
        this.bindClick('tap-longest-streak', () => this.openAIChat(`My longest streak is ${this.profile.longestStreak} days. What does research say about training frequency and consistency?`));

        // Tappable PR cards
        document.querySelectorAll('[data-pr-exercise]').forEach(el => {
          el.addEventListener('click', () => {
            const name = el.dataset.prExercise;
            this.openAIChat(`Analyze my ${name} progress. Here's my full history for this exercise.`, name);
          });
        });

        // Tappable week bars
        document.querySelectorAll('.week-bar-container[data-workout-id]').forEach(el => {
          el.addEventListener('click', () => {
            const wId = el.dataset.workoutId;
            if (wId) {
              const w = this.workouts.find(w => w.id === wId);
              if (w) this.showScreen('workoutDetail', { workout: w });
            }
          });
        });
        break;

      case 'startWorkout':
        this.bindClick('btn-begin-workout', () => this.beginWorkout());
        this.setupTagInput();
        break;

      case 'activeWorkout':
        this.bindClick('btn-cancel-workout', () => this.cancelWorkout());
        this.bindClick('btn-finish-workout', () => this.finishWorkout());
        this.bindClick('btn-add-exercise', () => this.showExercisePicker());
        this.bindClick('btn-workout-notes', () => this.showWorkoutNotesModal());
        this.bindSetInputs();
        this.bindSetCompleteButtons();
        this.bindAddSetButtons();
        this.bindRemoveSetButtons();
        this.bindExerciseMenus();
        this.startElapsedTimer();
        break;

      case 'restTimer':
        this.startRestTimer(data);
        this.bindClick('btn-timer-skip', () => Timer.skip());
        this.bindClick('btn-timer-minus15', () => this.adjustTimer(-15));
        this.bindClick('btn-timer-plus15', () => this.adjustTimer(15));
        break;

      case 'workoutComplete':
        this.bindClick('btn-back-home-complete', () => this.showScreen('home'));
        this.bindClick('btn-ai-analyze', () => this.analyzeLastWorkout());
        this.bindClick('btn-add-post-notes', () => this.showPostWorkoutNotes());
        break;

      case 'chat':
        this.bindClick('btn-chat-send', () => this.sendChatMessage());
        this.bindClick('btn-chat-menu', () => this.showChatMenu());
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
          chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); this.sendChatMessage(); }
          });
          // Defer focus so iOS has time to finish compositing the DOM before
          // showing the keyboard — a single rAF is often swallowed, double-rAF isn't
          requestAnimationFrame(() => requestAnimationFrame(() => {
            chatInput.focus();
            if (data.prefill) chatInput.select();
          }));
        }
        // Scroll to bottom + bind copy on long-press
        const msgs = document.getElementById('chat-messages');
        if (msgs) {
          // Use requestAnimationFrame to ensure DOM has painted before scrolling
          requestAnimationFrame(() => { msgs.scrollTop = msgs.scrollHeight; });
          this._bindAiChatCopy(msgs);
        }
        document.querySelectorAll('[data-chip]').forEach(chip => {
          chip.addEventListener('click', () => {
            const input = document.getElementById('chat-input');
            if (input) { input.value = chip.dataset.chip; input.focus(); }
          });
        });
        break;

      case 'settings':
        this.bindSettingsEvents();
        // Add real-time auto-save for API Key
        const apiKeyInput = document.getElementById('setting-api-key');
        if (apiKeyInput) {
          apiKeyInput.addEventListener('input', (e) => {
            const val = e.target.value.trim();
            this.settings.geminiApiKey = val;
            DB.saveSetting('geminiApiKey', val);
          });
        }
        // Add real-time theme preview and save
        const themeSelect = document.getElementById('setting-theme');
        if (themeSelect) {
          themeSelect.addEventListener('change', (e) => {
            const val = e.target.value;
            this.settings.theme = val;
            DB.saveSetting('theme', val);
            this.applyTheme();
          });
        }
        
        const batterySaverToggle = document.getElementById('setting-battery-saver');
        if (batterySaverToggle) {
          batterySaverToggle.addEventListener('change', (e) => {
            const val = e.target.checked;
            this.settings.batterySaver = val;
            DB.saveSetting('batterySaver', val);
            this.applyTheme();
          });
        }
        // Username live save
        const usernameInput = document.getElementById('setting-username');
        if (usernameInput) {
          usernameInput.addEventListener('input', (e) => {
            const newVal = e.target.value.trim();
            // Keep avatarSeed in sync if it was matching the old username
            if (this.settings.avatarSeed === this.settings.username) {
              this.settings.avatarSeed = newVal;
              DB.saveSetting('avatarSeed', newVal);
            }
            this.settings.username = newVal;
            DB.saveSetting('username', this.settings.username);
            // Debounced server sync so typo names don't flood the API
            clearTimeout(this._usernameSyncTimer);
            this._usernameSyncTimer = setTimeout(() => this._syncProfileToServer(), 1200);
          });
        }
        const avatarStyleSelect = document.getElementById('setting-avatar-style');
        if (avatarStyleSelect) {
          avatarStyleSelect.addEventListener('change', (e) => {
            this.settings.avatarStyle = e.target.value;
            DB.saveSetting('avatarStyle', this.settings.avatarStyle);
            const builder = document.getElementById('avatar-builder');
            if (builder) builder.style.display = e.target.value === 'avataaars' ? '' : 'none';
            const av = document.querySelector('.header + .fade-in img, img[alt="avatar"]');
            if (av) av.src = this._getAvatarUrl();
            clearTimeout(this._avatarSyncTimer);
            this._avatarSyncTimer = setTimeout(() => this._syncProfileToServer(), 1500);
          });
        }
        // Skin tone swatches
        document.querySelectorAll('[data-skin]').forEach(sw => {
          sw.addEventListener('click', () => {
            const hex = sw.dataset.skin;
            this.settings.avatarSkinColor = hex;
            DB.saveSetting('avatarSkinColor', hex);
            document.querySelectorAll('[data-skin]').forEach(s => s.style.borderColor = 'transparent');
            sw.style.borderColor = 'var(--aqua)';
            const av = document.getElementById('avatar-preview-img');
            if (av) av.src = this._getAvatarUrl();
            clearTimeout(this._avatarSyncTimer);
            this._avatarSyncTimer = setTimeout(() => this._syncProfileToServer(), 1500);
          });
        });
        // Hair style
        const hairSelect = document.getElementById('setting-hair-style');
        if (hairSelect) {
          hairSelect.addEventListener('change', (e) => {
            this.settings.avatarHairStyle = e.target.value;
            DB.saveSetting('avatarHairStyle', e.target.value);
            const av = document.getElementById('avatar-preview-img');
            if (av) av.src = this._getAvatarUrl();
            clearTimeout(this._avatarSyncTimer);
            this._avatarSyncTimer = setTimeout(() => this._syncProfileToServer(), 1500);
          });
        }
        // Facial hair
        const facialHairSelect = document.getElementById('setting-facial-hair');
        if (facialHairSelect) {
          facialHairSelect.addEventListener('change', (e) => {
            this.settings.avatarFacialHair = e.target.value;
            DB.saveSetting('avatarFacialHair', e.target.value);
            const av = document.getElementById('avatar-preview-img');
            if (av) av.src = this._getAvatarUrl();
            clearTimeout(this._avatarSyncTimer);
            this._avatarSyncTimer = setTimeout(() => this._syncProfileToServer(), 1500);
          });
        }
        // Eye type
        const eyeSelect = document.getElementById('setting-eye-type');
        if (eyeSelect) {
          eyeSelect.addEventListener('change', (e) => {
            this.settings.avatarEyeType = e.target.value;
            DB.saveSetting('avatarEyeType', e.target.value);
            const av = document.getElementById('avatar-preview-img');
            if (av) av.src = this._getAvatarUrl();
            clearTimeout(this._avatarSyncTimer);
            this._avatarSyncTimer = setTimeout(() => this._syncProfileToServer(), 1500);
          });
        }
        // Portrait: tap upload area to pick selfie
        const selfieUploadArea = document.getElementById('selfie-upload-area');
        const selfieInput = document.getElementById('selfie-file-input');
        if (selfieUploadArea && selfieInput) {
          // Hover overlay show/hide
          selfieUploadArea.addEventListener('mouseenter', () => {
            const ov = selfieUploadArea.querySelector('#selfie-upload-overlay');
            if (ov) ov.style.opacity = '1';
          });
          selfieUploadArea.addEventListener('mouseleave', () => {
            const ov = selfieUploadArea.querySelector('#selfie-upload-overlay');
            if (ov) ov.style.opacity = '0';
          });
          selfieUploadArea.addEventListener('click', () => selfieInput.click());
          selfieInput.addEventListener('change', (e) => {
            const file = e.target.files?.[0];
            if (file) this._generatePortraitFromSelfie(file);
          });
        }

        // Portrait custom text live-save
        const customTextInput = document.getElementById('portrait-custom-text');
        if (customTextInput) {
          customTextInput.addEventListener('input', (e) => {
            this.settings.portraitCustomText = e.target.value;
            DB.saveSetting('portraitCustomText', e.target.value);
          });
        }

        // Portrait style live-save
        const styleSelect = document.getElementById('portrait-style-select');
        if (styleSelect) {
          styleSelect.addEventListener('change', (e) => {
            this.settings.portraitStyle = e.target.value;
            DB.saveSetting('portraitStyle', e.target.value);
          });
        }

        // Generate / Regenerate button
        const btnGenPortrait = document.getElementById('btn-generate-portrait');
        if (btnGenPortrait) {
          btnGenPortrait.addEventListener('click', () => this._doGeneratePortrait(this.settings.selfieDescription || null));
        }

        // Clear button
        const btnClearPortrait = document.getElementById('btn-clear-portrait');
        if (btnClearPortrait) {
          btnClearPortrait.addEventListener('click', () => {
            this.settings.pollinationsPortrait = '';
            this.settings.selfieDescription = '';
            DB.saveSetting('pollinationsPortrait', '');
            DB.saveSetting('selfieDescription', '');
            this.showScreen('settings');
          });
        }

        const notifToggle = document.getElementById('setting-notifications');
        if (notifToggle) {
          notifToggle.addEventListener('change', async (e) => {
            if (e.target.checked) {
              // If already denied in browser, warn user — requestPermission won't re-prompt
              if (Notification.permission === 'denied') {
                e.target.checked = false;
                this.showToast('Notifications blocked — go to your browser/OS Settings and allow TropicalFit notifications, then try again.');
                return;
              }
              const perm = await Notification.requestPermission();
              const val = perm === 'granted';
              e.target.checked = val;
              this.settings.notificationsEnabled = val;
              DB.saveSetting('notificationsEnabled', val);
              if (val) {
                // Enable default sub-types on first grant so something actually fires
                if (!this.settings.notifDailyReminder && !this.settings.notifStreakAtRisk) {
                  ['notifDailyReminder','notifStreakAtRisk','notifBoardReset'].forEach(k => {
                    this.settings[k] = true;
                    DB.saveSetting(k, true);
                  });
                  if (!this.settings.notifDailyReminderTime) {
                    this.settings.notifDailyReminderTime = '08:00';
                    DB.saveSetting('notifDailyReminderTime', '08:00');
                  }
                  // Reflect in visible checkboxes without re-rendering
                  ['notif-daily','notif-streak','notif-board'].forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.checked = true;
                  });
                  const tr = document.getElementById('notif-time-row');
                  if (tr) tr.style.display = '';
                }
                await this.subscribeToPush();
                this._scheduleLocalNotifications();
                // Fire a test notification immediately so user sees it worked
                setTimeout(() => this._fireLocalNotif(
                  'TropicalFit Notifications On',
                  'Streak alerts and daily reminders are now active.',
                  'notif-test'
                ), 500);
              }
              const rows = document.getElementById('notif-detail-rows');
              if (rows) rows.style.cssText = val ? '' : 'opacity:0.4;pointer-events:none;';
            } else {
              this.settings.notificationsEnabled = false;
              DB.saveSetting('notificationsEnabled', false);
              const rows = document.getElementById('notif-detail-rows');
              if (rows) rows.style.cssText = 'opacity:0.4;pointer-events:none;';
            }
          });
        }
        // Per-type notification toggles
        const bindNotifToggle = (id, key) => {
          const el = document.getElementById(id);
          if (!el) return;
          el.addEventListener('change', (e) => {
            this.settings[key] = e.target.checked;
            DB.saveSetting(key, e.target.checked);
            if (key === 'notifDailyReminder') {
              const tr = document.getElementById('notif-time-row');
              if (tr) tr.style.display = e.target.checked ? '' : 'none';
            }
            this._scheduleLocalNotifications();
          });
        };
        bindNotifToggle('notif-daily',  'notifDailyReminder');
        bindNotifToggle('notif-streak', 'notifStreakAtRisk');
        bindNotifToggle('notif-board',  'notifBoardReset');
        bindNotifToggle('notif-chat',   'notifChatMessages');
        const notifTimeInput = document.getElementById('notif-time');
        if (notifTimeInput) {
          notifTimeInput.addEventListener('change', (e) => {
            this.settings.notifDailyReminderTime = e.target.value;
            DB.saveSetting('notifDailyReminderTime', e.target.value);
            this._scheduleLocalNotifications();
          });
        }
        // Test notification button
        this.bindClick('btn-test-notif', async () => {
          if (Notification.permission !== 'granted') {
            this.showToast('Grant notification permission first using the toggle above.');
            return;
          }
          await this._fireLocalNotif(
            'TropicalFit Test 🏖️',
            'Notifications are working! Streak alerts and reminders are active.',
            'notif-test'
          );
          this.showToast('Test notification sent!');
        });
        // Update permission pill without re-render when user grants via toggle
        const _updatePermPill = () => {
          const pill = document.getElementById('notif-permission-pill');
          if (!pill || !('Notification' in window)) return;
          const perm = Notification.permission;
          if (perm === 'granted') pill.innerHTML = `<span style="display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:20px;background:rgba(0,220,120,0.15);border:1px solid rgba(0,220,120,0.35);font-size:0.72rem;color:#00dc78;font-weight:700;">✓ Browser permission granted</span>`;
          else if (perm === 'denied') pill.innerHTML = `<span style="display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:20px;background:rgba(255,80,60,0.15);border:1px solid rgba(255,80,60,0.35);font-size:0.72rem;color:#ff6050;font-weight:700;">✗ Blocked — enable in browser/OS settings</span>`;
        };
        // Observe permission changes (fires after requestPermission resolves)
        const notifToggleEl = document.getElementById('setting-notifications');
        if (notifToggleEl) {
          notifToggleEl.addEventListener('change', () => setTimeout(_updatePermPill, 800));
        }
        break;

      case 'exerciseLibrary':
        this.bindClick('btn-add-exercise-lib', () => this.showAddExerciseModal());
        const exSearch = document.getElementById('exercise-search');
        if (exSearch) {
          exSearch.addEventListener('input', (e) => this.filterExercises(e.target.value));
        }
        document.querySelectorAll('[data-exercise-id]').forEach(el => {
          el.addEventListener('click', () => this.showEditExerciseModal(el.dataset.exerciseId));
        });
        this.triggerMissingIconGeneration();
        break;

      case 'workoutDetail':
        this.bindClick('btn-back-history', () => this.showScreen('logs'));
        this.bindClick('btn-back-history-2', () => this.showScreen('logs'));
        document.querySelectorAll('[data-tap-exercise]').forEach(el => {
          el.addEventListener('click', () => {
            this.openAIChat(`Analyze my ${el.dataset.tapExercise} progress.`, el.dataset.tapExercise);
          });
        });
        const deleteBtn = document.getElementById('btn-delete-workout');
        if (deleteBtn) {
          deleteBtn.addEventListener('click', () => this.deleteWorkout(deleteBtn.dataset.id));
        }
        const editBtn = document.getElementById('btn-edit-workout');
        if (editBtn) {
          editBtn.addEventListener('click', () => {
            const wId = editBtn.dataset.id;
            const w = this.workouts.find(wk => wk.id === wId);
            if (w) this.showEditWorkoutModal(w);
          });
        }
        const analyzeBtn = document.getElementById('btn-analyze-detail');
        if (analyzeBtn) {
          analyzeBtn.addEventListener('click', () => this.analyzeWorkoutById(analyzeBtn.dataset.id));
        }
        break;

      case 'fileUpload':
        this.bindClick('btn-select-file-upload', () => document.getElementById('ai-file-input').click());
        const fileInput = document.getElementById('ai-file-input');
        if (fileInput) {
          fileInput.addEventListener('change', (e) => this.handleFileUpload(e.target.files[0]));
        }
        break;

      case 'logs':
        document.querySelectorAll('[data-tab]').forEach(btn => {
          btn.addEventListener('click', () => {
            // Only swap the tab content — never re-render the full screen (avoids double header)
            const tabContent = document.getElementById('logs-tab-content');
            if (tabContent) {
              tabContent.innerHTML = btn.dataset.tab === 'history'
                ? this._renderLogsHistory()
                : this._renderLogsStats();
              // Update active tab pill styling
              document.querySelectorAll('[data-tab]').forEach(t =>
                t.classList.toggle('active', t.dataset.tab === btn.dataset.tab)
              );
            }
            this.bindScreenEvents('logs');
          });
        });
        this.bindClick('btn-export-history', () => ExportImport.exportCSV());
        this.bindClick('btn-start-from-logs', () => this.showScreen('startWorkout'));
        const histSearch = document.getElementById('history-search');
        if (histSearch) histSearch.addEventListener('input', (e) => this.filterHistory(e.target.value));
        document.querySelectorAll('[data-workout-id]').forEach(el => {
          el.addEventListener('click', () => {
            const w = this.workouts.find(w => w.id === el.dataset.workoutId);
            if (w) this.showScreen('workoutDetail', { workout: w });
          });
        });
        document.querySelectorAll('[data-pr-exercise]').forEach(el => {
          el.addEventListener('click', () => this.openAIChat?.(`Tell me about my ${el.dataset.prExercise} progress.`));
        });

        // ── Stats expand/collapse toggles ─────────────────────
        this.bindClick('btn-toggle-graph', () => {
          const btn = document.getElementById('btn-toggle-graph');
          if (!btn) return;
          const card = document.getElementById('vol-graph-card');
          if (btn.dataset.mode === 'recent') {
            btn.dataset.mode = 'all';
            btn.textContent = 'Last 14 ▴';
            card.innerHTML = this._buildVolumeLineGraph(0);
          } else {
            btn.dataset.mode = 'recent';
            btn.textContent = 'All time ▾';
            card.innerHTML = this._buildVolumeLineGraph(14);
          }
        });

        this.bindClick('btn-toggle-weekly', () => {
          const btn = document.getElementById('btn-toggle-weekly');
          if (!btn) return;
          const card = document.getElementById('weekly-vol-card');
          const cur = parseInt(btn.dataset.weeks);
          if (cur === 4) {
            btn.dataset.weeks = '12';
            btn.textContent = '4 weeks ▴';
            card.innerHTML = this._buildWeeklyVolBars(12);
          } else {
            btn.dataset.weeks = '4';
            btn.textContent = '12 weeks ▾';
            card.innerHTML = this._buildWeeklyVolBars(4);
          }
        });

        this.bindClick('btn-toggle-calendar', () => {
          const btn = document.getElementById('btn-toggle-calendar');
          if (!btn) return;
          const card = document.getElementById('cal-card');
          if (btn.dataset.mode === 'recent') {
            btn.dataset.mode = 'all';
            btn.textContent = '2 weeks ▴';
            card.innerHTML = this._buildCalendarHTML(true);
          } else {
            btn.dataset.mode = 'recent';
            btn.textContent = 'Full history ▾';
            card.innerHTML = this._buildCalendarHTML(false);
          }
        });
        break;

      case 'profile':
        this.bindClick('btn-edit-profile', () => this.showScreen('settings'));
        break;

      case 'userProfile':
        // back handled universally via btn-back-social
        this.bindClick('btn-nudge-user', async () => {
          if (!data || !data.user) return;
          const btn = document.getElementById('btn-nudge-user');
          if (btn) { btn.disabled = true; btn.textContent = 'Nudging...'; }
          try {
            await this.apiPost('/api/user/nudge', { target_id: data.user.id, nudger_name: this.profile.username });
            this.showToast('Nudge sent!');
            if (btn) { btn.textContent = 'Nudged!'; btn.style.background = 'var(--lagoon)'; btn.style.color = '#fff'; }
          } catch(e) {
            this.showToast('Failed to nudge');
            if (btn) { btn.disabled = false; btn.textContent = 'Nudge to Workout'; }
          }
        });
        break;

      case 'social':
        // Reactions
        this._bindReactionBars();
        // Social join (shown when no username yet)
        this.bindClick('btn-social-join', async () => {
          const val = document.getElementById('social-username-input')?.value.trim();
          if (!val) return;
          this.settings.username = val;
          this.settings.avatarSeed = val;
          DB.saveSetting('username', val);
          DB.saveSetting('avatarSeed', val);
          await this.registerWithServer();
          this.showScreen('social');
        });
        // ─── Global chat: incremental polling + send ──────────
        if (document.getElementById('global-chat-messages')) {
          requestAnimationFrame(() => this._positionChatFrame());
          const globalInput = document.getElementById('global-chat-input');
          const makeAv = (url) => url || `https://api.dicebear.com/7.x/avataaars/svg?seed=user`;
          const mkBubble = (m, idx) => {
            const mine = m.user_id === this.settings.serverId;
            const myAv = this._getAvatarUrl();
            return `<div class="chat-global-bubble ${mine ? 'mine' : ''}">
              ${!mine ? `<img class="bubble-avatar" src="${makeAv(m.avatar_url)}" alt="${m.username || 'athlete'}">` : ''}
              <div class="bubble-body">
                ${!mine ? `<div class="bubble-name">${m.username || 'athlete'}</div>` : ''}
                <div class="bubble-text">${this.escapeHtml(m.text)}</div>
                ${this._reactionBarHtml(m.id || `chat-srv-${idx}`, 'chat')}
              </div>
              ${mine ? `<img class="bubble-avatar" src="${myAv}" alt="you">` : ''}
            </div>`;
          };

          // Track which server-confirmed message IDs are already in the DOM
          const seenIds = new Set();

          const poll = async () => {
            const msgs = document.getElementById('global-chat-messages');
            if (!msgs) { clearInterval(this._chatPollTimer); this._chatPollTimer = null; return; }
            const data = await this._fetchChat();
            if (!data?.messages) return;

            if (seenIds.size === 0) {
              // First load — replace loading hint with full history
              if (!data.messages.length) {
                const hint = document.getElementById('chat-status-hint');
                if (hint) hint.textContent = 'No messages yet — say something!';
                return;
              }
              msgs.innerHTML = data.messages.map((m, i) => mkBubble(m, i)).join('');
              data.messages.forEach(m => seenIds.add(m.id));
              this._bindReactionBars();
              this._bindBubbleInteractions(msgs);
              
              // Force auto-scroll to the bottom always (initial load)
              const forceScroll = () => { msgs.scrollTop = msgs.scrollHeight; };
              requestAnimationFrame(() => {
                forceScroll();
                requestAnimationFrame(forceScroll);
                setTimeout(forceScroll, 50); // Catch late image layout shifts
              });
              
              // Load real reaction counts from server
              const msgIds = data.messages.map(m => m.id).filter(Boolean);
              if (msgIds.length) this._fetchReactionsBulk(msgIds);
              return;
            }

            // Incremental — only append messages not yet in DOM
            const newMsgs = data.messages.filter(m => !seenIds.has(m.id));
            if (!newMsgs.length) return;
            const atBottom = msgs.scrollHeight - msgs.scrollTop - msgs.clientHeight < 80;
            newMsgs.forEach(m => {
              // Remove the correct optimistic bubble — match by text to handle rapid sends
              if (m.user_id === this.settings.serverId) {
                const opts = msgs.querySelectorAll('[data-optimistic]');
                const match = Array.from(opts).find(o =>
                  o.querySelector('.bubble-text')?.textContent?.trim() === m.text.trim()
                );
                if (match) match.remove();
              }
              const wrap = document.createElement('div');
              wrap.innerHTML = mkBubble(m, seenIds.size);
              msgs.appendChild(wrap.firstChild);
              seenIds.add(m.id);
            });
            this._bindReactionBars();
            this._bindBubbleInteractions(msgs);
            
            // Force auto-scroll to the bottom always
            const forceScroll = () => { msgs.scrollTop = msgs.scrollHeight; };
            requestAnimationFrame(() => {
              forceScroll();
              requestAnimationFrame(forceScroll);
              setTimeout(forceScroll, 50); // Catch late image layout shifts
            });
          };

          if (this._chatPollTimer) clearInterval(this._chatPollTimer);
          if (this._chatVisibilityHandler) {
            document.removeEventListener('visibilitychange', this._chatVisibilityHandler);
            this._chatVisibilityHandler = null;
          }
          poll(); // immediate first load
          this._chatPollTimer = setInterval(poll, 2000);

          // Resume fast when the user switches back to the app
          this._chatVisibilityHandler = () => {
            if (!document.hidden && this.currentScreen === 'social') {
              poll(); // immediate catch-up poll
              if (this._chatPollTimer) clearInterval(this._chatPollTimer);
              this._chatPollTimer = setInterval(poll, 2000);
            }
          };
          document.addEventListener('visibilitychange', this._chatVisibilityHandler);

          // Send handler
          const sendGlobal = async () => {
            const text = globalInput?.value.trim();
            if (!text) return;
            if (!this.settings.serverId) { this.showToast('Join the Board to chat!'); return; }
            if (text.length > 300) { this.showToast('Message too long (max 300 chars)'); return; }
            globalInput.value = '';
            const msgs = document.getElementById('global-chat-messages');
            if (msgs) {
              const hint = document.getElementById('chat-status-hint');
              if (hint) hint.remove();
              const myAv = this._getAvatarUrl();
              const el = document.createElement('div');
              el.className = 'chat-global-bubble mine';
              el.setAttribute('data-optimistic', 'true');
              el.innerHTML = `<div class="bubble-body"><div class="bubble-text">${this.escapeHtml(text)}</div></div><img class="bubble-avatar" src="${myAv}" alt="you">`;
              msgs.appendChild(el);
              msgs.scrollTop = msgs.scrollHeight;
            }
            await this._postChatMessage(text);
            // Force a poll ~300ms later to confirm and swap the optimistic bubble
            setTimeout(poll, 300);
          };
          this.bindClick('btn-global-chat-send', sendGlobal);
          if (globalInput) globalInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); sendGlobal(); } });
        }
        break;
    }
  },

  // ─── HELPER: Bind click safely ─────────────────────────────
  bindClick(id, handler) {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', handler);
  },

  // ─── WORKOUT LOGIC ─────────────────────────────────────────
  async beginWorkout() {
    const title = document.getElementById('workout-title-input')?.value.trim() || '';
    const notes = document.getElementById('workout-notes-input')?.value.trim() || '';
    const tags = Array.from(document.querySelectorAll('#workout-tags-container .tag'))
      .map(el => el.textContent.replace('✕', '').trim());

    // Gather custom fields
    const customFields = {};
    document.querySelectorAll('[data-custom-field]').forEach(el => {
      const name = el.dataset.customField;
      const val = el.value.trim();
      if (val) customFields[name] = val;
    });

    this.activeWorkout = {
      id: this.generateId(),
      date: new Date().toISOString(),
      title,
      notes,
      tags,
      customFields,
      exercises: [],
      duration: 0,
      score: null,
      xpEarned: 0,
      aiAnalysis: ''
    };

    navigator.vibrate?.([60]);
    await Timer.startWorkoutSession();
    this.showExercisePicker();
  },

  showExercisePicker() {
    const sorted = [...this.exercises].sort((a, b) => {
      const aDate = a.lastUsed ? new Date(a.lastUsed) : new Date(0);
      const bDate = b.lastUsed ? new Date(b.lastUsed) : new Date(0);
      return bDate - aDate;
    });

    const html = `
      <div class="modal-overlay" id="exercise-picker-overlay">
        <div class="modal-sheet">
          <div class="modal-handle"></div>
          <div class="text-bold text-white text-lg mb-16">Select Exercise</div>
          <div class="search-bar" style="margin: 0 0 12px 0;">
            <span class="search-bar-icon" style="padding-left:12px;">${this.Icons.stats}</span>
            <input type="text" class="input" placeholder="Search or type new..." id="exercise-picker-search">
          </div>
          <div id="exercise-picker-list" style="max-height: 50vh; overflow-y: auto;">
            <div class="exercise-item" id="btn-add-new-exercise" style="border: 1px dashed var(--glass-border-hi); background: var(--clear-water); justify-content: center; margin-bottom: 8px; border-radius: var(--radius-md);">
              <div class="exercise-item-icon" style="background: transparent; color: var(--aqua); width: auto; height: auto;">${this.Icons.plus}</div>
              <div class="exercise-item-name" style="color: var(--aqua);">Create Custom Exercise</div>
            </div>
            ${sorted.map(ex => `
              <div class="exercise-item" data-pick-exercise="${ex.id}">
                <div class="exercise-item-icon">${this.Icons.dumbbell}</div>
                <div class="exercise-item-info">
                  <div class="exercise-item-name">${ex.name}</div>
                  <div class="exercise-item-meta">${ex.muscleGroups && ex.muscleGroups.length ? ex.muscleGroups.join(', ') : 'Custom'}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    document.getElementById('modal-container').innerHTML = html;

    // Bind events
    document.getElementById('exercise-picker-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'exercise-picker-overlay') {
        document.getElementById('modal-container').innerHTML = '';
      }
    });

    document.getElementById('btn-add-new-exercise').addEventListener('click', () => {
      document.getElementById('modal-container').innerHTML = '';
      this.showAddExerciseForWorkout();
    });

    document.querySelectorAll('[data-pick-exercise]').forEach(el => {
      el.addEventListener('click', () => {
        const ex = this.exercises.find(e => e.id === el.dataset.pickExercise);
        if (ex) {
          document.getElementById('modal-container').innerHTML = '';
          this.addExerciseToWorkout(ex);
        }
      });
    });

    const searchInput = document.getElementById('exercise-picker-search');
    if (searchInput) {
      searchInput.focus();
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        document.querySelectorAll('[data-pick-exercise]').forEach(el => {
          const name = el.querySelector('.exercise-item-name').textContent.toLowerCase();
          el.style.display = name.includes(query) ? '' : 'none';
        });
      });
    }
  },

  showCombineExercisesModal() {
    const sorted = [...this.exercises].sort((a, b) => a.name.localeCompare(b.name));
    const optionsHtml = sorted.map(ex => `<option value="${ex.id}">${ex.name}</option>`).join('');

    const html = `
      <div class="modal-overlay" id="combine-exercises-overlay">
        <div class="modal-sheet" style="padding-bottom: 24px;">
          <div class="modal-handle"></div>
          <div class="text-bold text-white text-lg mb-8">Combine Exercises</div>
          <div class="text-sm text-sea mb-16">Merge a duplicate exercise into another. The duplicate will be deleted and all its history will be moved to the target exercise.</div>
          
          <div class="input-group">
            <label class="input-label">Target Exercise (Keep this one)</label>
            <select class="input" id="combine-target">
              <option value="" disabled selected>Select target...</option>
              ${optionsHtml}
            </select>
          </div>
          
          <div class="input-group" style="margin-top: 16px;">
            <label class="input-label">Duplicate Exercise (Merge and delete this)</label>
            <select class="input" id="combine-duplicate">
              <option value="" disabled selected>Select duplicate...</option>
              ${optionsHtml}
            </select>
          </div>

          <button class="btn btn-accent mt-24" id="btn-confirm-combine" style="width: 100%;">Merge Exercises</button>
        </div>
      </div>
    `;

    document.getElementById('modal-container').innerHTML = html;

    document.getElementById('combine-exercises-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'combine-exercises-overlay') {
        document.getElementById('modal-container').innerHTML = '';
      }
    });

    document.getElementById('btn-confirm-combine').addEventListener('click', async () => {
      const targetId = document.getElementById('combine-target').value;
      const dupId = document.getElementById('combine-duplicate').value;

      if (!targetId || !dupId) {
        this.showToast('Please select both exercises');
        return;
      }
      if (targetId === dupId) {
        this.showToast('Cannot combine an exercise with itself');
        return;
      }

      const targetEx = this.exercises.find(e => e.id === targetId);
      const dupEx = this.exercises.find(e => e.id === dupId);

      if (confirm(`Merge "${dupEx.name}" into "${targetEx.name}"? This cannot be undone.`)) {
        // Rewrite workouts
        let mergedSets = 0;
        this.workouts.forEach(w => {
          w.exercises.forEach(ex => {
            if (ex.exerciseId === dupId) {
              ex.exerciseId = targetId;
              ex.name = targetEx.name;
              mergedSets += ex.sets.length;
            }
          });
        });

        // Delete duplicate exercise
        this.exercises = this.exercises.filter(e => e.id !== dupId);

        // Update target usage
        targetEx.timesUsed = (targetEx.timesUsed || 0) + (dupEx.timesUsed || 0);
        
        await DB.saveWorkouts(this.workouts);
        await DB.saveExercises(this.exercises);
        
        // Recalculate stats for safety
        await this._recalculateProfileStats();

        document.getElementById('modal-container').innerHTML = '';
        this.showToast(`Merged successfully! Updated ${mergedSets} sets.`);
        this.showScreen('settings'); // Refresh settings UI to show updated count
      }
    });
  },

  showAddExerciseForWorkout() {

    const html = `
      <div class="modal-overlay" id="add-exercise-overlay">
        <div class="modal-sheet">
          <div class="modal-handle"></div>
          <div class="text-bold text-white text-lg mb-16">New Exercise</div>
          <div class="input-group">
            <label class="input-label">Exercise Name</label>
            <input type="text" class="input" placeholder="e.g. Bench Press" id="new-exercise-name">
          </div>
          <div class="input-group">
            <label class="input-label">Muscle Groups</label>
            <div class="flex flex-wrap gap-4" id="muscle-group-selector">
              ${MUSCLE_GROUPS.map(mg => `
                <button class="tag" data-muscle-select="${mg}" style="cursor:pointer;">${mg}</button>
              `).join('')}
            </div>
          </div>
          <div class="input-group">
            <label class="input-label">Equipment (optional)</label>
            <input type="text" class="input" placeholder="e.g. Barbell, Dumbbell, Cable..." id="new-exercise-equipment">
          </div>
          <button class="btn btn-accent btn-large mt-8" id="btn-save-new-exercise">Add Exercise</button>
        </div>
      </div>
    `;

    document.getElementById('modal-container').innerHTML = html;

    const selectedMuscles = new Set();
    document.querySelectorAll('[data-muscle-select]').forEach(el => {
      el.addEventListener('click', () => {
        const mg = el.dataset.muscleSelect;
        if (selectedMuscles.has(mg)) {
          selectedMuscles.delete(mg);
          el.style.background = '';
          el.style.borderColor = '';
        } else {
          selectedMuscles.add(mg);
          el.style.background = 'rgba(246,174,45,0.3)';
          el.style.borderColor = 'var(--sunset)';
        }
      });
    });

    document.getElementById('add-exercise-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'add-exercise-overlay') {
        document.getElementById('modal-container').innerHTML = '';
        this.showExercisePicker();
      }
    });

    document.getElementById('btn-save-new-exercise').addEventListener('click', async () => {
      const name = document.getElementById('new-exercise-name').value.trim();
      if (!name) {
        this.showToast('Please enter an exercise name');
        return;
      }
      const exercise = {
        id: this.generateId(),
        name,
        muscleGroups: Array.from(selectedMuscles),
        equipment: document.getElementById('new-exercise-equipment').value.trim(),
        notes: '',
        isCustom: true,
        lastUsed: new Date().toISOString(),
        timesUsed: 0
      };
      await DB.saveExercise(exercise);
      this.exercises.push(exercise);
      // If no muscle groups were selected, auto-classify in background
      if (!exercise.muscleGroups.length) {
        this._autoFillMissingMuscleGroups();
      }
      document.getElementById('modal-container').innerHTML = '';
      this.addExerciseToWorkout(exercise);
    });
  },

  addExerciseToWorkout(exercise) {
    const setsCount = this.settings.defaultSetsPerExercise;
    const sets = [];
    for (let i = 0; i < setsCount; i++) {
      sets.push({
        setNumber: i + 1,
        weight: null,
        weightUnit: this.settings.defaultWeightUnit,
        reps: null,
        rpe: null,
        restAfter: null,
        notes: '',
        customFields: {},
        timestamp: null,
        completed: false
      });
    }

    const bilateral = this._detectBilateral(exercise.name);

    this.activeWorkout.exercises.push({
      exerciseId: exercise.id,
      name: exercise.name,
      notes: '',
      order: this.activeWorkout.exercises.length,
      customFields: {},
      bilateral: bilateral === true, // false/null → false initially
      sets
    });

    // Update exercise usage
    exercise.lastUsed = new Date().toISOString();
    exercise.timesUsed = (exercise.timesUsed || 0) + 1;
    DB.saveExercise(exercise);

    this.showScreen('activeWorkout');

    // If detection was ambiguous (null), prompt AFTER render so modal appears over the screen
    if (bilateral === null) {
      const newEx = this.activeWorkout.exercises[this.activeWorkout.exercises.length - 1];
      this._promptBilateral(newEx).then(() => this.showScreen('activeWorkout'));
    }
  },

  bindSetInputs() {
    document.querySelectorAll('[data-field]').forEach(input => {
      // Use 'input' not 'change' so the live volume ticker updates on every keystroke
      input.addEventListener('input', (e) => {
        const exIdx = parseInt(e.target.dataset.ex);
        const setIdx = parseInt(e.target.dataset.set);
        const field = e.target.dataset.field;
        const value = parseFloat(e.target.value) || null;
        if (this.activeWorkout?.exercises[exIdx]?.sets[setIdx]) {
          this.activeWorkout.exercises[exIdx].sets[setIdx][field] = value;
          this._updateLiveStats();
        }
      });
    });
  },

  bindRemoveSetButtons() {
    document.querySelectorAll('[data-remove-set]').forEach(btn => {
      btn.addEventListener('click', () => {
        const exIdx = parseInt(btn.dataset.removeSet);
        const setIdx = parseInt(btn.dataset.removeSetIdx);
        const ex = this.activeWorkout?.exercises[exIdx];
        if (!ex) return;
        if (ex.sets.length <= 1) { this.showToast('Need at least one set'); return; }
        ex.sets.splice(setIdx, 1);
        this.showScreen('activeWorkout');
      });
    });
  },

  bindSetCompleteButtons() {
    document.querySelectorAll('[data-complete-set]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const exIdx = parseInt(btn.dataset.ex);
        const setIdx = parseInt(btn.dataset.set);
        const set = this.activeWorkout?.exercises[exIdx]?.sets[setIdx];
        if (!set) return;
        if (set.completed) {
          // Un-complete: toggle back to editable
          set.completed = false;
          set.timestamp = null;
          this.showScreen('activeWorkout');
        } else {
          this.completeSet(exIdx, setIdx);
        }
      });
    });
  },

  bindAddSetButtons() {
    document.querySelectorAll('[data-add-set]').forEach(btn => {
      btn.addEventListener('click', () => {
        const exIdx = parseInt(btn.dataset.addSet);
        const ex = this.activeWorkout.exercises[exIdx];
        ex.sets.push({
          setNumber: ex.sets.length + 1,
          weight: null,
          weightUnit: this.settings.defaultWeightUnit,
          reps: null,
          rpe: null,
          restAfter: null,
          notes: '',
          customFields: {},
          timestamp: null,
          completed: false
        });
        this.showScreen('activeWorkout');
      });
    });
  },

  bindExerciseMenus() {
    document.querySelectorAll('[data-exercise-menu]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const exIdx = parseInt(btn.dataset.exerciseMenu);
        this.showExerciseMenu(exIdx);
      });
    });
  },

  showExerciseMenu(exIdx) {
    const ex = this.activeWorkout.exercises[exIdx];
    const restTime = ex.restSeconds ?? this.settings.defaultRestBetweenSets;
    const html = `
      <div class="modal-overlay" id="ex-menu-overlay">
        <div class="modal-sheet">
          <div class="modal-handle"></div>
          <div class="text-bold text-white text-lg mb-16">${ex.name}</div>
          <button class="btn btn-ghost btn-large mb-8" id="btn-ex-rename">${this.Icons.notes} Rename Exercise</button>
          <button class="btn btn-ghost btn-large mb-8" id="btn-ex-bilateral" style="${ex.bilateral ? 'color:var(--aqua);' : ''}">
            ${this.Icons.dumbbell}
            ${ex.bilateral ? 'Two dumbbells (×2 on) — tap to disable' : 'Two dumbbells? Count weight ×2'}
          </button>
          <button class="btn btn-ghost btn-large mb-8" id="btn-ex-rest">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Rest Time: ${restTime}s
          </button>
          <button class="btn btn-ghost btn-large mb-8" id="btn-ex-notes">${this.Icons.notes} Exercise Notes</button>
          <button class="btn btn-ghost btn-large mb-8" id="btn-ex-reorder-up">${this.Icons.up} Move Up</button>
          <button class="btn btn-ghost btn-large mb-8" id="btn-ex-reorder-down">${this.Icons.down} Move Down</button>
          <button class="btn btn-danger btn-large" id="btn-ex-remove">${this.Icons.trash} Remove Exercise</button>
        </div>
      </div>
    `;
    document.getElementById('modal-container').innerHTML = html;

    document.getElementById('ex-menu-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'ex-menu-overlay') document.getElementById('modal-container').innerHTML = '';
    });

    // ── Bilateral toggle ──
    document.getElementById('btn-ex-bilateral').addEventListener('click', () => {
      ex.bilateral = !ex.bilateral;
      this._saveBilateralPref(ex.name, ex.bilateral);
      document.getElementById('modal-container').innerHTML = '';
      this.showScreen('activeWorkout');
    });

    // ── Rename ──
    document.getElementById('btn-ex-rename').addEventListener('click', () => {
      document.getElementById('modal-container').innerHTML = `
        <div class="modal-overlay" id="rename-overlay">
          <div class="modal-sheet">
            <div class="modal-handle"></div>
            <div class="text-bold text-white text-lg mb-16">Rename Exercise</div>
            <input class="input" id="rename-input" value="${this.escapeHtml(ex.name)}" placeholder="Exercise name">
            <button class="btn btn-accent btn-large mt-16" id="btn-save-rename">Save</button>
          </div>
        </div>
      `;
      document.getElementById('rename-overlay').addEventListener('click', (e) => {
        if (e.target.id === 'rename-overlay') document.getElementById('modal-container').innerHTML = '';
      });
      const inp = document.getElementById('rename-input');
      requestAnimationFrame(() => { inp?.focus(); inp?.select(); });
      document.getElementById('btn-save-rename').addEventListener('click', () => {
        const newName = document.getElementById('rename-input')?.value.trim();
        if (!newName) { this.showToast('Enter a name'); return; }
        ex.name = newName;
        document.getElementById('modal-container').innerHTML = '';
        this.showScreen('activeWorkout');
      });
    });

    // ── Rest time ──
    document.getElementById('btn-ex-rest').addEventListener('click', () => {
      const cur = ex.restSeconds ?? this.settings.defaultRestBetweenSets;
      document.getElementById('modal-container').innerHTML = `
        <div class="modal-overlay" id="rest-overlay">
          <div class="modal-sheet">
            <div class="modal-handle"></div>
            <div class="text-bold text-white text-lg mb-8">Rest Time</div>
            <div class="text-xs text-sea mb-16">Overrides global default for this exercise only</div>
            <div style="display:flex;align-items:center;gap:12px;justify-content:center;">
              <button id="btn-rest-minus" style="width:44px;height:44px;border-radius:50%;border:1.5px solid var(--glass-border);background:var(--glass-mid);color:var(--text-main);font-size:1.4rem;cursor:pointer;">−</button>
              <span id="rest-val" style="font-size:2rem;font-weight:900;color:var(--aqua);min-width:70px;text-align:center;">${cur}s</span>
              <button id="btn-rest-plus" style="width:44px;height:44px;border-radius:50%;border:1.5px solid var(--glass-border);background:var(--glass-mid);color:var(--text-main);font-size:1.4rem;cursor:pointer;">+</button>
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin:16px 0;">
              ${[30,60,90,120,180].map(s => `<button class="tag rest-preset" data-s="${s}" style="cursor:pointer;${cur===s?'background:var(--lagoon);color:#021628;':''}"> ${s}s</button>`).join('')}
            </div>
            <button class="btn btn-accent btn-large" id="btn-save-rest">Set Rest Time</button>
          </div>
        </div>
      `;
      let restVal = cur;
      const valEl = () => document.getElementById('rest-val');
      const update = (v) => { restVal = Math.max(10, Math.min(600, v)); if (valEl()) valEl().textContent = restVal + 's'; };
      document.getElementById('rest-overlay').addEventListener('click', (e) => {
        if (e.target.id === 'rest-overlay') document.getElementById('modal-container').innerHTML = '';
      });
      document.getElementById('btn-rest-minus').addEventListener('click', () => update(restVal - 15));
      document.getElementById('btn-rest-plus').addEventListener('click',  () => update(restVal + 15));
      document.querySelectorAll('.rest-preset').forEach(btn => {
        btn.addEventListener('click', () => update(parseInt(btn.dataset.s)));
      });
      document.getElementById('btn-save-rest').addEventListener('click', () => {
        ex.restSeconds = restVal;
        document.getElementById('modal-container').innerHTML = '';
        this.showToast(`Rest set to ${restVal}s for ${ex.name}`);
      });
    });

    // ── Remove ──
    document.getElementById('btn-ex-remove').addEventListener('click', () => {
      this.activeWorkout.exercises.splice(exIdx, 1);
      document.getElementById('modal-container').innerHTML = '';
      this.showScreen('activeWorkout');
    });

    // ── Reorder ──
    document.getElementById('btn-ex-reorder-up').addEventListener('click', () => {
      if (exIdx > 0) {
        [this.activeWorkout.exercises[exIdx - 1], this.activeWorkout.exercises[exIdx]] =
          [this.activeWorkout.exercises[exIdx], this.activeWorkout.exercises[exIdx - 1]];
      }
      document.getElementById('modal-container').innerHTML = '';
      this.showScreen('activeWorkout');
    });

    document.getElementById('btn-ex-reorder-down').addEventListener('click', () => {
      if (exIdx < this.activeWorkout.exercises.length - 1) {
        [this.activeWorkout.exercises[exIdx], this.activeWorkout.exercises[exIdx + 1]] =
          [this.activeWorkout.exercises[exIdx + 1], this.activeWorkout.exercises[exIdx]];
      }
      document.getElementById('modal-container').innerHTML = '';
      this.showScreen('activeWorkout');
    });

    // ── Notes ──
    document.getElementById('btn-ex-notes').addEventListener('click', () => {
      document.getElementById('modal-container').innerHTML = `
        <div class="modal-overlay" id="notes-overlay">
          <div class="modal-sheet">
            <div class="modal-handle"></div>
            <div class="text-bold text-white text-lg mb-16">Notes for ${ex.name}</div>
            <textarea class="input" id="ex-notes-input" placeholder="Exercise notes...">${ex.notes || ''}</textarea>
            <button class="btn btn-accent btn-large mt-16" id="btn-save-ex-notes">Save</button>
          </div>
        </div>
      `;
      document.getElementById('notes-overlay').addEventListener('click', (e) => {
        if (e.target.id === 'notes-overlay') document.getElementById('modal-container').innerHTML = '';
      });
      document.getElementById('btn-save-ex-notes').addEventListener('click', () => {
        ex.notes = document.getElementById('ex-notes-input').value.trim();
        document.getElementById('modal-container').innerHTML = '';
      });
    });
  },

  async completeSet(exIdx, setIdx) {
    const set = this.activeWorkout.exercises[exIdx].sets[setIdx];
    if (!set.weight || !set.reps) {
      this.showToast('Enter weight and reps first');
      return;
    }

    set.completed = true;
    set.timestamp = new Date().toISOString();

    // Check for PR
    const exName = this.activeWorkout.exercises[exIdx].name;
    const isPR = this.checkAndUpdatePR(exName, set);

    if (isPR) {
      navigator.vibrate?.([50, 40, 100, 40, 200]);
      this.showCelebration(this.Icons.anchor, 'NEW PR!', `${exName}: ${set.weight} ${set.weightUnit} × ${set.reps}`);
    } else {
      navigator.vibrate?.([40]);
    }

    // Check if this was the last uncompleted set for this exercise
    const ex = this.activeWorkout.exercises[exIdx];
    const allDone = ex.sets.every(s => s.completed);
    const nextUncompletedSet = ex.sets.find(s => !s.completed);
    const restSecs    = ex.restSeconds ?? this.settings.defaultRestBetweenSets;
    const restBetweenEx = this.settings.defaultRestBetweenExercises;

    if (allDone) {
      // Check if there are more exercises
      const nextExIdx = exIdx + 1;
      if (nextExIdx < this.activeWorkout.exercises.length) {
        // Rest between exercises
        this.showScreen('restTimer', {
          seconds: restBetweenEx,
          label: `Rest before ${this.activeWorkout.exercises[nextExIdx].name}`,
          onComplete: () => this.showScreen('activeWorkout')
        });
      } else {
        this.showScreen('activeWorkout');
      }
    } else if (nextUncompletedSet) {
      // Rest between sets
      this.showScreen('restTimer', {
        seconds: restSecs,
        label: `Rest — ${exName} Set ${setIdx + 2} next`,
        onComplete: () => this.showScreen('activeWorkout')
      });
    } else {
      this.showScreen('activeWorkout');
    }
  },

  cancelWorkout() {
    if (confirm('Cancel this workout? All progress will be lost.')) {
      Timer.endWorkoutSession();
      this.activeWorkout = null;
      this.showScreen('home');
    }
  },

  async finishWorkout() {
    if (!this.activeWorkout) return;

    const w = this.activeWorkout;

    // Remove uncompleted sets
    w.exercises.forEach(ex => {
      ex.sets = ex.sets.filter(s => s.completed);
    });
    // Remove exercises with no completed sets
    w.exercises = w.exercises.filter(ex => ex.sets.length > 0);

    if (w.exercises.length === 0) {
      if (confirm('No sets completed. Discard workout?')) {
        Timer.endWorkoutSession();
        this.activeWorkout = null;
        this.showScreen('home');
      }
      return;
    }

    // Calculate duration
    w.duration = Math.round((Date.now() - new Date(w.date).getTime()) / 1000);

    // Compute + store muscle groups for this workout
    w.muscleGroups = this._workoutMuscleGroups(w);

    // Calculate XP
    const totalSets = w.exercises.reduce((s, e) => s + e.sets.length, 0);
    const totalVolume = w.exercises.reduce((sum, ex) =>
      sum + this._exVol(ex), 0);
    w.xpEarned = Math.round(totalSets * 10 + totalVolume * 0.01 + 50); // Base 50 XP per workout

    // Save workout
    await DB.saveWorkout(w);
    this.workouts.push(w);

    // Update profile
    await this.updateProfileAfterWorkout(w);

    Timer.endWorkoutSession();
    this.lastCompletedWorkout = w;
    this.activeWorkout = null;

    // Log to server in background (don't block UI)
    this._logWorkoutToServer(w);

    navigator.vibrate?.([80, 50, 80, 50, 200]);
    this.showScreen('workoutComplete');
  },

  async updateProfileAfterWorkout(workout) {
    const p = this.profile;
    p.xp += workout.xpEarned;
    p.totalWorkouts += 1;

    const totalVolume = workout.exercises.reduce((sum, ex) =>
      sum + this._exVol(ex), 0);
    p.totalVolume += totalVolume;

    // Update streak — each workout adds 1, up to 4-day grace window
    const sameDay = p.lastWorkoutDate &&
      new Date().toDateString() === new Date(p.lastWorkoutDate).toDateString();
    const daysSinceLast = p.lastWorkoutDate
      ? (Date.now() - new Date(p.lastWorkoutDate).getTime()) / 86400000
      : 999;

    if (sameDay) {
      // Multiple sessions same day — no extra streak point
    } else if (daysSinceLast <= 4) {
      p.currentStreak += 1;
    } else {
      p.currentStreak = 1;
    }
    p.longestStreak = Math.max(p.longestStreak, p.currentStreak);
    p.lastWorkoutDate = new Date().toISOString();

    // Update level
    const levelInfo = this.getLevelInfo(p.xp);
    p.level = levelInfo.level;
    p.levelTitle = levelInfo.title;

    await DB.saveProfile(p);
    this.profile = p;
  },

  // Recalculates total lifetime profile stats (XP, Volume, Level) from all historical workouts.
  // Useful when a past workout is edited.
  async _recalculateProfileStats() {
    const p = this.profile;
    p.xp = 0;
    p.totalVolume = 0;
    
    for (const w of this.workouts) {
      const totalSets = w.exercises.reduce((s, e) => s + e.sets.length, 0);
      const totalVolume = w.exercises.reduce((sum, ex) => sum + this._exVol(ex), 0);
      
      // Update workout's internal XP record
      w.xpEarned = Math.round(totalSets * 10 + totalVolume * 0.01 + 50);
      DB.saveWorkout(w); // Save the fixed xpEarned back to DB silently
      
      p.xp += w.xpEarned;
      p.totalVolume += totalVolume;
    }
    
    const levelInfo = this.getLevelInfo(p.xp);
    p.level = levelInfo.level;
    p.levelTitle = levelInfo.title;
    
    await DB.saveProfile(p);
    this.profile = p;
  },

  // ─── TIMER LOGIC ──────────────────────────────────────────
  startRestTimer(data) {
    const seconds = data.seconds || this.settings.defaultRestBetweenSets;
    const circumference = 2 * Math.PI * 95;
    const circle = document.getElementById('timer-ring-circle');
    if (circle) circle.style.strokeDasharray = circumference;

    Timer.start(
      seconds,
      // onTick
      (remaining, total) => {
        const display = document.getElementById('timer-display');
        const label = document.getElementById('timer-label');
        const circle = document.getElementById('timer-ring-circle');
        if (display) display.textContent = Timer.formatTime(remaining);
        if (label) label.textContent = `${remaining}s remaining`;
        if (circle) {
          const progress = Timer.getProgress(remaining, total);
          const offset = circumference * (1 - progress);
          circle.style.strokeDashoffset = offset;
        }
      },
      // onComplete
      () => {
        navigator.vibrate?.([100, 60, 100, 60, 100]);
        if (data.onComplete) {
          data.onComplete();
        } else {
          this.showScreen('activeWorkout');
        }
      }
    );
  },

  adjustTimer(delta) {
    if (Timer.isRunning) {
      Timer.targetEnd += delta * 1000;
      Timer.totalSeconds += delta;
      if (Timer.totalSeconds < 0) Timer.totalSeconds = 0;
    }
  },

  startElapsedTimer() {
    if (!this.activeWorkout) return;
    const update = () => {
      if (this.currentScreen !== 'activeWorkout') return;
      const elapsed = Math.round((Date.now() - new Date(this.activeWorkout.date).getTime()) / 1000);
      const el = document.getElementById('workout-elapsed');
      if (el) el.textContent = Timer.formatTime(elapsed);

      const totalVolume = this.activeWorkout.exercises.reduce((sum, ex) =>
        sum + this._exVol(ex), 0);
      const volEl = document.getElementById('workout-volume');
      if (volEl) volEl.textContent = totalVolume.toLocaleString();

      const totalSets = this.activeWorkout.exercises.reduce((s, e) => s + e.sets.filter(st => st.completed).length, 0);
      const setsEl = document.getElementById('workout-sets');
      if (setsEl) setsEl.textContent = totalSets;

      requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  },

  // ─── AI CHAT ──────────────────────────────────────────────
  _currentChatMessages: [],
  _currentChatContext: '',

  async openAIChat(prefill, exerciseName) {
    let context = '';
    if (exerciseName) {
      const history = this.workouts
        .filter(w => w.exercises.some(e => e.name === exerciseName))
        .map(w => {
          const ex = w.exercises.find(e => e.name === exerciseName);
          return `${new Date(w.date).toLocaleDateString()}: ${ex.sets.map(s => `${s.weight}${s.weightUnit || 'lbs'}×${s.reps}`).join(', ')}`;
        }).join('\n');
      context = `Full ${exerciseName} history:\n${history}`;
    }
    this._currentChatContext = context;
    this.showScreen('chat', { prefill, context });
  },

  buildChatContext() {
    const p = this.profile;
    const recentWorkouts = [...this.workouts]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)
      .map(w => ({
        id: w.id,
        date: w.date,
        title: w.title,
        exercises: w.exercises.map((ex, i) => ({
          index: i,
          name: ex.name,
          sets: ex.sets.map((s, j) => ({ index: j, weight: s.weight, reps: s.reps, unit: s.weightUnit }))
        }))
      }));

    return `Profile: Level ${p.level} (${p.levelTitle}), ${p.xp} XP, ${p.totalWorkouts} workouts, ${p.currentStreak} day streak.
Recent workouts (last 5): ${JSON.stringify(recentWorkouts)}
Exercise library: ${this.exercises.map(e => e.name).join(', ')}`;
  },

  async executeAIAction(action) {
    if (!action || !action.type) return;

    switch (action.type) {
      case 'add_exercise': {
        const { name, muscleGroups = [], equipment = '' } = action.params;
        if (!name) return;
        const exists = this.exercises.find(e => e.name.toLowerCase() === name.toLowerCase());
        if (exists) {
          this.showToast(`${name} already in library`);
          return;
        }
        const exercise = {
          id: this.generateId(),
          name,
          muscleGroups,
          equipment,
          notes: '',
          isCustom: true,
          lastUsed: new Date().toISOString(),
          timesUsed: 0
        };
        await DB.saveExercise(exercise);
        this.exercises.push(exercise);
        this.showToast(`Added "${name}" to library`);
        break;
      }

      case 'edit_workout_set': {
        const { workoutId, exerciseIndex, setIndex, weight, reps } = action.params;
        const w = this.workouts.find(w => w.id === workoutId);
        if (!w) { this.showToast('Workout not found'); return; }
        const set = w.exercises[exerciseIndex]?.sets[setIndex];
        if (!set) { this.showToast('Set not found'); return; }
        if (weight !== undefined) set.weight = weight;
        if (reps !== undefined) set.reps = reps;
        await DB.saveWorkout(w);
        const idx = this.workouts.findIndex(wk => wk.id === workoutId);
        if (idx >= 0) this.workouts[idx] = w;
        this.showToast(`Updated ${w.exercises[exerciseIndex].name} set ${setIndex + 1}`);
        break;
      }

      case 'add_note_to_workout': {
        const { workoutId, note } = action.params;
        const w = this.workouts.find(w => w.id === workoutId);
        if (!w) { this.showToast('Workout not found'); return; }
        w.notes = (w.notes ? w.notes + '\n' : '') + note;
        await DB.saveWorkout(w);
        const idx = this.workouts.findIndex(wk => wk.id === workoutId);
        if (idx >= 0) this.workouts[idx] = w;
        this.showToast('Note added to workout');
        break;
      }

      case 'log_workout': {
        const { date, title, exercises = [] } = action.params;
        if (!exercises.length) { this.showToast('No exercises found in description'); return; }

        const workout = {
          id: this.generateId(),
          date: date ? new Date(date).toISOString() : new Date().toISOString(),
          title: title || 'Chat Logged Workout',
          notes: 'Logged via Coach Chat',
          tags: ['chat-logged'],
          customFields: {},
          exercises: exercises.map((ex, i) => ({
            exerciseId: null,
            name: ex.name,
            notes: '',
            order: i,
            customFields: {},
            sets: (ex.sets || []).map((s, j) => ({
              setNumber: j + 1,
              weight: s.weight || 0,
              weightUnit: s.weightUnit || this.settings.defaultWeightUnit,
              reps: s.reps || 0,
              rpe: null,
              restAfter: null,
              notes: '',
              customFields: {},
              timestamp: new Date().toISOString(),
              completed: true
            }))
          })),
          duration: 0,
          score: null,
          xpEarned: 0,
          aiAnalysis: ''
        };

        // Calculate XP
        const totalSets = workout.exercises.reduce((s, e) => s + e.sets.length, 0);
        const totalVolume = workout.exercises.reduce((sum, ex) =>
          sum + this._exVol(ex), 0);
        workout.xpEarned = Math.round(totalSets * 10 + totalVolume * 0.01 + 50);

        await DB.saveWorkout(workout);
        this.workouts.push(workout);
        await this.updateProfileAfterWorkout(workout);

        // Add any new exercises to library
        for (const ex of workout.exercises) {
          const exists = this.exercises.find(e => e.name.toLowerCase() === ex.name.toLowerCase());
          if (!exists) {
            const newEx = {
              id: this.generateId(),
              name: ex.name,
              muscleGroups: [],
              equipment: '',
              notes: '',
              isCustom: true,
              lastUsed: new Date().toISOString(),
              timesUsed: 1
            };
            await DB.saveExercise(newEx);
            this.exercises.push(newEx);
          }
        }

        this.showToast(`Logged: ${workout.title} (+${workout.xpEarned} XP)`);
        break;
      }

      case 'navigate': {
        const { screen } = action.params;
        if (screen) {
          document.getElementById('modal-container').innerHTML = '';
          this.showScreen(screen);
        }
        break;
      }
    }
  },

  async sendChatMessage() {
    const input = document.getElementById('chat-input');
    if (!input) return;
    const message = input.value.trim();
    if (!message) return;

    input.value = '';
    input.disabled = true; // prevent double-send
    this._currentChatMessages.push({ role: 'user', content: message });

    const msgsContainer = document.getElementById('chat-messages');
    const userBubble = document.createElement('div');
    userBubble.className = 'chat-bubble user';
    userBubble.textContent = message;
    msgsContainer.appendChild(userBubble);

    const typingBubble = document.createElement('div');
    typingBubble.className = 'chat-bubble ai';
    typingBubble.id = 'ai-typing';
    typingBubble.innerHTML = '<div class="spinner" style="width:20px;height:20px;border-width:2px;"></div>';
    msgsContainer.appendChild(typingBubble);
    msgsContainer.scrollTop = msgsContainer.scrollHeight;

    // Auto-register with server if needed (required for free backend AI tier)
    if (!this.settings.serverId && this.settings.username) {
      await this.registerWithServer().catch(() => {});
    }

    // Build rich context from app data
    const context = this._currentChatContext || this.buildChatContext();
    const result = await AI.chat(this._currentChatMessages, context);

    const typingEl = document.getElementById('ai-typing');
    if (typingEl) typingEl.remove();
    input.disabled = false;

    const aiBubble = document.createElement('div');
    aiBubble.className = 'chat-bubble ai';
    if (result.error) {
      aiBubble.style.color = 'var(--coral)';
      aiBubble.textContent = result.error;
      // If free tier error, show helpful hint
      if (result.error.includes('Join the community') || result.error.includes('Register')) {
        aiBubble.innerHTML = `<span style="color:var(--coral)">${this.escapeHtml(result.error)}</span><br><small style="color:var(--text-muted)">Set a username in Config → Profile to unlock the free AI Coach.</small>`;
      }
    } else {
      this._currentChatMessages.push({ role: 'ai', content: result.text });
      aiBubble.textContent = result.text;
    }
    msgsContainer.appendChild(aiBubble);
    this._bindAiChatCopy(msgsContainer);
    msgsContainer.scrollTop = msgsContainer.scrollHeight;

    // Re-focus input so user can type the next message without tapping
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const inp = document.getElementById('chat-input');
      if (inp) inp.focus();
    }));

    // Execute any app action the AI requested
    if (!result.error && result.action) {
      await this.executeAIAction(result.action);
    }

    // Save chat log
    await this.saveChatLog();
  },

  async saveChatLog() {
    if (this._currentChatMessages.length === 0) return;
    const log = {
      id: this._currentChatId || this.generateId(),
      date: new Date().toISOString(),
      title: this._currentChatMessages[0]?.content.substring(0, 50) || 'Chat',
      messages: [...this._currentChatMessages]
    };
    this._currentChatId = log.id;
    await DB.saveChatLog(log);
  },

  showChatMenu() {
    const html = `
      <div class="modal-overlay" id="chat-menu-overlay">
        <div class="modal-sheet">
          <div class="modal-handle"></div>
          <button class="btn btn-ghost btn-large mb-8" id="btn-new-chat">${this.Icons.sparkle} New Chat</button>
          <button class="btn btn-ghost btn-large mb-8" id="btn-export-chats">Export Chats</button>
        </div>
      </div>
    `;
    document.getElementById('modal-container').innerHTML = html;
    document.getElementById('chat-menu-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'chat-menu-overlay') document.getElementById('modal-container').innerHTML = '';
    });
    document.getElementById('btn-new-chat').addEventListener('click', () => {
      this._currentChatMessages = [];
      this._currentChatId = null;
      this._currentChatContext = '';
      document.getElementById('modal-container').innerHTML = '';
      this.showScreen('chat');
    });
    document.getElementById('btn-export-chats').addEventListener('click', () => {
      ExportImport.exportChatLogs();
      document.getElementById('modal-container').innerHTML = '';
    });
  },

  // ─── AI ANALYSIS ──────────────────────────────────────────
  async analyzeLastWorkout() {
    if (!this.lastCompletedWorkout) return;
    this.showToast('Analyzing workout...');
    const result = await AI.analyzeWorkout(this.lastCompletedWorkout);
    if (result.text) {
      this.lastCompletedWorkout.aiAnalysis = result.text;
      await DB.saveWorkout(this.lastCompletedWorkout);
      const idx = this.workouts.findIndex(w => w.id === this.lastCompletedWorkout.id);
      if (idx >= 0) this.workouts[idx] = this.lastCompletedWorkout;
      this.showScreen('workoutComplete');
    } else {
      this.showToast(result.error || 'Analysis failed');
    }
  },

  async analyzeWorkoutById(id) {
    const w = this.workouts.find(w => w.id === id);
    if (!w) return;
    this.showToast('Analyzing...');
    const result = await AI.analyzeWorkout(w);
    if (result.text) {
      w.aiAnalysis = result.text;
      await DB.saveWorkout(w);
      this.showScreen('workoutDetail', { workout: w });
    } else {
      this.showToast(result.error || 'Analysis failed');
    }
  },

  // ─── FILE UPLOAD ──────────────────────────────────────────
  async handleFileUpload(file) {
    if (!file) return;
    const statusEl = document.getElementById('file-upload-status');
    const resultEl = document.getElementById('file-upload-result');
    if (statusEl) statusEl.classList.remove('hidden');
    if (resultEl) resultEl.classList.add('hidden');

    let progressInterval = null;
    let progress = 0;
    const statusTextEl = statusEl ? statusEl.querySelector('.text-sand') : null;
    
    if (statusTextEl) {
      statusTextEl.textContent = 'Analyzing data... 0%';
      progressInterval = setInterval(() => {
        if (progress < 95 && !statusTextEl.textContent.includes('Retrying')) {
          progress += Math.floor(Math.random() * 5) + 1;
          if (progress > 95) progress = 95;
          statusTextEl.textContent = `Analyzing data... ${progress}%`;
        }
      }, 500);
    }

    try {
      const fileData = await ExportImport.readFileForAI(file);
      const result = await AI.parseFileContent(fileData.content, file.type, (msg) => {
        if (statusTextEl) statusTextEl.textContent = msg;
      });

      if (progressInterval) clearInterval(progressInterval);
      if (statusTextEl) statusTextEl.textContent = 'AI is reading your file...'; // Reset text
      if (statusEl) statusEl.classList.add('hidden');

      if (result.error) {
        if (resultEl) {
          resultEl.classList.remove('hidden');
          resultEl.innerHTML = `<div class="card" style="border-color: var(--coral);"><div class="text-coral">${this.escapeHtml(result.error)}</div></div>`;
        }
        return;
      }

      // Try to parse JSON from AI response (handles raw JSON or markdown code blocks)
      try {
        let raw = result.text.trim();
        // Strip markdown code fences if present
        raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
        // Find the outermost JSON object
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (result._truncated) {
            this.showToast('Large file — only the first ~14KB was parsed. Add a Gemini API key in Settings for full support.', 5000);
          }
          this.showParsedWorkoutConfirmation(parsed);
        } else {
          if (resultEl) {
            resultEl.classList.remove('hidden');
            resultEl.innerHTML = `<div class="card" style="border-color:var(--coral);"><div class="text-coral text-sm">Could not find workout data in the response. Try a different file format.</div><div class="text-xs text-sea mt-8">${this.escapeHtml(result.text.substring(0, 200))}</div></div>`;
          }
        }
      } catch (parseErr) {
        if (resultEl) {
          resultEl.classList.remove('hidden');
          resultEl.innerHTML = `<div class="card" style="border-color:var(--coral);"><div class="text-coral text-sm">Parse error: ${this.escapeHtml(parseErr.message)}</div><div class="text-xs text-sea mt-8">${this.escapeHtml(result.text.substring(0, 300))}</div></div>`;
        }
      }
    } catch (err) {
      if (statusEl) statusEl.classList.add('hidden');
      this.showToast('Error reading file: ' + err.message);
    }
  },

  showParsedWorkoutConfirmation(parsed) {
    const resultEl = document.getElementById('file-upload-result');
    if (!resultEl) return;
    resultEl.classList.remove('hidden');

    let html = `<div class="text-bold text-white mb-8">Parsed Workouts:</div>`;

    if (parsed.workouts) {
      parsed.workouts.forEach((w, i) => {
        html += `
          <div class="card mb-8">
            <div class="text-bold text-white">${w.date || 'Unknown date'} ${w.title || ''}</div>
            ${(w.exercises || []).map(ex => `
              <div class="text-sm text-sea mt-4">${ex.name}: ${(ex.sets || []).map(s => `${s.weight}×${s.reps}`).join(', ')}</div>
            `).join('')}
          </div>
        `;
      });
    }

    if (parsed.uncertain && parsed.uncertain.length > 0) {
      html += `<div class="text-bold text-sunset mt-16 mb-8">Needs Clarification:</div>`;
      parsed.uncertain.forEach(u => {
        html += `<div class="card mb-8" style="border-color: var(--sunset);"><div class="text-sm text-sand">${u.field}</div></div>`;
      });
    }

    html += `<button class="btn btn-accent btn-large mt-16" id="btn-confirm-import">Import These Workouts</button>`;

    resultEl.innerHTML = html;

    document.getElementById('btn-confirm-import')?.addEventListener('click', async () => {
      if (parsed.workouts) {
        for (const pw of parsed.workouts) {
          const workout = {
            id: this.generateId(),
            date: pw.date ? new Date(pw.date).toISOString() : new Date().toISOString(),
            title: pw.title || 'Imported Workout',
            notes: 'Imported from file upload',
            tags: ['imported'],
            customFields: {},
            exercises: (pw.exercises || []).map((ex, i) => ({
              exerciseId: null,
              name: ex.name,
              notes: '',
              order: i,
              customFields: {},
              sets: (ex.sets || []).map((s, j) => ({
                setNumber: j + 1,
                weight: s.weight || 0,
                weightUnit: s.weightUnit || this.settings.defaultWeightUnit,
                reps: s.reps || 0,
                rpe: null,
                restAfter: null,
                notes: '',
                customFields: {},
                timestamp: new Date().toISOString(),
                completed: true
              }))
            })),
            duration: 0,
            score: null,
            xpEarned: 0,
            aiAnalysis: ''
          };
          await DB.saveWorkout(workout);
          this.workouts.push(workout);

          // Add exercises to library if new
          for (const ex of workout.exercises) {
            const exists = this.exercises.find(e => e.name.toLowerCase() === ex.name.toLowerCase());
            if (!exists) {
              const newEx = {
                id: this.generateId(),
                name: ex.name,
                muscleGroups: [],
                equipment: '',
                notes: '',
                isCustom: true,
                lastUsed: new Date().toISOString(),
                timesUsed: 1
              };
              await DB.saveExercise(newEx);
              this.exercises.push(newEx);
            }
          }
        }
        this.showToast(`Imported ${parsed.workouts.length} workout(s)!`);
        this.showScreen('logs');
      }
    });
  },

  // ─── SETTINGS EVENTS ──────────────────────────────────────
  bindSettingsEvents() {
    // Adjust buttons
    document.querySelectorAll('[data-adjust]').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.adjust;
        const dir = parseInt(btn.dataset.dir);
        let val = this.settings[key] + dir;
        if (key === 'defaultSetsPerExercise') val = Math.max(1, Math.min(10, val));
        else val = Math.max(15, Math.min(600, val));
        this.settings[key] = val;
        const display = document.getElementById(`val-${key}`);
        if (display) display.textContent = key.includes('Rest') ? val + 's' : val;
      });
    });

    this.bindClick('btn-save-settings', async () => {
      this.settings.defaultWeightUnit = document.getElementById('setting-weight-unit')?.value || 'lbs';
      this.settings.theme = document.getElementById('setting-theme')?.value || 'auto';
      const newKey = document.getElementById('setting-api-key')?.value.trim() || '';
      this.settings.geminiApiKey = newKey;
      
      // Force immediate save to DB for each key
      for (const [key, value] of Object.entries(this.settings)) {
        await DB.saveSetting(key, value);
      }
      
      this.applyTheme();
      this.showToast('Settings Saved to the Keys!');
    });

    const themeSelect = document.getElementById('setting-theme');
    if (themeSelect) {
      themeSelect.addEventListener('change', (e) => {
        this.settings.theme = e.target.value;
        this.applyTheme();
      });
    }

    this.bindClick('btn-manage-exercises', () => {
      this.showCombineExercisesModal();
    });
    this.bindClick('btn-show-exercise-library', () => this.showScreen('exerciseLibrary'));

    this.bindClick('btn-export-json', () => ExportImport.exportJSON());
    this.bindClick('btn-export-csv', () => ExportImport.exportCSV());

    this.bindClick('btn-import-data', () => document.getElementById('import-file-input')?.click());
    document.getElementById('import-file-input')?.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const result = await ExportImport.importJSON(file);
        await this.loadData();
        this.showToast(`Imported ${result.workouts} workouts, ${result.exercises} exercises`);
        this.showScreen('settings');
      } catch (err) {
        this.showToast('Import failed: ' + err.message);
      }
    });

    this.bindClick('btn-upload-workout-file', () => document.getElementById('workout-file-input')?.click());
    document.getElementById('workout-file-input')?.addEventListener('change', (e) => {
      if (e.target.files[0]) {
        this.showScreen('fileUpload');
        setTimeout(() => this.handleFileUpload(e.target.files[0]), 100);
      }
    });

    this.bindClick('btn-add-custom-field', () => this.showAddCustomFieldModal());

    document.querySelectorAll('[data-remove-field]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.removeField);
        this.settings.customFieldTemplates.splice(idx, 1);
        this.showScreen('settings');
      });
    });

    this.bindClick('btn-clear-all-data', async () => {
      if (confirm('Delete ALL data? This cannot be undone!')) {
        if (confirm('Are you really sure? Everything will be gone forever.')) {
          await DB.clear('workouts');
          await DB.clear('exercises');
          await DB.clear('chatLogs');
          await DB.clear('settings');
          await DB.clear('profile');
          await this.loadData();
          this.showToast('All data cleared');
          this.showScreen('home');
        }
      }
    });

    this.bindClick('btn-force-update', async () => {
      this.showToast('Clearing cache and updating…');
      try {
        // Delete every service worker cache
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
        // Unregister all service workers so the new one installs fresh
        if ('serviceWorker' in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations();
          await Promise.all(regs.map(r => r.unregister()));
        }
      } catch(e) { console.warn('Cache clear error:', e); }
      // Hard reload bypasses any in-memory cache
      location.reload(true);
    });
  },

  showAddCustomFieldModal() {
    const html = `
      <div class="modal-overlay" id="custom-field-overlay">
        <div class="modal-sheet">
          <div class="modal-handle"></div>
          <div class="text-bold text-white text-lg mb-16">Add Custom Field</div>
          <div class="input-group">
            <label class="input-label">Field Name</label>
            <input type="text" class="input" placeholder="e.g. Tempo, Grip, Mood" id="cf-name">
          </div>
          <div class="input-group">
            <label class="input-label">Field Type</label>
            <select class="input" id="cf-type">
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="select">Dropdown</option>
            </select>
          </div>
          <div class="input-group hidden" id="cf-options-group">
            <label class="input-label">Options (comma separated)</label>
            <input type="text" class="input" placeholder="e.g. Wide, Normal, Close" id="cf-options">
          </div>
          <button class="btn btn-accent btn-large mt-8" id="btn-save-cf">Add Field</button>
        </div>
      </div>
    `;
    document.getElementById('modal-container').innerHTML = html;

    document.getElementById('custom-field-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'custom-field-overlay') document.getElementById('modal-container').innerHTML = '';
    });

    document.getElementById('cf-type').addEventListener('change', (e) => {
      document.getElementById('cf-options-group').classList.toggle('hidden', e.target.value !== 'select');
    });

    document.getElementById('btn-save-cf').addEventListener('click', () => {
      const name = document.getElementById('cf-name').value.trim();
      const type = document.getElementById('cf-type').value;
      if (!name) { this.showToast('Enter a field name'); return; }
      const field = { name, type };
      if (type === 'select') {
        field.options = document.getElementById('cf-options').value.split(',').map(o => o.trim()).filter(Boolean);
      }
      if (!this.settings.customFieldTemplates) this.settings.customFieldTemplates = [];
      this.settings.customFieldTemplates.push(field);
      document.getElementById('modal-container').innerHTML = '';
      this.showScreen('settings');
    });
  },

  // ─── TAG INPUT ─────────────────────────────────────────────
  setupTagInput() {
    const input = document.getElementById('workout-tags-input');
    const container = document.getElementById('workout-tags-container');
    if (!input || !container) return;

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const tag = input.value.trim().toLowerCase();
        if (tag && !container.querySelector(`[data-tag="${tag}"]`)) {
          const tagEl = document.createElement('span');
          tagEl.className = 'tag';
          tagEl.dataset.tag = tag;
          tagEl.innerHTML = `${tag} <span class="tag-remove" data-remove-tag="${tag}">✕</span>`;
          container.appendChild(tagEl);
          tagEl.querySelector('.tag-remove').addEventListener('click', () => tagEl.remove());
        }
        input.value = '';
      }
    });
  },

  // ─── WORKOUT NOTES MODAL ──────────────────────────────────
  showWorkoutNotesModal() {
    const html = `
      <div class="modal-overlay" id="workout-notes-overlay">
        <div class="modal-sheet">
          <div class="modal-handle"></div>
          <div class="text-bold text-white text-lg mb-16">Workout Notes</div>
          <textarea class="input" id="workout-notes-textarea" placeholder="How's the workout going?">${this.activeWorkout?.notes || ''}</textarea>
          <button class="btn btn-accent btn-large mt-16" id="btn-save-workout-notes">Save</button>
        </div>
      </div>
    `;
    document.getElementById('modal-container').innerHTML = html;
    document.getElementById('workout-notes-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'workout-notes-overlay') document.getElementById('modal-container').innerHTML = '';
    });
    document.getElementById('btn-save-workout-notes').addEventListener('click', () => {
      if (this.activeWorkout) {
        this.activeWorkout.notes = document.getElementById('workout-notes-textarea').value.trim();
      }
      document.getElementById('modal-container').innerHTML = '';
    });
  },

  showPostWorkoutNotes() {
    const w = this.lastCompletedWorkout;
    if (!w) return;
    const html = `
      <div class="modal-overlay" id="post-notes-overlay">
        <div class="modal-sheet">
          <div class="modal-handle"></div>
          <div class="text-bold text-white text-lg mb-16">Post-Workout Notes</div>
          <textarea class="input" id="post-notes-textarea" placeholder="How did it go? How do you feel?">${w.notes || ''}</textarea>
          <div class="input-group mt-16">
            <label class="input-label">Add Tags</label>
            <input type="text" class="input" placeholder="Press Enter to add" id="post-tags-input">
            <div class="flex gap-4 flex-wrap mt-8" id="post-tags-container">
              ${(w.tags || []).map(t => `<span class="tag" data-tag="${t}">${t} <span class="tag-remove">✕</span></span>`).join('')}
            </div>
          </div>
          <button class="btn btn-accent btn-large mt-16" id="btn-save-post-notes">Save</button>
        </div>
      </div>
    `;
    document.getElementById('modal-container').innerHTML = html;
    document.getElementById('post-notes-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'post-notes-overlay') document.getElementById('modal-container').innerHTML = '';
    });
    document.getElementById('btn-save-post-notes').addEventListener('click', async () => {
      w.notes = document.getElementById('post-notes-textarea').value.trim();
      const tags = Array.from(document.querySelectorAll('#post-tags-container .tag')).map(el => el.dataset.tag);
      w.tags = tags;
      await DB.saveWorkout(w);
      const idx = this.workouts.findIndex(wk => wk.id === w.id);
      if (idx >= 0) this.workouts[idx] = w;
      document.getElementById('modal-container').innerHTML = '';
      this.showScreen('workoutComplete');
    });
  },

  // ─── EXERCISE LIBRARY MODALS ──────────────────────────────
  showAddExerciseModal() {
    this.showAddExerciseForWorkout(); // Reuse the modal
  },

  showEditExerciseModal(id) {
    const ex = this.exercises.find(e => e.id === id);
    if (!ex) return;
    const selected = new Set(ex.muscleGroups || []);

    const html = `
      <div class="modal-overlay" id="edit-ex-overlay">
        <div class="modal-sheet" style="max-height:88vh;overflow-y:auto;">
          <div class="modal-handle"></div>
          <div class="text-bold text-white text-lg mb-16">Edit Exercise</div>
          <div class="input-group">
            <label class="input-label">Name</label>
            <input type="text" class="input" value="${this.escapeHtml(ex.name)}" id="edit-ex-name">
          </div>
          <div class="input-group">
            <label class="input-label" style="display:flex;justify-content:space-between;align-items:center;">
              <span>Muscle Groups</span>
              <button id="btn-ai-suggest-muscles" style="background:none;border:1px solid rgba(0,200,200,0.4);border-radius:8px;color:var(--aqua);font-size:0.72rem;padding:3px 10px;cursor:pointer;display:inline-flex;align-items:center;gap:4px;">${this.Icons.robotIcon.replace('width="20" height="20"','width="14" height="14"')} AI Suggest</button>
            </label>
            <div class="flex flex-wrap gap-4 mt-8" id="edit-muscle-chips">
              ${MUSCLE_GROUPS.map(mg => `
                <button class="tag edit-muscle-tag" data-mg="${mg}"
                  style="cursor:pointer;transition:all 0.15s;${selected.has(mg) ? 'background:var(--lagoon);color:#fff;border-color:var(--aqua);' : ''}">
                  ${mg}
                </button>`).join('')}
            </div>
          </div>
          <div class="input-group">
            <label class="input-label">Equipment</label>
            <input type="text" class="input" value="${this.escapeHtml(ex.equipment || '')}" id="edit-ex-equipment">
          </div>
          <div class="input-group">
            <label class="input-label">Notes</label>
            <textarea class="input" id="edit-ex-notes">${this.escapeHtml(ex.notes || '')}</textarea>
          </div>
          <div class="text-xs text-sea mb-16">Used ${ex.timesUsed || 0} times</div>
          <button class="btn btn-accent btn-large mb-8" id="btn-save-edit-ex">Save</button>
          <button class="btn btn-danger btn-large" id="btn-delete-ex">Delete Exercise</button>
        </div>
      </div>
    `;
    document.getElementById('modal-container').innerHTML = html;

    // Chip toggle logic
    document.querySelectorAll('.edit-muscle-tag').forEach(btn => {
      btn.addEventListener('click', () => {
        const mg = btn.dataset.mg;
        if (selected.has(mg)) {
          selected.delete(mg);
          btn.style.background = '';
          btn.style.color = '';
          btn.style.borderColor = '';
        } else {
          selected.add(mg);
          btn.style.background = 'var(--lagoon)';
          btn.style.color = '#fff';
          btn.style.borderColor = 'var(--aqua)';
        }
      });
    });

    // AI Suggest button
    document.getElementById('btn-ai-suggest-muscles').addEventListener('click', async () => {
      const suggestBtn = document.getElementById('btn-ai-suggest-muscles');
      const name = document.getElementById('edit-ex-name').value.trim() || ex.name;
      suggestBtn.innerHTML = `<span style="display:inline-flex;align-items:center;gap:4px;">${this.Icons.hourglassIcon.replace('width="20" height="20"','width="14" height="14"')} Thinking…</span>`;
      suggestBtn.disabled = true;
      const groups = await this._aiSuggestMuscleGroups(name);
      suggestBtn.innerHTML = groups.length
        ? `<span style="display:inline-flex;align-items:center;gap:4px;">${this.Icons.check.replace('width="24" height="24"','width="14" height="14"')} Done</span>`
        : `<span style="display:inline-flex;align-items:center;gap:4px;">${this.Icons.robotIcon.replace('width="20" height="20"','width="14" height="14"')} AI Suggest</span>`;
      suggestBtn.disabled = false;
      if (groups.length) {
        selected.clear();
        groups.forEach(mg => selected.add(mg));
        document.querySelectorAll('.edit-muscle-tag').forEach(btn => {
          const active = selected.has(btn.dataset.mg);
          btn.style.background = active ? 'var(--lagoon)' : '';
          btn.style.color = active ? '#fff' : '';
          btn.style.borderColor = active ? 'var(--aqua)' : '';
        });
      } else {
        this.showToast('No suggestion found — try typing the name more specifically');
      }
    });

    document.getElementById('edit-ex-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'edit-ex-overlay') document.getElementById('modal-container').innerHTML = '';
    });

    document.getElementById('btn-save-edit-ex').addEventListener('click', async () => {
      ex.name = document.getElementById('edit-ex-name').value.trim();
      ex.muscleGroups = Array.from(selected);
      ex.equipment = document.getElementById('edit-ex-equipment').value.trim();
      ex.notes = document.getElementById('edit-ex-notes').value.trim();
      await DB.saveExercise(ex);
      document.getElementById('modal-container').innerHTML = '';
      this.showScreen('exerciseLibrary');
    });

    document.getElementById('btn-delete-ex').addEventListener('click', async () => {
      const hasHistory = this.workouts.some(w => w.exercises.some(e => e.exerciseId === ex.id || e.name === ex.name));
      const msg = hasHistory
        ? 'This exercise has workout history. Delete anyway? (History will be kept)'
        : 'Delete this exercise?';
      if (confirm(msg)) {
        await DB.deleteExercise(ex.id);
        this.exercises = this.exercises.filter(e => e.id !== ex.id);
        document.getElementById('modal-container').innerHTML = '';
        this.showScreen('exerciseLibrary');
      }
    });
  },

  // ─── EDIT PAST WORKOUT MODAL ────────────────────────────────
  showEditWorkoutModal(w) {
    const unit = this.settings.defaultWeightUnit;

    // Deep-clone exercises so we mutate editState, not the live workout
    const editState = w.exercises.map(ex => ({
      name: ex.name,
      notes: ex.notes || '',
      bilateral: ex.bilateral ?? this._detectBilateral(ex.name) === true,
      sets: ex.sets.map(s => ({
        weight: s.weight ?? '',
        reps:   s.reps   ?? '',
        weightUnit: s.weightUnit || unit,
      })),
    }));

    // Build all exercise names for autocomplete (library + EXERCISE_MUSCLE_MAP keys)
    const allExerciseNames = Array.from(new Set([
      ...this.exercises.map(e => e.name),
      ...Object.keys(EXERCISE_MUSCLE_MAP).map(k => k.charAt(0).toUpperCase() + k.slice(1)),
    ])).sort();

    // ── Render just the exercises block (called on every mutation) ──
    const renderExercises = () => {
      const container = document.getElementById('edit-exercises-container');
      if (!container) return;
      container.innerHTML = editState.map((ex, exIdx) => `
        <div class="edit-ex-block" data-ex-idx="${exIdx}" style="margin-bottom:16px;padding:14px;background:rgba(255,255,255,0.04);border-radius:var(--radius-md);border:1px solid var(--glass-border);">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
            <div style="display:flex;align-items:center;gap:8px;">
              <div class="text-bold text-white" style="font-size:0.9rem;">${this.escapeHtml(ex.name)}</div>
              ${ex.bilateral ? `<span style="font-size:0.6rem;font-weight:800;letter-spacing:0.04em;color:#021628;background:var(--aqua);border-radius:4px;padding:2px 4px;line-height:1;">×2</span>` : ''}
            </div>
            <div style="display:flex;align-items:center;gap:12px;">
              <button class="btn-toggle-bilateral" data-ex="${exIdx}"
                style="background:none;border:none;color:${ex.bilateral ? 'var(--aqua)' : 'var(--text-muted)'};cursor:pointer;padding:2px;display:flex;align-items:center;" title="Toggle Two Dumbbells (×2 weight)">
                ${this.Icons.dumbbell}
              </button>
              <button class="btn-remove-ex" data-ex="${exIdx}"
                style="background:none;border:none;color:rgba(255,100,100,0.7);cursor:pointer;font-size:1.1rem;padding:2px 6px;line-height:1;" title="Remove exercise">✕</button>
            </div>
          </div>
          <div class="edit-sets-list" data-ex="${exIdx}">
            ${ex.sets.map((s, sIdx) => `
              <div class="edit-set-row" data-ex="${exIdx}" data-set="${sIdx}" style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                <div class="set-number completed" style="width:20px;height:20px;font-size:0.65rem;flex-shrink:0;">${sIdx + 1}</div>
                <input type="number" inputmode="decimal" class="input edit-set-weight" step="0.5" min="0"
                  data-ex="${exIdx}" data-set="${sIdx}" value="${s.weight}" placeholder="wt"
                  style="width:68px;text-align:center;padding:5px 6px;">
                <span class="text-xs text-muted">${s.weightUnit}</span>
                <span class="text-xs text-muted">×</span>
                <input type="number" inputmode="numeric" class="input edit-set-reps" step="1" min="0"
                  data-ex="${exIdx}" data-set="${sIdx}" value="${s.reps}" placeholder="reps"
                  style="width:56px;text-align:center;padding:5px 6px;">
                <button class="btn-remove-set" data-ex="${exIdx}" data-set="${sIdx}"
                  style="background:none;border:none;color:rgba(255,100,100,0.6);cursor:pointer;font-size:1rem;padding:2px 5px;line-height:1;margin-left:auto;" title="Remove set">–</button>
              </div>
            `).join('')}
          </div>
          <button class="btn-add-set" data-ex="${exIdx}"
            style="margin-top:6px;padding:6px 12px;background:rgba(0,200,255,0.08);border:1px solid rgba(0,200,255,0.2);border-radius:var(--radius-sm);color:var(--aqua);font-size:0.75rem;font-weight:700;cursor:pointer;font-family:inherit;">
            + Add Set
          </button>
        </div>
      `).join('') + `
        <div style="margin-top:4px;margin-bottom:8px;">
          <div style="display:flex;gap:8px;position:relative;">
            <input type="text" id="edit-add-ex-input" class="input" placeholder="Add exercise (type to search)…"
              style="flex:1;" autocomplete="off">
            <button id="btn-confirm-add-ex"
              style="padding:8px 14px;background:linear-gradient(135deg,var(--teal),var(--lagoon));border:none;border-radius:var(--radius-md);color:#021628;font-weight:800;font-size:0.8rem;cursor:pointer;font-family:inherit;white-space:nowrap;">
              + Add
            </button>
          </div>
          <div id="edit-ex-suggestions" style="display:none;position:absolute;left:0;right:0;z-index:50;background:#0a1628;border:1px solid var(--glass-border);border-radius:var(--radius-md);max-height:180px;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,0.85);margin-top:2px;"></div>
        </div>
      `;
      _bindExerciseContainerEvents();
    };

    // ── Flush input values into editState before any mutation ──
    const _flushInputs = () => {
      document.querySelectorAll('.edit-set-weight').forEach(inp => {
        const ei = parseInt(inp.dataset.ex), si = parseInt(inp.dataset.set);
        if (editState[ei]?.sets[si]) editState[ei].sets[si].weight = parseFloat(inp.value) || 0;
      });
      document.querySelectorAll('.edit-set-reps').forEach(inp => {
        const ei = parseInt(inp.dataset.ex), si = parseInt(inp.dataset.set);
        if (editState[ei]?.sets[si]) editState[ei].sets[si].reps = parseFloat(inp.value) || 0;
      });
    };

    // ── Event delegation on the exercises container ──
    const _bindExerciseContainerEvents = () => {
      const container = document.getElementById('edit-exercises-container');
      if (!container) return;

      // Toggle Bilateral
      container.querySelectorAll('.btn-toggle-bilateral').forEach(btn => {
        btn.addEventListener('click', () => {
          _flushInputs();
          const exIdx = parseInt(btn.dataset.ex);
          editState[exIdx].bilateral = !editState[exIdx].bilateral;
          renderExercises();
        });
      });

      // Remove exercise
      container.querySelectorAll('.btn-remove-ex').forEach(btn => {
        btn.addEventListener('click', () => {
          _flushInputs();
          const exIdx = parseInt(btn.dataset.ex);
          if (editState.length <= 1) { this.showToast('Need at least one exercise'); return; }
          editState.splice(exIdx, 1);
          renderExercises();
        });
      });

      // Remove set
      container.querySelectorAll('.btn-remove-set').forEach(btn => {
        btn.addEventListener('click', () => {
          _flushInputs();
          const exIdx = parseInt(btn.dataset.ex), sIdx = parseInt(btn.dataset.set);
          if (editState[exIdx].sets.length <= 1) { this.showToast('Need at least one set'); return; }
          editState[exIdx].sets.splice(sIdx, 1);
          renderExercises();
        });
      });

      // Add set
      container.querySelectorAll('.btn-add-set').forEach(btn => {
        btn.addEventListener('click', () => {
          _flushInputs();
          const exIdx = parseInt(btn.dataset.ex);
          // Default new set to last set's values
          const lastSet = editState[exIdx].sets[editState[exIdx].sets.length - 1];
          editState[exIdx].sets.push({
            weight: lastSet?.weight ?? '',
            reps:   lastSet?.reps   ?? '',
            weightUnit: lastSet?.weightUnit || unit,
          });
          renderExercises();
        });
      });

      // Add exercise: autocomplete
      const exInput = document.getElementById('edit-add-ex-input');
      const suggestBox = document.getElementById('edit-ex-suggestions');
      if (exInput && suggestBox) {
        exInput.addEventListener('input', () => {
          const q = exInput.value.trim().toLowerCase();
          if (!q) { suggestBox.style.display = 'none'; return; }
          const hits = allExerciseNames.filter(n => n.toLowerCase().includes(q)).slice(0, 8);
          if (!hits.length) { suggestBox.style.display = 'none'; return; }
          suggestBox.style.display = 'block';
          suggestBox.innerHTML = hits.map(h =>
            `<div class="edit-ex-suggestion" style="padding:10px 14px;cursor:pointer;font-size:0.85rem;color:#e8f4ff;border-bottom:1px solid rgba(255,255,255,0.10);">${this.escapeHtml(h)}</div>`
          ).join('');
          suggestBox.querySelectorAll('.edit-ex-suggestion').forEach(el => {
            el.addEventListener('mouseenter', () => { el.style.background = 'rgba(0,180,255,0.12)'; });
            el.addEventListener('mouseleave', () => { el.style.background = ''; });
            el.addEventListener('click', () => {
              exInput.value = el.textContent;
              suggestBox.style.display = 'none';
            });
          });
        });
        exInput.addEventListener('keydown', e => {
          if (e.key === 'Escape') suggestBox.style.display = 'none';
        });
      }

      // Confirm add exercise
      const confirmBtn = document.getElementById('btn-confirm-add-ex');
      if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
          const inp = document.getElementById('edit-add-ex-input');
          const name = inp?.value.trim();
          if (!name) { this.showToast('Enter an exercise name'); return; }
          _flushInputs();
          const setsToClone = parseInt(this.settings.defaultSetsPerExercise) || 3;
          editState.push({
            name,
            notes: '',
            sets: Array.from({ length: setsToClone }, () => ({ weight: '', reps: '', weightUnit: unit })),
          });
          if (inp) inp.value = '';
          const sug = document.getElementById('edit-ex-suggestions');
          if (sug) sug.style.display = 'none';
          renderExercises();
          // Scroll to new exercise
          setTimeout(() => {
            const newBlock = document.getElementById('edit-exercises-container')?.lastElementChild?.previousElementSibling;
            newBlock?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 60);
        });
      }
    };

    // ── Build the modal shell (notes + action buttons are outside the exercise container) ──
    const html = `
      <div class="modal-overlay" id="edit-workout-overlay">
        <div class="modal-sheet" style="max-height:92vh;overflow-y:auto;padding-bottom:env(safe-area-inset-bottom,0px);">
          <div class="modal-handle"></div>
          <div class="text-bold text-white text-lg mb-4">Edit Workout</div>
          <div class="text-xs text-sea mb-16">${new Date(w.date).toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric'})}</div>

          <div id="edit-exercises-container" style="position:relative;"></div>

          <div class="input-group" style="margin-top:12px;">
            <label class="input-label">Notes</label>
            <textarea class="input" id="edit-workout-notes" rows="2">${this.escapeHtml(w.notes || '')}</textarea>
          </div>
          <div class="flex gap-8 mt-16">
            <button class="btn btn-accent flex-1" id="btn-save-edit-workout">Save Changes</button>
            <button class="btn btn-ghost" id="btn-cancel-edit-workout">Cancel</button>
          </div>
        </div>
      </div>
    `;
    document.getElementById('modal-container').innerHTML = html;

    // Render exercises into the container
    renderExercises();

    // ── Close / cancel ──
    document.getElementById('edit-workout-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'edit-workout-overlay') document.getElementById('modal-container').innerHTML = '';
    });
    document.getElementById('btn-cancel-edit-workout').addEventListener('click', () => {
      document.getElementById('modal-container').innerHTML = '';
    });

    // ── Save ──
    document.getElementById('btn-save-edit-workout').addEventListener('click', async () => {
      // Flush any in-progress inputs
      _flushInputs();

      // Write editState back to the workout object
      w.exercises = editState.map(ex => ({
        ...ex,
        bilateral: ex.bilateral,
        sets: ex.sets.map(s => ({
          weight: parseFloat(s.weight) || 0,
          reps:   parseFloat(s.reps)   || 0,
          weightUnit: s.weightUnit || unit,
          completed: true,
        })),
      }));
      w.notes = document.getElementById('edit-workout-notes').value.trim();

      // Recalculate total volume for profile stat accuracy
      w._editedVolume = w.exercises.reduce((sum, ex) =>
        sum + this._exVol(ex), 0);

      await DB.saveWorkout(w);
      const idx = this.workouts.findIndex(wk => wk.id === w.id);
      if (idx >= 0) this.workouts[idx] = w;

      // Retroactively update overall profile stats based on edit
      await this._recalculateProfileStats();

      document.getElementById('modal-container').innerHTML = '';
      this.showToast('Workout updated!');
      this.showScreen('workoutDetail', { workout: w });
    });
  },

  // ─── DELETE WORKOUT ────────────────────────────────────────
  async deleteWorkout(id) {
    if (confirm('Delete this workout? This cannot be undone.')) {
      await DB.deleteWorkout(id);
      this.workouts = this.workouts.filter(w => w.id !== id);
      this.showToast('Workout deleted');
      this.showScreen('logs');
    }
  },

  // ─── SEARCH / FILTER ──────────────────────────────────────
  filterHistory(query) {
    const q = query.toLowerCase();
    document.querySelectorAll('[data-workout-id]').forEach(el => {
      const text = el.textContent.toLowerCase();
      el.style.display = text.includes(q) ? '' : 'none';
    });
  },

  filterExercises(query) {
    const q = query.toLowerCase();
    document.querySelectorAll('[data-exercise-id]').forEach(el => {
      const text = el.textContent.toLowerCase();
      el.style.display = text.includes(q) ? '' : 'none';
    });
  },

  // ─── PR DETECTION ─────────────────────────────────────────
  checkAndUpdatePR(exerciseName, set) {
    const prs = this.profile.personalRecords;
    if (!prs[exerciseName]) {
      prs[exerciseName] = {};
    }

    let isPR = false;
    const weight = set.weight || 0;
    const reps = set.reps || 0;
    const volume = weight * reps;

    // Max weight PR
    if (!prs[exerciseName].maxWeight || weight > prs[exerciseName].maxWeight.value) {
      prs[exerciseName].maxWeight = {
        value: weight,
        unit: set.weightUnit || this.settings.defaultWeightUnit,
        reps,
        date: new Date().toISOString()
      };
      isPR = true;
    }

    // Max reps at same weight PR
    if (!prs[exerciseName].maxReps ||
        (weight >= (prs[exerciseName].maxReps.weight || 0) && reps > (prs[exerciseName].maxReps.value || 0))) {
      prs[exerciseName].maxReps = {
        value: reps,
        weight,
        date: new Date().toISOString()
      };
      isPR = true;
    }

    // Max volume single set
    if (!prs[exerciseName].maxVolume || volume > (prs[exerciseName].maxVolume.value || 0)) {
      prs[exerciseName].maxVolume = {
        value: volume,
        date: new Date().toISOString()
      };
    }

    if (isPR) {
      DB.saveProfile(this.profile);
    }

    return isPR;
  },

  getRecentPRs(count) {
    const prs = [];
    for (const [name, data] of Object.entries(this.profile.personalRecords || {})) {
      if (data.maxWeight) {
        prs.push({
          exercise: name,
          weight: data.maxWeight.value,
          unit: data.maxWeight.unit || this.settings.defaultWeightUnit,
          reps: data.maxWeight.reps || 0,
          date: data.maxWeight.date
        });
      }
    }
    return prs.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, count);
  },

  getPreviousSet(exerciseName, setIndex) {
    // Find the last workout with this exercise
    const sorted = [...this.workouts].sort((a, b) => new Date(b.date) - new Date(a.date));
    for (const w of sorted) {
      const ex = w.exercises.find(e => e.name === exerciseName);
      if (ex && ex.sets[setIndex]) {
        return ex.sets[setIndex];
      }
    }
    return null;
  },

  // ─── LEVEL SYSTEM ─────────────────────────────────────────
  getLevelInfo(xp) {
    let level = 0;
    for (let i = this.LEVELS.length - 1; i >= 0; i--) {
      if (xp >= this.LEVELS[i].xp) {
        level = i;
        break;
      }
    }
    const current = this.LEVELS[level];
    const next = this.LEVELS[Math.min(level + 1, this.LEVELS.length - 1)];
    const xpInLevel = xp - current.xp;
    const xpForLevel = next.xp - current.xp;
    const progress = xpForLevel > 0 ? Math.min(100, (xpInLevel / xpForLevel) * 100) : 100;

    return {
      level,
      title: current.title,
      nextTitle: next.title,
      nextXp: next.xp,
      xpToNext: Math.max(0, next.xp - xp),
      progress
    };
  },

  // Returns CSS class for the avatar ring based on level tier
  _getAvatarRingClass(level) {
    if (level >= 16) return 'avatar-ring-5';
    if (level >= 12) return 'avatar-ring-4';
    if (level >= 8)  return 'avatar-ring-3';
    if (level >= 4)  return 'avatar-ring-2';
    return 'avatar-ring-1';
  },

  // ─── WEEK DATA ─────────────────────────────────────────────
  getWeekData() {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const weekData = [];
    let maxVolume = 0;

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateStr = date.toDateString();

      const dayWorkouts = this.workouts.filter(w => new Date(w.date).toDateString() === dateStr);
      const volume = dayWorkouts.reduce((sum, w) =>
        sum + w.exercises.reduce((s, ex) =>
        sum + this._exVol(ex), 0), 0);

      if (volume > maxVolume) maxVolume = volume;

      weekData.push({
        label: days[i],
        date: dateStr,
        isToday: dateStr === today.toDateString(),
        isFuture: date > today,
        hasWorkout: dayWorkouts.length > 0,
        volume,
        workoutId: dayWorkouts[0]?.id || ''
      });
    }

    weekData.forEach(d => {
      d.volumePercent = maxVolume > 0 ? (d.volume / maxVolume) * 100 : 0;
    });

    return weekData;
  },

  getWeekVolume(weekOffset = 0) {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (weekOffset * 7));
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    return this.workouts
      .filter(w => {
        const d = new Date(w.date);
        return d >= startOfWeek && d < endOfWeek;
      })
      .reduce((sum, w) =>
        sum + w.exercises.reduce((s, ex) =>
          s + this._exVol(ex), 0), 0);
  },

  getVolumeHistory(weeks) {
    const data = [];
    let maxVol = 0;
    for (let i = weeks - 1; i >= 0; i--) {
      const vol = this.getWeekVolume(-i);
      if (vol > maxVol) maxVol = vol;
      data.push({
        volume: vol,
        label: i === 0 ? 'This' : `${i}w ago`
      });
    }
    data.forEach(d => {
      d.percent = maxVol > 0 ? (d.volume / maxVol) * 100 : 0;
    });
    return data;
  },

  getMuscleHeatmapData(days = 7) {
    const muscles = {};
    const cutoff = new Date(Date.now() - days * 86400000);

    this.workouts
      .filter(w => new Date(w.date) >= cutoff)
      .forEach(w => {
        w.exercises.forEach(ex => {
          const groups = this._getMuscleGroups(ex.name, ex.exerciseId);
          groups.forEach(mg => {
            muscles[mg] = (muscles[mg] || 0) + ex.sets.length;
          });
        });
      });

    // Normalize to 1-5 scale (only muscles that were actually trained)
    const maxSets = Math.max(1, ...Object.values(muscles));
    for (const key of Object.keys(muscles)) {
      muscles[key] = Math.min(5, Math.ceil((muscles[key] / maxSets) * 5));
    }

    return muscles; // only contains muscles with intensity >= 1
  },

  // ─── SVG BODY HEATMAP ──────────────────────────────────────
  _buildBodyHeatmap(muscleData) {
    const C = [
      'rgba(255,255,255,0.06)', // 0 — untrained
      'rgba(0,160,185,0.35)',   // 1
      'rgba(0,200,220,0.55)',   // 2
      'rgba(255,210,55,0.65)',  // 3
      'rgba(255,125,35,0.80)',  // 4
      'rgba(215,45,30,0.90)',   // 5
    ];

    // Each SVG region → which muscle groups contribute to it
    const RM = {
      chest:  ['Chest', 'Full Body'],
      shl:    ['Shoulders', 'Full Body'],
      shr:    ['Shoulders', 'Full Body'],
      bil:    ['Biceps', 'Full Body'],
      bir:    ['Biceps', 'Full Body'],
      fal:    ['Forearms', 'Full Body'],
      far:    ['Forearms', 'Full Body'],
      abs:    ['Abs', 'Full Body', 'Cardio'],
      ql:     ['Quads', 'Full Body', 'Cardio'],
      qr:     ['Quads', 'Full Body', 'Cardio'],
      clf:    ['Calves', 'Full Body', 'Cardio'],
      crf:    ['Calves', 'Full Body', 'Cardio'],
      traps:  ['Traps', 'Full Body'],
      sbsl:   ['Shoulders', 'Full Body'],
      sbsr:   ['Shoulders', 'Full Body'],
      back:   ['Back', 'Lats', 'Full Body'],
      tril:   ['Triceps', 'Full Body'],
      trir:   ['Triceps', 'Full Body'],
      glutes: ['Glutes', 'Full Body', 'Cardio'],
      hl:     ['Hamstrings', 'Full Body', 'Cardio'],
      hr:     ['Hamstrings', 'Full Body', 'Cardio'],
      clb:    ['Calves', 'Full Body', 'Cardio'],
      crb:    ['Calves', 'Full Body', 'Cardio'],
    };

    // Build intensity per region (max of all contributing muscles)
    const ri = {};
    for (const [region, muscles] of Object.entries(RM)) {
      ri[region] = Math.max(0, ...muscles.map(m => muscleData[m] || 0));
    }
    const f = id => C[ri[id] || 0];
    const base = 'rgba(255,255,255,0.07)';
    const sk   = 'rgba(255,255,255,0.16)';
    const ol   = 'rgba(255,255,255,0.11)';

    // Trained muscle summary (for text label)
    const trained = Object.entries(muscleData).sort((a,b)=>b[1]-a[1]).map(([m])=>m).join(' · ') || 'None';

    return `
      <svg viewBox="0 0 190 205" width="100%" style="display:block;max-width:400px;margin:0 auto;">

        <!-- ── FRONT ── -->
        <g>
          <circle cx="47" cy="13" r="10" fill="${base}" stroke="${ol}" stroke-width="0.8"/>
          <rect x="43" y="23" width="8" height="7" rx="2" fill="${base}" stroke="${ol}" stroke-width="0.8"/>
          <ellipse cx="30" cy="39" rx="10" ry="8" fill="${f('shl')}" stroke="${sk}" stroke-width="0.8"/>
          <ellipse cx="64" cy="39" rx="10" ry="8" fill="${f('shr')}" stroke="${sk}" stroke-width="0.8"/>
          <rect x="32" y="30" width="30" height="26" rx="5" fill="${f('chest')}" stroke="${sk}" stroke-width="0.8"/>
          <rect x="19" y="35" width="12" height="27" rx="6" fill="${f('bil')}" stroke="${sk}" stroke-width="0.8"/>
          <rect x="63" y="35" width="12" height="27" rx="6" fill="${f('bir')}" stroke="${sk}" stroke-width="0.8"/>
          <rect x="18" y="64" width="11" height="22" rx="4" fill="${f('fal')}" stroke="${sk}" stroke-width="0.8"/>
          <rect x="65" y="64" width="11" height="22" rx="4" fill="${f('far')}" stroke="${sk}" stroke-width="0.8"/>
          <rect x="33" y="56" width="28" height="30" rx="4" fill="${f('abs')}" stroke="${sk}" stroke-width="0.8"/>
          <rect x="30" y="86" width="34" height="10" rx="5" fill="${base}" stroke="${ol}" stroke-width="0.8"/>
          <rect x="30" y="96" width="15" height="42" rx="7" fill="${f('ql')}" stroke="${sk}" stroke-width="0.8"/>
          <rect x="49" y="96" width="15" height="42" rx="7" fill="${f('qr')}" stroke="${sk}" stroke-width="0.8"/>
          <rect x="31" y="141" width="13" height="33" rx="6" fill="${f('clf')}" stroke="${sk}" stroke-width="0.8"/>
          <rect x="50" y="141" width="13" height="33" rx="6" fill="${f('crf')}" stroke="${sk}" stroke-width="0.8"/>
          <rect x="29" y="174" width="15" height="7" rx="3" fill="${base}" stroke="${ol}" stroke-width="0.8"/>
          <rect x="50" y="174" width="15" height="7" rx="3" fill="${base}" stroke="${ol}" stroke-width="0.8"/>
          <text x="47" y="192" text-anchor="middle" fill="rgba(120,195,215,0.6)" font-size="7.5" font-family="-apple-system,sans-serif" font-weight="600" letter-spacing="0.5">FRONT</text>
        </g>

        <!-- ── BACK ── -->
        <g transform="translate(96,0)">
          <circle cx="47" cy="13" r="10" fill="${base}" stroke="${ol}" stroke-width="0.8"/>
          <rect x="43" y="23" width="8" height="7" rx="2" fill="${base}" stroke="${ol}" stroke-width="0.8"/>
          <path d="M44,25 L50,25 L64,47 L30,47 Z" fill="${f('traps')}" stroke="${sk}" stroke-width="0.8"/>
          <ellipse cx="30" cy="39" rx="10" ry="8" fill="${f('sbsl')}" stroke="${sk}" stroke-width="0.8"/>
          <ellipse cx="64" cy="39" rx="10" ry="8" fill="${f('sbsr')}" stroke="${sk}" stroke-width="0.8"/>
          <path d="M30,47 L64,47 L59,87 L35,87 Z" fill="${f('back')}" stroke="${sk}" stroke-width="0.8"/>
          <rect x="19" y="35" width="12" height="27" rx="6" fill="${f('tril')}" stroke="${sk}" stroke-width="0.8"/>
          <rect x="63" y="35" width="12" height="27" rx="6" fill="${f('trir')}" stroke="${sk}" stroke-width="0.8"/>
          <rect x="18" y="64" width="11" height="22" rx="4" fill="${f('fal')}" stroke="${sk}" stroke-width="0.8"/>
          <rect x="65" y="64" width="11" height="22" rx="4" fill="${f('far')}" stroke="${sk}" stroke-width="0.8"/>
          <rect x="30" y="87" width="34" height="22" rx="8" fill="${f('glutes')}" stroke="${sk}" stroke-width="0.8"/>
          <rect x="30" y="109" width="15" height="36" rx="7" fill="${f('hl')}" stroke="${sk}" stroke-width="0.8"/>
          <rect x="49" y="109" width="15" height="36" rx="7" fill="${f('hr')}" stroke="${sk}" stroke-width="0.8"/>
          <rect x="31" y="148" width="13" height="28" rx="6" fill="${f('clb')}" stroke="${sk}" stroke-width="0.8"/>
          <rect x="50" y="148" width="13" height="28" rx="6" fill="${f('crb')}" stroke="${sk}" stroke-width="0.8"/>
          <rect x="29" y="176" width="15" height="7" rx="3" fill="${base}" stroke="${ol}" stroke-width="0.8"/>
          <rect x="50" y="176" width="15" height="7" rx="3" fill="${base}" stroke="${ol}" stroke-width="0.8"/>
          <text x="47" y="192" text-anchor="middle" fill="rgba(120,195,215,0.6)" font-size="7.5" font-family="-apple-system,sans-serif" font-weight="600" letter-spacing="0.5">BACK</text>
        </g>

        <!-- Divider -->
        <line x1="95" y1="4" x2="95" y2="186" stroke="rgba(255,255,255,0.07)" stroke-width="0.5"/>

        <!-- Legend -->
        <g transform="translate(15,197)">
          <text x="0" y="7" fill="rgba(120,190,210,0.55)" font-size="7" font-family="-apple-system,sans-serif">Less</text>
          ${[1,2,3,4,5].map((i,idx) => `<rect x="${27+idx*13}" y="0" width="11" height="8" rx="2" fill="${C[i]}"/>`).join('')}
          <text x="96" y="7" fill="rgba(120,190,210,0.55)" font-size="7" font-family="-apple-system,sans-serif">More</text>
        </g>
      </svg>
      <div style="text-align:center;font-size:0.68rem;color:var(--text-muted);margin-top:6px;line-height:1.5;">${trained}</div>`;
  },

  // ─── CELEBRATIONS ──────────────────────────────────────────
  showCelebration(emoji, title, detail) {
    const container = document.getElementById('celebration-container');
    container.innerHTML = `
      <div class="celebration-overlay" id="celebration-overlay">
        <div class="celebration-emoji">${emoji}</div>
        <div class="celebration-title">${title}</div>
        <div class="celebration-detail">${detail}</div>
      </div>
    `;

    // Confetti
    for (let i = 0; i < 30; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.animationDelay = Math.random() * 0.5 + 's';
      confetti.style.background = ['#F6AE2D', '#E0533B', '#087E8B', '#5FAD56', '#F9C74F', '#FF7B54'][Math.floor(Math.random() * 6)];
      container.appendChild(confetti);
    }

    setTimeout(() => {
      container.innerHTML = '';
    }, 3000);
  },

  // ─── TOAST ─────────────────────────────────────────────────
  showToast(message, duration = 3000) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), duration);
  },

  // ─── HELPERS ──────────────────────────────────────────────
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  },

  escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  formatVolume(vol) {
    if (vol >= 1000000) return (vol / 1000000).toFixed(1) + 'M';
    if (vol >= 1000) return (vol / 1000).toFixed(1) + 'K';
    return vol.toString();
  },

  getGreeting() {
    const hour = new Date().getHours();
    if (hour < 6) return 'Late night session';
    if (hour < 12) return 'Morning on the Shore';
    if (hour < 17) return 'Island Afternoon';
    if (hour < 21) return 'Sunset Session';
    return 'Night owl gains';
  },

  async triggerMissingIconGeneration() {
    if (this._isGeneratingIcons) return;
    this._isGeneratingIcons = true;
    try {
      for (const ex of this.exercises) {
        if (!ex.icon) {
          let icon = null;
          if (this.settings.geminiApiKey) {
            // Use Gemini SVG generation if key available
            icon = await AI.generateExerciseIcon(ex.name, ex.muscleGroups);
            await new Promise(r => setTimeout(r, 4500)); // respect rate limit
          } else {
            // Fall back to Pollinations URL (no key needed, deterministic)
            icon = this._getExerciseIconUrl(ex.name);
          }
          if (icon) {
            ex.icon = icon;
            await DB.saveExercise(ex);
            const iconEl = document.getElementById(`icon-${ex.id}`);
            if (iconEl) {
              iconEl.innerHTML = `<img src="${icon}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" class="fade-in" loading="lazy">`;
            }
          }
        }
      }
    } finally {
      this._isGeneratingIcons = false;
    }
  }
};

// ─── Boot ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => App.init());
