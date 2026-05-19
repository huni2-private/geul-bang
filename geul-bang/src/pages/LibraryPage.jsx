// 서재 페이지 — 소설 목록, 정렬, 스켈레톤 로딩
import { useState, useMemo } from 'react'
import { css } from 'styled-system/css'
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

const topRow = css({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px',
  gap: '12px',
  flexWrap: 'wrap',
})

const heading = css({
  fontSize: { base: '18px', sm: '22px' },
  fontWeight: '700',
  color: 'token(colors.text)',
})

const sortSelect = css({
  fontSize: '13px',
  padding: '4px 8px',
  borderRadius: '6px',
  border: '1px solid token(colors.border)',
  background: 'token(colors.bg.card)',
  color: 'token(colors.text)',
  cursor: 'pointer',
})

const grid = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
})

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

// ── 온보딩 빈 상태 ──────────────────────────────────────────

const onboarding = css({
  padding: { base: '40px 0 60px', sm: '56px 0 80px' },
})

const hero = css({
  textAlign: 'center',
  marginBottom: '40px',
})

const heroTitle = css({
  fontSize: { base: '22px', sm: '26px' },
  fontWeight: '700',
  color: 'token(colors.text)',
  marginBottom: '10px',
  letterSpacing: '-0.5px',
})

const heroDesc = css({
  fontSize: { base: '14px', sm: '15px' },
  color: 'token(colors.text.muted)',
  lineHeight: '1.7',
  marginBottom: '28px',
})

const steps = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  marginBottom: '28px',
  textAlign: 'left',
})

const stepItem = css({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 16px',
  borderRadius: '10px',
  background: 'token(colors.bg.subtle)',
  border: '1px solid token(colors.border)',
  fontSize: '14px',
  color: 'token(colors.text)',
})

const stepNum = css({
  width: '24px',
  height: '24px',
  borderRadius: '50%',
  background: 'token(colors.accent)',
  color: '#fff',
  fontSize: '12px',
  fontWeight: '700',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
})

const divider = css({
  borderTop: '1px solid token(colors.border)',
  margin: '40px 0',
})

const featureGrid = css({
  display: 'grid',
  gridTemplateColumns: { base: '1fr', sm: '1fr 1fr' },
  gap: '16px',
})

const featureItem = css({
  display: 'flex',
  gap: '12px',
  alignItems: 'flex-start',
  padding: '16px',
  borderRadius: '10px',
  background: 'token(colors.bg.subtle)',
  border: '1px solid token(colors.border)',
})

const featureDot = css({
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  background: 'token(colors.accent)',
  marginTop: '6px',
  flexShrink: 0,
})

const featureName = css({
  fontSize: '14px',
  fontWeight: '600',
  color: 'token(colors.text)',
  display: 'block',
  marginBottom: '4px',
})

const featureDesc = css({
  fontSize: '13px',
  color: 'token(colors.text.muted)',
  lineHeight: '1.5',
})

const FEATURES = [
  {
    name: 'EUC-KR 자동 변환',
    desc: '한국 웹소설 .txt 파일의 깨진 글자를 자동으로 변환합니다.',
  },
  {
    name: '이어 읽기',
    desc: '읽던 위치를 자동으로 저장해 다음에 그대로 이어 읽습니다.',
  },
  {
    name: '테마·글자 크기',
    desc: '라이트·다크·세피아 테마와 글자 크기를 자유롭게 조절합니다.',
  },
  {
    name: '클라우드 동기',
    desc: 'Google 계정을 연동하면 다른 기기에서도 같은 서재를 씁니다.',
  },
]

export default function LibraryPage() {
  const user = useAuth()
  const { novels, loading, uploading, uploadNovel, removeNovel } = useNovels()
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [sortOrder, setSortOrder] = useState(() =>
    localStorage.getItem(SORT_KEY) || 'lastRead'
  )
  const { canInstall, install } = usePWAInstall()

  async function handleUpload(file) {
    await uploadNovel(file)
    if (user?.isAnonymous) setShowLinkModal(true)
  }

  function handleSortChange(value) {
    setSortOrder(value)
    localStorage.setItem(SORT_KEY, value)
  }

  const sortedNovels = useMemo(() => {
    const list = [...novels]
    if (sortOrder === 'title') {
      return list.sort((a, b) => (a.title || '').localeCompare(b.title || '', 'ko'))
    }
    if (sortOrder === 'progress') {
      return list.sort((a, b) => (b.progressRatio || 0) - (a.progressRatio || 0))
    }
    // lastRead: lastReadAt 내림차순, null은 뒤로
    return list.sort((a, b) => {
      const toMs = (ts) => ts?.toMillis ? ts.toMillis() : ts ? new Date(ts).getTime() : 0
      return toMs(b.lastReadAt) - toMs(a.lastReadAt)
    })
  }, [novels, sortOrder])

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
      <Header>
        <FileUploader onUpload={handleUpload} uploading={uploading} />
      </Header>
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
          // ── 빈 서재: 온보딩 화면 ──
          <div className={onboarding}>
            <div className={hero}>
              <h1 className={heroTitle}>글방 사용 방법</h1>
              <p className={heroDesc}>
                한국 웹소설 .txt 파일을 올리면 어디서든 이어 읽을 수 있어요.
              </p>
              <div className={steps}>
                <div className={stepItem}>
                  <span className={stepNum}>1</span>
                  상단 <strong>소설 추가</strong> 버튼을 눌러 .txt 파일을 선택하세요.
                </div>
                <div className={stepItem}>
                  <span className={stepNum}>2</span>
                  목록에서 읽고 싶은 소설을 탭하면 뷰어가 열립니다.
                </div>
                <div className={stepItem}>
                  <span className={stepNum}>3</span>
                  읽던 위치가 자동 저장되어 다음에 그대로 이어 읽습니다.
                </div>
              </div>
              <FileUploader onUpload={handleUpload} uploading={uploading} />
            </div>

            <hr className={divider} />

            <div className={featureGrid}>
              {FEATURES.map((f) => (
                <div key={f.name} className={featureItem}>
                  <span className={featureDot} />
                  <div>
                    <span className={featureName}>{f.name}</span>
                    <span className={featureDesc}>{f.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // ── 소설 목록 ──
          <>
            <div className={topRow}>
              <h1 className={heading}>내 서재</h1>
              <select
                className={sortSelect}
                value={sortOrder}
                onChange={(e) => handleSortChange(e.target.value)}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className={grid}>
              {sortedNovels.map((novel) => (
                <NovelCard key={novel.id} novel={novel} onDelete={removeNovel} />
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  )
}
