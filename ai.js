// Updated section for ai.js - add this method to the AI object:

async generateExerciseIcon(exerciseName, muscleGroups = []) {
    const apiKey = await this.getApiKey();
    if (!apiKey) return null;

    // Check cache first
    const cached = await DB.get('exercises', null);
    // Cache check happens at the app level, this just generates

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
      // Extract base64 image from response
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
