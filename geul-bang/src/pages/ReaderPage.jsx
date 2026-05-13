import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../contexts/AuthContext'
import { useReader } from '../hooks/useReader'
import { usePageMode } from '../hooks/usePageMode'
import Header from '../components/layout/Header'
import ReaderSettings from '../components/reader/ReaderSettings'
import PageControls from '../components/reader/PageControls'
import { updateProgress } from '../services/novel.service'
import { css } from 'styled-system/css'
import { ArrowLeft } from 'lucide-react'

const SETTINGS_KEY = 'geulbang_settings'
const DEFAULT_SETTINGS = { fontSize: 18, theme: 'light', mode: 'scroll' }

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
  flexShrink: 0,
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

const scrollContent = css({
  maxWidth: '680px',
  margin: '0 auto',
  padding: { base: '76px 16px 60px', sm: '88px 24px 80px' },
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

  const isPageMode = settings.mode === 'page'

  useReader(novelId, novel?.scrollPosition ?? 0, isPageMode)

  const { currentPage, totalPages, colWidth, goNext, goPrev, progressRatio, wrapperRef, columnRef } =
    usePageMode({
      enabled: isPageMode && !loading && !!text,
      text,
      fontSize: settings.fontSize,
      initialProgress: novel?.progressRatio ?? 0,
    })

  // Save progress on page turn
  useEffect(() => {
    if (!isPageMode || !user || !novelId || loading) return
    updateProgress(user.uid, novelId, { scrollPosition: 0, progressRatio })
  }, [isPageMode, user, novelId, loading, progressRatio])

  // Keyboard navigation in page mode
  useEffect(() => {
    if (!isPageMode) return
    function onKey(e) {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goPrev()
      else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isPageMode, goPrev, goNext])

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

      {isPageMode ? (
        <div
          ref={wrapperRef}
          style={{
            position: 'relative',
            overflow: 'hidden',
            height: 'calc(100svh - 56px)',
            marginTop: '56px',
          }}
        >
          <div
            ref={columnRef}
            style={{
              height: '100%',
              padding: '0 24px',
              columnFill: 'auto',
              columnGap: 0,
              columnWidth: colWidth,
              fontSize: `${settings.fontSize}px`,
              color: themeStyle.color,
              lineHeight: '1.9',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              fontFamily: 'var(--fonts-reader)',
              willChange: 'transform',
              transform: `translateX(${-currentPage * colWidth}px)`,
              transition: 'transform 0.3s ease',
            }}
          >
            {text}
          </div>
          <PageControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPrev={goPrev}
            onNext={goNext}
          />
        </div>
      ) : (
        <div
          className={scrollContent}
          style={{ fontSize: `${settings.fontSize}px`, color: themeStyle.color }}
        >
          {text}
        </div>
      )}
    </div>
  )
}
