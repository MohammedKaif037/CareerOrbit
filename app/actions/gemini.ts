"use server";

export async function generateFollowUpAction(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY; 
  
  if (!apiKey) {
    throw new Error("API Key not configured on server");
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 300 },
      }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    console.error("Gemini Error:", data);
    throw new Error(data.error?.message || "Failed to generate content");
  }

  return data.candidates?.[0]?.content?.parts?.[0]?.text;
}
