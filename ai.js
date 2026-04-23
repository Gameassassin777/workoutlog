// ai.js — Gemini 2.5 Flash Integration for Tropical Workout Tracker
const AI = {
  async getApiKey() {
    return await DB.getSetting('geminiApiKey');
  },

  buildSystemInstruction(context = '') {
    return {
      parts: [{
        text: `You are a concise Florida Keys fitness coach inside a workout tracking app. Be brief, direct, and encouraging — no walls of text. Never use markdown (no **, ##, -, *, etc.) — plain text only.

You have access to app actions. If the user asks you to do something in the app, respond with a JSON block on its own line at the END of your message, like this:
ACTION:{"type":"add_exercise","params":{"name":"Cable Fly","muscleGroups":["Chest","Shoulders"]}}

Available actions:
- add_exercise: params = {name, muscleGroups (array), equipment (optional)}
- log_workout: params = {date (ISO, default today), title, exercises: [{name, sets: [{weight, reps, weightUnit}]}]}
- edit_workout_set: params = {workoutId, exerciseIndex, setIndex, weight, reps}
- add_note_to_workout: params = {workoutId, note}
- navigate: params = {screen} (screens: home, history, stats, settings)

If the user describes a workout they did, use log_workout to save it. Ask for any missing details (exercises, sets, weights, reps) before logging.
If no action is needed, just reply in plain text — no JSON, no markdown.
${context ? 'User data context:\n' + context : ''}`
      }]
    };
  },

  stripMarkdown(text) {
    return text
      .replace(/\*\*\*(.+?)\*\*\*/g, '$1')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/_{1,2}(.+?)_{1,2}/g, '$1')
      .replace(/`(.+?)`/g, '$1')
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/^\s*[-*+]\s+/gm, '• ')
      .replace(/^\s*\d+\.\s+/gm, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  },

  parseActionFromResponse(text) {
    const actionMatch = text.match(/\nACTION:(\{[\s\S]+?\})\s*$/);
    if (actionMatch) {
      try {
        const action = JSON.parse(actionMatch[1]);
        const cleanText = text.replace(/\nACTION:[\s\S]+$/, '').trim();
        return { cleanText, action };
      } catch (e) {}
    }
    return { cleanText: text, action: null };
  },

  async chat(messages, context = '') {
    const apiKey = await this.getApiKey();
    if (!apiKey) return { error: 'Add your Gemini API key in Settings' };

    const systemInstruction = this.buildSystemInstruction(context);

    const contents = messages.map(m => ({
      role: m.role === 'ai' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemInstruction, contents })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);

      const raw = data.candidates[0].content.parts[0].text;
      const { cleanText, action } = this.parseActionFromResponse(raw);
      return { text: this.stripMarkdown(cleanText), action };
    } catch (err) {
      console.error('AI Chat failed:', err);
      return { error: 'Gemini error: ' + err.message };
    }
  },

  async analyzeWorkout(workout) {
    const apiKey = await this.getApiKey();
    if (!apiKey) return { error: 'API Key missing' };

    const prompt = `Briefly analyze this workout in 2-3 sentences. Focus on volume and any notable effort. Plain text only, no markdown.\n\nWorkout: ${JSON.stringify(workout)}`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      return { text: this.stripMarkdown(data.candidates[0].content.parts[0].text) };
    } catch (err) {
      return { error: 'Analysis failed: ' + err.message };
    }
  },

  async parseFileContent(content, type) {
    const apiKey = await this.getApiKey();
    if (!apiKey) return { error: 'API Key missing — add it in Settings' };

    const isImage = type && type.startsWith('image/');
    let parts;

    if (isImage) {
      const base64 = content.split(',')[1];
      parts = [
        { text: `Parse this workout log image into JSON with a "workouts" array. Each workout: "date" (ISO), "title", "exercises" (array of {name, sets:[{weight,reps}]}). Respond ONLY with valid JSON, no markdown.` },
        { inlineData: { mimeType: type, data: base64 } }
      ];
    } else {
      parts = [{
        text: `Parse this workout log into JSON with a "workouts" array. Each workout: "date" (ISO), "title", "exercises" (array of {name, sets:[{weight,reps}]}). Respond ONLY with valid JSON, no markdown.\n\n${content}`
      }];
    }

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts }] })
      });

      const data = await response.json();
      if (data.error) return { error: data.error.message };
      return { text: data.candidates[0].content.parts[0].text };
    } catch (err) {
      return { error: 'Parsing failed: ' + err.message };
    }
  },

  async generateExerciseIcon(exerciseName, muscleGroups = []) {
    const apiKey = await this.getApiKey();
    if (!apiKey) return null;

    const muscleText = muscleGroups.length > 0 ? ` targeting ${muscleGroups.join(' and ')}` : '';
    const prompt = `Minimalist flat fitness icon: person performing ${exerciseName}${muscleText}. Bold clean lines, simple silhouette, teal (#087E8B) on white. No text, square format.`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseModalities: ["IMAGE", "TEXT"],
              imageSizeOptions: { aspectRatio: "1:1" }
            }
          })
        }
      );

      if (!response.ok) return null;
      const data = await response.json();
      const parts = data.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
      return null;
    } catch (err) {
      console.warn('Image generation failed:', err);
      return null;
    }
  }
};
