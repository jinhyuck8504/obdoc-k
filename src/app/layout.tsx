import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ObDoc MVP',
  description: 'Obesity Doctor Management System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  )
}
