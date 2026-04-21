import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'HomeHelp — Find Local Home Services',
  description: 'Search for trusted local plumbers, electricians, HVAC, and more in your area.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="bg-gray-50 min-h-full flex flex-col">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-8 w-full flex-1">{children}</main>
      </body>
    </html>
  )
}
