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
import ChapterDrawer from '../components/reader/ChapterDrawer'
import { updateProgress, getChunks } from '../services/novel.service'
import { detectChapters } from '../utils/chapter'
import { css } from 'styled-system/css'
import { ArrowLeft } from 'lucide-react'

const SETTINGS_KEY = 'geulbang_settings'
const DEFAULT_SETTINGS = { fontSize: 18, theme: 'light', mode: 'scroll', font: 'serif', lineHeight: 1.9, padding: 'normal' }

const PADDING_MAP = { narrow: 16, normal: 24, wide: 40 }

const FONT_FAMILIES = {
  serif: 'var(--fonts-reader)',
  sans: 'var(--fonts-ui)',
}

function loadSettings() {
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') }
  } catch {
    return DEFAULT_SETTINGS
  }
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

const progressBar = css({
  position: 'fixed',
  top: '56px',
  left: 0,
  height: '3px',
  zIndex: 101,
  transition: 'width 0.1s linear',
  background: 'token(colors.accent)',
  pointerEvents: 'none',
})

const pageWrap = css({
  minHeight: '100svh',
  background: 'token(colors.bg)',
  color: 'token(colors.text)',
})

const scrollContent = css({
  maxWidth: '680px',
  margin: '0 auto',
  paddingTop: { base: '76px', sm: '88px' },
  paddingBottom: { base: '60px', sm: '80px' },
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',
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
      const txt = await getChunks(user.uid, novelId)
      setText(txt)
      setLoading(false)
    }
    load()
  }, [user, novelId, navigate])

  const isPageMode = settings.mode === 'page'
  // 항상 명시적으로 설정 — 전역 html data-theme을 덮어쓰기 위해 light도 포함
  const dataTheme = settings.theme
  const fontFamily = FONT_FAMILIES[settings.font] || FONT_FAMILIES.serif

  const [scrollPct, setScrollPct] = useState(0)
  const [chapters, setChapters] = useState([])

  useEffect(() => {
    if (!text) return
    setChapters(detectChapters(text))
  }, [text])

  // 스크롤 모드 진행 바
  useEffect(() => {
    if (isPageMode) { setScrollPct(0); return }
    function onScroll() {
      const max = document.body.scrollHeight - window.innerHeight
      setScrollPct(max > 0 ? Math.min(window.scrollY / max, 1) : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [isPageMode])

  useReader(novelId, novel?.scrollPosition ?? 0, isPageMode)

  const { currentPage, totalPages, colWidth, goNext, goPrev, goToPage, progressRatio, wrapperRef, columnRef } =
    usePageMode({
      enabled: isPageMode && !loading && !!text,
      text,
      fontSize: settings.fontSize,
      initialProgress: novel?.progressRatio ?? 0,
      hPad: (PADDING_MAP[settings.padding] ?? 24) * 2,
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

  function handleChapterJump(chapter) {
    const ratio = text.length > 0 ? chapter.charOffset / text.length : 0
    if (isPageMode) {
      goToPage(Math.round(ratio * (totalPages - 1)))
    } else {
      const max = document.body.scrollHeight - window.innerHeight
      window.scrollTo({ top: ratio * max, behavior: 'smooth' })
    }
  }

  function handleSettingsChange(patch) {
    setSettings((prev) => {
      const next = { ...prev, ...patch }
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(next))
      return next
    })
  }

  if (!user || loading) {
    return (
      <div
        className={pageWrap}
        data-theme={dataTheme}
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        <span style={{ fontSize: '14px', opacity: 0.5 }}>불러오는 중...</span>
      </div>
    )
  }

  return (
    <div className={pageWrap} data-theme={dataTheme}>
      {!isPageMode && (
        <div className={progressBar} style={{ width: `${scrollPct * 100}%` }} />
      )}
      <Header>
        <button className={backBtn} onClick={() => navigate('/')}>
          <ArrowLeft size={16} /> 서재
        </button>
        <span className={titleText}>{novel?.title}</span>
        <ChapterDrawer
          chapters={chapters}
          currentCharOffset={Math.round((isPageMode ? progressRatio : scrollPct) * (text.length || 0))}
          onJump={handleChapterJump}
        />
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
              padding: `0 ${PADDING_MAP[settings.padding] ?? 24}px`,
              columnFill: 'auto',
              columnGap: 0,
              columnWidth: colWidth,
              fontSize: `${settings.fontSize}px`,
              lineHeight: settings.lineHeight,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              fontFamily,
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
          style={{
            fontSize: `${settings.fontSize}px`,
            fontFamily,
            lineHeight: settings.lineHeight,
            paddingLeft: `${PADDING_MAP[settings.padding] ?? 24}px`,
            paddingRight: `${PADDING_MAP[settings.padding] ?? 24}px`,
          }}
        >
          {text}
        </div>
      )}
    </div>
  )
}
