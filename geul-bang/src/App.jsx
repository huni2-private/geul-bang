import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import LibraryPage from './pages/LibraryPage'

const ReaderPage = lazy(() => import('./pages/ReaderPage'))

export default function App() {
  return (
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
  )
}
