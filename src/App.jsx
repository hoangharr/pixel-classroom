import Scene from './components/Scene'
import Auth from './components/Auth'
import { useEffect, useState, useRef } from 'react'
import { auth, rtdb } from './firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { ref, onValue, set } from 'firebase/database'
import { classroomConfig } from './classroomConfig'
import { mapData } from './mapData'

function App() {
  const [user, setUser] = useState(null)
  const [activeZone, setActiveZone] = useState(null)
  const [showSidebar, setShowSidebar] = useState(false)
  const [meetActive, setMeetActive] = useState(false)
  const [isJoinedMeet, setIsJoinedMeet] = useState(false)
  const meetWindowRef = useRef(null)

  const email = user?.email?.toLowerCase() || ''
  const isTeacher = email && classroomConfig.teacherEmails.includes(email)

  // 1. Đồng bộ trạng thái tiết học & Remote Close
  useEffect(() => {
    const meetStatusRef = ref(rtdb, 'world/config/meetStatus')
    const unsub = onValue(meetStatusRef, (snap) => {
      const active = snap.val() || false
      setMeetActive(active)
      
      // Nếu tiết học kết thúc, tự động đóng cửa sổ của mọi người
      if (!active && meetWindowRef.current) {
        handleLeaveMeet()
      }
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u))
    return () => unsub()
  }, [])

  const handleZoneChange = (zoneId) => {
    setActiveZone(prev => (prev === zoneId ? prev : zoneId))
  }

  const handleInteract = (zone) => {
    alert(`Tương tác: ${getZoneDisplay(zone)}`)
  }

  const toggleMeetStatus = () => {
    if (!isTeacher) return
    const meetStatusRef = ref(rtdb, 'world/config/meetStatus')
    const newStatus = !meetActive
    set(meetStatusRef, newStatus)
    if (!newStatus) handleLeaveMeet()
  }

  const handleJoinMeet = () => {
    const roomName = `PixelClassroom_Lop1_2026` 
    const displayName = user?.displayName || user?.email?.split('@')[0] || 'User'
    
    // Thêm config PiP vào URL Jitsi
    const meetUrl = `https://meet.jit.si/${roomName}#config.prejoinPageEnabled=false&config.pips.enabled=true&userInfo.displayName="${displayName}"`
    
    const width = 450
    const height = 550
    const left = window.screen.width - width - 20
    const top = 100
    
    meetWindowRef.current = window.open(
      meetUrl, 
      'JitsiMeetPopup', 
      `width=${width},height=${height},left=${left},top=${top},menubar=no,status=no,toolbar=no,location=no`
    )
    
    setIsJoinedMeet(true)

    const checkWindow = setInterval(() => {
      if (meetWindowRef.current && meetWindowRef.current.closed) {
        setIsJoinedMeet(false)
        meetWindowRef.current = null
        clearInterval(checkWindow)
      }
    }, 1000)
  }

  const handleLeaveMeet = () => {
    if (meetWindowRef.current) {
      meetWindowRef.current.close()
      meetWindowRef.current = null
    }
    setIsJoinedMeet(false)
  }

  // Hàm mang cửa sổ lên phía trước khi cần
  const bringMeetToFront = () => {
    if (meetWindowRef.current && !meetWindowRef.current.closed) {
      meetWindowRef.current.focus()
    }
  }

  const getZoneDisplay = (zoneId) => {
    if (!zoneId) return 'Hành lang'
    const room = mapData.rooms.find(r => r.id === zoneId)
    if (room) return room.name
    const allObjects = mapData.rooms.flatMap(r => r.objects)
    const obj = allObjects.find(o => o.id === zoneId)
    return obj ? (obj.label || obj.id) : zoneId
  }

  const isInClassroom = activeZone === 'classroom_1' || 
                       activeZone === 'board_1' || 
                       activeZone === 'desk_teacher' || 
                       activeZone?.startsWith('desk_student')

  if (!user) return <Auth />

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative', backgroundColor: '#000' }}>
      <Scene
        role={isTeacher ? 'teacher' : 'student'}
        onZoneChange={handleZoneChange}
        onInteract={handleInteract}
      />

      {/* Meet Notification Overlay */}
      {isInClassroom && (
        <div style={{
          position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000,
          background: 'rgba(255, 255, 255, 0.95)', padding: '12px 25px', borderRadius: '50px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: '15px', border: '2px solid #34a853', backdropFilter: 'blur(4px)'
        }}>
          <div style={{ 
            width: '12px', height: '12px', borderRadius: '50%', 
            background: meetActive ? '#34a853' : '#ea4335', 
            animation: meetActive ? 'pulse 2s infinite' : 'none' 
          }} />
          <span style={{ fontWeight: 'bold', color: '#1a1a1a', fontSize: '14px' }}>
            {meetActive ? 'Tiết học đang diễn ra' : 'Phòng học đang trống'}
          </span>
          
          {meetActive && !isJoinedMeet && (
            <button 
              onClick={handleJoinMeet}
              style={{ padding: '8px 20px', background: '#34a853', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Vào học (Video)
            </button>
          )}

          {isJoinedMeet && (
            <>
              <button 
                onClick={bringMeetToFront}
                style={{ padding: '8px 20px', background: '#4285f4', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Hiện Video ↗
              </button>
              <button 
                onClick={handleLeaveMeet}
                style={{ padding: '8px 20px', background: '#ea4335', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Rời lớp
              </button>
            </>
          )}

          {isTeacher && (
            <button 
              onClick={toggleMeetStatus}
              style={{ padding: '8px 20px', background: meetActive ? '#ea4335' : '#4285f4', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              {meetActive ? 'Kết thúc tiết' : 'Bắt đầu tiết'}
            </button>
          )}
        </div>
      )}

      {/* Sidebar UI */}
      <div 
        onMouseEnter={() => setShowSidebar(true)} onMouseLeave={() => setShowSidebar(false)}
        style={{ position: 'fixed', left: 0, top: 0, height: '100%', width: '300px',
          transform: showSidebar ? 'translateX(0)' : 'translateX(-280px)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)', zIndex: 100, display: 'flex'
        }}
      >
        <div style={{ flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.98)', boxShadow: '5px 0 25px rgba(0,0,0,0.15)', padding: '25px', display: 'flex', flexDirection: 'column', borderRight: '5px solid #7a5b3a' }}>
          <h2 style={{ margin: '0 0 25px 0', fontSize: '22px', color: '#7a5b3a' }}>🏫 Pixel Classroom</h2>
          <div style={{ marginBottom: '25px', padding: '15px', background: '#f8f9fa', borderRadius: '12px' }}>
            <div style={{ fontSize: '13px', color: '#666', fontWeight: 'bold' }}>Người dùng</div>
            <div style={{ fontWeight: '500' }}>{user.email}</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '12px', fontSize: '12px' }}>
              <strong>Mẹo Video Call:</strong><br />
              - Bấm <b>Hiện Video ↗</b> nếu cửa sổ bị ẩn.<br />
              - Chuột phải vào Video, chọn <b>Picture-in-Picture</b> để ghim lên đầu mọi cửa sổ khác.<br />
              - Thầy giáo kết thúc tiết sẽ tự động đóng video của cả lớp.
            </div>
          </div>
          <button onClick={() => signOut(auth)} style={{ width: '100%', padding: '12px', backgroundColor: '#ff4d4f', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Đăng xuất</button>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(52, 168, 83, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(52, 168, 83, 0); }
          100% { box-shadow: 0 0 0 0 rgba(52, 168, 83, 0); }
        }
      `}</style>
    </div>
  )
}

export default App
