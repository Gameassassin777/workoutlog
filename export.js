// export.js — Export/Import functionality
const ExportImport = {
  async exportJSON() {
    const data = await DB.getExportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    this._download(blob, `tropicalfit-backup-${this._dateStr()}.json`);
  },

  async exportCSV() {
    const workouts = await DB.getAllWorkouts();
    const rows = [
      ['Date', 'Workout Title', 'Exercise', 'Set', 'Weight', 'Unit', 'Reps', 'RPE', 'Set Notes', 'Workout Notes'].join(',')
    ];

    for (const w of workouts) {
      const date = new Date(w.date).toLocaleDateString();
      const title = this._csvEscape(w.title || '');
      const wNotes = this._csvEscape(w.notes || '');
      for (const ex of w.exercises) {
        for (const set of ex.sets) {
          rows.push([
            date,
            title,
            this._csvEscape(ex.name),
            set.setNumber,
            set.weight,
            set.weightUnit || 'lbs',
            set.reps,
            set.rpe || '',
            this._csvEscape(set.notes || ''),
            wNotes
          ].join(','));
        }
      }
    }

    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    this._download(blob, `tropicalfit-workouts-${this._dateStr()}.csv`);
  },

  async exportChatLogs() {
    const logs = await DB.getAllChatLogs();
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    this._download(blob, `tropicalfit-chats-${this._dateStr()}.json`);
  },

  async importJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (!data.version && !data.workouts) {
            reject(new Error('Invalid backup file format'));
            return;
          }
          await DB.importData(data);
          resolve({
            workouts: data.workouts?.length || 0,
            exercises: data.exercises?.length || 0,
            chatLogs: data.chatLogs?.length || 0
          });
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  },

  async readFileForAI(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve({
          content: e.target.result,
          type: file.type,
          name: file.name
        });
      };
      reader.onerror = () => reject(reader.error);

      if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    });
  },

  _download(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  _dateStr() {
    return new Date().toISOString().split('T')[0];
  },

  _csvEscape(str) {
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }
};
