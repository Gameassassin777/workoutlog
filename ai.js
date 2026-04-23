// ai.js — Gemini 2.5 Flash integration
const AI = {
  SYSTEM_PROMPT: `You are TropicalFit AI — a fun, tropical-themed fitness coach who gives ONLY evidence-based advice backed by peer-reviewed research.

Your personality: Encouraging, knowledgeable, uses tropical metaphors (waves, sunshine, island vibes). Keep responses concise but informative.

When recommending supplements, cite the research:
- Creatine monohydrate (3-5g daily) — most studied supplement, increases strength/power output
- Caffeine (3-6mg/kg) — proven ergogenic aid, improves endurance and strength
- Sodium bicarbonate (baking soda, 0.3g/kg) — buffers lactic acid, improves high-intensity endurance
- Protein (1.6-2.2g/kg/day) — meta-analyses show this range optimal for muscle protein synthesis
- Beta-alanine (3-6g daily) — increases carnosine, improves muscular endurance for 1-4 min efforts

When analyzing workouts, reference:
- Progressive overload (increase volume/intensity over time)
- Volume landmarks: MEV (Minimum Effective Volume), MAV (Maximum Adaptive Volume), MRV (Maximum Recoverable Volume)
- RPE/RIR based training for autoregulation
- Deload protocols (every 4-8 weeks, reduce volume 40-60%)
- Frequency: meta-analyses show 2x/week per muscle group superior to 1x
- Rest periods: 2-5 min for strength, 1-2 min for hypertrophy
- Tempo and time under tension considerations

Never recommend unproven supplements or bro-science.
Always explain WHY something works (mechanism of action).
Keep it fun and tropical but scientifically rigorous.
Use emojis sparingly but effectively 🌴🏋️🌊

When given workout data, analyze it specifically — don't give generic advice.`,

  async getApiKey() {
    return await DB.getSetting('geminiApiKey');
  },

  async chat(messages, context = '') {
    const apiKey = await this.getApiKey();
    if (!apiKey) {
      return { error: 'No API key set. Go to Settings → AI Setup to add your free Gemini API key from aistudio.google.com' };
    }

    const contents = [];

    // Add system prompt as first user/model exchange
    contents.push({
      role: 'user',
      parts: [{ text: `System instructions: ${this.SYSTEM_PROMPT}${context ? '\n\nContext data:\n' + context : ''}` }]
    });
    contents.push({
      role: 'model',
      parts: [{ text: 'Understood! I\'m your TropicalFit AI coach. I\'ll give evidence-based advice with island vibes. 🌴 What can I help you with?' }]
    });

    // Add conversation history
    for (const msg of messages) {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      });
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.7,
              topP: 0.9,
              topK: 40,
              maxOutputTokens: 2048
            }
          })
        }
      );

      if (!response.ok) {
        const err = await response.json();
        return { error: `API Error: ${err.error?.message || response.statusText}` };
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) return { error: 'No response from AI' };
      return { text };
    } catch (err) {
      return { error: `Network error: ${err.message}` };
    }
  },

  async analyzeWorkout(workout) {
    const summary = this._workoutToText(workout);
    const messages = [
      { role: 'user', content: `Analyze this workout and give me a score out of 100, key observations, and one evidence-based tip to improve:\n\n${summary}` }
    ];
    return this.chat(messages);
  },

  async analyzeExerciseHistory(exerciseName, workouts) {
    const history = workouts
      .filter(w => w.exercises.some(e => e.name === exerciseName))
      .map(w => {
        const ex = w.exercises.find(e => e.name === exerciseName);
        return `${w.date}: ${ex.sets.map(s => `${s.weight}${s.weightUnit || 'lbs'}×${s.reps}`).join(', ')}`;
      })
      .join('\n');

    const messages = [
      { role: 'user', content: `Analyze my ${exerciseName} progression over time. Look for trends, plateaus, and give evidence-based advice:\n\n${history}` }
    ];
    return this.chat(messages);
  },

  async parseFileContent(content, fileType) {
    const messages = [
      {
        role: 'user',
        content: `I'm uploading a workout log file (${fileType}). Parse this into structured workout data. Return ONLY valid JSON in this exact format:
{
  "workouts": [
    {
      "date": "YYYY-MM-DD",
      "title": "optional title",
      "exercises": [
        {
          "name": "Exercise Name",
          "sets": [
            { "weight": 135, "weightUnit": "lbs", "reps": 10 }
          ]
        }
      ]
    }
  ],
  "uncertain": [
    { "field": "description of what's unclear", "options": ["option1", "option2"] }
  ]
}

If anything is unclear, add it to the "uncertain" array. Here's the file content:

${content}`
      }
    ];
    return this.chat(messages);
  },

  _workoutToText(workout) {
    let text = `Date: ${new Date(workout.date).toLocaleDateString()}\n`;
    if (workout.title) text += `Title: ${workout.title}\n`;
    if (workout.notes) text += `Notes: ${workout.notes}\n`;
    if (workout.duration) text += `Duration: ${Math.round(workout.duration / 60)} minutes\n`;
    text += '\n';
    for (const ex of workout.exercises) {
      text += `${ex.name}:\n`;
      for (const set of ex.sets) {
        text += `  Set ${set.setNumber}: ${set.weight}${set.weightUnit || 'lbs'} × ${set.reps} reps`;
        if (set.rpe) text += ` @ RPE ${set.rpe}`;
        if (set.notes) text += ` (${set.notes})`;
        text += '\n';
      }
    }
    return text;
  }
};
