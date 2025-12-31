import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { generateText } from "ai"
import { buildPersonalizationContext, type ContentMode } from "@/lib/personalization-prompts"
import { getOpenRouterApiKey, getOpenRouterModelId } from "@/lib/env"
import { cleanLLMText } from "@/lib/clean-llm-text"

export async function POST(request: Request) {
  try {
    const { verseReference, verseText, ageRange, gender, stageSituation, poemType, source, contentMode = "casual" } = await request.json()

    const openrouter = createOpenRouter({
      apiKey: getOpenRouterApiKey(),
    })

    const personalization = buildPersonalizationContext(ageRange, gender, stageSituation, contentMode as ContentMode)

    const isClassic = poemType === "classic"
    
    const styleGuide = contentMode === "academic"
      ? isClassic
        ? "Write a formally structured poem with careful attention to meter and form. Draw on the tradition of Hebrew liturgical poetry (piyyut), medieval Jewish poets like Yehuda HaLevi and Ibn Gabirol, and modern Hebrew poets like Yehuda Amichai and Rachel. The poem should reward multiple readings with layers of meaning."
        : "Write a literary free verse poem with sophisticated imagery, allusion to Jewish texts and tradition, and theological depth. Reference the style of modern Jewish poets. Use imagery drawn from Jewish experience and sacred texts."
      : isClassic
        ? "Write a PIYYUT-STYLE poem - something that could be sung or chanted, with clear rhythm and structure. Think of the beautiful poetry in our siddur, or songs sung at the Shabbat table. The words should elevate the soul."
        : "Write a FREE VERSE poem with vivid imagery and spiritual depth, no strict rhyme required. The poem should flow naturally, paint pictures with words, and touch the Jewish soul. Something that might be shared at a seder, a simcha, or a moment of reflection."

    const systemInstruction = contentMode === "academic"
      ? `You are a literary poet with expertise in Jewish poetry traditions - from biblical poetry through piyyut to modern Hebrew verse. Write poetry that combines literary sophistication with deep Jewish learning.

CRITICAL: Write ONLY plain text poetry. NO URLs, NO links, NO citations, NO bracketed text, NO markdown formatting.

${personalization}`
      : `You are a gifted Jewish poet who writes beautiful verse that speaks to the Jewish soul. Your poems reflect the depth of Torah, the rhythm of Jewish life, and the longing for the sacred.

Your poems have:
- Beautiful rhythm and flow
- Rich imagery drawn from Jewish life and tradition
- Hebrew or Yiddish words used naturally where they add meaning
- Connections to holidays, Shabbat, prayer, and lifecycle
- Universal human emotions through a Jewish lens

CRITICAL: Write ONLY plain text poetry. NO URLs, NO links, NO citations, NO bracketed text, NO markdown formatting.

${personalization}`

    const lineCount = contentMode === "academic" ? "20-32 lines" : "16-24 lines"

    const { text } = await generateText({
      model: openrouter(getOpenRouterModelId()),
      system: systemInstruction,
      prompt: `Generate 1 beautiful ${isClassic ? "PIYYUT-STYLE (Classic)" : "FREE VERSE"} poem inspired by ${verseReference}: "${verseText}"
${source ? `(From: ${source})` : ""}

${styleGuide}

Requirements:
- ${lineCount} total (this is a COMPLETE poem, not a snippet)
- Clear stanzas with blank lines between them
- Rich imagery from Jewish tradition and experience
- ${contentMode === "academic" ? "Literary sophistication and theological depth" : "Spiritual warmth and accessibility"}
- May include Hebrew/Yiddish words where they add beauty (with meaning clear from context)

Respond in this EXACT format:
TITLE===Your Poem Title===TITLE
POEM===
First line of poem
Second line of poem
Third line of poem

Fourth line (new stanza)
Fifth line
Sixth line

(continue for ${lineCount})
===POEM
IMAGE===Detailed visual description for artwork to accompany this poem - beautiful, evocative, Jewishly meaningful===IMAGE`,
      maxTokens: 2500,
    })

    const titleMatch = text.match(/TITLE===(.+?)===TITLE/s)
    const poemMatch = text.match(/POEM===(.+?)===POEM/s)
    const imageMatch = text.match(/IMAGE===(.+?)===IMAGE/s)

    const poem = {
      title: cleanLLMText(titleMatch?.[1]?.trim() || "Untitled Poem"),
      type: isClassic ? "Piyyut Style" : "Free Verse",
      text: poemMatch?.[1]?.trim() || text,
      imagePrompt: imageMatch?.[1]?.trim() || "Beautiful artistic representation of Jewish spirituality and tradition",
    }

    return Response.json({ poem })
  } catch (error) {
    console.error("Poem generation error:", error)
    return Response.json({ error: "Failed to generate poem" }, { status: 500 })
  }
}
