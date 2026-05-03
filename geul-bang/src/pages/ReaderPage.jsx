import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../contexts/AuthContext'
import { useReader } from '../hooks/useReader'
import Header from '../components/layout/Header'
import ReaderSettings from '../components/reader/ReaderSettings'
import { css } from 'styled-system/css'
import { ArrowLeft } from 'lucide-react'

const SETTINGS_KEY = 'geulbang_settings'
const DEFAULT_SETTINGS = { fontSize: 18, theme: 'light' }

function loadSettings() {
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') }
  } catch {
    return DEFAULT_SETTINGS
  }
}

const THEME_STYLES = {
  light: { background: '#ffffff', color: '#1a1a1a' },
  dark: { background: '#1a1a1a', color: '#e0e0e0' },
  sepia: { background: '#f4ecd8', color: '#3b2f2f' },
}

const backBtn = css({
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  fontSize: '14px',
  color: 'token(colors.text.muted)',
  padding: '4px 8px',
  borderRadius: '6px',
  _hover: { background: 'token(colors.bg.subtle)' },
})

const titleText = css({
  fontSize: '15px',
  fontWeight: '600',
  color: 'token(colors.text)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  flex: 1,
  textAlign: 'center',
})

const content = css({
  maxWidth: '680px',
  margin: '0 auto',
  padding: '88px 24px 80px',
  lineHeight: '1.9',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',
  fontFamily: 'token(fonts.reader)',
})

export default function ReaderPage() {
  const { novelId } = useParams()
  const navigate = useNavigate()
  const user = useAuth()
  const [novel, setNovel] = useState(null)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState(loadSettings)

  useEffect(() => {
    if (!user || !novelId) return
    async function load() {
      const snap = await getDoc(doc(db, 'users', user.uid, 'novels', novelId))
      if (!snap.exists()) { navigate('/'); return }
      const data = { id: snap.id, ...snap.data() }
      setNovel(data)
      const res = await fetch(data.fileUrl)
      const txt = await res.text()
      setText(txt)
      setLoading(false)
    }
    load()
  }, [user, novelId, navigate])

  useReader(novelId, novel?.scrollPosition ?? 0)

  function handleSettingsChange(patch) {
    setSettings((prev) => {
      const next = { ...prev, ...patch }
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(next))
      return next
    })
  }

  const themeStyle = THEME_STYLES[settings.theme] || THEME_STYLES.light

  if (!user || loading) {
    return (
      <div style={{ ...themeStyle, minHeight: '100svh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <span style={{ fontSize: '14px', opacity: 0.5 }}>불러오는 중...</span>
      </div>
    )
  }

  return (
    <div style={{ ...themeStyle, minHeight: '100svh' }}>
      <Header>
        <button className={backBtn} onClick={() => navigate('/')}>
          <ArrowLeft size={16} /> 서재
        </button>
        <span className={titleText}>{novel?.title}</span>
        <ReaderSettings settings={settings} onChange={handleSettingsChange} />
      </Header>
      <div
        className={content}
        style={{ fontSize: `${settings.fontSize}px`, color: themeStyle.color }}
      >
        {text}
      </div>
    </div>
  )
}
