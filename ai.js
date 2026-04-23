// ai.js — Gemini 2.5 Flash Integration for Tropical Workout Tracker
const AI = {
  async getApiKey() {
    return await DB.getSetting('geminiApiKey');
  },

  async chat(messages, context = '') {
    const apiKey = await this.getApiKey();
    if (!apiKey) return { error: 'Please set your Gemini API Key in Settings' };

    const systemPrompt = `You are a premium, expert Florida Keys Fitness Coach. 
    Your tone is encouraging, extremely laid-back, and high-energy expert. 
    Provide concise, actionable advice based on current sports science.
    You help users reach their goals while keeping that "Keys Life" vibe alive. 
    Refer to workouts as "sessions on the island" or "gains in the sun" occasionally.
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

    const prompt = `Return ONLY raw valid SVG code for a minimalist, flat fitness icon of a person performing a ${exerciseName}${muscleText}. Do your absolute best to represent this exact exercise visually as an SVG vector drawing. Style: bold clean lines, simple silhouette figure, tropical teal (#087E8B) accent color on a transparent or white background. Viewbox should be 0 0 100 100. Professional app UI icon style, centered composition, no text, no labels, square format. Do NOT wrap it in markdown blocks, just return the <svg> tags and content.`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ 
              parts: [{ text: prompt }] 
            }],
            generationConfig: {
              temperature: 0.2
            }
          })
        }
      );

      if (!response.ok) return null;

      const data = await response.json();
      let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // Clean up markdown if the AI includes it anyway
      text = text.replace(/```xml/g, '').replace(/```svg/g, '').replace(/```html/g, '').replace(/```/g, '').trim();
      
      const svgStart = text.indexOf('<svg');
      const svgEnd = text.lastIndexOf('</svg>');
      
      if (svgStart !== -1 && svgEnd !== -1) {
        const svgCode = text.substring(svgStart, svgEnd + 6);
        const encodedSvg = encodeURIComponent(svgCode);
        return `data:image/svg+xml;utf8,${encodedSvg}`;
      }
      return null;
    } catch (err) {
      console.warn('SVG generation failed:', err);
      return null;
    }
  }
};
