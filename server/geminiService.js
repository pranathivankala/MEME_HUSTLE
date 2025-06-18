export async function generateCaptionAndVibe(title, tags = []) {
  const prompt = `
Generate a funny caption and a one-liner cyberpunk vibe for a meme.
Title: "${title}"
Tags: ${tags.join(', ')}

Format:
Caption: ...
Vibe: ...
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const captionMatch = text.match(/Caption:\s*(.+)/i);
    const vibeMatch = text.match(/Vibe:\s*(.+)/i);

    return {
      ai_caption: captionMatch?.[1]?.trim() || "YOLO to the moon!",
      ai_vibe: vibeMatch?.[1]?.trim() || "Retro Chaos Glitch"
    };
  } catch (error) {
    console.error("Gemini error fallback:", error.message);
    return {
      ai_caption: "YOLO to the moon!",
      ai_vibe: "Retro Chaos Glitch"
    };
  }
}
