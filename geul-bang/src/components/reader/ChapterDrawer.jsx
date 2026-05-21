// 독자 화면 우측 슬라이드인 드로어 — 목차 / 검색 / 북마크 탭
import { css, cx } from 'styled-system/css'
import { BookOpen, X, Trash2 } from 'lucide-react'
import { useState, useMemo, useEffect, useDeferredValue } from 'react'
import { subscribeBookmarks, addBookmark, deleteBookmark } from '../../services/novel.service'

const toggleBtn = css({
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'token(colors.text.muted)',
  padding: '4px',
  borderRadius: '6px',
  _hover: { background: 'token(colors.bg.subtle)' },
})

const backdrop = css({ position: 'fixed', inset: 0, zIndex: 199 })

const drawer = css({
  position: 'fixed',
  top: 0,
  right: 0,
  bottom: 0,
  width: { base: '85vw', sm: '340px' },
  zIndex: 200,
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
  background: 'token(colors.bg.card)',
  color: 'token(colors.text)',
})

const drawerTop = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 16px 0',
  flexShrink: 0,
})

const tabRow = css({ display: 'flex', gap: '4px', flex: 1 })

const tabBtn = css({
  padding: '6px 12px',
  borderRadius: '6px',
  border: 'none',
  background: 'none',
  fontSize: '13px',
  fontWeight: '500',
  cursor: 'pointer',
  color: 'token(colors.text.muted)',
  _hover: { background: 'token(colors.bg.subtle)' },
})

const tabBtnActive = css({
  background: 'token(colors.bg.subtle)',
  color: 'token(colors.text)',
  fontWeight: '700',
})

const divider = css({
  height: '1px',
  background: 'token(colors.border)',
  margin: '8px 0 0',
  flexShrink: 0,
})

const list = css({ flex: 1, overflowY: 'auto', padding: '8px 0' })

const item = css({
  display: 'block',
  width: '100%',
  textAlign: 'left',
  background: 'none',
  border: 'none',
  padding: '10px 20px',
  fontSize: '13px',
  color: 'token(colors.text)',
  cursor: 'pointer',
  lineHeight: '1.5',
  borderLeft: '3px solid transparent',
  _hover: { background: 'token(colors.bg.subtle)' },
})

const itemActive = css({
  borderLeftColor: 'token(colors.accent)',
  color: 'token(colors.accent)',
  fontWeight: '600',
  background: 'token(colors.bg.subtle)',
})

const emptyMsg = css({
  padding: '32px 20px',
  fontSize: '13px',
  color: 'token(colors.text.muted)',
  textAlign: 'center',
  lineHeight: '1.7',
})

const searchWrap = css({
  padding: '10px 16px',
  borderBottom: '1px solid token(colors.border)',
  flexShrink: 0,
})

const searchInputCss = css({
  width: '100%',
  padding: '8px 12px',
  borderRadius: '8px',
  border: '1px solid token(colors.border)',
  background: 'token(colors.bg.subtle)',
  color: 'token(colors.text)',
  fontSize: '14px',
  outline: 'none',
  _focus: { borderColor: 'token(colors.accent)' },
})

const bmRow = css({
  display: 'flex',
  alignItems: 'stretch',
  borderLeft: '3px solid transparent',
  _hover: { background: 'token(colors.bg.subtle)' },
})

const bmJump = css({
  flex: 1,
  textAlign: 'left',
  background: 'none',
  border: 'none',
  padding: '10px 12px 10px 20px',
  cursor: 'pointer',
  minWidth: 0,
})

const bmLabel = css({
  fontSize: '13px',
  color: 'token(colors.text)',
  fontWeight: '500',
  display: 'block',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})

const bmPct = css({
  fontSize: '11px',
  color: 'token(colors.text.muted)',
  marginTop: '2px',
})

const bmDelete = css({
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '0 14px',
  color: 'token(colors.text.muted)',
  flexShrink: 0,
  _hover: { color: '#ef4444' },
})

const addBmBtn = css({
  display: 'block',
  width: 'calc(100% - 32px)',
  margin: '8px 16px',
  padding: '9px 0',
  borderRadius: '8px',
  border: '1px solid token(colors.accent)',
  background: 'none',
  color: 'token(colors.accent)',
  fontSize: '13px',
  fontWeight: '600',
  cursor: 'pointer',
  _hover: { background: 'token(colors.bg.subtle)' },
})

function searchText(text, query) {
  if (!query || !text) return []
  const lower = text.toLowerCase()
  const lowerQ = query.toLowerCase()
  const results = []
  let start = 0
  while (results.length < 200) {
    const idx = lower.indexOf(lowerQ, start)
    if (idx === -1) break
    results.push(idx)
    start = idx + 1
  }
  return results
}

