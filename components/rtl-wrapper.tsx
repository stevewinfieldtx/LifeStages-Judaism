"use client"

import { useLanguage } from "@/context/language-context"
import { useEffect } from "react"

export function RTLWrapper({ children }: { children: React.ReactNode }) {
  const { isRTL } = useLanguage()

  useEffect(() => {
    // Update the document direction when language changes
    document.documentElement.dir = isRTL ? "rtl" : "ltr"
    document.documentElement.lang = isRTL ? "he" : "en"
  }, [isRTL])

  return <>{children}</>
}
