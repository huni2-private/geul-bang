import { css } from 'styled-system/css'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { linkGoogle } from '../../services/auth.service'

const banner = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  padding: '10px 16px',
  background: '#fef3c7',
  borderBottom: '1px solid #fde68a',
  fontSize: '14px',
  color: '#92400e',
  flexWrap: 'wrap',
})

const btn = css({
  padding: '4px 12px',
  borderRadius: '6px',
  border: '1px solid #d97706',
  background: 'transparent',
  color: '#92400e',
  fontSize: '13px',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  _hover: { background: '#fde68a' },
})

export default function AccountBanner() {
  const user = useAuth()
  const showToast = useToast()
  if (!user || !user.isAnonymous) return null

  async function handleLink() {
    try {
      await linkGoogle()
    } catch (e) {
      if (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request') {
        return
      }
      if (e.code === 'auth/credential-already-in-use') {
        showToast('이미 다른 계정에 연동된 Google 계정입니다.', 'warn')
        return
      }
      console.error('계정 연동 실패:', e)
    }
  }

  return (
    <div className={banner}>
      <span>브라우저 데이터 삭제 시 소설이 사라집니다. 계정을 연동하면 안전하게 보존됩니다.</span>
      <button className={btn} onClick={handleLink}>계정 연동하기</button>
    </div>
  )
}
