// 서재 페이지 — 소설 목록, 검색/정렬, 스켈레톤 로딩
import { useState, useMemo } from 'react'
import { css } from 'styled-system/css'
import { Search } from 'lucide-react'
import Header from '../components/layout/Header'
import AccountBanner from '../components/auth/AccountBanner'
import NovelCard from '../components/library/NovelCard'
import FileUploader from '../components/library/FileUploader'
import LinkAccountModal from '../components/auth/LinkAccountModal'
import { useNovels } from '../hooks/useNovels'
import { useAuth } from '../contexts/AuthContext'
import { usePWAInstall } from '../hooks/usePWAInstall'

const SORT_KEY = 'geulbang_sort'
const SORT_OPTIONS = [
  { value: 'lastRead', label: '최근 읽은 순' },
  { value: 'title', label: '제목 순' },
  { value: 'progress', label: '진행률 순' },
]

// ── 레이아웃 ────────────────────────────────────────────────

const wrap = css({
  paddingTop: '56px',
  height: '100svh',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  background: 'token(colors.bg)',
})

const installBanner = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  padding: '10px 16px',
  background: 'token(colors.bg.subtle)',
  borderBottom: '1px solid token(colors.border)',
  fontSize: '13px',
  color: 'token(colors.text.muted)',
  flexWrap: 'wrap',
  flexShrink: 0,
})

const installBtn = css({
  padding: '5px 14px',
  borderRadius: '6px',
  border: '1px solid token(colors.accent)',
  background: 'transparent',
  color: 'token(colors.accent)',
  fontSize: '13px',
  fontWeight: '600',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  _hover: { background: 'token(colors.bg.card)' },
})

const inner = css({
  flex: 1,
  overflowY: 'auto',
  maxWidth: '680px',
  margin: '0 auto',
  width: '100%',
  padding: { base: '24px 16px', sm: '32px 20px' },
})

// ── 스켈레톤 ─────────────────────────────────────────────────

const skeletonCard = css({
  background: 'token(colors.bg.card)',
  border: '1px solid token(colors.border)',
  borderRadius: '10px',
  padding: '12px 16px 12px 12px',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  opacity: 0.5,
})

const grid = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
})

// ── 빈 서재 ─────────────────────────────────────────────────

const emptyWrap = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '80px 0 60px',
  gap: '12px',
  textAlign: 'center',
})

const emptyIcon = css({
  fontSize: '48px',
  lineHeight: 1,
  marginBottom: '4px',
})

const emptyTitle = css({
  fontSize: { base: '18px', sm: '20px' },
  fontWeight: '700',
  color: 'token(colors.text)',
  letterSpacing: '-0.3px',
})

const emptyDesc = css({
  fontSize: '13px',
  color: 'token(colors.text.muted)',
  marginBottom: '8px',
})

// ── 소설 목록 툴바 ───────────────────────────────────────────

const toolbar = css({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '16px',
})

const searchWrap = css({
  position: 'relative',
  flex: 1,
})

const searchIcon = css({
  position: 'absolute',
  left: '10px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: 'token(colors.text.muted)',
  pointerEvents: 'none',
})

const searchInput = css({
  width: '100%',
  padding: '8px 12px 8px 32px',
  borderRadius: '8px',
  border: '1px solid token(colors.border)',
  background: 'token(colors.bg.card)',
  color: 'token(colors.text)',
  fontSize: '14px',
  outline: 'none',
  transition: 'border-color 0.15s',
  _focus: { borderColor: 'token(colors.accent)' },
})

const sortSelect = css({
  fontSize: '13px',
  padding: '8px 8px',
  borderRadius: '8px',
  border: '1px solid token(colors.border)',
  background: 'token(colors.bg.card)',
  color: 'token(colors.text)',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  flexShrink: 0,
})

const noResult = css({
  textAlign: 'center',
  padding: '40px 0',
  fontSize: '14px',
  color: 'token(colors.text.muted)',
})

