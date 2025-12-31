"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useDevotional } from "@/context/devotional-context"
import { useSubscription } from "@/context/subscription-context"
import { useLanguage } from "@/context/language-context"
import { LanguageSelector } from "@/components/language-selector"
import { BottomNav } from "@/components/bottom-nav"

export default function LandingPage() {
  const router = useRouter()
  const { userName, isLoading, loadingStep, generateDevotional } = useDevotional()
  const { canSearchCustomVerse, isTrialActive, daysLeftInTrial } = useSubscription()
  const { t } = useLanguage()
  const [currentProfile, setCurrentProfile] = useState({ ageRange: "", gender: "", stageSituation: "" })

  useEffect(() => {
    const loadProfile = () => {
      const savedProfile = localStorage.getItem("userProfile")
      if (savedProfile) {
        try {
          const parsed = JSON.parse(savedProfile)
          setCurrentProfile({
            ageRange: parsed.ageRange || "",
            gender: parsed.gender || "",
            stageSituation: parsed.stageSituation || "Nothing special",
          })
        } catch (e) {
          console.error("Error parsing user profile:", e)
        }
      }
    }

    loadProfile()
    window.addEventListener("focus", loadProfile)
    return () => window.removeEventListener("focus", loadProfile)
  }, [])

  const handleGenerateDevotional = async (source: string) => {
    const ready = await generateDevotional(source)
    if (ready) {
      router.push("/verse")
    }
  }

  const getProfileLabel = () => {
    if (!currentProfile.ageRange && !currentProfile.gender) return "Set up your profile"
    const parts = []
    if (currentProfile.ageRange) parts.push(currentProfile.ageRange)
    if (currentProfile.gender) parts.push(currentProfile.gender)
    if (currentProfile.stageSituation && currentProfile.stageSituation !== "Nothing special") {
      parts.push(currentProfile.stageSituation)
    }
    return parts.filter(Boolean).join(" · ")
  }

  return (
    <div className="relative flex h-full w-full flex-col overflow-x-hidden max-w-md mx-auto shadow-2xl bg-[#1a237e]">
      <div className="absolute inset-0 h-full w-full overflow-hidden">
        <Image
          src="/peaceful-mountain-sunrise-spiritual.jpg"
          alt="Background"
          fill
          className="object-cover opacity-25"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a237e] via-[#1a237e]/85 to-[#1a237e]/70"></div>
      </div>

      <div className="absolute top-4 right-4 z-20">
        <LanguageSelector variant="compact" />
      </div>

      {isLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#1a237e]/95 backdrop-blur-sm text-white p-6 text-center">
          <div className="size-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-4"></div>
          <h2 className="text-xl font-bold mb-2 text-amber-100">{t("generating")}</h2>
          <p className="text-sm text-blue-200 animate-pulse">{loadingStep || "Preparing your study..."}</p>
        </div>
      )}

      <div className="relative z-10 flex flex-1 flex-col px-6 pt-8 pb-24 gap-6">
        {/* Header with Star of David / Menorah */}
        <div className="flex flex-col items-center">
          <div className="relative w-36 h-36 rounded-full overflow-hidden shadow-2xl shadow-blue-900/50 border-2 border-amber-400/50 bg-gradient-to-br from-blue-100 to-blue-300 flex items-center justify-center">
            <div className="text-6xl">✡️</div>
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-white text-center">Torah for Life Stages</h1>
          <p className="mt-1 text-sm text-blue-200/80">Jewish wisdom that speaks to where you are</p>
          {isTrialActive && (
            <div className="mt-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30">
              <p className="text-xs text-amber-100">
                {t("trial")}: {daysLeftInTrial} {daysLeftInTrial === 1 ? t("dayLeft") : t("daysLeft")}
              </p>
            </div>
          )}
        </div>

        {/* Welcome Section */}
        <div className="flex flex-col">
          <div className="flex flex-col items-center text-center text-white mb-6">
            <h2 className="text-xl font-semibold text-amber-100">
              Shalom, {userName}
            </h2>
            <p className="mt-1 max-w-xs text-sm text-blue-100/70">Discover Torah wisdom personalized for your journey</p>
            <button
              onClick={() => router.push("/profile")}
              className="mt-3 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-xs text-amber-100 hover:bg-white/20 transition-colors flex items-center gap-1.5 border border-amber-400/30"
            >
              <span className="material-symbols-outlined text-sm">person</span>
              {getProfileLabel()}
            </button>
          </div>

          {/* Scripture Selection */}
          <div className="flex flex-col gap-4">
            <button
              onClick={() => (canSearchCustomVerse ? router.push("/selection") : null)}
              disabled={!canSearchCustomVerse}
              className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 text-base font-bold text-white shadow-lg transition active:scale-[0.98] ${
                canSearchCustomVerse
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-amber-900/30"
                  : "bg-gray-400 cursor-not-allowed opacity-60"
              }`}
            >
              <span className="material-symbols-outlined">menu_book</span>
              Search Texts
              {!canSearchCustomVerse && <span className="material-symbols-outlined text-sm">lock</span>}
            </button>

            {/* Scripture Sources */}
            <div className="flex flex-col gap-3 pt-2">
              <p className="text-sm font-semibold text-amber-200 text-center mb-1">Daily Study</p>
              
              {/* Parashat HaShavua - Featured */}
              <button
                onClick={() => handleGenerateDevotional("Parshah")}
                disabled={isLoading}
                className="flex w-full items-center gap-3 rounded-xl bg-white/15 backdrop-blur-sm p-4 text-white transition hover:bg-white/25 active:scale-[0.98] cursor-pointer disabled:opacity-50 border border-white/20"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <span className="text-2xl">📜</span>
                </div>
                <div className="flex-1 text-left">
                  <span className="text-sm font-bold text-white">Parashat HaShavua</span>
                  <p className="text-xs text-blue-200/70">Weekly Torah Portion</p>
                </div>
                <span className="material-symbols-outlined text-amber-300">arrow_forward</span>
              </button>

              {/* Jewish Texts Grid */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleGenerateDevotional("Torah")}
                  disabled={isLoading}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white/10 backdrop-blur-sm p-3 text-white transition hover:bg-white/20 active:scale-95 cursor-pointer disabled:opacity-50 border border-white/10"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center shadow-lg">
                    <span className="text-lg">📖</span>
                  </div>
                  <span className="text-[10px] font-medium text-blue-100 text-center leading-tight">Torah</span>
                </button>
                
                <button
                  onClick={() => handleGenerateDevotional("Tehillim")}
                  disabled={isLoading}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white/10 backdrop-blur-sm p-3 text-white transition hover:bg-white/20 active:scale-95 cursor-pointer disabled:opacity-50 border border-white/10"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg">
                    <span className="text-lg">🎵</span>
                  </div>
                  <span className="text-[10px] font-medium text-blue-100 text-center leading-tight">Tehillim</span>
                </button>
                
                <button
                  onClick={() => handleGenerateDevotional("Talmud")}
                  disabled={isLoading}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white/10 backdrop-blur-sm p-3 text-white transition hover:bg-white/20 active:scale-95 cursor-pointer disabled:opacity-50 border border-white/10"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-700 to-red-900 flex items-center justify-center shadow-lg">
                    <span className="text-lg">📚</span>
                  </div>
                  <span className="text-[10px] font-medium text-blue-100 text-center leading-tight">Talmud</span>
                </button>
              </div>

              {/* Second Row */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleGenerateDevotional("Prophets")}
                  disabled={isLoading}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white/10 backdrop-blur-sm p-3 text-white transition hover:bg-white/20 active:scale-95 cursor-pointer disabled:opacity-50 border border-white/10"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center shadow-lg">
                    <span className="text-lg">🔥</span>
                  </div>
                  <span className="text-[10px] font-medium text-blue-100 text-center leading-tight">Nevi'im (Prophets)</span>
                </button>
                
                <button
                  onClick={() => handleGenerateDevotional("Writings")}
                  disabled={isLoading}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white/10 backdrop-blur-sm p-3 text-white transition hover:bg-white/20 active:scale-95 cursor-pointer disabled:opacity-50 border border-white/10"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center shadow-lg">
                    <span className="text-lg">✨</span>
                  </div>
                  <span className="text-[10px] font-medium text-blue-100 text-center leading-tight">Ketuvim (Writings)</span>
                </button>
              </div>
              
              <p className="mt-2 text-center text-[11px] text-blue-200/50">Personalized Torah wisdom for your life stage</p>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
