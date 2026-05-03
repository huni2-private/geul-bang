import { css } from 'styled-system/css'
import Header from '../components/layout/Header'
import AccountBanner from '../components/auth/AccountBanner'
import NovelCard from '../components/library/NovelCard'
import FileUploader from '../components/library/FileUploader'
import { useNovels } from '../hooks/useNovels'
import { useAuth } from '../contexts/AuthContext'

const wrap = css({
  paddingTop: '56px',
  minHeight: '100svh',
  background: 'token(colors.bg)',
})

const inner = css({
  maxWidth: '680px',
  margin: '0 auto',
  padding: '32px 20px',
})

const topRow = css({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px',
})

const heading = css({
  fontSize: '22px',
  fontWeight: '700',
  color: 'token(colors.text)',
})

const grid = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
})

const empty = css({
  textAlign: 'center',
  padding: '80px 20px',
  color: 'token(colors.text.muted)',
})

const emptyTitle = css({ fontSize: '16px', marginBottom: '8px' })
const emptyDesc = css({ fontSize: '14px', marginBottom: '24px' })

export default function LibraryPage() {
  const user = useAuth()
  const { novels, uploading, uploadNovel, removeNovel } = useNovels()

  if (!user) {
    return (
      <div className={css({ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100svh' })}>
        <span className={css({ color: 'token(colors.text.muted)', fontSize: '14px' })}>불러오는 중...</span>
      </div>
    )
  }

  return (
    <div className={wrap}>
      <Header />
      <AccountBanner />
      <div className={inner}>
        <div className={topRow}>
          <h1 className={heading}>내 서재</h1>
          <FileUploader onUpload={uploadNovel} uploading={uploading} />
        </div>

        {novels.length === 0 ? (
          <div className={empty}>
            <p className={emptyTitle}>서재가 비어 있어요.</p>
            <p className={emptyDesc}>.txt 파일을 업로드해서 첫 소설을 추가해보세요.</p>
            <FileUploader onUpload={uploadNovel} uploading={uploading} />
          </div>
        ) : (
          <div className={grid}>
            {novels.map((novel) => (
              <NovelCard key={novel.id} novel={novel} onDelete={removeNovel} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
