// app.js — Main application logic for Tropical Workout Tracker
// ═══════════════════════════════════════════════════════════════

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
    add: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
    dumbbell: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6.5 6.5 11 11"/><path d="m21 21-1.5-1.5"/><path d="m3 3 1.5 1.5"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/></svg>`,
    stats: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
    profile: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    back: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>`,
    check: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    chevronRight: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`,
    palm: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 8c0-2.76-2.46-5-5.5-5S2 5.24 2 8c0 2.21 1.79 4 4 4"/><path d="M13 7.14A5.82 5.82 0 0 1 16.5 6c3.04 0 5.5 2.24 5.5 5 0 2.47-1.96 4.54-4.5 4.93"/><path d="M5.89 12c-.41 1.33-.76 2.87-.72 4.4a16.63 16.63 0 0 0 1.63 7.6"/><path d="M17.15 15.82c-.52 1.33-1.07 2.76-1.55 4.18"/><path d="M12 11c0 2.76-1.34 5-3 5s-3-2.24-3-5"/></svg>`,
    sun: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`,
    moon: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,
    anchor: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/><path d="M9 20 5 12"/><path d="m15 20 4-8"/></svg>`
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
    theme: 'auto'
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
  },

  async loadData() {
    this.profile = await DB.getProfile() || { ...this.DEFAULT_PROFILE };
    this.exercises = await DB.getAllExercises();
    this.workouts = await DB.getAllWorkouts();

    // Load settings
    this.settings = {};
    for (const [key, defaultVal] of Object.entries(this.DEFAULT_SETTINGS)) {
      const saved = await DB.getSetting(key);
      this.settings[key] = saved !== null ? saved : defaultVal;
    }
    this.applyTheme();
  },

  applyTheme() {
    const theme = this.settings.theme || 'auto';
    document.body.classList.remove('theme-light', 'theme-dark');
    if (theme === 'light') document.body.classList.add('theme-light');
    if (theme === 'dark') document.body.classList.add('theme-dark');
  },

  registerSW() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(err => {
        console.warn('SW registration failed:', err);
      });
    }
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
      home: 'home', history: 'history',
      startWorkout: 'home', activeWorkout: 'home',
      restTimer: 'home', workoutComplete: 'home',
      stats: 'stats', chat: 'chat', settings: 'settings',
      exerciseLibrary: 'home', workoutDetail: 'history',
      profile: 'home', fileUpload: 'chat'
    };
    const activeKey = navMap[screen] || 'home';
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.screen === activeKey);
    });
  },

  // ─── Screen Router ─────────────────────────────────────────
  async showScreen(name, data = {}) {
    this.currentScreen = name;
    this.setActiveNav(name);
    const container = document.getElementById('screen-container');

    const renderers = {
      home: () => this.renderHome(),
      history: () => this.renderHistory(),
      startWorkout: () => this.renderStartWorkout(),
      activeWorkout: () => this.renderActiveWorkout(),
      restTimer: () => this.renderRestTimer(data),
      workoutComplete: () => this.renderWorkoutComplete(),
      stats: () => this.renderStats(),
      chat: () => this.renderCoachChat(data),
      settings: () => this.renderSettings(),
      exerciseLibrary: () => this.renderExerciseLibrary(),
      workoutDetail: () => this.renderWorkoutDetail(data),
      profile: () => this.renderProfile(),
      fileUpload: () => this.renderFileUpload(),
    };

    const renderer = renderers[name];
    if (renderer) {
      container.innerHTML = await renderer();
      this.bindScreenEvents(name, data);
    }
  },

  // ─── HOME SCREEN ──────────────────────────────────────────
  renderHome() {
    const p = this.profile;
    const levelInfo = this.getLevelInfo(p.xp);
    const weekData = this.getWeekData();
    const weekVolume = this.getWeekVolume();
    const lastWeekVolume = this.getWeekVolume(-1);
    const volumeChange = lastWeekVolume > 0
      ? Math.round(((weekVolume - lastWeekVolume) / lastWeekVolume) * 100)
      : 0;
    const recentPRs = this.getRecentPRs(3);
    const todayGreeting = this.getGreeting();

    return `
      <div class="header">
        <span class="header-title">Island Hub</span>
        <button class="header-back" id="btn-profile" style="margin-left:auto;">${this.Icons.profile}</button>
      </div>
      <div class="fade-in">
        <div class="p-16" style="padding-bottom: 8px;">
          <div class="text-sm text-muted">${todayGreeting}</div>
          <div class="text-xl text-extra-bold text-main mt-4">Shore Life, Gains Life!</div>
        </div>

        <!-- Streak + Level Row -->
        <div class="flex gap-8 mx-16 mb-8">
          <div class="streak-badge" id="tap-streak">
            STREAK: ${p.currentStreak} Day${p.currentStreak !== 1 ? 's' : ''}
          </div>
          <div class="streak-badge" id="tap-level" style="background: linear-gradient(135deg, rgba(8,126,139,0.2), rgba(27,160,152,0.2)); border-color: rgba(8,126,139,0.3); color: var(--sea-foam);">
            Lv.${levelInfo.level}
          </div>
        </div>

        <!-- XP Bar -->
        <div class="xp-bar-container" id="tap-xp">
          <div class="xp-bar-header">
            <span>${levelInfo.title}</span>
            <span>${p.xp} / ${levelInfo.nextXp} XP</span>
          </div>
          <div class="xp-bar">
            <div class="xp-bar-fill" style="width: ${levelInfo.progress}%"></div>
          </div>
          <div class="level-title">${levelInfo.xpToNext} XP to ${levelInfo.nextTitle}</div>
        </div>

        <!-- Weekly Activity -->
        <div class="section-header">
          <span class="section-title">This Week</span>
          <span class="text-xs text-sunset">${weekVolume > 0 ? weekVolume.toLocaleString() + ' ' + this.settings.defaultWeightUnit : 'No workouts yet'}</span>
        </div>
        <div class="week-chart" id="week-chart">
          ${weekData.map(d => `
            <div class="week-bar-container" data-date="${d.date}" data-workout-id="${d.workoutId || ''}">
              <div class="week-bar ${d.isToday ? 'today' : d.isFuture ? 'future' : d.hasWorkout ? 'done' : 'future'}"
                   style="height: ${d.hasWorkout ? Math.max(20, d.volumePercent) : 4}%"></div>
              <span class="week-day ${d.isToday ? 'today' : ''}">${d.label}</span>
            </div>
          `).join('')}
        </div>

        ${volumeChange !== 0 ? `
          <div class="text-center text-sm mb-8" style="color: ${volumeChange > 0 ? 'var(--palm-light)' : 'var(--coral)'}">
            ${volumeChange > 0 ? '↑' : '↓'} ${Math.abs(volumeChange)}% vs last week
          </div>
        ` : ''}

        <!-- Quick Stats -->
        <div class="stat-row">
          <div class="stat-chip" id="tap-total-workouts">
            <div class="stat-chip-label">Workouts</div>
            <div class="stat-chip-value">${p.totalWorkouts}</div>
            <div class="stat-chip-sub">all time</div>
          </div>
          <div class="stat-chip" id="tap-total-volume">
            <div class="stat-chip-label">Volume</div>
            <div class="stat-chip-value">${this.formatVolume(p.totalVolume)}</div>
            <div class="stat-chip-sub">total ${this.settings.defaultWeightUnit}</div>
          </div>
          <div class="stat-chip" id="tap-longest-streak">
            <div class="stat-chip-label">Best Streak</div>
            <div class="stat-chip-value">${p.longestStreak}</div>
            <div class="stat-chip-sub">days</div>
          </div>
        </div>

        ${recentPRs.length > 0 ? `
          <div class="section-header">
            <span class="section-title">New PRs</span>
            <button class="section-action" id="tap-all-prs">View All</button>
          </div>
          ${recentPRs.map(pr => `
            <div class="card card-tappable card-highlight" data-pr-exercise="${pr.exercise}">
                <div class="text-coral text-bold">NEW PR</div>
              </div>
            </div>
          `).join('')}
        ` : ''}

        <!-- Start Workout Button -->
        <div class="p-16 mt-8">
          <button class="btn btn-accent btn-large w-full" id="btn-start-workout">
            ${this.Icons.dumbbell} Start Session
          </button>
        </div>

        <!-- Quick Links -->
        <div class="flex gap-8 mx-16 mb-16">
          <button class="btn btn-ghost flex-1" id="btn-profile">${this.Icons.profile} Profile</button>
        </div>

        <div style="height: 20px;"></div>
      </div>
    `;
  },

  // ─── HISTORY SCREEN ───────────────────────────────────────
  renderHistory() {
    const sorted = [...this.workouts].sort((a, b) => new Date(b.date) - new Date(a.date));

    if (sorted.length === 0) {
      return `
        <div class="header">
          <span class="header-title">Workout History</span>
        </div>
        <div class="empty-state">
          <div class="empty-state-icon" style="background: var(--clear-water); border: 2px solid var(--aqua); color: var(--lagoon);">Logs</div>
          <div class="empty-state-title">No Logs Yet</div>
          <div class="empty-state-text">Hit the shore and start lifting!<br>Your journey begins with one rep.</div>
          <button class="btn btn-accent mt-24" id="btn-start-from-history">${this.Icons.dumbbell} Start First Session</button>
        </div>
      `;
    }

    return `
      <div class="header">
        <span class="header-title">Workout History</span>
        <button class="header-action" id="btn-export-history">Export</button>
      </div>
      <div class="search-bar">
        <span class="search-bar-icon" style="padding-left:12px;">${this.Icons.stats}</span>
        <input type="text" class="input" placeholder="Search logs, tags..." id="history-search">
      </div>
      <div id="history-list">
        ${sorted.map(w => this.renderWorkoutCard(w)).join('')}
      </div>
      <div style="height: 20px;"></div>
    `;
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
        ${w.tags && w.tags.length > 0 ? `
          <div class="flex gap-4 mt-8 flex-wrap">
            ${w.tags.map(t => `<span class="tag" style="font-size:0.65rem;">#${t}</span>`).join('')}
          </div>
        ` : ''}
      </div>
    `;
  },

  // ─── START WORKOUT SCREEN ─────────────────────────────────
  renderStartWorkout() {
    return `
      <div class="header">
        <button class="header-back" id="btn-back-home">←</button>
        <span class="header-title">New Workout</span>
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
      sum + ex.sets.reduce((s, set) => s + ((set.weight || 0) * (set.reps || 0)), 0), 0);

    return `
      <div class="header">
        <button class="header-back" id="btn-cancel-workout">✕</button>
        <span class="header-title">${w.title || 'Workout'}</span>
        <button class="header-action" id="btn-finish-workout">Finish</button>
      </div>

      <!-- Live Stats Bar -->
      <div class="flex gap-8 p-16" style="padding-top:8px; padding-bottom:8px; background: var(--ocean);">
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
          ＋ Add Exercise
        </button>
      </div>

      <!-- Workout Notes -->
      <div class="p-16" style="padding-top: 0;">
        <button class="btn btn-ghost btn-large" id="btn-workout-notes">
          📝 Workout Notes
        </button>
      </div>

      <div style="height: 40px;"></div>
    `;
  },

  renderExerciseBlock(ex, exIdx) {
    const setsTotal = this.settings.defaultSetsPerExercise;
    return `
      <div class="card slide-up" style="animation-delay: ${exIdx * 0.05}s">
        <div class="flex flex-between" style="align-items: center; margin-bottom: 12px;">
          <div class="text-bold text-white" style="font-size: 1.05rem;">${ex.name}</div>
          <button class="btn btn-small btn-ghost" data-exercise-menu="${exIdx}">⋯</button>
        </div>

        <!-- Set Headers -->
        <div class="set-row" style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 6px;">
          <div class="set-number" style="background:none; color: var(--sea-foam); font-size: 0.7rem;">SET</div>
          <div class="set-input" style="gap: 4px;">
            <span class="flex-1 text-center text-xs text-sea">PREV</span>
            <span class="flex-1 text-center text-xs text-sea">${this.settings.defaultWeightUnit.toUpperCase()}</span>
            <span class="flex-1 text-center text-xs text-sea">REPS</span>
          </div>
          <div style="width:44px; text-align:center;" class="text-xs text-sea">✓</div>
        </div>

        <!-- Sets -->
        ${ex.sets.map((set, setIdx) => this.renderSetRow(set, setIdx, exIdx, ex)).join('')}

        <!-- Add Set -->
        <button class="btn btn-ghost btn-small w-full mt-8" data-add-set="${exIdx}">
          ＋ Add Set
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
          ${isCompleted ? '✓' : ''}
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

        <!-- Motivational Quote (static for now, AI later) -->
        <div class="card mt-24 mx-16">
          <div class="text-sm text-sand" style="font-style: italic;">
            "The last three or four reps is what makes the muscle grow."
          </div>
          <div class="text-xs text-sea mt-4">— Arnold Schwarzenegger</div>
        </div>
      </div>
    `;
  },

  // ─── WORKOUT COMPLETE SCREEN ──────────────────────────────
  renderWorkoutComplete() {
    const w = this.lastCompletedWorkout;
    if (!w) return this.renderHome();

    const totalVolume = w.exercises.reduce((sum, ex) =>
      sum + ex.sets.reduce((s, set) => s + ((set.weight || 0) * (set.reps || 0)), 0), 0);
    const totalSets = w.exercises.reduce((s, e) => s + e.sets.length, 0);
    const durationMin = w.duration ? Math.round(w.duration / 60) : 0;

    return `
      <div class="fade-in text-center" style="padding-top: 40px;">
        <div style="font-size: 4rem;" class="celebration-emoji">🎉</div>
        <div class="text-xl text-extra-bold text-sunset mt-8">Workout Complete!</div>
        <div class="text-sm text-sea mt-4">Great job riding those waves!</div>

        ${w.xpEarned ? `
          <div class="card card-highlight mx-16 mt-16">
            <div class="text-xs text-sea">XP EARNED</div>
            <div class="text-xl text-extra-bold text-sunset">+${w.xpEarned} XP</div>
          </div>
        ` : ''}

        <!-- Summary Stats -->
        <div class="stat-row mt-16">
          <div class="stat-chip">
            <div class="stat-chip-label">Duration</div>
            <div class="stat-chip-value">${durationMin}m</div>
          </div>
          <div class="stat-chip">
            <div class="stat-chip-label">Volume</div>
            <div class="stat-chip-value">${this.formatVolume(totalVolume)}</div>
          </div>
          <div class="stat-chip">
            <div class="stat-chip-label">Sets</div>
            <div class="stat-chip-value">${totalSets}</div>
          </div>
        </div>

        <!-- Exercises Summary -->
        ${w.exercises.map(ex => `
          <div class="card" style="text-align: left;">
            <div class="text-bold text-white">💪 ${ex.name}</div>
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
            🤖 AI Analysis
          </button>
          <button class="btn btn-ghost btn-large mb-8" id="btn-add-post-notes">
            📝 Add Notes
          </button>
          <button class="btn btn-accent btn-large" id="btn-back-home-complete">
            Home
          </button>
        </div>

        <div style="height: 20px;"></div>
      </div>
    `;
  },

  // ─── STATS SCREEN ─────────────────────────────────────────
  renderStats() {
    const p = this.profile;
    const muscleData = this.getMuscleHeatmapData();

    return `
      <div class="header">
        <button class="header-back" id="btn-back-home">${this.Icons.back}</button>
        <span class="header-title">Island Stats</span>
      </div>
      <div class="fade-in">
        <!-- Volume Over Time -->
        <div class="section-header">
          <span class="section-title">Weekly Volume</span>
        </div>
        <div class="card" id="tap-volume-trend">
          <div class="text-xs text-sea">Last 4 Weeks</div>
          <div class="flex gap-4 mt-8" style="align-items: flex-end; height: 60px;">
            ${this.getVolumeHistory(4).map(v => `
              <div class="flex-1 flex flex-col" style="align-items:center; justify-content: flex-end; height: 100%;">
                <div style="width:100%; background: linear-gradient(to top, var(--teal), var(--sea-foam)); border-radius: 4px 4px 0 0; min-height: 4px; height: ${v.percent}%;"></div>
                <div class="text-xs text-sea mt-4">${v.label}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Muscle Heatmap -->
        <div class="section-header">
          <span class="section-title">Muscle Activity (This Week)</span>
        </div>
        <div class="card">
          <div class="flex flex-wrap gap-8" style="justify-content: center;">
            ${Object.entries(muscleData).map(([muscle, intensity]) => `
              <div class="heatmap-region intensity-${Math.min(5, intensity)}"
                   data-muscle="${muscle}"
                   style="position:relative; width: auto; height: auto; padding: 8px 12px; border-radius: var(--radius-sm); cursor: pointer;">
                ${muscle}
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Exercise PRs -->
        <div class="section-header">
          <span class="section-title">Personal Records</span>
        </div>
        ${Object.entries(p.personalRecords || {}).map(([name, pr]) => `
          <div class="card card-tappable" data-pr-exercise="${name}">
            <div class="flex flex-between" style="align-items: center;">
              <div>
                <div class="text-bold text-white">${name}</div>
                <div class="text-xs text-sea">${pr.maxWeight ? pr.maxWeight.value + ' ' + (pr.maxWeight.unit || this.settings.defaultWeightUnit) : ''}</div>
              </div>
              <div class="text-sunset text-bold">${this.Icons.anchor}</div>
            </div>
          </div>
        `).join('')}

        ${Object.keys(p.personalRecords || {}).length === 0 ? `
          <div class="empty-state" style="padding: 30px;">
            <div class="empty-state-icon">${this.Icons.anchor}</div>
            <div class="empty-state-text">Complete workouts to set PRs!</div>
          </div>
        ` : ''}

        <div style="height: 20px;"></div>
      </div>
    `;
  },

  // ─── CHAT SCREEN ──────────────────────────────────────────
  renderCoachChat(data) {
    const prefilledMsg = data.prefill || '';

    return `
      <div class="chat-container">
        <div class="header">
          <span class="header-title">Coach Chat 🦜</span>
          <button class="header-back" id="btn-chat-menu" style="margin-left:auto;">${this.Icons.settings}</button>
        </div>
        <div class="chat-messages" id="chat-messages">
          <div class="chat-bubble ai">
            Hey there! I'm your Florida Keys fitness coach. Tap any stat on the home screen to ask me about it, or ask me anything about training, nutrition, or recovery!
          </div>
          ${this._currentChatMessages ? this._currentChatMessages.map(m => `
            <div class="chat-bubble ${m.role}">${this.escapeHtml(m.content)}</div>
          `).join('') : ''}
        </div>
        <div class="chat-input-bar">
          <button class="btn btn-small btn-ghost" id="btn-chat-upload" style="padding: 10px;">${this.Icons.add}</button>
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
        <span class="header-title">Settings Configuration</span>
      </div>
      <div class="fade-in">
        <!-- Appearance -->
        <div class="section-header">
          <span class="section-title">Appearance</span>
        </div>
        <div class="card">
          <div class="input-group">
            <label class="input-label">Color Scheme</label>
            <select class="input" id="setting-theme">
              <option value="auto" ${s.theme === 'auto' ? 'selected' : ''}>Auto (System Default)</option>
              <option value="light" ${s.theme === 'light' ? 'selected' : ''}>Island Light (Florida Keys)</option>
              <option value="dark" ${s.theme === 'dark' ? 'selected' : ''}>Deep Ocean (Original)</option>
            </select>
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
          <button class="section-action" id="btn-manage-exercises">Manage</button>
        </div>
        <div class="card">
          <div class="text-sm text-sea">${this.exercises.length} exercises saved</div>
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
          <input type="file" id="import-file-input" accept=".json" class="hidden">
          <button class="btn btn-ghost w-full mb-8" id="btn-upload-workout-file">Upload Workout Log (AI Parse)</button>
          <input type="file" id="workout-file-input" accept=".txt,.csv,.json,image/*" class="hidden">
          <div class="divider"></div>
          <button class="btn btn-danger btn-small w-full mt-8" id="btn-clear-all-data">Clear All Data</button>
        </div>

        <button class="btn btn-ghost w-full mx-16 mt-16 mb-16" id="btn-save-settings">
          Save Settings
        </button>

        <div style="height: 20px;"></div>
      </div>
    `;
  },

  // ─── EXERCISE LIBRARY SCREEN ──────────────────────────────
  renderExerciseLibrary() {
    const sorted = [...this.exercises].sort((a, b) => (b.timesUsed || 0) - (a.timesUsed || 0));

    return `
      <div class="header">
        <button class="header-back" id="btn-back-settings">←</button>
        <span class="header-title">Exercise Library</span>
        <button class="header-action" id="btn-add-exercise-lib">＋</button>
      </div>
      <div class="search-bar">
        <span class="search-bar-icon" style="padding-left:12px;">${this.Icons.stats}</span>
        <input type="text" class="input" placeholder="Search exercises..." id="exercise-search">
      </div>
      <div id="exercise-list">
        ${sorted.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state-icon">💪</div>
            <div class="empty-state-title">No Exercises Yet</div>
            <div class="empty-state-text">Exercises are added automatically when you work out, or add them manually.</div>
          </div>
        ` : sorted.map(ex => `
          <div class="exercise-item" data-exercise-id="${ex.id}">
            <div class="exercise-item-icon" id="icon-${ex.id}">
              ${ex.icon ? `<img src="${ex.icon}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">` : this.Icons.palm}
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
    if (!w) return this.renderHistory();

    const date = new Date(w.date);
    const dateStr = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const totalVolume = w.exercises.reduce((sum, ex) =>
      sum + ex.sets.reduce((s, set) => s + ((set.weight || 0) * (set.reps || 0)), 0), 0);

    return `
      <div class="header">
        <button class="header-back" id="btn-back-history">←</button>
        <span class="header-title">${w.title || dateStr}</span>
        <button class="header-action" id="btn-delete-workout" data-id="${w.id}">🗑</button>
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
            <div class="text-bold text-white mb-8">💪 ${ex.name}</div>
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
            <div class="card-title">🤖 AI Analysis</div>
            <div class="text-sm text-sand" style="white-space: pre-wrap;">${this.escapeHtml(w.aiAnalysis)}</div>
          </div>
        ` : ''}

        <div class="p-16">
          <button class="btn btn-primary btn-large mb-8" id="btn-analyze-detail" data-id="${w.id}">
            🤖 ${w.aiAnalysis ? 'Re-Analyze' : 'AI Analysis'}
          </button>
          <button class="btn btn-ghost btn-large" id="btn-back-history-2">← Back</button>
        </div>

        <div style="height: 20px;"></div>
      </div>
    `;
  },

  // ─── PROFILE SCREEN ───────────────────────────────────────
  renderProfile() {
    const p = this.profile;
    const levelInfo = this.getLevelInfo(p.xp);

    return `
      <div class="header">
        <button class="header-back" id="btn-back-home">${this.Icons.back}</button>
        <span class="header-title">Island Profile</span>
      </div>
      <div class="fade-in text-center">
        <div style="font-size: 4rem; margin-top: 30px;">${levelInfo.title.split(' ')[0]}</div>
        <div class="text-xl text-extra-bold text-white mt-8">${levelInfo.title}</div>
        <div class="text-sm text-sea">Level ${levelInfo.level}</div>

        <div class="xp-bar-container mt-16">
          <div class="xp-bar-header">
            <span>${p.xp} XP</span>
            <span>${levelInfo.nextXp} XP</span>
          </div>
          <div class="xp-bar">
            <div class="xp-bar-fill" style="width: ${levelInfo.progress}%"></div>
          </div>
        </div>

        <div class="stat-row mt-16">
          <div class="stat-chip">
            <div class="stat-chip-label">Workouts</div>
            <div class="stat-chip-value">${p.totalWorkouts}</div>
          </div>
          <div class="stat-chip">
            <div class="stat-chip-label">Streak</div>
            <div class="stat-chip-value">STREAK: ${p.currentStreak}</div>
          </div>
          <div class="stat-chip">
            <div class="stat-chip-label">Best Streak</div>
            <div class="stat-chip-value">${p.longestStreak}</div>
          </div>
        </div>

        <div class="stat-row">
          <div class="stat-chip">
            <div class="stat-chip-label">Total Volume</div>
            <div class="stat-chip-value">${this.formatVolume(p.totalVolume)}</div>
            <div class="stat-chip-sub">${this.settings.defaultWeightUnit}</div>
          </div>
          <div class="stat-chip">
            <div class="stat-chip-label">PRs</div>
            <div class="stat-chip-value">${Object.keys(p.personalRecords || {}).length}</div>
          </div>
          <div class="stat-chip">
            <div class="stat-chip-label">Member Since</div>
            <div class="stat-chip-value text-sm">${new Date(p.joinDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>
          </div>
        </div>

        <div style="height: 40px;"></div>
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
        <input type="file" id="ai-file-input" accept=".txt,.csv,.json,.md,image/*" class="hidden">

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
    this.bindClick('btn-back-history', () => this.showScreen('history'));
    this.bindClick('btn-back-history-2', () => this.showScreen('history'));
    this.bindClick('btn-back-chat', () => this.showScreen('chat'));

    switch (screen) {
      case 'home':
        this.bindClick('btn-start-workout', () => this.showScreen('startWorkout'));
        this.bindClick('btn-settings', () => this.showScreen('settings'));
        this.bindClick('btn-profile', () => this.showScreen('profile'));

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

      case 'history':
        this.bindClick('btn-start-from-history', () => this.showScreen('startWorkout'));
        this.bindClick('btn-export-history', () => ExportImport.exportCSV());

        document.querySelectorAll('[data-workout-id]').forEach(el => {
          el.addEventListener('click', () => {
            const w = this.workouts.find(w => w.id === el.dataset.workoutId);
            if (w) this.showScreen('workoutDetail', { workout: w });
          });
        });

        const searchInput = document.getElementById('history-search');
        if (searchInput) {
          searchInput.addEventListener('input', (e) => this.filterHistory(e.target.value));
        }
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

      case 'stats':
        document.querySelectorAll('[data-muscle]').forEach(el => {
          el.addEventListener('click', () => {
            const muscle = el.dataset.muscle;
            this.openAIChat(`This week I trained ${muscle}. Analyze my ${muscle} training volume and frequency based on my workout history. Am I doing enough?`);
          });
        });
        document.querySelectorAll('[data-pr-exercise]').forEach(el => {
          el.addEventListener('click', () => {
            this.openAIChat(`Analyze my ${el.dataset.prExercise} progress over time.`, el.dataset.prExercise);
          });
        });
        this.bindClick('tap-volume-trend', () => this.openAIChat('Analyze my weekly volume trend over the past month. What patterns do you see?'));
        break;

      case 'chat':
        this.bindClick('btn-chat-send', () => this.sendChatMessage());
        this.bindClick('btn-chat-upload', () => this.showScreen('fileUpload'));
        this.bindClick('btn-chat-menu', () => this.showChatMenu());
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
          chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.sendChatMessage();
          });
          if (data.prefill) chatInput.focus();
        }
        // Scroll to bottom
        const msgs = document.getElementById('chat-messages');
        if (msgs) msgs.scrollTop = msgs.scrollHeight;
        break;

      case 'settings':
        this.bindSettingsEvents();
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
        this.bindClick('btn-back-history', () => this.showScreen('history'));
        this.bindClick('btn-back-history-2', () => this.showScreen('history'));
        document.querySelectorAll('[data-tap-exercise]').forEach(el => {
          el.addEventListener('click', () => {
            this.openAIChat(`Analyze my ${el.dataset.tapExercise} progress.`, el.dataset.tapExercise);
          });
        });
        const deleteBtn = document.getElementById('btn-delete-workout');
        if (deleteBtn) {
          deleteBtn.addEventListener('click', () => this.deleteWorkout(deleteBtn.dataset.id));
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
            <div class="exercise-item" id="btn-add-new-exercise">
              <div class="exercise-item-icon" style="background: linear-gradient(135deg, var(--sunset), var(--sunrise));">＋</div>
              <div class="exercise-item-info">
                <div class="exercise-item-name">Add New Exercise</div>
              </div>
            </div>
            ${sorted.map(ex => `
              <div class="exercise-item" data-pick-exercise="${ex.id}">
                <div class="exercise-item-icon">${this.Icons.palm}</div>
                <div class="exercise-item-info">
                  <div class="exercise-item-name">${ex.name}</div>
                  <div class="exercise-item-meta">${ex.muscleGroups ? ex.muscleGroups.join(', ') : ''}</div>
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

  showAddExerciseForWorkout() {
    const MUSCLE_GROUPS = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Forearms',
      'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Abs', 'Traps', 'Lats', 'Full Body', 'Cardio'];

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

    this.activeWorkout.exercises.push({
      exerciseId: exercise.id,
      name: exercise.name,
      notes: '',
      order: this.activeWorkout.exercises.length,
      customFields: {},
      sets
    });

    // Update exercise usage
    exercise.lastUsed = new Date().toISOString();
    exercise.timesUsed = (exercise.timesUsed || 0) + 1;
    DB.saveExercise(exercise);

    this.showScreen('activeWorkout');
  },

  bindSetInputs() {
    document.querySelectorAll('[data-field]').forEach(input => {
      input.addEventListener('change', (e) => {
        const exIdx = parseInt(e.target.dataset.ex);
        const setIdx = parseInt(e.target.dataset.set);
        const field = e.target.dataset.field;
        const value = parseFloat(e.target.value) || null;
        if (this.activeWorkout?.exercises[exIdx]?.sets[setIdx]) {
          this.activeWorkout.exercises[exIdx].sets[setIdx][field] = value;
        }
      });
    });
  },

  bindSetCompleteButtons() {
    document.querySelectorAll('[data-complete-set]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const exIdx = parseInt(btn.dataset.ex);
        const setIdx = parseInt(btn.dataset.set);
        this.completeSet(exIdx, setIdx);
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
    const html = `
      <div class="modal-overlay" id="ex-menu-overlay">
        <div class="modal-sheet">
          <div class="modal-handle"></div>
          <div class="text-bold text-white text-lg mb-16">${ex.name}</div>
          <button class="btn btn-ghost btn-large mb-8" id="btn-ex-notes">📝 Add Notes</button>
          <button class="btn btn-ghost btn-large mb-8" id="btn-ex-reorder-up">⬆ Move Up</button>
          <button class="btn btn-ghost btn-large mb-8" id="btn-ex-reorder-down">⬇ Move Down</button>
          <button class="btn btn-danger btn-large" id="btn-ex-remove">🗑 Remove Exercise</button>
        </div>
      </div>
    `;
    document.getElementById('modal-container').innerHTML = html;

    document.getElementById('ex-menu-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'ex-menu-overlay') document.getElementById('modal-container').innerHTML = '';
    });

    document.getElementById('btn-ex-remove').addEventListener('click', () => {
      this.activeWorkout.exercises.splice(exIdx, 1);
      document.getElementById('modal-container').innerHTML = '';
      this.showScreen('activeWorkout');
    });

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
      this.showCelebration(this.Icons.anchor, 'NEW PR!', `${exName}: ${set.weight} ${set.weightUnit} × ${set.reps}`);
    }

    // Check if this was the last uncompleted set for this exercise
    const ex = this.activeWorkout.exercises[exIdx];
    const allDone = ex.sets.every(s => s.completed);
    const nextUncompletedSet = ex.sets.find(s => !s.completed);

    if (allDone) {
      // Check if there are more exercises
      const nextExIdx = exIdx + 1;
      if (nextExIdx < this.activeWorkout.exercises.length) {
        // Rest between exercises
        this.showScreen('restTimer', {
          seconds: this.settings.defaultRestBetweenExercises,
          label: `Rest before ${this.activeWorkout.exercises[nextExIdx].name}`,
          onComplete: () => this.showScreen('activeWorkout')
        });
      } else {
        this.showScreen('activeWorkout');
      }
    } else if (nextUncompletedSet) {
      // Rest between sets
      this.showScreen('restTimer', {
        seconds: this.settings.defaultRestBetweenSets,
        label: `Rest — ${exName} Set ${setIdx + 2} next 💪`,
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

    // Calculate XP
    const totalSets = w.exercises.reduce((s, e) => s + e.sets.length, 0);
    const totalVolume = w.exercises.reduce((sum, ex) =>
      sum + ex.sets.reduce((s, set) => s + ((set.weight || 0) * (set.reps || 0)), 0), 0);
    w.xpEarned = Math.round(totalSets * 10 + totalVolume * 0.01 + 50); // Base 50 XP per workout

    // Save workout
    await DB.saveWorkout(w);
    this.workouts.push(w);

    // Update profile
    await this.updateProfileAfterWorkout(w);

    Timer.endWorkoutSession();
    this.lastCompletedWorkout = w;
    this.activeWorkout = null;

    this.showScreen('workoutComplete');
  },

  async updateProfileAfterWorkout(workout) {
    const p = this.profile;
    p.xp += workout.xpEarned;
    p.totalWorkouts += 1;

    const totalVolume = workout.exercises.reduce((sum, ex) =>
      sum + ex.sets.reduce((s, set) => s + ((set.weight || 0) * (set.reps || 0)), 0), 0);
    p.totalVolume += totalVolume;

    // Update streak
    const today = new Date().toDateString();
    const lastDate = p.lastWorkoutDate ? new Date(p.lastWorkoutDate).toDateString() : null;
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (lastDate === today) {
      // Already worked out today, no streak change
    } else if (lastDate === yesterday) {
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
        sum + ex.sets.reduce((s, set) => s + ((set.weight || 0) * (set.reps || 0)), 0), 0);
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

  async sendChatMessage() {
    const input = document.getElementById('chat-input');
    if (!input) return;
    const message = input.value.trim();
    if (!message) return;

    input.value = '';
    this._currentChatMessages.push({ role: 'user', content: message });

    const msgsContainer = document.getElementById('chat-messages');
    msgsContainer.innerHTML += `<div class="chat-bubble user">${this.escapeHtml(message)}</div>`;
    msgsContainer.innerHTML += `<div class="chat-bubble ai" id="ai-typing"><div class="spinner" style="width:20px;height:20px;border-width:2px;"></div></div>`;
    msgsContainer.scrollTop = msgsContainer.scrollHeight;

    const result = await AI.chat(this._currentChatMessages, this._currentChatContext);

    const typingEl = document.getElementById('ai-typing');
    if (typingEl) typingEl.remove();

    if (result.error) {
      msgsContainer.innerHTML += `<div class="chat-bubble ai" style="color: var(--coral);">${this.escapeHtml(result.error)}</div>`;
    } else {
      this._currentChatMessages.push({ role: 'ai', content: result.text });
      msgsContainer.innerHTML += `<div class="chat-bubble ai">${this.escapeHtml(result.text)}</div>`;
    }
    msgsContainer.scrollTop = msgsContainer.scrollHeight;

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
          <button class="btn btn-ghost btn-large mb-8" id="btn-new-chat">🆕 New Chat</button>
          <button class="btn btn-ghost btn-large mb-8" id="btn-export-chats">📦 Export Chats</button>
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

    try {
      const fileData = await ExportImport.readFileForAI(file);
      const result = await AI.parseFileContent(fileData.content, file.type);

      if (statusEl) statusEl.classList.add('hidden');

      if (result.error) {
        if (resultEl) {
          resultEl.classList.remove('hidden');
          resultEl.innerHTML = `<div class="card" style="border-color: var(--coral);"><div class="text-coral">${this.escapeHtml(result.error)}</div></div>`;
        }
        return;
      }

      // Try to parse JSON from AI response
      try {
        const jsonMatch = result.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          this.showParsedWorkoutConfirmation(parsed);
        } else {
          if (resultEl) {
            resultEl.classList.remove('hidden');
            resultEl.innerHTML = `<div class="card"><div class="text-sand text-sm">${this.escapeHtml(result.text)}</div></div>`;
          }
        }
      } catch (parseErr) {
        if (resultEl) {
          resultEl.classList.remove('hidden');
          resultEl.innerHTML = `<div class="card"><div class="text-sand text-sm">${this.escapeHtml(result.text)}</div></div>`;
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
              <div class="text-sm text-sea mt-4">💪 ${ex.name}: ${(ex.sets || []).map(s => `${s.weight}×${s.reps}`).join(', ')}</div>
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

    html += `<button class="btn btn-accent btn-large mt-16" id="btn-confirm-import">✅ Import These Workouts</button>`;

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
        this.showScreen('history');
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

    this.bindClick('btn-manage-exercises', () => this.showScreen('exerciseLibrary'));

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

    const html = `
      <div class="modal-overlay" id="edit-ex-overlay">
        <div class="modal-sheet">
          <div class="modal-handle"></div>
          <div class="text-bold text-white text-lg mb-16">Edit Exercise</div>
          <div class="input-group">
            <label class="input-label">Name</label>
            <input type="text" class="input" value="${this.escapeHtml(ex.name)}" id="edit-ex-name">
          </div>
          <div class="input-group">
            <label class="input-label">Muscle Groups</label>
            <input type="text" class="input" value="${(ex.muscleGroups || []).join(', ')}" id="edit-ex-muscles" placeholder="Chest, Triceps...">
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

    document.getElementById('edit-ex-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'edit-ex-overlay') document.getElementById('modal-container').innerHTML = '';
    });

    document.getElementById('btn-save-edit-ex').addEventListener('click', async () => {
      ex.name = document.getElementById('edit-ex-name').value.trim();
      ex.muscleGroups = document.getElementById('edit-ex-muscles').value.split(',').map(s => s.trim()).filter(Boolean);
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

  // ─── DELETE WORKOUT ────────────────────────────────────────
  async deleteWorkout(id) {
    if (confirm('Delete this workout? This cannot be undone.')) {
      await DB.deleteWorkout(id);
      this.workouts = this.workouts.filter(w => w.id !== id);
      this.showToast('Workout deleted');
      this.showScreen('history');
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
          s + ex.sets.reduce((ss, set) => ss + ((set.weight || 0) * (set.reps || 0)), 0), 0), 0);

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
          s + ex.sets.reduce((ss, set) => ss + ((set.weight || 0) * (set.reps || 0)), 0), 0), 0);
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

  getMuscleHeatmapData() {
    const muscles = {};
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0, 0, 0, 0);

    this.workouts
      .filter(w => new Date(w.date) >= weekStart)
      .forEach(w => {
        w.exercises.forEach(ex => {
          const exerciseLib = this.exercises.find(e => e.id === ex.exerciseId || e.name === ex.name);
          const groups = exerciseLib?.muscleGroups || [];
          groups.forEach(mg => {
            muscles[mg] = (muscles[mg] || 0) + ex.sets.length;
          });
        });
      });

    // Normalize to 0-5 scale
    const maxSets = Math.max(1, ...Object.values(muscles));
    for (const key of Object.keys(muscles)) {
      muscles[key] = Math.min(5, Math.ceil((muscles[key] / maxSets) * 5));
    }

    // Add common muscles with 0 if not present
    ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Abs'].forEach(m => {
      if (!muscles[m]) muscles[m] = 0;
    });

    return muscles;
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
  showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
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
    if (!this.settings.geminiApiKey) return;
    
    for (const ex of this.exercises) {
      if (!ex.icon) {
        // Slow down requests to respect free tier limits (2 per minute)
        setTimeout(async () => {
          const icon = await AI.generateExerciseIcon(ex.name, ex.muscleGroups);
          if (icon) {
            ex.icon = icon;
            await DB.saveExercise(ex);
            const iconEl = document.getElementById(`icon-${ex.id}`);
            if (iconEl) iconEl.innerHTML = `<img src="${icon}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;" class="fade-in">`;
          }
        }, 1000); // Small initial delay, real throttling would be more complex
        break; // Only do one per library visit for now to stay safe
      }
    }
  }
};

// ─── Boot ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => App.init());
