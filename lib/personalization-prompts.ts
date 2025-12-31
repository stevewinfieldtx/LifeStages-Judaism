export type ContentMode = "casual" | "academic"

export function getAgePrompt(ageRange: string, contentMode: ContentMode = "casual"): string {
  if (contentMode === "academic") {
    return getAcademicAgePrompt(ageRange)
  }

  switch (ageRange) {
    case "child":
      return "Write for a Jewish child (ages 6-12). Use simple Hebrew terms with explanations. Reference stories they'd know from Hebrew school - Abraham, Moses, David. Make Torah come alive with wonder and excitement. Connect to their world - family, school, friends, holidays."

    case "teen":
      return "Write for a Jewish teenager preparing for or past Bar/Bat Mitzvah. They're developing their own relationship with Judaism. Address real questions about faith, identity, fitting in while being Jewish. Reference relatable challenges. Be authentic, not preachy. They can handle complexity."

    case "youth":
      return "Write for a young Jewish adult (18-30). They may be in college, starting careers, navigating dating and identity. Some are deeply observant, others exploring. Address real-world application of Jewish wisdom. Be intellectually engaging. They appreciate depth and authenticity."

    case "adult":
      return "Write for Jewish adults navigating career, family, and community. They juggle obligations - work, children, aging parents, community involvement. Address practical wisdom for daily life. They want substance that respects their intelligence and time."

    case "senior":
      return "Write for senior Jews with a lifetime of experience. They've seen much, lost loved ones, celebrated simchas. Honor their wisdom while offering fresh perspectives. Address legacy, meaning, and the gift of perspective. They appreciate depth and don't need things oversimplified."

    default:
      return "Write for a general Jewish audience seeking meaningful connection with Torah and tradition."
  }
}

function getAcademicAgePrompt(ageRange: string): string {
  switch (ageRange) {
    case "child":
      return "Write for a Jewish child with age-appropriate scholarly context. Introduce Hebrew terms properly. Explain historical background simply but accurately."

    case "teen":
      return "Write for a Jewish teenager with emerging intellectual curiosity. Include rabbinic commentary basics, introduce different Jewish movements' perspectives, explain Hebrew/Aramaic terms. Institute or day school level."

    case "youth":
      return "Write for educated young Jewish adults. Include detailed textual analysis, multiple commentators (Rashi, Rambam, modern scholars), historical-critical context, denominational perspectives. University Jewish studies level."

    case "adult":
      return "Write for intellectually engaged Jewish adults. Provide comprehensive scholarly analysis - classical and modern commentators, academic biblical scholarship, comparative ancient Near Eastern studies, linguistic analysis, responsa literature."

    case "senior":
      return "Write for scholarly senior Jews. Full academic depth - Hebrew/Aramaic textual analysis, comprehensive rabbinic literature, Kabbalistic interpretations where relevant, modern academic scholarship, historical development of interpretation."

    default:
      return "Write with full scholarly apparatus - rabbinic sources, academic scholarship, linguistic analysis, historical context."
  }
}

export function getGenderPrompt(gender: string): string {
  switch (gender) {
    case "male":
      return "The reader is a Jewish man."
    case "female":
      return "The reader is a Jewish woman."
    default:
      return ""
  }
}

export function getStageSituationPrompt(stageSituation: string): string {
  const situations: Record<string, string> = {
    "Bar/Bat Mitzvah preparation": "The reader is preparing for Bar/Bat Mitzvah - a major milestone of taking on the responsibilities of Jewish adulthood. Connect to themes of maturity, responsibility, and covenant.",
    "Wedding preparation": "The reader is preparing for a Jewish wedding. Connect to themes of partnership, building a Jewish home, and the sanctity of marriage under the chuppah.",
    "New parent": "The reader is a new Jewish parent, navigating the sacred responsibility of raising Jewish children. Connect to themes of legacy, education, and blessing.",
    "Mourning/Shiva": "The reader is in mourning or observing shiva. Approach with deep compassion. Connect to themes of memory, comfort, and the Jewish approach to grief and healing.",
    "Conversion journey": "The reader is converting to Judaism or considering conversion. Welcome them warmly. Explain traditions thoughtfully. Honor their choice to join the Jewish people.",
    "High Holiday reflection": "The reader is in the High Holiday season of teshuvah (repentance). Connect to themes of introspection, return, forgiveness, and renewal.",
    "Empty nester": "The reader's children have grown and left home. Connect to themes of new purpose, continued growth, and the ongoing gift of Jewish wisdom.",
    "Retirement": "The reader is entering retirement. Connect to themes of legacy, wisdom-sharing, continued learning, and meaningful contribution to community.",
    "Health challenges": "The reader faces health challenges. Connect to themes of healing (refuah), faith through difficulty, and the Jewish approach to suffering and hope.",
    "Career transition": "The reader is navigating career change. Connect to themes of purpose, parnassah (livelihood), and finding meaning in work.",
    "Interfaith family": "The reader is part of an interfaith family. Be welcoming and inclusive while authentically presenting Jewish wisdom.",
    "Reconnecting with Judaism": "The reader is reconnecting with Judaism after time away. Welcome them back warmly. Don't assume prior knowledge but don't condescend.",
    "Nothing special": ""
  }
  return situations[stageSituation] || ""
}

export function getAcademicModeInstructions(): string {
  return `ACADEMIC MODE - Provide scholarly depth:

LINGUISTIC ANALYSIS:
- Hebrew word studies with roots and cognates
- Aramaic terms from Talmud when relevant
- Explain grammatical nuances that affect meaning

RABBINIC COMMENTARY:
- Cite classical commentators: Rashi, Ramban, Ibn Ezra, Sforno, Rambam
- Include Talmudic discussions (Bavli and Yerushalmi)
- Reference Midrash (Midrash Rabbah, Tanchuma, etc.)
- Modern commentators: Nechama Leibowitz, Rabbi Sacks, Soloveitchik

HISTORICAL-CRITICAL CONTEXT:
- Ancient Near Eastern parallels
- Archaeological evidence
- Documentary hypothesis awareness (for academic readers)
- Historical setting and composition

DENOMINATIONAL PERSPECTIVES:
- Note where Orthodox, Conservative, Reform, and Reconstructionist views differ
- Hasidic interpretations where relevant (Baal Shem Tov, Rebbe Nachman, Lubavitcher Rebbe)

MYSTICAL DIMENSION:
- Kabbalistic interpretations (Zohar, Tanya) where appropriate
- Gematria if genuinely insightful

TONE: Scholarly but accessible. Faith-rooted with academic rigor. Cite sources naturally within text.`
}

export function buildPersonalizationContext(
  ageRange: string,
  gender: string,
  stageSituation: string,
  contentMode: ContentMode = "casual"
): string {
  const parts: string[] = []

  const agePrompt = getAgePrompt(ageRange, contentMode)
  if (agePrompt) parts.push(agePrompt)

  const genderPrompt = getGenderPrompt(gender)
  if (genderPrompt) parts.push(genderPrompt)

  const stagePrompt = getStageSituationPrompt(stageSituation)
  if (stagePrompt) parts.push(stagePrompt)

  if (contentMode === "academic") {
    parts.push(getAcademicModeInstructions())
  }

  return parts.join("\n\n")
}