export default function LibraryPage() {
  const user = useAuth()
  const { novels, loading, uploading, uploadNovel, removeNovel } = useNovels()
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [sortOrder, setSortOrder] = useState(() =>
    localStorage.getItem(SORT_KEY) || 'lastRead'
  )
  const [searchQuery, setSearchQuery] = useState('')
  const { canInstall, install } = usePWAInstall()

  async function handleUpload(file) {
    await uploadNovel(file)
    if (user?.isAnonymous) setShowLinkModal(true)
  }

  function handleSortChange(value) {
    setSortOrder(value)
    localStorage.setItem(SORT_KEY, value)
  }

  const displayedNovels = useMemo(() => {
    const list = [...novels]
    // 정렬
    if (sortOrder === 'title') {
      list.sort((a, b) => (a.title || '').localeCompare(b.title || '', 'ko'))
    } else if (sortOrder === 'progress') {
      list.sort((a, b) => (b.progressRatio || 0) - (a.progressRatio || 0))
    } else {
      list.sort((a, b) => {
        const toMs = (ts) => ts?.toMillis ? ts.toMillis() : ts ? new Date(ts).getTime() : 0
        return toMs(b.lastReadAt) - toMs(a.lastReadAt)
      })
    }
    // 검색 필터
    const q = searchQuery.trim().toLowerCase()
    return q ? list.filter((n) => n.title.toLowerCase().includes(q)) : list
  }, [novels, sortOrder, searchQuery])

  if (!user) {
    return (
      <div className={css({ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100svh' })}>
        <span className={css({ color: 'token(colors.text.muted)', fontSize: '14px' })}>불러오는 중...</span>
      </div>
    )
  }

  return (
    <div className={wrap}>
      {showLinkModal && <LinkAccountModal onClose={() => setShowLinkModal(false)} />}
      <Header />
      <AccountBanner />
      {canInstall && (
        <div className={installBanner}>
          <span>홈 화면에 추가하면 앱처럼 바로 열 수 있어요.</span>
          <button className={installBtn} onClick={install}>홈에 추가</button>
        </div>
      )}
      <div className={inner}>

        {loading ? (
          // ── 스켈레톤 ──
          <div className={grid}>
            {[0, 1, 2].map((i) => (
              <div key={i} className={skeletonCard}>
                <div style={{ width: 64, height: 80, borderRadius: 8, background: 'currentColor', opacity: 0.3 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: 16, borderRadius: 4, background: 'currentColor', opacity: 0.3, marginBottom: 8, width: '60%' }} />
                  <div style={{ height: 12, borderRadius: 4, background: 'currentColor', opacity: 0.3, marginBottom: 10, width: '40%' }} />
                  <div style={{ height: 6, borderRadius: 99, background: 'currentColor', opacity: 0.3 }} />
                </div>
              </div>
            ))}
          </div>

        ) : novels.length === 0 ? (
          // ── 빈 서재 ──
          <div className={emptyWrap}>
            <span className={emptyIcon}>📚</span>
            <p className={emptyTitle}>서재가 비어있어요</p>
            <p className={emptyDesc}>.txt · .pdf · .docx 파일을 추가해보세요</p>
            <FileUploader onUpload={handleUpload} uploading={uploading} />
          </div>

        ) : (
          // ── 소설 목록 ──
          <>
            <div className={toolbar}>
              <div className={searchWrap}>
                <Search size={14} className={searchIcon} />
                <input
                  type="search"
                  className={searchInput}
                  placeholder="소설 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select
                className={sortSelect}
                value={sortOrder}
                onChange={(e) => handleSortChange(e.target.value)}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <FileUploader onUpload={handleUpload} uploading={uploading} />
            </div>

            {displayedNovels.length === 0 ? (
              <p className={noResult}>"{searchQuery}"에 대한 검색 결과가 없습니다.</p>
            ) : (
              <div className={grid}>
                {displayedNovels.map((novel) => (
                  <NovelCard key={novel.id} novel={novel} onDelete={removeNovel} />
                ))}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  )
}
