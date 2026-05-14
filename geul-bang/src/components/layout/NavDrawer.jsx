// 좌측 슬라이드인 네비게이션 드로어
import { css } from 'styled-system/css'
import { X, BookOpen, Info, User, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { linkGoogle, loginWithGoogle, logOut } from '../../services/auth.service'

const backdrop = css({
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.4)',
  zIndex: 299,
})

const drawer = css({
  position: 'fixed',
  top: 0,
  left: 0,
  bottom: 0,
  width: { base: '72vw', sm: '280px' },
  background: 'token(colors.bg.card)',
  borderRight: '1px solid token(colors.border)',
  zIndex: 300,
  display: 'flex',
  flexDirection: 'column',
  overflowY: 'auto',
  boxShadow: '4px 0 24px rgba(0,0,0,0.12)',
})

const drawerTop = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '20px 20px 16px',
  borderBottom: '1px solid token(colors.border)',
  flexShrink: 0,
})

const appName = css({
  fontSize: '18px',
  fontWeight: '700',
  color: 'token(colors.text)',
  letterSpacing: '-0.5px',
})

const closeBtn = css({
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'token(colors.text.muted)',
  padding: '4px',
  borderRadius: '6px',
  _hover: { background: 'token(colors.bg.subtle)' },
})

const section = css({
  padding: '8px 0',
  borderBottom: '1px solid token(colors.border)',
})

const sectionLabel = css({
  fontSize: '11px',
  fontWeight: '600',
  color: 'token(colors.text.muted)',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  padding: '8px 20px 4px',
})

const navItem = css({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  width: '100%',
  padding: '10px 20px',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '14px',
  color: 'token(colors.text)',
  textAlign: 'left',
  borderRadius: '0',
  transition: 'background 0.1s',
  _hover: { background: 'token(colors.bg.subtle)' },
})

const themeRow = css({
  display: 'flex',
  gap: '6px',
  padding: '8px 20px 12px',
})

const themeChip = css({
  flex: 1,
  padding: '6px 4px',
  borderRadius: '6px',
  border: '1px solid token(colors.border)',
  fontSize: '12px',
  cursor: 'pointer',
  transition: 'all 0.15s',
  background: 'token(colors.bg.subtle)',
  color: 'token(colors.text)',
})

const accountBox = css({
  margin: '8px 20px 12px',
  padding: '12px',
  borderRadius: '8px',
  background: 'token(colors.bg.subtle)',
  border: '1px solid token(colors.border)',
})

const accountEmail = css({
  fontSize: '13px',
  fontWeight: '600',
  color: 'token(colors.text)',
  marginBottom: '2px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})

const accountSub = css({
  fontSize: '12px',
  color: 'token(colors.text.muted)',
  marginBottom: '10px',
})

const actionBtn = css({
  display: 'block',
  width: '100%',
  padding: '7px 0',
  borderRadius: '6px',
  border: '1px solid token(colors.border)',
  background: 'none',
  cursor: 'pointer',
  fontSize: '13px',
  color: 'token(colors.text)',
  transition: 'background 0.1s',
  _hover: { background: 'token(colors.bg.card)' },
})

const primaryAction = css({
  display: 'block',
  width: '100%',
  padding: '7px 0',
  borderRadius: '6px',
  border: 'none',
  background: 'token(colors.accent)',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: '600',
  color: '#fff',
  transition: 'opacity 0.15s',
  _hover: { opacity: 0.85 },
})

const anonWarn = css({
  fontSize: '12px',
  color: 'token(colors.text.muted)',
  lineHeight: '1.5',
  marginBottom: '10px',
})

const aboutText = css({
  padding: '12px 20px 20px',
  fontSize: '12px',
  color: 'token(colors.text.muted)',
  lineHeight: '1.6',
})

const THEMES = [
  { key: 'light', label: '라이트', bg: '#ffffff', color: '#1a1a1a' },
  { key: 'dark', label: '다크', bg: '#1a1a1a', color: '#e0e0e0' },
  { key: 'sepia', label: '세피아', bg: '#f4ecd8', color: '#3b2f2f' },
]

export default function NavDrawer({ open, onClose }) {
  const navigate = useNavigate()
  const user = useAuth()
  const { theme, setTheme } = useTheme()

  if (!open) return null

  async function handleLinkGoogle() {
    try {
      if (user?.isAnonymous) {
        await linkGoogle()
      } else {
        await loginWithGoogle()
      }
    } catch (e) {
      if (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request') return
      if (e.code === 'auth/credential-already-in-use') {
        alert('이미 다른 계정에 연동된 Google 계정입니다.')
        return
      }
      console.error('로그인 실패:', e)
    }
  }

  async function handleLogOut() {
    if (!confirm('로그아웃하면 익명 계정으로 전환됩니다. 계속하시겠어요?')) return
    await logOut()
    onClose()
  }

  function goLibrary() {
    navigate('/')
    onClose()
  }

  return (
    <>
      <div className={backdrop} onClick={onClose} />
      <div className={drawer}>

        {/* 헤더 */}
        <div className={drawerTop}>
          <span className={appName}>글방</span>
          <button className={closeBtn} onClick={onClose}><X size={18} /></button>
        </div>

        {/* 내 서재 */}
        <div className={section}>
          <button className={navItem} onClick={goLibrary}>
            <BookOpen size={16} />
            내 서재
          </button>
        </div>

        {/* 계정 */}
        <div className={section}>
          <p className={sectionLabel}>계정</p>
          <div className={accountBox}>
            {user?.isAnonymous ? (
              <>
                <p className={anonWarn}>
                  현재 익명으로 사용 중입니다.<br />
                  Google 계정을 연동하면 소설과 진행률이 안전하게 보존됩니다.
                </p>
                <button className={primaryAction} onClick={handleLinkGoogle}>
                  Google로 연동하기
                </button>
              </>
            ) : (
              <>
                <p className={accountEmail}>{user?.displayName || user?.email || '사용자'}</p>
                <p className={accountSub}>{user?.email}</p>
                <button className={actionBtn} onClick={handleLogOut}>로그아웃</button>
              </>
            )}
          </div>
        </div>

        {/* 앱 설정 */}
        <div className={section}>
          <p className={sectionLabel}>앱 설정</p>
          <p className={css({ fontSize: '12px', color: 'token(colors.text.muted)', padding: '4px 20px 2px' })}>
            테마
          </p>
          <div className={themeRow}>
            {THEMES.map((t) => (
              <button
                key={t.key}
                className={themeChip}
                style={{
                  background: t.bg,
                  color: t.color,
                  borderColor: theme === t.key ? 'var(--colors-accent)' : undefined,
                  borderWidth: theme === t.key ? '2px' : undefined,
                  fontWeight: theme === t.key ? '600' : undefined,
                }}
                onClick={() => setTheme(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* 글방 소개 */}
        <div className={section}>
          <button className={navItem} onClick={onClose}>
            <Info size={16} />
            글방 소개
          </button>
          <p className={aboutText}>
            .txt 파일을 올리면 어디서든 이어 읽을 수 있는 개인 웹소설 리더입니다.
            EUC-KR 인코딩을 자동으로 변환하며 Google 계정으로 기기 간 동기화를 지원합니다.<br /><br />
            <span style={{ opacity: 0.6 }}>geul-bang.web.app</span>
          </p>
        </div>

      </div>
    </>
  )
}
