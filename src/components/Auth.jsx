import React, { useState } from 'react'
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { auth } from '../firebase'

export default function Auth() {
  const [error, setError] = useState(null)

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
    } catch (err) {
      console.error(err)
      setError('Đăng nhập thất bại. Vui lòng thử lại.')
    }
  }

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f0f2f5',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <div style={{
        padding: '40px',
        background: 'white',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <h1 style={{ marginBottom: '20px', color: '#1a1a1a' }}>Pixel Classroom</h1>
        <p style={{ marginBottom: '30px', color: '#666' }}>Vui lòng đăng nhập để tham gia lớp học</p>
        
        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

        <button
          onClick={handleLogin}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            background: '#4285f4',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Đăng nhập bằng Google
        </button>
      </div>
    </div>
  )
}
