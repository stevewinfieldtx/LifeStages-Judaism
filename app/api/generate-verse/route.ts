import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { generateText } from "ai"
import { getOpenRouterApiKey, getOpenRouterModelId } from "@/lib/env"

// Jewish scripture sources
const SCRIPTURE_SOURCES = {
  TORAH: "Torah",
  PROPHETS: "Nevi'im (Prophets)",
  WRITINGS: "Ketuvim (Writings)",
  TALMUD: "Talmud",
  PSALMS: "Tehillim (Psalms)",
}

async function fetchParshahVerse(): Promise<{ reference: string; text: string; version: string; source: string } | null> {
  try {
    const openrouter = createOpenRouter({
      apiKey: getOpenRouterApiKey(),
    })

    const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

    const { text } = await generateText({
      model: openrouter(getOpenRouterModelId()),
      prompt: `Today is ${currentDate}. Select a meaningful verse from the current week's Torah portion (Parashat HaShavua).
      
      Return ONLY a JSON object with this structure:
      {
        "reference": "Book Chapter:Verse in Hebrew naming (e.g., 'Bereshit 1:1', 'Shemot 3:14', 'Vayikra 19:18')",
        "version": "Hebrew Bible",
        "text": "The verse text (can use JPS or standard English translation)",
        "source": "Torah"
      }
      
      Choose a meaningful verse from this week's parshah. Return only the JSON, no explanation.`,
      maxTokens: 500,
    })

    const cleanJson = text.replace(/```json|```/g, "").trim()
    return JSON.parse(cleanJson)
  } catch (e) {
    console.error("Parshah fetch error:", e)
  }
  return null
}

async function fetchTorahVerse(): Promise<{ reference: string; text: string; version: string; source: string } | null> {
  try {
    const openrouter = createOpenRouter({
      apiKey: getOpenRouterApiKey(),
    })

    const { text } = await generateText({
      model: openrouter(getOpenRouterModelId()),
      prompt: `Select a powerful, meaningful verse from the Torah (Five Books of Moses) that would be meaningful for daily study.
      
      Return ONLY a JSON object with this structure:
      {
        "reference": "Book Chapter:Verse using Hebrew names (e.g., 'Bereshit 1:1', 'Shemot 20:2', 'Devarim 6:4')",
        "version": "Hebrew Bible",
        "text": "The verse text in English translation",
        "source": "Torah"
      }
      
      Choose well-known verses that are central to Jewish thought and practice. Return only the JSON, no explanation.`,
      maxTokens: 500,
    })

    const cleanJson = text.replace(/```json|```/g, "").trim()
    return JSON.parse(cleanJson)
  } catch (e) {
    console.error("Torah fetch error:", e)
  }
  return null
}

async function fetchTehillimVerse(): Promise<{ reference: string; text: string; version: string; source: string } | null> {
  try {
    const openrouter = createOpenRouter({
      apiKey: getOpenRouterApiKey(),
    })

    const { text } = await generateText({
      model: openrouter(getOpenRouterModelId()),
      prompt: `Select a meaningful verse from Tehillim (Psalms) that would be uplifting and spiritually meaningful.
      
      Return ONLY a JSON object with this structure:
      {
        "reference": "Tehillim Chapter:Verse (e.g., 'Tehillim 23:1', 'Tehillim 27:4', 'Tehillim 121:1-2')",
        "version": "Hebrew Bible",
        "text": "The verse text in English translation",
        "source": "Tehillim (Psalms)"
      }
      
      Choose verses that are commonly recited in Jewish prayer or provide comfort and inspiration. Return only the JSON, no explanation.`,
      maxTokens: 500,
    })

    const cleanJson = text.replace(/```json|```/g, "").trim()
    return JSON.parse(cleanJson)
  } catch (e) {
    console.error("Tehillim fetch error:", e)
  }
  return null
}

async function fetchProphetsVerse(): Promise<{ reference: string; text: string; version: string; source: string } | null> {
  try {
    const openrouter = createOpenRouter({
      apiKey: getOpenRouterApiKey(),
    })

    const { text } = await generateText({
      model: openrouter(getOpenRouterModelId()),
      prompt: `Select a meaningful verse from Nevi'im (Prophets) - either the Former Prophets (Joshua, Judges, Samuel, Kings) or Latter Prophets (Isaiah, Jeremiah, Ezekiel, Twelve Minor Prophets).
      
      Return ONLY a JSON object with this structure:
      {
        "reference": "Book Chapter:Verse (e.g., 'Yeshayahu 40:31', 'Yirmiyahu 29:11', 'Michah 6:8')",
        "version": "Hebrew Bible",
        "text": "The verse text in English translation",
        "source": "Nevi'im (Prophets)"
      }
      
      Choose verses that are well-known or particularly meaningful in Jewish tradition. Return only the JSON, no explanation.`,
      maxTokens: 500,
    })

    const cleanJson = text.replace(/```json|```/g, "").trim()
    return JSON.parse(cleanJson)
  } catch (e) {
    console.error("Prophets fetch error:", e)
  }
  return null
}

