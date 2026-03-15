import React, { useState } from 'react'
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword 
} from 'firebase/auth'
import { auth, rtdb } from '../firebase'
import { ref, push, serverTimestamp } from 'firebase/database'
import emailjs from '@emailjs/browser'

// --- CẤU HÌNH EMAILJS (Lấy từ emailjs.com) ---
const EMAILJS_SERVICE_ID = "service_l8x1p2o"; 
const EMAILJS_TEMPLATE_ID = "template_h095iwf";
const EMAILJS_PUBLIC_KEY = "VErvAC0zESe2cIyXi";

export default function Auth() {
  const [view, setView] = useState('login') 
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Trial Form States
  const [trialData, setTrialData] = useState({
    fullName: '',
    age: '',
    email: '',
    job: '',
    level: '',
    purpose: ''
  })

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
    } catch (err) {
      setError('Không thể kết nối với Google. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const handleEmailLogin = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err) {
      setError('Tài khoản hoặc mật khẩu không chính xác.')
    } finally {
      setLoading(false)
    }
  }

  const handleTrialSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      // 1. Lưu vào Firebase
      await push(ref(rtdb, 'registrations/trial'), {
        ...trialData,
        createdAt: serverTimestamp()
      })

      // 2. Gửi Email thông báo qua EmailJS
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name: trialData.fullName,
          from_email: trialData.email,
          age: trialData.age,
          job: trialData.job,
          level: trialData.level,
          purpose: trialData.purpose,
          to_name: "Thầy giáo Hoàng" // Tên người nhận
        },
        EMAILJS_PUBLIC_KEY
      )

      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        setView('login')
      }, 3000)
    } catch (err) {
      console.error(err)
      setError('Có lỗi xảy ra khi gửi thông tin. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const openLinkedIn = () => window.open('https://www.linkedin.com/in/hoang-do-minh', '_blank')
  const openZalo = () => window.open('https://zalo.me/0964025769', '_blank')

  if (success) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>✅</div>
          <h2>Đăng ký thành công!</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>Thông tin đã được gửi đến thầy giáo. Bạn sẽ nhận được phản hồi sớm nhất.</p>
        </div>
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ marginBottom: '25px' }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>🏫</div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>PIXEL CLASS</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginTop: '8px' }}>
            {view === 'login' ? 'Dành cho giáo viên & học viên chính thức' : 'Bắt đầu hành trình chinh phục tiếng Anh'}
          </p>
        </div>

        {error && <div style={errorStyle}>{error}</div>}

        {view === 'login' ? (
          <>
            <form onSubmit={handleEmailLogin} style={formStyle}>
              <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
              <input type="password" required placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
              <button type="submit" disabled={loading} style={primaryButtonStyle}>
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </form>
            <div style={dividerStyle}><div style={lineStyle} /><span style={{fontSize: '11px', color: 'rgba(255,255,255,0.3)'}}>HOẶC</span><div style={lineStyle} /></div>
            <button onClick={handleGoogleLogin} style={googleButtonStyle}>
              <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" width="18" alt="G" />
              Tiếp tục với Google
            </button>
            <p style={{ marginTop: '25px', fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
              Bạn là người mới? <span onClick={() => setView('trial')} style={linkStyle}>Đăng ký học thử ngay</span>
            </p>
          </>
        ) : (
          <form onSubmit={handleTrialSubmit} style={formStyle}>
            <input type="text" required placeholder="Họ và tên" value={trialData.fullName} onChange={(e) => setTrialData({...trialData, fullName: e.target.value})} style={inputStyle} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <input type="text" required placeholder="Tuổi" value={trialData.age} onChange={(e) => setTrialData({...trialData, age: e.target.value})} style={{...inputStyle, width: '80px'}} />
              <input type="text" required placeholder="Nghề nghiệp/Ngành học" value={trialData.job} onChange={(e) => setTrialData({...trialData, job: e.target.value})} style={inputStyle} />
            </div>
            <input type="text" required placeholder="Trình độ tiếng Anh hiện tại (VD: Mất gốc)" value={trialData.level} onChange={(e) => setTrialData({...trialData, level: e.target.value})} style={inputStyle} />
            <input type="email" required placeholder="Email liên hệ" value={trialData.email} onChange={(e) => setTrialData({...trialData, email: e.target.value})} style={inputStyle} />
            <textarea placeholder="Mục đích học của bạn..." value={trialData.purpose} onChange={(e) => setTrialData({...trialData, purpose: e.target.value})} style={{...inputStyle, height: '60px', resize: 'none'}} />
            
            <button type="submit" disabled={loading} className="hover-btn" style={{...primaryButtonStyle, background: '#34a853', marginTop: '5px'}}>
              {loading ? 'Đang gửi...' : 'Gửi thông tin đăng ký'}
            </button>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={openLinkedIn} className="hover-btn" style={{...socialButtonStyle, background: '#0077b5'}}>
                 LinkedIn
              </button>
              <button type="button" onClick={openZalo} className="hover-btn" style={{...socialButtonStyle, background: '#0068ff'}}>
                Zalo
              </button>
            </div>

            <p style={{ marginTop: '15px', fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
              Quay lại trang <span onClick={() => setView('login')} style={linkStyle}>Đăng nhập</span>
            </p>
          </form>
        )}
      </div>
      <style>{`
        .hover-btn { transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .hover-btn:hover { transform: translateY(-4px); boxShadow: 0 10px 20px rgba(0,0,0,0.4); filter: brightness(1.1); }
        .hover-btn:active { transform: translateY(-1px); }
      `}</style>
    </div>
  )
}

// STYLES (Không đổi)
const containerStyle = { height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', fontFamily: "'Inter', sans-serif" }
const cardStyle = { width: '100%', maxWidth: '450px', padding: '35px', background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(25px)', borderRadius: '30px', border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 30px 60px rgba(0,0,0,0.4)', textAlign: 'center', color: '#fff' }
const formStyle = { display: 'flex', flexDirection: 'column', gap: '12px' }
const inputStyle = { width: '100%', padding: '14px 18px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }
const primaryButtonStyle = { width: '100%', padding: '15px', borderRadius: '12px', background: '#fff', color: '#000', border: 'none', fontWeight: '800', fontSize: '14px', cursor: 'pointer' }
const socialButtonStyle = { flex: 1, padding: '12px', borderRadius: '12px', color: '#fff', border: 'none', fontWeight: '600', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }
const googleButtonStyle = { width: '100%', padding: '13px', borderRadius: '12px', background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }
const dividerStyle = { margin: '25px 0', display: 'flex', alignItems: 'center', gap: '15px' }
const lineStyle = { flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }
const linkStyle = { color: '#fff', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }
const errorStyle = { background: 'rgba(234, 67, 53, 0.1)', color: '#ff8a80', padding: '10px', borderRadius: '10px', fontSize: '12px', marginBottom: '15px', border: '1px solid rgba(234, 67, 53, 0.2)' }
