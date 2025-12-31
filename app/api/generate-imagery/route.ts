import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { generateText } from "ai"
import { parseLLMJson } from "@/lib/parse-llm-json"
import { buildPersonalizationContext, type ContentMode } from "@/lib/personalization-prompts"
import { getOpenRouterApiKey, getOpenRouterModelId } from "@/lib/env"
import { cleanLLMObject } from "@/lib/clean-llm-text"

export async function POST(request: Request) {
  try {
    const { verseReference, verseText, ageRange, gender, stageSituation, source, contentMode = "casual" } = await request.json()

    const openrouter = createOpenRouter({
      apiKey: getOpenRouterApiKey(),
    })

    const personalization = buildPersonalizationContext(ageRange, gender, stageSituation, contentMode as ContentMode)

    const systemInstruction = contentMode === "academic"
      ? `You are a Jewish studies scholar analyzing scriptural symbolism with academic rigor. Provide deep symbolic analysis with references to rabbinic literature, Kabbalistic tradition, Hebrew linguistics, and scholarly interpretations.

Include: Hebrew word roots and their symbolic significance, rabbinic and mystical interpretations, connections to Jewish ritual and practice, how symbols developed in Jewish thought through the ages.

IMPORTANT: Each symbol explanation should be 100-150 words of substantive scholarly analysis.

CRITICAL: Write ONLY plain prose text. NO URLs, NO links, NO citations, NO bracketed text, NO markdown formatting.

${personalization}`
      : `You have a gift for seeing deeper meaning in Jewish texts. Help readers discover beautiful symbolism in a way that enriches their understanding and connection to tradition.

Write like you're sharing an insight over a Shabbat table - "Here's something beautiful I noticed..." "The rabbis teach that..." "This reminds me of..."

Feel free to reference:
- Connections to Jewish holidays and lifecycle events
- Kabbalistic interpretations (accessible, not overly esoteric)
- How symbols appear in Jewish art, ritual objects, synagogue architecture
- Cross-references to other Jewish texts
- Practical application to Jewish life

IMPORTANT: Each symbol explanation should be 80-120 words.

CRITICAL: Write ONLY plain prose text. NO URLs, NO links, NO citations, NO bracketed text, NO markdown formatting.

${personalization}`

    const explanationLength = contentMode === "academic" ? "100-150 words of scholarly analysis" : "80-120 words of heartfelt explanation"

    const { text } = await generateText({
      model: openrouter(getOpenRouterModelId()),
      system: systemInstruction,
      prompt: `Find 4 powerful symbols or themes in ${verseReference}: "${verseText}"
${source ? `(From: ${source})` : ""}

${contentMode === "academic" ? "Provide scholarly analysis of each symbol including Hebrew linguistics, rabbinic interpretation, and Kabbalistic dimensions where appropriate." : "Unpack each symbol in a way that helps readers see deeper meaning and connect it to their Jewish lives."}

IMPORTANT: Each "sub" field must be ${explanationLength}. Don't give brief answers.

Consider symbols like: light, water, fire, bread, wine, the number 7, trees, paths, garments, gates, mountains, shepherds, stars, oil, salt, etc.

Create 4 distinct visual concepts for imagePrompts (all respectful of Jewish tradition):
1. First image: Focus on a natural element or sacred landscape
2. Second image: Focus on Jewish ritual or practice
3. Third image: Focus on an abstract or symbolic representation
4. Fourth image: Focus on a scene that illustrates the verse

Return ONLY a JSON object, no markdown, no citations, no URLs:
{
  "imagery": [
    { "title": "Symbol Name", "sub": "${explanationLength} exploring this symbol deeply", "icon": "auto_awesome", "imagePrompt": "Detailed visual description" },
    { "title": "Symbol Name", "sub": "${explanationLength} exploring this symbol deeply", "icon": "water_drop", "imagePrompt": "Detailed visual description" },
    { "title": "Symbol Name", "sub": "${explanationLength} exploring this symbol deeply", "icon": "spa", "imagePrompt": "Detailed visual description" },
    { "title": "Symbol Name", "sub": "${explanationLength} exploring this symbol deeply", "icon": "wb_sunny", "imagePrompt": "Detailed visual description" }
  ]
}`,
      maxTokens: contentMode === "academic" ? 5000 : 3500,
    })

    const cleanJson = text.replace(/```json|```/g, "").trim()
    const data = parseLLMJson(cleanJson)
    const cleanedData = cleanLLMObject(data)

    return Response.json(cleanedData)
  } catch (error) {
    console.error("Imagery generation error:", error)
    return Response.json({ error: "Failed to generate imagery" }, { status: 500 })
  }
}
