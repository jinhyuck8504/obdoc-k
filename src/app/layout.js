import { Inter } from 'next/font/google'
import { AuthProvider } from '@/contexts/AuthContext'
import { ToastProvider } from '@/contexts/ToastContext'
import { LoadingProvider } from '@/contexts/LoadingContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'OBDOC MVP',
  description: '비만 관리 플랫폼',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <style dangerouslySetInnerHTML={{
          __html: `
            * {
              box-sizing: border-box;
              padding: 0;
              margin: 0;
            }
            html, body {
              max-width: 100vw;
              overflow-x: hidden;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
              line-height: 1.6;
              color: #333;
              background: #fff;
            }
            a {
              color: inherit;
              text-decoration: none;
            }
            button {
              cursor: pointer;
              border: none;
              background: none;
              font-family: inherit;
            }
            input, textarea, select {
              font-family: inherit;
              border: 1px solid #ddd;
              padding: 8px 12px;
              border-radius: 4px;
            }
            .container {
              max-width: 1200px;
              margin: 0 auto;
              padding: 0 16px;
            }
            .flex { display: flex; }
            .flex-col { flex-direction: column; }
            .items-center { align-items: center; }
            .justify-center { justify-content: center; }
            .justify-between { justify-content: space-between; }
            .gap-4 { gap: 16px; }
            .p-4 { padding: 16px; }
            .p-6 { padding: 24px; }
            .mb-4 { margin-bottom: 16px; }
            .mt-4 { margin-top: 16px; }
            .text-center { text-align: center; }
            .text-lg { font-size: 1.125rem; }
            .text-xl { font-size: 1.25rem; }
            .text-2xl { font-size: 1.5rem; }
            .font-bold { font-weight: bold; }
            .bg-blue-500 { background-color: #3b82f6; }
            .bg-gray-100 { background-color: #f3f4f6; }
            .text-white { color: white; }
            .text-gray-600 { color: #6b7280; }
            .rounded { border-radius: 4px; }
            .rounded-lg { border-radius: 8px; }
            .shadow { box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1); }
            .border { border: 1px solid #e5e7eb; }
            .w-full { width: 100%; }
            .h-full { height: 100%; }
            .min-h-screen { min-height: 100vh; }
          `
        }} />
      </head>
      <body className={inter.className}>
        <LoadingProvider>
          <ToastProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </ToastProvider>
        </LoadingProvider>
      </body>
    </html>
  )
}
