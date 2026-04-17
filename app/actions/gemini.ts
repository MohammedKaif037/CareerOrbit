"use server";

export async function generateFollowUpAction(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("API Key not found in server environment.");
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { 
          temperature: 0.7, 
          // We increase this to 1000 so it never stops mid-sentence.
          // Your prompt already asks for <120 words, so it will still be short.
          maxOutputTokens: 1000, 
          topP: 0.95 
        },
      }),
    }
  );

  if (!res.ok) {
    const errorData = await res.json();
    console.error("Gemini API Error:", errorData);
    throw new Error(errorData.error?.message || "Failed to connect to Gemini API");
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  return text.trim();
}
