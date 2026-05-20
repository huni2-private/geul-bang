// 첫 업로드 후 익명 사용자에게 Google 계정 연동을 권유하는 모달
import { css } from 'styled-system/css'
import { X } from 'lucide-react'
import { linkGoogle } from '../../services/auth.service'
import { useToast } from '../../contexts/ToastContext'

const overlay = css({
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.5)',
  zIndex: 300,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
})

const modal = css({
  background: 'token(colors.bg.card)',
  border: '1px solid token(colors.border)',
  borderRadius: '16px',
  padding: '28px 24px 24px',
  width: '100%',
  maxWidth: '360px',
  position: 'relative',
})

const closeBtn = css({
  position: 'absolute',
  top: '16px',
  right: '16px',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'token(colors.text.muted)',
  padding: '4px',
  borderRadius: '6px',
  _hover: { background: 'token(colors.bg.subtle)' },
})

const icon = css({
  fontSize: '36px',
  display: 'block',
  marginBottom: '12px',
})

const title = css({
  fontSize: '17px',
  fontWeight: '700',
  color: 'token(colors.text)',
  marginBottom: '8px',
})

const desc = css({
  fontSize: '14px',
  color: 'token(colors.text.muted)',
  lineHeight: '1.6',
  marginBottom: '20px',
})

const primaryBtn = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  width: '100%',
  padding: '11px',
  borderRadius: '8px',
  background: 'token(colors.accent)',
  color: '#fff',
  fontSize: '14px',
  fontWeight: '600',
  border: 'none',
  cursor: 'pointer',
  marginBottom: '10px',
  transition: 'opacity 0.15s',
  _hover: { opacity: 0.85 },
})

const skipBtn = css({
  display: 'block',
  width: '100%',
  padding: '8px',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '13px',
  color: 'token(colors.text.muted)',
  _hover: { color: 'token(colors.text)' },
})

export default function LinkAccountModal({ onClose }) {
  const showToast = useToast()

  async function handleLink() {
    try {
      await linkGoogle()
      onClose()
    } catch (e) {
      if (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request') return
      if (e.code === 'auth/credential-already-in-use') {
        showToast('이미 다른 계정에 연동된 Google 계정입니다.', 'warn')
        return
      }
      console.error('계정 연동 실패:', e)
    }
  }

  return (
    <div className={overlay} onClick={onClose}>
      <div className={modal} onClick={(e) => e.stopPropagation()}>
        <button className={closeBtn} onClick={onClose}><X size={16} /></button>
        <span className={icon}>☁️</span>
        <h2 className={title}>소설을 안전하게 보관하세요</h2>
        <p className={desc}>
          지금은 이 기기에만 저장되어 있어요.<br />
          Google 계정을 연동하면 다른 기기에서도 읽고, 브라우저 데이터가 지워져도 소설이 보존됩니다.
        </p>
        <button className={primaryBtn} onClick={handleLink}>
          Google로 계정 연동하기
        </button>
        <button className={skipBtn} onClick={onClose}>나중에 하기</button>
      </div>
    </div>
  )
}
