import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { generateText } from "ai"
import { buildPersonalizationContext, type ContentMode } from "@/lib/personalization-prompts"
import { getOpenRouterApiKey, getOpenRouterModelId } from "@/lib/env"
import { cleanLLMText } from "@/lib/clean-llm-text"

export async function POST(request: Request) {
  try {
    const { verseReference, verseText, ageRange, gender, stageSituation, storyType, source, contentMode = "casual" } = await request.json()

    if (!verseReference || !verseText || !storyType) {
      return Response.json({
        error: "Missing required fields",
        title: "Story Unavailable",
        text: "Unable to generate story due to missing information.",
        imagePrompt: "A peaceful scene",
      }, { status: 400 })
    }

    const openrouter = createOpenRouter({
      apiKey: getOpenRouterApiKey(),
    })

    const personalization = buildPersonalizationContext(ageRange, gender, stageSituation, contentMode as ContentMode)

    const storyPrompts: Record<string, Record<string, string>> = {
      casual: {
        contemporary: `Write a modern-day story set in contemporary Jewish life.

Settings could include: a Jewish family home on Shabbat, a synagogue (Orthodox, Conservative, Reform, or Reconstructionist), a Jewish summer camp, a Hillel house, a shiva home, a Jewish wedding, a bar/bat mitzvah celebration, a family Passover seder, a Jewish day school, a kibbutz, Jerusalem's Old City, a Jewish deli where wisdom is shared...

Focus on realistic situations Jews face today - balancing tradition and modernity, raising Jewish children, building community, navigating interfaith relationships, finding meaning in ritual, connecting to Israel, dealing with antisemitism, rediscovering heritage.

Use natural Jewish terminology (Shabbat, shul, rabbi, mitzvah, etc.) but make it feel authentic, not like a textbook.`,
        historical: `Write a story set in Jewish history that brings this text to life.

Options include:
- Biblical era: Ancient Israel, the Exodus, the judges, the kings, the prophets
- Second Temple period: The Maccabees, Hillel and Shammai, the destruction of the Temple
- Rabbinic era: The Talmudic sages in Babylon or the Land of Israel
- Medieval period: Rashi in France, Maimonides in Egypt, the Golden Age of Spain
- Hasidic masters: The Baal Shem Tov, Rebbe Nachman, the great rebbes
- Modern Jewish history: Immigration to America, the shtetl, the founding of Israel

Make historical figures feel real and relatable. Show their struggles, their faith, their humanity.`,
      },
      academic: {
        contemporary: `Write a thoughtful modern narrative that explores the theological and ethical implications of this text. Include realistic scenarios where contemporary Jews grapple with applying ancient wisdom, referencing different denominational perspectives and modern Jewish thought.`,
        historical: `Write a historically rigorous narrative set in the actual time and place of this text.

Include accurate historical details - material culture, social structures, religious practices of the period. For Talmudic stories, accurately portray the beit midrash culture. For biblical narratives, incorporate archaeological and historical scholarship.

The story should be both engaging and educational, helping readers understand the historical world of our ancestors.`,
      }
    }

    const mode = contentMode as ContentMode
    const storyPrompt = storyPrompts[mode]?.[storyType] || storyPrompts.casual[storyType] || storyPrompts.casual.contemporary

    const systemInstruction = contentMode === "academic"
      ? `You are a historical fiction writer with deep expertise in Jewish history and texts. Write stories that are both engaging and historically rigorous, incorporating scholarly knowledge of the period.

CRITICAL: Write ONLY plain prose. NO URLs, NO links, NO citations, NO bracketed text, NO markdown formatting, NO asterisks or underscores for emphasis.

${personalization}`
      : `You are a gifted Jewish storyteller - a maggid - creating stories that touch the heart and illuminate Torah. Your stories feel authentically Jewish, rich with the texture of Jewish life.

Your stories should:
- Feel genuine to Jewish experience
- Show how Torah wisdom applies to real life
- Include appropriate Jewish terminology used naturally
- Never be preachy or heavy-handed
- Have real conflict, real emotion, real resolution
- Be appropriate for all ages
- Honor the diversity of Jewish experience

CRITICAL: Write ONLY plain prose. NO URLs, NO links, NO citations, NO bracketed text, NO markdown formatting.

${personalization}`

    const wordCount = contentMode === "academic" ? "1000-1200" : "800-1000"

    const { text } = await generateText({
      model: openrouter(getOpenRouterModelId()),
      system: systemInstruction,
      prompt: `Create ONE powerful, complete story that brings ${verseReference}: "${verseText}" to life.
${source ? `(Source: ${source})` : ""}

${storyPrompt}

CRITICAL LENGTH REQUIREMENT: The story MUST be ${wordCount} words. This is a FULL story, not a summary.

Include:
- Detailed scene setting with sensory details
- Multiple characters with distinct personalities
- Natural dialogue
- Deep internal thoughts and spiritual moments
- A clear narrative arc with compelling setup, conflict, and resolution
- Moments that touch the heart
- A powerful connection to the text's message

Format response EXACTLY like this:
TITLE===Your Story Title===TITLE
STORY===Your full story text (${wordCount} words, plain prose, no formatting)===STORY
IMAGE===Cinematic scene description for an image===IMAGE`,
      maxTokens: 8000,
    })

    const titleMatch = text.match(/TITLE===(.+?)===TITLE/s)
    const storyMatch = text.match(/STORY===(.+?)===STORY/s)
    const imageMatch = text.match(/IMAGE===(.+?)===IMAGE/s)

    const title = cleanLLMText(titleMatch?.[1]?.trim() || "A Story of Faith")
    const storyText = cleanLLMText(storyMatch?.[1]?.trim() || text.replace(/TITLE===.+?===TITLE/s, "").replace(/IMAGE===.+?===IMAGE/s, "").trim())
    const imagePrompt = imageMatch?.[1]?.trim() || `A warm, evocative scene related to ${verseReference}`

    return Response.json({
      title,
      text: storyText,
      imagePrompt,
    })
  } catch (error) {
    console.error("Story generation error:", error)
    return Response.json({
      title: "Story Unavailable",
      text: "We encountered an issue generating this story. Please try again later.",
      imagePrompt: "A peaceful, contemplative scene",
    }, { status: 200 })
  }
}
