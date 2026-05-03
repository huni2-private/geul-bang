import { css } from 'styled-system/css'
import { useScrollDirection } from '../../hooks/useScrollDirection'

const header = css({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 100,
  background: 'token(colors.bg)',
  borderBottom: '1px solid token(colors.border)',
  transition: 'transform 0.3s ease',
  padding: { base: '0 16px', sm: '0 20px' },
  height: '56px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
})

const hidden = css({ transform: 'translateY(-100%)' })

const logo = css({
  fontSize: '20px',
  fontWeight: '700',
  color: 'token(colors.text)',
  textDecoration: 'none',
  letterSpacing: '-0.5px',
})

export default function Header({ children }) {
  const isHidden = useScrollDirection()

  return (
    <header className={`${header} ${isHidden ? hidden : ''}`}>
      <a href="/" className={logo}>글방</a>
      {children}
    </header>
  )
}
