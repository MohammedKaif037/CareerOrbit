"use server";

export async function generateFollowUpAction(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("API Key is not configured in Netlify environment variables.");
  }

  // Updated model name to gemini-1.5-flash-latest to match v1beta requirements
 const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { 
          temperature: 0.7, 
          maxOutputTokens: 400,
          topP: 0.95 
        },
      }),
    }
  );

  if (!res.ok) {
    const errorData = await res.json();
    console.error("Gemini API Error:", errorData);
    // This message will now be logged properly in Netlify Functions
    throw new Error(errorData.error?.message || "Failed to connect to Gemini API");
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  return text.trim();
}
