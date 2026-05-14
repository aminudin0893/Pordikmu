export async function generateEducationContent(prompt: string, systemInstruction?: string, model?: string) {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, systemInstruction, model }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to generate content");
  }
  
  return await response.json();
}
