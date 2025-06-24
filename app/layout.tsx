import type React from "react"
import type { Metadata } from "next"
import SiteHeader from "@/components/site-header"
import "./globals.css"

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.dev",
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
