// ai.js — Gemini 2.5 Flash Integration for Tropical Workout Tracker
const AI = {
  async getApiKey() {
    return await DB.getSetting('geminiApiKey');
  },

  async chat(messages, context = '') {
    const apiKey = await this.getApiKey();
    if (!apiKey) return { error: 'Please set your Gemini API Key in Settings 🌴' };

    const systemPrompt = `You are a premium, evidence-based Florida Keys Fitness Coach. 
    Your tone is encouraging, laid-back, and expert (use 🦜, ⚓️, 🌊, 🌴 emojis). 
    Provide concise, actionable advice based on current sports science.
    You help users reach their goals while keeping that "Keys Life" energy high.
    User Context: ${context}`;

    const contents = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      ...messages.map(m => ({
        role: m.role === 'ai' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }))
    ];

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      
      return { text: data.candidates[0].content.parts[0].text };
    } catch (err) {
      console.error('AI Chat failed:', err);
      return { error: 'Failed to reach Gemini. Check your connection or API key.' };
    }
  },

  async analyzeWorkout(workout) {
    const apiKey = await this.getApiKey();
    if (!apiKey) return { error: 'API Key missing' };

    const prompt = `Analyze this workout and provide a brief (2-3 sentence) evidence-based summary of the effort, focusing on volume and progression.
    Workout: ${JSON.stringify(workout)}`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      const data = await response.json();
      return { text: data.candidates[0].content.parts[0].text };
    } catch (err) {
      return { error: 'Analysis failed' };
    }
  },

  async parseFileContent(content, type) {
    const apiKey = await this.getApiKey();
    if (!apiKey) return { error: 'API Key missing' };

    const prompt = `You are a workout log parser. Convert the following text or data into a JSON format with a "workouts" array. 
    Each workout should have: "date" (ISO), "title", and "exercises" (array with "name" and "sets" array of {weight, reps}).
    If anything is unclear, add it to an "uncertain" array with a "field" description.
    
    Data to parse:
    ${content}`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      const data = await response.json();
      return { text: data.candidates[0].content.parts[0].text };
    } catch (err) {
      return { error: 'Parsing failed' };
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
