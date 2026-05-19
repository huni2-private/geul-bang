// 상단 고정 헤더 — 네비 드로어 + 계정 칩
import { useState } from 'react'
import { css } from 'styled-system/css'
import { Menu, LogOut, Link2 } from 'lucide-react'
import { useScrollDirection } from '../../hooks/useScrollDirection'
import { useAuth } from '../../contexts/AuthContext'
import { logOut, linkGoogle } from '../../services/auth.service'
import NavDrawer from './NavDrawer'

const header = css({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 100,
  background: 'token(colors.bg)',
  borderBottom: '1px solid token(colors.border)',
  transition: 'transform 0.3s ease',
  height: '56px',
})

const hidden = css({ transform: 'translateY(-100%)' })

const headerInner = css({
  height: '100%',
  padding: { base: '0 16px', sm: '0 20px' },
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
})

const menuBtn = css({
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'token(colors.text.muted)',
  padding: '6px',
  borderRadius: '6px',
  display: 'flex',
  alignItems: 'center',
  flexShrink: 0,
  _hover: { background: 'token(colors.bg.subtle)' },
})

const logo = css({
  fontSize: '18px',
  fontWeight: '700',
  color: 'token(colors.text)',
  textDecoration: 'none',
  letterSpacing: '-0.5px',
  flexShrink: 0,
})

const spacer = css({ flex: 1 })

const accountBtn = css({
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '7px',
  padding: '4px 8px 4px 4px',
  borderRadius: '20px',
  transition: 'background 0.15s',
  flexShrink: 0,
  _hover: { background: 'token(colors.bg.subtle)' },
})

const avatar = css({
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '13px',
  fontWeight: '700',
  color: 'white',
  flexShrink: 0,
  overflow: 'hidden',
  objectFit: 'cover',
})

const accountLabel = css({
  fontSize: '13px',
  fontWeight: '500',
  color: 'token(colors.text)',
  maxWidth: '120px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  display: { base: 'none', sm: 'block' },
})

const dropdown = css({
  position: 'fixed',
  top: '60px',
  right: { base: '8px', sm: '12px' },
  background: 'token(colors.bg.card)',
  border: '1px solid token(colors.border)',
  borderRadius: '12px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
  zIndex: 101,
  minWidth: '220px',
  padding: '16px',
})

const dropName = css({
  fontSize: '14px',
  fontWeight: '700',
  color: 'token(colors.text)',
  marginBottom: '2px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})

const dropEmail = css({
  fontSize: '12px',
  color: 'token(colors.text.muted)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})

const dropDivider = css({
  borderTop: '1px solid token(colors.border)',
  margin: '12px 0 8px',
})

const dropAction = css({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  width: '100%',
  padding: '8px 10px',
  borderRadius: '8px',
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  fontSize: '13px',
  textAlign: 'left',
  transition: 'background 0.1s',
})

const dropLogout = css({
  color: '#ef4444',
  _hover: { background: '#fee2e2' },
})

const dropLink = css({
  color: 'token(colors.accent)',
  fontWeight: '600',
  border: '1px solid token(colors.accent)',
  borderRadius: '8px',
  _hover: { background: 'token(colors.bg.subtle)' },
})

const anonChip = css({
  fontSize: '11px',
  fontWeight: '600',
  color: 'token(colors.text.muted)',
  background: 'token(colors.bg.subtle)',
  border: '1px solid token(colors.border)',
  borderRadius: '10px',
  padding: '2px 8px',
  display: { base: 'none', sm: 'block' },
})

export default function Header({ children }) {
  const isHidden = useScrollDirection()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)
  const user = useAuth()

  async function handleLogout() {
    if (!confirm('로그아웃하면 익명 계정으로 전환됩니다. 계속하시겠어요?')) return
    setDropOpen(false)
    await logOut()
  }

  async function handleLink() {
    setDropOpen(false)
    try {
      await linkGoogle()
    } catch (e) {
      if (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request') return
      if (e.code === 'auth/credential-already-in-use') {
        alert('이미 다른 계정에 연동된 Google 계정입니다.')
        return
      }
      console.error('계정 연동 실패:', e)
    }
  }

  const displayName = user?.displayName || user?.email?.split('@')[0] || '사용자'
  const initial = user?.isAnonymous ? '익' : (displayName.charAt(0) || 'U')
  const avatarBg = user?.isAnonymous ? '#9ca3af' : 'var(--colors-accent)'

  return (
    <>
      <header className={`${header} ${isHidden ? hidden : ''}`}>
        <div className={headerInner}>
          <button className={menuBtn} onClick={() => setMenuOpen(true)}>
            <Menu size={20} />
          </button>
          <a href="/" className={logo}>글방</a>

          <div className={spacer} />
          {children}

          {/* 계정 칩 */}
          {user && (
            <button className={accountBtn} onClick={() => setDropOpen((v) => !v)}>
              {user.photoURL ? (
                <img src={user.photoURL} className={avatar} alt="프로필" referrerPolicy="no-referrer" />
              ) : (
                <span className={avatar} style={{ background: avatarBg }}>{initial}</span>
              )}
              {user.isAnonymous ? (
                <span className={anonChip}>익명</span>
              ) : (
                <span className={accountLabel}>{displayName}</span>
              )}
            </button>
          )}
        </div>
      </header>

      {/* 계정 드롭다운 */}
      {dropOpen && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 100 }}
            onClick={() => setDropOpen(false)}
          />
          <div className={dropdown}>
            {user?.isAnonymous ? (
              <>
                <p className={dropName}>익명 사용자</p>
                <p className={dropEmail}>Google 연동 시 데이터가 안전하게 보존됩니다.</p>
                <div className={dropDivider} />
                <button className={`${dropAction} ${dropLink}`} onClick={handleLink}>
                  <Link2 size={14} />
                  Google로 연동하기
                </button>
              </>
            ) : (
              <>
                <p className={dropName}>{user?.displayName || '사용자'}</p>
                <p className={dropEmail}>{user?.email}</p>
                <div className={dropDivider} />
                <button className={`${dropAction} ${dropLogout}`} onClick={handleLogout}>
                  <LogOut size={14} />
                  로그아웃
                </button>
              </>
            )}
          </div>
        </>
      )}

      <NavDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}
