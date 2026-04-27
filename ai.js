// ai.js — Gemini 2.5 Flash Integration for Tropical Workout Tracker
const AI = {
  BACKEND: 'https://tropicalfit.gameassassin777.workers.dev',

  async getApiKey() {
    return await DB.getSetting('geminiApiKey');
  },

  // Call backend AI proxy (used when user has no personal Gemini key)
  // Rate-limited on the server side: 15 messages / user / day
  async backendChat(messages, context = '') {
    const userId = await DB.getSetting('serverId');
    if (!userId) return { error: 'Join the community first to use the free AI tier.' };
    try {
      const res = await fetch(`${this.BACKEND}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, messages, context }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error || 'AI unavailable' };
      return data;
    } catch (e) {
      return { error: 'Could not reach the island server.' };
    }
  },

  async fetchWithRetry(url, options, maxRetries = 4, onProgress = null) {
    // Gemini rate limits reset per minute — delays must be long enough to clear the window
    const retryDelays = [12000, 30000, 65000]; // 12s, 30s, 65s
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const response = await fetch(url, options);
      if (!response.ok) {
        if (response.status === 429 && attempt < maxRetries) {
          const delay = retryDelays[attempt - 1] || 65000;
          console.warn(`Rate limited (429). Retrying in ${delay/1000}s... (attempt ${attempt}/${maxRetries})`);
          if (onProgress) onProgress(`Rate limit hit — waiting ${delay/1000}s before retry ${attempt}/${maxRetries - 1}...`);
          await new Promise(r => setTimeout(r, delay));
          continue;
        }
      }
      return response;
    }
  },

  async chat(messages, context = '') {
    const apiKey = await this.getApiKey();
    // No personal key — use free backend tier (rate limited)
    if (!apiKey) return this.backendChat(messages, context);

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
    if (!apiKey) {
      // Use backend with a single synthetic message
      const prompt = `Analyze this workout briefly (2-3 sentences). Focus on volume and intensity.\n${JSON.stringify(workout)}`;
      return this.backendChat([{ role: 'user', content: prompt }], '');
    }

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
    const isImage = type && type.startsWith('image/');

    // Backend fallback for text-based files (no key or rate limited)
    // Limit: ~14k chars. Larger files need a personal Gemini key for full processing.
    const BACKEND_CHAR_LIMIT = 14000;
    const tryBackend = async () => {
      const userId = await DB.getSetting('serverId');
      if (!userId) return { error: 'Add a Gemini API key in Settings → AI to import files, or join the community first.' };
      const wasLarge = content.length > BACKEND_CHAR_LIMIT;
      const truncated = wasLarge ? content.substring(0, BACKEND_CHAR_LIMIT) + '\n...[file truncated — add a Gemini API key in Settings for full file support]' : content;
      if (wasLarge && onProgress) onProgress(`File is large (${Math.round(content.length/1024)}KB) — only first ~14KB will be parsed. Add a Gemini API key for full support.`);
      const prompt = `Parse this workout log into JSON. Return ONLY a JSON object with a "workouts" array. Each workout needs: "date" (ISO), "title", "exercises" (array with "name" and "sets" array of {weight, reps}). Data:\n${truncated}`;
      if (!wasLarge && onProgress) onProgress('Trying backup server...');
      const result = await this.backendChat([{ role: 'user', content: prompt }], '');
      if (wasLarge && !result.error) result._truncated = true;
      return result;
    };

    if (!apiKey) {
      if (isImage) return { error: 'A Gemini API key is required to parse image files. Add yours in Settings → AI.' };
      return tryBackend();
    }

    // Large text files: chunk to avoid hitting per-minute token limits
    const CHUNK_CHARS = 60000; // ~15K tokens per chunk — comfortably under per-minute TPM limits
    if (!isImage && content.length > CHUNK_CHARS) {
      return this._parseFileInChunks(content, apiKey, CHUNK_CHARS, onProgress, tryBackend);
    }

    const parsePrompt = `You are a workout log parser. Convert the following into a JSON object with a "workouts" array.
    Each workout: "date" (ISO), "title", "exercises" (array with "name" and "sets" array of {weight, reps}).
    Add unclear items to an "uncertain" array. Return only valid JSON.\n\nData:\n${isImage ? '[See attached image]' : content}`;

    // Use multimodal parts for images, text-only for everything else
    const parts = isImage
      ? [{ inline_data: { mime_type: type, data: content.replace(/^data:[^,]+,/, '') } }, { text: parsePrompt }]
      : [{ text: parsePrompt }];

    try {
      const response = await this.fetchWithRetry(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts }] }) },
        4, onProgress
      );

      if (!response.ok) {
        if (response.status === 429) {
          if (!isImage) return tryBackend();
          return { error: 'Gemini rate limit hit. Please wait a minute and try again.' };
        }
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

  // ─── Chunked parsing for large files ───────────────────────
  async _parseFileInChunks(content, apiKey, chunkSize, onProgress, fallback) {
    const totalChunks = Math.ceil(content.length / chunkSize);
    const allWorkouts = [];
    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    if (onProgress) onProgress(`Large file detected (${Math.round(content.length/1024)}KB) — splitting into ${totalChunks} chunks...`);

    for (let i = 0; i < totalChunks; i++) {
      const chunk = content.substring(i * chunkSize, (i + 1) * chunkSize);
      if (onProgress) onProgress(`Parsing chunk ${i + 1} of ${totalChunks}...`);

      const prompt = `Parse this workout log chunk (${i + 1} of ${totalChunks}) into a JSON object with a "workouts" array.
Each workout: "date" (ISO string), "title", "exercises" (array with "name" and "sets" array of {weight, reps}).
Return only valid JSON — no markdown, no explanation.\n\nData:\n${chunk}`;

      try {
        const response = await this.fetchWithRetry(
          GEMINI_URL,
          { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) },
          4, onProgress
        );

        if (!response.ok) {
          if (response.status === 429) {
            // After exhausting retries on a chunk, try backend for remaining content
            if (fallback) {
              if (onProgress) onProgress(`Still rate limited on chunk ${i + 1} — falling back to backup server for remaining data...`);
              const remaining = content.substring(i * chunkSize);
              const fallbackResult = await fallback(remaining);
              if (!fallbackResult.error) {
                try {
                  let raw = fallbackResult.text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
                  const m = raw.match(/\{[\s\S]*\}/);
                  if (m) { const p = JSON.parse(m[0]); if (p.workouts) allWorkouts.push(...p.workouts); }
                } catch(_) {}
              }
              break;
            }
            return { error: `Rate limit hit on chunk ${i + 1}. Parsed ${allWorkouts.length} workouts so far. Try again in a minute.` };
          }
          console.warn(`Chunk ${i + 1} failed: HTTP ${response.status}`);
          continue;
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        let raw = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.workouts?.length) allWorkouts.push(...parsed.workouts);
        }
      } catch (err) {
        console.warn(`Chunk ${i + 1} parse error:`, err);
      }

      // Pause between chunks to stay under per-minute token limits
      if (i < totalChunks - 1) {
        if (onProgress) onProgress(`Chunk ${i + 1} done — waiting 4s before next chunk...`);
        await new Promise(r => setTimeout(r, 4000));
      }
    }

    if (!allWorkouts.length) return { error: 'Could not parse any workouts from the file. Try a different format.' };
    if (onProgress) onProgress(`Done! Found ${allWorkouts.length} workouts across ${totalChunks} chunks.`);
    return { text: JSON.stringify({ workouts: allWorkouts }) };
  },

  // Describe a person's appearance from a selfie (Gemini Vision)
  // Returns a comma-separated feature string for use in Pollinations prompt
  async describeSelfie(base64Data, mimeType = 'image/jpeg') {
    const apiKey = await this.getApiKey();

    const prompt = `Describe this person's physical appearance in concise detail for AI image generation. Focus on: gender, approximate age, ethnicity, hair color and style, eye color, skin tone, facial features, facial hair if any, body build if visible. Return ONLY a comma-separated descriptor list — no sentences, no explanation. Example output: "white male, mid 20s, short dark brown hair, blue eyes, light skin, strong jaw, light stubble, athletic build"`;

    const makeParts = (key) => ({
      contents: [{
        parts: [
          { inline_data: { mime_type: mimeType, data: base64Data } },
          { text: prompt }
        ]
      }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 200 }
    });

    if (apiKey) {
      // Use local key
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(makeParts(apiKey)) }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (text) return { description: text };
        throw new Error('Empty response');
      } catch (e) {
        return { error: e.message };
      }
    } else {
      // Fall back to backend proxy (sends image data — rate limited 1/day)
      const userId = await DB.getSetting('serverId');
      if (!userId) return { error: 'Register first to use selfie portrait without a personal API key.' };
      try {
        const res = await fetch(`${this.BACKEND}/api/ai/describe-selfie`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, image_base64: base64Data, mime_type: mimeType })
        });
        const data = await res.json();
        if (!res.ok) return { error: data.error || 'Server error' };
        return data;
      } catch (e) {
        return { error: 'Could not reach server.' };
      }
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
