import { useState } from 'react'
import { css } from 'styled-system/css'
import { Menu } from 'lucide-react'
import { useScrollDirection } from '../../hooks/useScrollDirection'
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

export default function Header({ children }) {
  const isHidden = useScrollDirection()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <header className={`${header} ${isHidden ? hidden : ''}`}>
        <div className={headerInner}>
          <button className={menuBtn} onClick={() => setMenuOpen(true)}>
            <Menu size={20} />
          </button>
          <a href="/" className={logo}>글방</a>
          {children}
        </div>
      </header>
      <NavDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}
