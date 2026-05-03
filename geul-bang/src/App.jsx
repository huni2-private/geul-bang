import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import LibraryPage from './pages/LibraryPage'
import ReaderPage from './pages/ReaderPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LibraryPage />} />
          <Route path="/reader/:novelId" element={<ReaderPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
