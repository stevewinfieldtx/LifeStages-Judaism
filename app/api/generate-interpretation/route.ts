import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { generateText } from "ai"
import { buildPersonalizationContext, type ContentMode } from "@/lib/personalization-prompts"
import { getOpenRouterApiKey, getOpenRouterModelId } from "@/lib/env"
import { cleanLLMText } from "@/lib/clean-llm-text"

export async function POST(request: Request) {
  try {
    const { verseReference, verseText, ageRange, gender, stageSituation, language = "en", source, contentMode = "casual" } = await request.json()

    const openrouter = createOpenRouter({
      apiKey: getOpenRouterApiKey(),
    })

    const personalizationContext = buildPersonalizationContext(ageRange, gender, stageSituation, contentMode as ContentMode)

    const languageName = getLanguageName(language)
    const languageInstruction =
      language !== "en"
        ? `CRITICAL LANGUAGE REQUIREMENT: You MUST write your entire interpretation in ${languageName}. Every single word of the interpretation content must be in ${languageName}. Do NOT write in English. The delimiters stay in English, but ALL content between them must be in ${languageName}.`
        : ""

    const judaismContext = contentMode === "academic" 
      ? `You are a Jewish studies scholar providing rigorous textual analysis rooted in the rabbinic tradition. Draw on classical commentators, Talmudic sources, and modern scholarship while maintaining reverence for Torah.`
      : `You are creating Torah study content for Jewish readers seeking meaningful connection with their tradition.

Key guidelines:
- Use Jewish terminology naturally (Torah, mitzvot, Hashem, teshuvah, chesed, etc.)
- Reference rabbinic wisdom - Talmud, Midrash, great rabbis through the ages
- Connect texts to Jewish life - Shabbat, holidays, lifecycle events, daily practice
- Honor the diversity of Jewish experience - different levels of observance, different movements
- Maintain a tone of warmth, wisdom, and authentic Jewish voice
- Use "Hashem" or "God" rather than "the Lord" (Christian phrasing)
- Remember: Torah is not just history but living wisdom for today`

    const baseInstructions = `CRITICAL: Write ONLY plain prose text. NO URLs, NO links, NO citations, NO bracketed text, NO markdown formatting, NO asterisks, NO underscores for emphasis.`

    const systemInstruction = `${judaismContext}\n\n${baseInstructions}\n\n${languageInstruction}${languageInstruction ? "\n\n" : ""}${personalizationContext}`

    const promptInstruction = contentMode === "academic"
      ? `Write a comprehensive scholarly analysis of this text. Include Hebrew word studies, cite classical commentators (Rashi, Ramban, etc.), reference Talmudic discussions, and engage with modern Jewish scholarship. Maintain academic rigor while being spiritually insightful. Be thorough and detailed.`
      : `Write a rich, reflective d'var Torah (Torah teaching) about this text in a warm, personal tone. This should feel like something a thoughtful rabbi might share - genuine, wise, and connecting the ancient text to real life today. Explore multiple layers of meaning. Share insights that would help someone apply this wisdom in their daily life.`

    const wordLimit = contentMode === "academic" ? "500-700 words with scholarly depth" : "350-450 words of meaningful reflection"

    const { text } = await generateText({
      model: openrouter(getOpenRouterModelId()),
      system: systemInstruction,
      prompt: `${verseReference}: "${verseText}"
      ${source ? `(Source: ${source})` : ""}
      
      ${language !== "en" ? `REMINDER: Write your interpretation in ${languageName}, NOT English.\n\n` : ""}${promptInstruction}

      Write ONLY plain text - no URLs, no links, no citations, no brackets, no asterisks.
      
      IMPORTANT: Write a FULL, COMPLETE response of ${wordLimit}. Do not cut short. Provide rich, meaningful content.
      
      Format your response EXACTLY like this:
      
      INTERPRETATION===
      Your ${contentMode === "academic" ? "scholarly analysis" : "d'var Torah"} here... (${wordLimit})
      ===INTERPRETATION
      
      IMAGE_PROMPT===
      Cinematic description of an inspiring scene that captures the text's theme. Consider ancient Israelite settings, Jewish lifecycle moments, or symbolic imagery. Always respectful and appropriate.
      ===IMAGE_PROMPT`,
      maxTokens: contentMode === "academic" ? 8000 : 6000,
    })

    let interpretationMatch = text.match(/INTERPRETATION===\s*([\s\S]*?)\s*===INTERPRETATION/)
    if (!interpretationMatch) {
      interpretationMatch = text.match(/INTERPRETATION===\s*([\s\S]*?)\s*===(?:IMAGE_PROMPT|$)/)
    }

    let imagePromptMatch = text.match(/IMAGE_PROMPT===\s*([\s\S]*?)\s*===(?:IMAGE_PROMPT|$)/)
    if (!imagePromptMatch) {
      imagePromptMatch = text.match(/===?IMAGE_PROMPT\s*([\s\S]*?)(?:===|$)/)
    }

    const interpretation = cleanLLMText(interpretationMatch ? interpretationMatch[1].trim() : "Unable to generate interpretation.")
    const heroImagePrompt = imagePromptMatch ? imagePromptMatch[1].trim() : "A serene scene depicting Jewish faith and wisdom"

    return Response.json({
      interpretation,
      heroImagePrompt,
    })
  } catch (error) {
    console.error("Interpretation generation error:", error)
    return Response.json({ error: "Failed to generate interpretation" }, { status: 500 })
  }
}

function getLanguageName(code: string): string {
  const languages: Record<string, string> = {
    en: "English",
    he: "Hebrew (עברית)",
    es: "Spanish (Español)",
    fr: "French (Français)",
    de: "German (Deutsch)",
    ru: "Russian (Русский)",
    yi: "Yiddish (ייִדיש)",
    pt: "Portuguese (Português)",
  }
  return languages[code] || "English"
}
