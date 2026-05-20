import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ToastProvider } from './contexts/ToastContext'
import LibraryPage from './pages/LibraryPage'

const ReaderPage = lazy(() => import('./pages/ReaderPage'))

export default function App() {
  return (
    <ThemeProvider>
    <ToastProvider>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LibraryPage />} />
          <Route
            path="/reader/:novelId"
            element={
              <Suspense fallback={null}>
                <ReaderPage />
              </Suspense>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ToastProvider>
    </ThemeProvider>
  )
}
