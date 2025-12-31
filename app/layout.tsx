import type React from "react"
import type { Metadata, Viewport } from "next"
import { Libre_Baskerville, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { DevotionalProvider } from "@/context/devotional-context"
import { SubscriptionProvider } from "@/context/subscription-context"
import { LanguageProvider } from "@/context/language-context"
import "./globals.css"

const _libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
})
const _inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Torah for Life Stages - Jewish Wisdom That Speaks to Where You Are",
  description:
    "AI-powered Torah study personalized to your age, background, and life situation. Discover context, stories, poetry, imagery, and teachings from Torah, Talmud, and Jewish tradition tailored just for you.",
  generator: "v0.app",
}

export const viewport: Viewport = {
  themeColor: "#1a237e",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
        />
      </head>
      <body className="font-sans antialiased">
        <LanguageProvider>
          <SubscriptionProvider>
            <DevotionalProvider>{children}</DevotionalProvider>
          </SubscriptionProvider>
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  )
}
