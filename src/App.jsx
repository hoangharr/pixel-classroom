import Scene from './components/Scene'
import Auth from './components/Auth'
import { useEffect, useState } from 'react'
import { auth } from './firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { classroomConfig } from './classroomConfig'
import { mapData } from './mapData'

function App() {
  const [user, setUser] = useState(null)
  const [activeZone, setActiveZone] = useState(null)
  const [showSidebar, setShowSidebar] = useState(false)

  const email = user?.email?.toLowerCase() || ''
  const isTeacher = email && classroomConfig.teacherEmails.includes(email)

  const handleZoneChange = (zoneId) => {
    setActiveZone(prev => {
      if (prev === zoneId) return prev
      return zoneId
    })
  }

  const handleInteract = (zone) => {
    alert(`Tương tác: ${getZoneDisplay(zone)}`)
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u))
    return () => unsub()
  }, [])

  const getZoneDisplay = (zoneId) => {
    if (!zoneId) return 'Hành lang'
    const room = mapData.rooms.find(r => r.id === zoneId)
    if (room) return room.name
    const allObjects = mapData.rooms.flatMap(r => r.objects)
    const obj = allObjects.find(o => o.id === zoneId)
    if (obj) return obj.label || obj.id
    return zoneId
  }

  if (!user) return <Auth />

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative', backgroundColor: '#000' }}>
      {/* Game Scene */}
      <Scene
        role={isTeacher ? 'teacher' : 'student'}
        onZoneChange={handleZoneChange}
        onInteract={handleInteract}
      />

      {/* Floating UI Elements */}
      <div 
        onMouseEnter={() => setShowSidebar(true)}
        onMouseLeave={() => setShowSidebar(false)}
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          height: '100%',
          width: '300px',
          transform: showSidebar ? 'translateX(0)' : 'translateX(-280px)',
          transition: 'transform 0.3s ease-in-out',
          zIndex: 100,
          display: 'flex'
        }}
      >
        <div style={{
          flex: 1,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          boxShadow: '2px 0 10px rgba(0,0,0,0.2)',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '4px solid #7a5b3a'
        }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#7a5b3a' }}>Pixel Classroom</h2>
          
          <div style={{ marginBottom: '20px', fontSize: '14px' }}>
            <strong>Người dùng:</strong><br />
            <span style={{ color: '#666' }}>{user.email}</span>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <strong>Vị trí hiện tại:</strong><br />
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#d46b08' }}>
              {getZoneDisplay(activeZone)}
            </span>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '8px', fontSize: '13px' }}>
              <strong>Hướng dẫn:</strong>
              <ul style={{ paddingLeft: '20px', margin: '10px 0' }}>
                <li>Di chuyển: WASD / Mũi tên</li>
                <li>Tương tác: Phím E</li>
              </ul>
            </div>
          </div>

          <button 
            onClick={() => signOut(auth)}
            style={{ 
              width: '100%', 
              padding: '10px', 
              backgroundColor: '#ff4d4f', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Đăng xuất
          </button>
        </div>
        
        {/* Handle to show sidebar */}
        <div style={{ 
          width: '20px', 
          height: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          cursor: 'pointer'
        }}>
          <div style={{ 
            width: '4px', 
            height: '40px', 
            backgroundColor: 'rgba(255,255,255,0.5)', 
            borderRadius: '2px' 
          }} />
        </div>
      </div>
    </div>
  )
}

export default App
