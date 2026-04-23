// ai.js — Gemini 2.5 Flash Integration for Tropical Workout Tracker
const AI = {
  async getApiKey() {
    return await DB.getSetting('geminiApiKey');
  },

  async fetchWithRetry(url, options, maxRetries = 3, onProgress = null) {
    let delay = 2000;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const response = await fetch(url, options);
      if (!response.ok) {
        if (response.status === 429 && attempt < maxRetries) {
          console.warn(`Rate limited (429). Retrying in ${delay}ms...`);
          if (onProgress) onProgress(`Rate limit hit. Retrying in ${delay/1000}s...`);
          await new Promise(r => setTimeout(r, delay));
          delay *= 2;
          continue;
        }
      }
      return response;
    }
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
      const response = await this.fetchWithRetry(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('Invalid response format from Gemini');
      
      return { text };
    } catch (err) {
      console.error('AI Chat failed:', err);
      return { error: `Failed to reach Gemini: ${err.message}` };
    }
  },

  async analyzeWorkout(workout) {
    const apiKey = await this.getApiKey();
    if (!apiKey) return { error: 'API Key missing' };

    const prompt = `Analyze this workout and provide a brief (2-3 sentence) evidence-based summary of the effort, focusing on volume and progression.
    Workout: ${JSON.stringify(workout)}`;

    try {
      const response = await this.fetchWithRetry(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('Invalid response format');
      
      return { text };
    } catch (err) {
      console.error('AI Analysis failed:', err);
      return { error: 'Analysis failed: ' + err.message };
    }
  },

  async parseFileContent(content, type, onProgress = null) {
    const apiKey = await this.getApiKey();
    if (!apiKey) return { error: 'API Key missing' };

    const prompt = `You are a workout log parser. Convert the following text or data into a JSON format with a "workouts" array. 
    Each workout should have: "date" (ISO), "title", and "exercises" (array with "name" and "sets" array of {weight, reps}).
    If anything is unclear, add it to an "uncertain" array with a "field" description.
    
    Data to parse:
    ${content}`;

    try {
      const response = await this.fetchWithRetry(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      }, 3, onProgress);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('Invalid response format');
      
      return { text };
    } catch (err) {
      console.error('AI Parsing failed:', err);
      return { error: 'Parsing failed: ' + err.message };
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
      const response = await this.fetchWithRetry(
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

      if (!response.ok) {
        console.warn(`SVG API error: ${response.status}`);
        return null;
      }

      const data = await response.json();
      let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // Clean up markdown if the AI includes it anyway
      text = text.replace(/```xml/g, '').replace(/```svg/g, '').replace(/```html/g, '').replace(/```/g, '').trim();
      
      const svgStart = text.indexOf('<svg');
      const svgEnd = text.lastIndexOf('</svg>');
      
      if (svgStart !== -1 && svgEnd !== -1) {
        const svgCode = text.substring(svgStart, svgEnd + 6);
        
        // Strict basic validation to prevent broken tags or script injection
        if (!svgCode.includes('xmlns') && !svgCode.includes('viewBox')) return null;
        if (svgCode.includes('<script')) return null;
        
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
