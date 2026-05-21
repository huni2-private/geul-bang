// 서재 페이지 — 소설 목록, 검색/정렬, 스켈레톤 로딩
import { useState, useMemo, useRef } from 'react'
import { css } from 'styled-system/css'
import { Search, Upload } from 'lucide-react'
import Header from '../components/layout/Header'
import AccountBanner from '../components/auth/AccountBanner'
import NovelCard from '../components/library/NovelCard'
import FileUploader from '../components/library/FileUploader'
import LinkAccountModal from '../components/auth/LinkAccountModal'
import { useNovels } from '../hooks/useNovels'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
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

const grid = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
})

// ── 업로드 진행 카드 ──────────────────────────────────────────

const uploadingCard = css({
  background: 'token(colors.accent.subtle)',
  border: '1px solid token(colors.accent.muted)',
  borderRadius: '10px',
  padding: '16px',
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
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
  width: '72px',
  height: '72px',
  objectFit: 'contain',
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
  const { novels, uploading, dbError, uploadNovel, removeNovel } = useNovels()
  const showToast = useToast()
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [uploadStep, setUploadStep] = useState('')
  const [sortOrder, setSortOrder] = useState(() =>
    localStorage.getItem(SORT_KEY) || 'lastRead'
  )
  const [searchQuery, setSearchQuery] = useState('')
  const { canInstall, install } = usePWAInstall()
  const [isDragging, setIsDragging] = useState(false)
  const dragCounter = useRef(0)

  async function handleUpload(file) {
    const MAX_MB = 30
    if (file.size > MAX_MB * 1024 * 1024) {
      showToast(`파일이 너무 큽니다 (${(file.size / 1024 / 1024).toFixed(1)}MB). ${MAX_MB}MB 이하 파일만 올릴 수 있어요.`, 'error', 8000)
      return
    }
    setUploadStep('')
    try {
      const uploaded = await uploadNovel(file, (step) => setUploadStep(step))
      if (uploaded) {
        setUploadStep('')
        showToast('업로드 완료! 소설을 탭해서 읽어보세요.', 'info', 3000)
        if (user?.isAnonymous) setShowLinkModal(true)
      }
    } catch (e) {
      setUploadStep('')
      console.error('업로드 실패:', e)
      const code = e?.code || ''
      const msg = code.includes('permission-denied')
        ? '저장 권한이 없습니다. 로그인 상태를 확인해주세요.'
        : code.includes('unavailable') || code.includes('network')
        ? '네트워크 오류입니다. 인터넷 연결을 확인해주세요.'
        : (e.message || '업로드 중 오류가 발생했습니다.')
      showToast(`업로드 실패: ${msg}`, 'error', 8000)
    }
  }

  function handleDragEnter(e) {
    e.preventDefault()
    dragCounter.current++
    if (!uploading) setIsDragging(true)
  }

  function handleDragLeave(e) {
    e.preventDefault()
    dragCounter.current--
    if (dragCounter.current === 0) setIsDragging(false)
  }

  function handleDragOver(e) {
    e.preventDefault()
  }

  function handleDrop(e) {
    e.preventDefault()
    dragCounter.current = 0
    setIsDragging(false)
    if (uploading) return
    const file = e.dataTransfer.files?.[0]
    if (file) handleUpload(file)
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

  const uploadPct = (() => {
    const m = uploadStep.match(/\((\d+)%\)/)
    return m ? parseInt(m[1]) : null
  })()

  return (
    <div
      className={wrap}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.08)',
          border: '3px dashed var(--colors-accent)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 16, pointerEvents: 'none',
        }}>
          <Upload size={48} style={{ color: 'var(--colors-accent)' }} />
          <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--colors-accent)', margin: 0 }}>
            파일을 놓으세요
          </p>
          <p style={{ fontSize: 14, color: 'var(--colors-text-muted)', margin: 0 }}>
            .txt · .pdf · .docx 지원
          </p>
        </div>
      )}
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
        {/* 업로드 진행 카드 */}
        {uploading && (
          <div className={uploadingCard} style={{ marginBottom: 16 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{
                  width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                  border: '2px solid var(--colors-accent-muted)',
                  borderTopColor: 'var(--colors-accent)',
                  animation: 'spin 0.8s linear infinite',
                }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--colors-accent)' }}>
                  {uploadStep || '업로드 준비 중...'}
                </span>
              </div>
              <div style={{
                height: 6, borderRadius: 99,
                background: 'var(--colors-border)', overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', borderRadius: 99,
                  background: 'var(--colors-accent)',
                  transition: uploadPct !== null ? 'width 0.4s ease' : 'none',
                  width: uploadPct !== null ? `${uploadPct}%` : '35%',
                  animation: uploadPct === null ? 'progressScan 1.4s ease infinite' : 'none',
                }} />
              </div>
              <p style={{ fontSize: 11, color: 'var(--colors-text-muted)', marginTop: 4 }}>
                페이지를 닫지 마세요.
              </p>
            </div>
          </div>
        )}

        {dbError ? (
          // ── DB 연결 오류 ──
          <div className={emptyWrap}>
            <div style={{ fontSize: 40 }}>⚠️</div>
            <p className={emptyTitle}>데이터베이스에 연결할 수 없어요</p>
            <p className={emptyDesc} style={{ textAlign: 'center', lineHeight: 1.7 }}>
              오류: <strong>{dbError.code || dbError.message}</strong><br />
              페이지를 새로고침하거나 잠시 후 다시 시도해주세요.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 24px', borderRadius: 8,
                background: 'var(--colors-accent)', color: '#fff',
                border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}
            >
              새로고침
            </button>
          </div>

        ) : novels.length === 0 && !uploading ? (
          // ── 빈 서재 ──
          <div className={emptyWrap}>
            <img src="/geulbang.png" className={emptyIcon} alt="글방" />
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
                  <NovelCard
                    key={novel.id}
                    novel={novel}
                    onDelete={async (n) => {
                      try {
                        await removeNovel(n)
                      } catch {
                        showToast('삭제 중 오류가 발생했습니다. 다시 시도해주세요.', 'error')
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  )
}
