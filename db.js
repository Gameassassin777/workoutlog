// db.js — IndexedDB wrapper for Tropical Workout Tracker
const DB_NAME = 'TropicalFitDB';
const DB_VERSION = 1;

const STORES = {
  workouts: 'workouts',
  exercises: 'exercises',
  settings: 'settings',
  profile: 'profile',
  chatLogs: 'chatLogs'
};

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains(STORES.workouts)) {
        const workoutStore = db.createObjectStore(STORES.workouts, { keyPath: 'id' });
        workoutStore.createIndex('date', 'date', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.exercises)) {
        const exerciseStore = db.createObjectStore(STORES.exercises, { keyPath: 'id' });
        exerciseStore.createIndex('name', 'name', { unique: false });
        exerciseStore.createIndex('lastUsed', 'lastUsed', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.settings)) {
        db.createObjectStore(STORES.settings, { keyPath: 'key' });
      }

      if (!db.objectStoreNames.contains(STORES.profile)) {
        db.createObjectStore(STORES.profile, { keyPath: 'key' });
      }

      if (!db.objectStoreNames.contains(STORES.chatLogs)) {
        const chatStore = db.createObjectStore(STORES.chatLogs, { keyPath: 'id' });
        chatStore.createIndex('date', 'date', { unique: false });
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

  async getExportData() {
    const workouts = await this.getAllWorkouts();
    const exercises = await this.getAllExercises();
    const chatLogs = await this.getAllChatLogs();
    const profile = await this.getProfile();
    const settings = {};
    const allSettings = await this.getAll(STORES.settings);
    allSettings.forEach(s => { settings[s.key] = s.value; });
    return { workouts, exercises, chatLogs, profile, settings, exportDate: new Date().toISOString(), version: 1 };
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
