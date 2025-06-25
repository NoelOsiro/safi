import type React from "react"
import type { Metadata } from "next"
import SiteHeader from "@/components/site-header"
import "./globals.css"

export const metadata: Metadata = {
  title: "WinjoPro",
  description: "Empowering communities through food safety and hygiene training.",
  generator: "WinjoPro",
  metadataBase: new URL("https://safi-iota.vercel.app"), // 🔁 Update to your actual deployed domain
  openGraph: {
    title: "WinjoPro",
    description: "Empowering communities through food safety and hygiene training.",
    url: "https://safi-iota.vercel.app", // 🔁 Update
    siteName: "WinjoPro",
    images: [
      {
        url: "https://safi-iota.vercel.app/images/og-image.png", // 🔁 Replace with a real image
        width: 1200,
        height: 630,
        alt: "WinjoPro Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WinjoPro",
    description: "Empowering communities through food safety and hygiene training.",
    images: ["https://safi-iota.vercel.app/images/og-image.png"], // 🔁 Replace with your image
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen flex flex-col bg-gray-50">
        <SiteHeader />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  )
}