async function fetchTalmudVerse(): Promise<{ reference: string; text: string; version: string; source: string } | null> {
  try {
    const openrouter = createOpenRouter({
      apiKey: getOpenRouterApiKey(),
    })

    const { text } = await generateText({
      model: openrouter(getOpenRouterModelId()),
      prompt: `Select a meaningful teaching from the Talmud (Babylonian Talmud preferred) that would be meaningful for daily reflection.
      
      Return ONLY a JSON object with this structure:
      {
        "reference": "Masechet Daf (e.g., 'Berakhot 17a', 'Shabbat 31a', 'Pirkei Avot 1:14')",
        "version": "Talmud Bavli",
        "text": "The teaching in English translation",
        "source": "Talmud"
      }
      
      Choose well-known teachings, ethical maxims, or profound insights from the sages. Return only the JSON, no explanation.`,
      maxTokens: 500,
    })

    const cleanJson = text.replace(/```json|```/g, "").trim()
    return JSON.parse(cleanJson)
  } catch (e) {
    console.error("Talmud fetch error:", e)
  }
  return null
}

async function fetchWritingsVerse(): Promise<{ reference: string; text: string; version: string; source: string } | null> {
  try {
    const openrouter = createOpenRouter({
      apiKey: getOpenRouterApiKey(),
    })

    const { text } = await generateText({
      model: openrouter(getOpenRouterModelId()),
      prompt: `Select a meaningful verse from Ketuvim (Writings) - excluding Psalms. Choose from Proverbs (Mishlei), Job (Iyov), Song of Songs (Shir HaShirim), Ruth, Lamentations (Eicha), Ecclesiastes (Kohelet), Esther, Daniel, Ezra, Nehemiah, or Chronicles.
      
      Return ONLY a JSON object with this structure:
      {
        "reference": "Book Chapter:Verse (e.g., 'Mishlei 3:5-6', 'Kohelet 3:1', 'Ruth 1:16')",
        "version": "Hebrew Bible",
        "text": "The verse text in English translation",
        "source": "Ketuvim (Writings)"
      }
      
      Choose well-known wisdom verses or meaningful passages. Return only the JSON, no explanation.`,
      maxTokens: 500,
    })

    const cleanJson = text.replace(/```json|```/g, "").trim()
    return JSON.parse(cleanJson)
  } catch (e) {
    console.error("Writings fetch error:", e)
  }
  return null
}

export async function POST(request: Request) {
  try {
    const { source, verseQuery } = await request.json()

    // Handle specific verse queries (user searching for a specific verse)
    if (verseQuery) {
      console.log("[v0] generate-verse API - verseQuery requested:", verseQuery)
      const openrouter = createOpenRouter({
        apiKey: getOpenRouterApiKey(),
      })

      const { text } = await generateText({
        model: openrouter(getOpenRouterModelId()),
        prompt: `Return ONLY a JSON object for the Jewish scripture or text: ${verseQuery}
        
        This could be from Torah, Nevi'im, Ketuvim, Talmud, or other Jewish texts.
        
        Return ONLY this JSON structure, no markdown, no explanation:
        {
          "reference": "The reference in proper Jewish format",
          "version": "Hebrew Bible" or "Talmud Bavli" or appropriate source",
          "text": "The text in English translation",
          "source": "Torah" or "Nevi'im (Prophets)" or "Ketuvim (Writings)" or "Tehillim (Psalms)" or "Talmud"
        }`,
        maxTokens: 500,
      })

      const cleanJson = text.replace(/```json|```/g, "").trim()
      const data = JSON.parse(cleanJson)
      console.log("[v0] generate-verse API - LLM returned:", data.reference)
      return Response.json(data)
    }

    let verse = null

    // Handle scripture source selection
    if (source === "Parshah" || source === "WeeklyPortion") {
      verse = await fetchParshahVerse()
    } else if (source === "Torah") {
      verse = await fetchTorahVerse()
    } else if (source === "Tehillim" || source === "Psalms") {
      verse = await fetchTehillimVerse()
    } else if (source === "Prophets" || source === "Neviim") {
      verse = await fetchProphetsVerse()
    } else if (source === "Talmud") {
      verse = await fetchTalmudVerse()
    } else if (source === "Writings" || source === "Ketuvim") {
      verse = await fetchWritingsVerse()
    }

    // Fallback: try Parshah (weekly portion) if nothing else works
    if (!verse) {
      console.log("[v0] generate-verse API - Primary source failed, trying Parshah...")
      verse = await fetchParshahVerse()
    }

    if (!verse) {
      console.log("[v0] generate-verse API - No verse found, returning error")
      return Response.json({ error: "Unable to fetch verse of the day" }, { status: 500 })
    }

    console.log("[v0] generate-verse API - Returning verse:", verse.reference, "from", verse.source)
    return Response.json(verse)
  } catch (error) {
    console.error("Verse generation error:", error)
    return Response.json({ error: "Failed to generate verse" }, { status: 500 })
  }
}
