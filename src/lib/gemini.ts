export async function generateEducationContent(prompt: string, systemInstruction?: string, model?: string) {
  const userKey = localStorage.getItem('user_gemini_key');
  
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, systemInstruction, model, apiKey: userKey }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to generate content");
  }
  
  return await response.json();
}
