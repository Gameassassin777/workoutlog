// ai.js — Gemini 2.5 Flash Integration for Tropical Workout Tracker
const AI = {
  async getApiKey() {
    return await DB.getSetting('geminiApiKey');
  },

  async chat(messages, context = '') {
    const apiKey = await this.getApiKey();
    if (!apiKey) return { error: 'Please set your Gemini API Key in Settings' };

    const systemInstruction = {
      parts: [{
        text: `You are a premium, expert Florida Keys Fitness Coach. Your tone is encouraging, laid-back, and high-energy. Provide concise, actionable advice based on current sports science. Keep that "Keys Life" vibe alive.${context ? '\n\nUser Context:\n' + context : ''}`
      }]
    };

    const contents = messages.map(m => ({
      role: m.role === 'ai' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemInstruction, contents })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      
      return { text: data.candidates[0].content.parts[0].text };
    } catch (err) {
      console.error('AI Chat failed:', err);
      return { error: 'Failed to reach Gemini: ' + err.message };
    }
  },

  async analyzeWorkout(workout) {
    const apiKey = await this.getApiKey();
    if (!apiKey) return { error: 'API Key missing' };

    const prompt = `Analyze this workout and provide a brief (2-3 sentence) evidence-based summary of the effort, focusing on volume and progression.
    Workout: ${JSON.stringify(workout)}`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      return { text: data.candidates[0].content.parts[0].text };
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
      // Strip the data URL prefix to get raw base64
      const base64 = content.split(',')[1];
      const mimeType = type;
      parts = [
        { text: `You are a workout log parser. Parse this image of a workout log into JSON with a "workouts" array. Each workout has: "date" (ISO string), "title" (string), and "exercises" (array of {name, sets: [{weight, reps}]}). Respond ONLY with valid JSON, no markdown, no explanation.` },
        { inlineData: { mimeType, data: base64 } }
      ];
    } else {
      parts = [{
        text: `You are a workout log parser. Convert the following text into JSON with a "workouts" array. Each workout has: "date" (ISO string), "title" (string), and "exercises" (array of {name, sets: [{weight, reps}]}). Respond ONLY with valid JSON, no markdown, no explanation.\n\nData:\n${content}`
      }];
    }

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
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

    const muscleText = muscleGroups.length > 0 
      ? ` targeting ${muscleGroups.join(' and ')}` 
      : '';

    const prompt = `Generate a minimalist, high-contrast flat fitness icon of a person performing a ${exerciseName}${muscleText}. Style: bold clean lines, simple silhouette figure, tropical teal (#087E8B) accent color on white background. Professional app UI icon style, centered composition, no text, no labels, square format.`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-image-generation:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ 
              parts: [{ text: prompt }] 
            }],
            generationConfig: {
              responseModalities: ["IMAGE", "TEXT"],
              imageSizeOptions: {
                aspectRatio: "1:1"
              }
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
