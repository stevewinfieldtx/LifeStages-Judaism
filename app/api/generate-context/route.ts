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

    const isTorah = source?.includes("Torah") || /Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Bereshit|Shemot|Vayikra|Bamidbar|Devarim/i.test(verseReference)
    const isProphets = source?.includes("Prophets") || source?.includes("Nevi'im") || /Isaiah|Jeremiah|Ezekiel|Joshua|Judges|Samuel|Kings/i.test(verseReference)
    const isWritings = source?.includes("Writings") || source?.includes("Ketuvim") || /Psalms|Proverbs|Job|Ecclesiastes|Song|Ruth|Esther|Daniel|Ezra|Nehemiah|Chronicles/i.test(verseReference)
    const isTalmud = source?.includes("Talmud") || /Berakhot|Shabbat|Eruvin|Pesachim|Yoma|Sukkah|Beitzah|Rosh Hashanah|Taanit|Megillah|Moed Katan|Chagigah|Yevamot|Ketubot|Nedarim|Nazir|Sotah|Gittin|Kiddushin|Bava Kamma|Bava Metzia|Bava Batra|Sanhedrin|Makkot|Shevuot|Avodah Zarah|Horayot|Zevachim|Menachot|Chullin|Bekhorot|Arakhin|Temurah|Keritot|Meilah|Kinnim|Tamid|Middot|Niddah/i.test(verseReference)

    let scriptureTypeGuidance = ""
    if (isTorah) {
      scriptureTypeGuidance = contentMode === "academic" 
        ? `This is from the Torah (Chumash). Your scholarly analysis MUST include:
- The parsha (weekly portion) context and where this fits in the narrative
- Classical commentators: Rashi (with attention to his sources), Ramban, Ibn Ezra, Sforno, Or HaChaim
- Relevant Talmudic discussions that cite or interpret this verse
- Midrashic elaborations (Midrash Rabbah, Tanchuma, Yalkut Shimoni)
- Hebrew word analysis - roots, grammatical forms, variant readings
- Ancient Near Eastern parallels and historical context
- How this text is used in Jewish liturgy or practice`
        : `This is from the Torah. Help readers deeply understand:
- Where this fits in the Torah narrative - what's happening in the story?
- Who are the people involved? Make them real and relatable
- What does Jewish tradition say about this passage?
- How has this text shaped Jewish life and practice?
- What is the eternal message for us today?`
    } else if (isTalmud) {
      scriptureTypeGuidance = contentMode === "academic"
        ? `This is from the Talmud. Your scholarly analysis MUST include:
- The masechet (tractate) context and the sugya (topic) being discussed
- The structure of the argument - what question is being addressed?
- Named sages and their positions
- The give-and-take of the dialectic
- How later authorities (Rishonim, Acharonim) ruled
- Practical halakhic implications
- The historical period (Tannaitic, Amoraic) and location (Bavli vs Yerushalmi)`
        : `This is from the Talmud. Help readers understand:
- What question or situation sparked this discussion?
- Who are the rabbis debating and what are their views?
- How does the Talmud reach its conclusion?
- What does this teach us about how Jews approach questions?
- How does this apply to Jewish life today?`
    } else if (isProphets) {
      scriptureTypeGuidance = contentMode === "academic"
        ? `This is from Nevi'im (Prophets). Your scholarly analysis should include:
- Historical context - which king, what period, what crisis?
- The prophet's mission and relationship to the people
- Literary analysis - poetic structure, metaphors, rhetorical devices
- How this passage is used as a Haftarah reading
- Rabbinic interpretation of prophetic imagery
- Connections to other biblical texts`
        : `This is from the Prophets. Help readers understand:
- What was happening in Israel/Judah at this time?
- Who was this prophet and what was their mission?
- What message was God sending through these words?
- How does this prophetic vision speak to us today?`
    } else if (isWritings) {
      scriptureTypeGuidance = contentMode === "academic"
        ? `This is from Ketuvim (Writings). Your scholarly analysis should include:
- The genre and literary character of this book
- Traditional authorship and historical setting
- How this text is used in Jewish liturgy and holidays
- Wisdom themes and their development in Jewish thought
- Rabbinic and medieval commentary
- Modern scholarly perspectives`
        : `This is from the Writings (Ketuvim). Help readers understand:
- What kind of text is this? (Psalm, wisdom, history, etc.)
- When and why might this have been written?
- How do Jews use this text today? (prayers, holidays, study)
- What timeless wisdom does it offer?`
    } else {
      scriptureTypeGuidance = `Help readers understand the context of this Jewish text - who wrote it, when, and why it matters for Jewish life today.`
    }

    const systemInstruction = contentMode === "academic"
      ? `You are a Jewish studies professor writing for an educated audience. Your analysis must demonstrate deep knowledge of rabbinic literature.

CRITICAL ACADEMIC REQUIREMENTS:
- Cite classical commentators BY NAME (Rashi, Ramban, Ibn Ezra, Sforno, Rambam, etc.)
- Include Talmudic references with masechet and daf when relevant
- Reference Midrashic sources
- Use Hebrew terms with transliteration and translation
- Acknowledge different interpretive traditions
- Reference modern scholars (Nechama Leibowitz, Rabbi Sacks, etc.)

IMPORTANT: Each field should be 150-250 words of substantive scholarly content.

${scriptureTypeGuidance}

${personalization}

CRITICAL: Write ONLY plain prose text. NO URLs, NO links, NO bracketed citations. Mention sources by name in the text itself.`
      : `You're helping Jews understand their sacred texts better - like a warm, knowledgeable rabbi who makes Torah come alive. Keep it engaging and meaningful. 

Use phrases like "Our tradition teaches...", "The rabbis asked...", "Here's something beautiful...", "Imagine you were there..."

IMPORTANT: Each field should be 100-200 words of rich, engaging content.

${scriptureTypeGuidance}

${personalization}

CRITICAL: Write ONLY plain prose text. NO URLs, NO links, NO citations, NO bracketed text, NO markdown formatting.`

    const fieldLength = contentMode === "academic" ? "150-250 words of scholarly analysis" : "100-200 words of engaging explanation"

    const { text } = await generateText({
      model: openrouter(getOpenRouterModelId()),
      system: systemInstruction,
      prompt: `Provide ${contentMode === "academic" ? "comprehensive scholarly context for" : "rich background on"} ${verseReference}: "${verseText}"
      ${source ? `(Source: ${source})` : ""}
      
      ${contentMode === "academic" ? "Write as if for Jewish studies journal. Cite rabbis and sources by name. Include Hebrew terms." : "Make this come alive! Help readers feel connected to our ancestors and their wisdom."}
      
      IMPORTANT: Each field must be ${fieldLength}. Do not give brief answers.
      
      Return ONLY a JSON object with this structure, no markdown, no bracketed citations, no URLs:
      {
        "context": {
          "whoIsSpeaking": "${fieldLength} - Who is speaking or writing? For Torah: Moshe transmitting God's words? A character in the narrative? For Talmud: Which rabbi? For Psalms: David? Asaph?",
          "originalListeners": "${fieldLength} - Who first heard/received this? The Israelites at Sinai? Exiles in Babylon? Students in the beit midrash?",
          "whyTheConversation": "${fieldLength} - What prompted this text? A crisis? A question? A moment of revelation?",
          "historicalBackdrop": "${fieldLength} - What was happening in Jewish history? Temple era? Exile? Rabbinic period?",
          "immediateImpact": "${fieldLength} - How did people respond? What happened next in the story or history?",
          "longTermImpact": "${fieldLength} - How has this text shaped Jewish thought, practice, and life through the ages?",
          "setting": "${fieldLength} - Help readers picture the scene. Sinai? The Temple? A study hall in Babylonia?"
        },
        "contextImagePrompt": "Detailed cinematic historical scene. Ancient Israelite, Second Temple, or rabbinic settings as appropriate. Modest, dignified imagery respectful of Jewish tradition."
      }`,
      maxTokens: contentMode === "academic" ? 8000 : 5000,
    })

    const data = parseLLMJson(text)
    const cleanedData = cleanLLMObject(data)

    return Response.json(cleanedData)
  } catch (error) {
    console.error("Context generation error:", error)
    return Response.json({ error: "Failed to generate context" }, { status: 500 })
  }
}
