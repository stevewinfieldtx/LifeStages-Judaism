"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useDevotional } from "@/context/devotional-context"
import { useLanguage } from "@/context/language-context"
import { BottomNav } from "@/components/bottom-nav"

type TabType = "all" | "torah" | "tehillim" | "prophets" | "writings" | "talmud"

export default function SelectionPage() {
  const router = useRouter()
  const { generateForVerse, isLoading } = useDevotional()
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<TabType>("all")

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      await generateForVerse(searchQuery.trim())
      router.push("/verse")
    }
  }

  const handlePopularVerse = async (verse: string) => {
    await generateForVerse(verse)
    router.push("/verse")
  }

  const torahVerses = [
    "Bereshit 1:1",
    "Bereshit 1:27",
    "Shemot 3:14",
    "Shemot 20:2-3",
    "Vayikra 19:18",
    "Devarim 6:4-5",
    "Devarim 6:6-7",
    "Devarim 30:19",
    "Bereshit 12:1-2",
    "Shemot 19:5-6",
  ]

  const tehillimVerses = [
    "Tehillim 23:1-4",
    "Tehillim 27:1",
    "Tehillim 27:4",
    "Tehillim 121:1-2",
    "Tehillim 119:105",
    "Tehillim 139:14",
    "Tehillim 34:15",
    "Tehillim 46:2",
    "Tehillim 90:12",
    "Tehillim 100:1-2",
  ]

  const prophetsVerses = [
    "Yeshayahu 40:31",
    "Yeshayahu 41:10",
    "Yeshayahu 58:6-7",
    "Yirmiyahu 29:11",
    "Michah 6:8",
    "Zechariah 4:6",
    "Yeshayahu 2:4",
    "Hoshea 6:6",
    "Amos 5:24",
  ]

  const writingsVerses = [
    "Mishlei 3:5-6",
    "Mishlei 22:6",
    "Kohelet 3:1",
    "Kohelet 12:13",
    "Ruth 1:16",
    "Shir HaShirim 8:6",
    "Eicha 3:22-23",
  ]

  const talmudVerses = [
    "Pirkei Avot 1:14",
    "Pirkei Avot 2:4",
    "Shabbat 31a",
    "Berakhot 17a",
    "Sanhedrin 37a",
    "Taanit 7a",
    "Pirkei Avot 1:2",
    "Pirkei Avot 4:1",
  ]

  const getDisplayVerses = () => {
    switch (activeTab) {
      case "torah":
        return torahVerses
      case "tehillim":
        return tehillimVerses
      case "prophets":
        return prophetsVerses
      case "writings":
        return writingsVerses
      case "talmud":
        return talmudVerses
      case "all":
      default:
        return [...torahVerses.slice(0, 3), ...tehillimVerses.slice(0, 3), ...prophetsVerses.slice(0, 2), ...talmudVerses.slice(0, 2)]
    }
  }

  const tabs: { id: TabType; label: string }[] = [
    { id: "all", label: "All" },
    { id: "torah", label: "Torah" },
    { id: "tehillim", label: "Tehillim" },
    { id: "prophets", label: "Nevi'im" },
    { id: "writings", label: "Ketuvim" },
    { id: "talmud", label: "Talmud" },
  ]

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden pb-24 mx-auto max-w-md shadow-2xl bg-background">
      <div className="flex items-center px-4 py-4 justify-between sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <button
          onClick={() => router.push("/")}
          className="flex size-10 items-center justify-center rounded-full hover:bg-muted transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>
            arrow_back_ios_new
          </span>
        </button>
        <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">Search Texts</h2>
        <div className="w-10"></div>
      </div>

      {isLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm">
          <div className="size-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-sm text-muted-foreground animate-pulse">Finding your text...</p>
        </div>
      )}

      <div className="flex flex-col gap-6 px-6 py-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Find a Text</h1>
          <p className="text-sm text-muted-foreground">
            Search Torah, Tehillim, Prophets, Writings, or Talmud
          </p>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="e.g., Devarim 6:4 or Tehillim 23"
              className="w-full h-12 pl-10 pr-4 rounded-xl border border-border bg-card text-base focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={!searchQuery.trim() || isLoading}
            className="h-12 px-4 rounded-xl bg-primary text-primary-foreground font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
          >
            Go
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold">Popular Texts</h3>
          
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {getDisplayVerses().map((verse, idx) => (
              <button
                key={idx}
                onClick={() => handlePopularVerse(verse)}
                disabled={isLoading}
                className="px-3 py-2 rounded-lg border border-border bg-card text-sm font-medium hover:border-primary hover:bg-primary/5 transition-colors disabled:opacity-50"
              >
                {verse}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 p-4 rounded-xl bg-muted/50 border border-border">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-primary">tips_and_updates</span>
            <div>
              <h4 className="font-semibold text-sm mb-1">Search Tips</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Use Hebrew names: &quot;Bereshit&quot; not &quot;Genesis&quot;</li>
                <li>• For Talmud: &quot;Berakhot 17a&quot; or &quot;Pirkei Avot 1:14&quot;</li>
                <li>• For Tehillim: &quot;Tehillim 23&quot; or &quot;Psalm 23&quot;</li>
                <li>• Topics work too: &quot;Shema&quot; or &quot;love your neighbor&quot;</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