export default function ChapterDrawer({ chapters = [], currentCharOffset, onJump, text = '', novelId, uid }) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState('chapters')
  const [query, setQuery] = useState('')
  const [bookmarks, setBookmarks] = useState([])

  const deferredQuery = useDeferredValue(query)
  const searchResults = useMemo(
    () => searchText(text, deferredQuery),
    [text, deferredQuery],
  )

  useEffect(() => {
    if (!uid || !novelId) return
    return subscribeBookmarks(uid, novelId, setBookmarks)
  }, [uid, novelId])

  const activeIdx = chapters.reduce(
    (acc, ch, i) => (ch.charOffset <= currentCharOffset ? i : acc),
    0,
  )

  function handleJump(target) {
    onJump(target)
    setOpen(false)
  }

  async function handleAddBookmark() {
    if (!uid || !novelId) return
    const pct = text.length > 0 ? Math.round(currentCharOffset / text.length * 100) : 0
    const nearChapter = [...chapters].reverse().find((ch) => ch.charOffset <= currentCharOffset)
    const label = nearChapter ? nearChapter.title : `${pct}% 위치`
    await addBookmark(uid, novelId, { label, charOffset: currentCharOffset })
  }

  return (
    <>
      <button className={toggleBtn} onClick={() => setOpen(true)} title="목차">
        <BookOpen size={20} />
      </button>

      {open && (
        <>
          <div className={backdrop} onClick={() => setOpen(false)} />
          <div className={drawer}>
            <div className={drawerTop}>
              <div className={tabRow}>
                {[
                  { key: 'chapters', label: `목차${chapters.length > 0 ? ` (${chapters.length})` : ''}` },
                  { key: 'search', label: '검색' },
                  { key: 'bookmarks', label: `북마크${bookmarks.length > 0 ? ` (${bookmarks.length})` : ''}` },
                ].map((t) => (
                  <button
                    key={t.key}
                    className={cx(tabBtn, tab === t.key ? tabBtnActive : '')}
                    onClick={() => setTab(t.key)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <button className={toggleBtn} onClick={() => setOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <div className={divider} />

            {tab === 'chapters' && (
              <div className={list}>
                {chapters.length === 0 ? (
                  <p className={emptyMsg}>챕터를 감지하지 못했습니다.<br />소설 형식에 따라 목차가 지원되지 않을 수 있습니다.</p>
                ) : (
                  chapters.map((ch, i) => (
                    <button
                      key={i}
                      className={cx(item, i === activeIdx ? itemActive : '')}
                      onClick={() => handleJump(ch)}
                    >
                      {ch.title}
                    </button>
                  ))
                )}
              </div>
            )}

            {tab === 'search' && (
              <>
                <div className={searchWrap}>
                  <input
                    type="text"
                    className={searchInputCss}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="소설 내 검색..."
                    autoFocus
                  />
                  {query && (
                    <p style={{ fontSize: '12px', color: 'var(--colors-text-muted)', marginTop: '6px' }}>
                      {searchResults.length >= 200 ? '200개 이상' : `${searchResults.length}개`} 발견
                    </p>
                  )}
                </div>
                <div className={list}>
                  {!query && (
                    <p className={emptyMsg}>검색어를 입력하세요.</p>
                  )}
                  {query && searchResults.length === 0 && (
                    <p className={emptyMsg}>"{query}"에 대한 결과가 없습니다.</p>
                  )}
                  {searchResults.map((idx, i) => {
                    const CONTEXT = 35
                    const before = text.slice(Math.max(0, idx - CONTEXT), idx).replace(/\n+/g, ' ')
                    const match = text.slice(idx, idx + deferredQuery.length)
                    const after = text.slice(idx + deferredQuery.length, idx + deferredQuery.length + CONTEXT).replace(/\n+/g, ' ')
                    return (
                      <button key={i} className={item} onClick={() => handleJump({ charOffset: idx })}>
                        <span style={{ fontSize: '12px', lineHeight: 1.6 }}>
                          {before && <span style={{ opacity: 0.6 }}>{before}</span>}
                          <mark style={{
                            background: 'var(--colors-accent)',
                            color: '#fff',
                            borderRadius: '2px',
                            padding: '0 2px',
                          }}>
                            {match}
                          </mark>
                          {after && <span style={{ opacity: 0.6 }}>{after}</span>}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </>
            )}

            {tab === 'bookmarks' && (
              <>
                <button className={addBmBtn} onClick={handleAddBookmark}>
                  + 현재 위치 북마크 추가
                </button>
                <div className={list}>
                  {bookmarks.length === 0 ? (
                    <p className={emptyMsg}>저장된 북마크가 없습니다.<br />위 버튼으로 현재 위치를 저장하세요.</p>
                  ) : (
                    bookmarks.map((bm) => {
                      const pct = text.length > 0 ? Math.round(bm.charOffset / text.length * 100) : 0
                      return (
                        <div key={bm.id} className={bmRow}>
                          <button className={bmJump} onClick={() => handleJump({ charOffset: bm.charOffset })}>
                            <span className={bmLabel}>{bm.label}</span>
                            <span className={bmPct}>{pct}% 위치</span>
                          </button>
                          <button className={bmDelete} onClick={() => deleteBookmark(uid, novelId, bm.id)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )
                    })
                  )}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </>
  )
}
