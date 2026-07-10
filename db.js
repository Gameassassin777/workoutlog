// db.js — IndexedDB wrapper for Tropical Workout Tracker
const DB_NAME = 'TropicalFitDB';
const DB_VERSION = 2;

const STORES = {
  workouts: 'workouts',
  exercises: 'exercises',
  settings: 'settings',
  profile: 'profile',
  chatLogs: 'chatLogs',
  plunges: 'plunges'
};

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    // Versioned migration ladder. Each case falls through to add subsequent changes
    // so any older version is brought fully up to date. Add a new case when bumping DB_VERSION.
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      const oldVersion = event.oldVersion;

      // eslint-disable-next-line no-fallthrough
      switch (oldVersion) {
        case 0: {
          // Fresh install: create all v1 stores.
          const workoutStore = db.createObjectStore(STORES.workouts, { keyPath: 'id' });
          workoutStore.createIndex('date', 'date', { unique: false });

          const exerciseStore = db.createObjectStore(STORES.exercises, { keyPath: 'id' });
          exerciseStore.createIndex('name', 'name', { unique: false });
          exerciseStore.createIndex('lastUsed', 'lastUsed', { unique: false });

          db.createObjectStore(STORES.settings, { keyPath: 'key' });
          db.createObjectStore(STORES.profile, { keyPath: 'key' });

          const chatStore = db.createObjectStore(STORES.chatLogs, { keyPath: 'id' });
          chatStore.createIndex('date', 'date', { unique: false });
        }
        // Falls through to v2
        case 1: {
          // v1 → v2: add plunges store
          if (!db.objectStoreNames.contains(STORES.plunges)) {
            const plungeStore = db.createObjectStore(STORES.plunges, { keyPath: 'id' });
            plungeStore.createIndex('date', 'date', { unique: false });
            plungeStore.createIndex('type', 'type', { unique: false });
          }
        }
        // Future migrations go here:
        // case 2: { /* v2 → v3 */ }
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

const DB = {
  async _tx(storeName, mode, callback) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, mode);
      const store = tx.objectStore(storeName);
      const result = callback(store);
      tx.oncomplete = () => resolve(result.result || result);
      tx.onerror = () => reject(tx.error);
    });
  },

  async getAll(storeName) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async get(storeName, key) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async put(storeName, data) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.put(data);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async delete(storeName, key) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async clear(storeName) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  // Convenience methods
  async getAllWorkouts() {
    return this.getAll(STORES.workouts);
  },

  async getWorkout(id) {
    return this.get(STORES.workouts, id);
  },

  async saveWorkout(workout) {
    return this.put(STORES.workouts, workout);
  },

  async deleteWorkout(id) {
    return this.delete(STORES.workouts, id);
  },

  async getAllExercises() {
    return this.getAll(STORES.exercises);
  },

  async saveExercise(exercise) {
    return this.put(STORES.exercises, exercise);
  },

  async deleteExercise(id) {
    return this.delete(STORES.exercises, id);
  },

  async getSetting(key) {
    // Try localStorage first for instant speed/reliability
    const local = localStorage.getItem(`tf_setting_${key}`);
    if (local !== null && local !== 'null') {
      try { return JSON.parse(local); } catch (e) { return local; }
    }

    const result = await this.get(STORES.settings, key);
    return result ? result.value : null;
  },

  async saveSetting(key, value) {
    // Save to both for redundancy
    if (value === null || value === undefined) {
      localStorage.removeItem(`tf_setting_${key}`);
    } else {
      localStorage.setItem(`tf_setting_${key}`, JSON.stringify(value));
    }
    return this.put(STORES.settings, { key, value });
  },

  async getProfile() {
    const result = await this.get(STORES.profile, 'main');
    return result || null;
  },

  async saveProfile(profile) {
    profile.key = 'main';
    return this.put(STORES.profile, profile);
  },

  async getAllChatLogs() {
    return this.getAll(STORES.chatLogs);
  },

  async saveChatLog(log) {
    return this.put(STORES.chatLogs, log);
  },

  async deleteChatLog(id) {
    return this.delete(STORES.chatLogs, id);
  },

  async getAllPlunges() {
    return this.getAll(STORES.plunges);
  },

  async savePlunge(plunge) {
    return this.put(STORES.plunges, plunge);
  },

  async deletePlunge(id) {
    return this.delete(STORES.plunges, id);
  },

  async getExportData() {
    const workouts = await this.getAllWorkouts();
    const exercises = await this.getAllExercises();
    const chatLogs = await this.getAllChatLogs();
    const profile = await this.getProfile();
    const plunges = await this.getAllPlunges();
    const settings = {};
    const allSettings = await this.getAll(STORES.settings);
    allSettings.forEach(s => { settings[s.key] = s.value; });
    return { workouts, exercises, chatLogs, profile, plunges, settings, exportDate: new Date().toISOString(), version: 2 };
  },

  async importData(data) {
    if (data.workouts) {
      for (const w of data.workouts) await this.saveWorkout(w);
    }
    if (data.exercises) {
      for (const e of data.exercises) await this.saveExercise(e);
    }
    if (data.chatLogs) {
      for (const c of data.chatLogs) await this.saveChatLog(c);
    }
    if (data.profile) {
      await this.saveProfile(data.profile);
    }
    if (data.plunges) {
      for (const p of data.plunges) await this.savePlunge(p);
    }
    if (data.settings) {
      for (const [key, value] of Object.entries(data.settings)) {
        await this.saveSetting(key, value);
      }
    }
  },
  async clearAllData() {
    const db = await openDB();
    const stores = Object.values(STORES);
    return new Promise((resolve, reject) => {
      const tx = db.transaction(stores, 'readwrite');
      stores.forEach(s => tx.objectStore(s).clear());
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
};
