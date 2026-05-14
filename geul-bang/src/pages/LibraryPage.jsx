import { useState } from 'react'
import { css } from 'styled-system/css'
import Header from '../components/layout/Header'
import AccountBanner from '../components/auth/AccountBanner'
import NovelCard from '../components/library/NovelCard'
import FileUploader from '../components/library/FileUploader'
import LinkAccountModal from '../components/auth/LinkAccountModal'
import { useNovels } from '../hooks/useNovels'
import { useAuth } from '../contexts/AuthContext'
import { usePWAInstall } from '../hooks/usePWAInstall'

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

const grid = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
})

// ── 온보딩 빈 상태 ──────────────────────────────────────────

const onboarding = css({
  padding: { base: '40px 0 60px', sm: '56px 0 80px' },
})

const hero = css({
  textAlign: 'center',
  marginBottom: '48px',
})

const heroIcon = css({
  fontSize: '48px',
  display: 'block',
  marginBottom: '20px',
  lineHeight: 1,
})

const heroTitle = css({
  fontSize: { base: '22px', sm: '26px' },
  fontWeight: '700',
  color: 'token(colors.text)',
  marginBottom: '12px',
  letterSpacing: '-0.5px',
})

const heroDesc = css({
  fontSize: { base: '14px', sm: '15px' },
  color: 'token(colors.text.muted)',
  lineHeight: '1.7',
  marginBottom: '28px',
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
  const { novels, uploading, uploadNovel, removeNovel } = useNovels()
  const [showLinkModal, setShowLinkModal] = useState(false)
  const { canInstall, install } = usePWAInstall()

  async function handleUpload(file) {
    await uploadNovel(file)
    if (user?.isAnonymous) setShowLinkModal(true)
  }

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

        {novels.length === 0 ? (
          // ── 빈 서재: 온보딩 화면 ──
          <div className={onboarding}>
            <div className={hero}>
              <span className={heroIcon}>📚</span>
              <h1 className={heroTitle}>나만의 웹소설 리더</h1>
              <p className={heroDesc}>
                .txt 파일을 올리면 기기에 상관없이 어디서든 이어 읽을 수 있어요.<br />
                EUC-KR 인코딩도 자동으로 변환해 드립니다.
              </p>
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
              <FileUploader onUpload={handleUpload} uploading={uploading} />
            </div>
            <div className={grid}>
              {novels.map((novel) => (
                <NovelCard key={novel.id} novel={novel} onDelete={removeNovel} />
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  )
}
