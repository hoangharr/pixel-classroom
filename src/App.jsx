import Scene from './components/Scene'
import Auth from './components/Auth'
import Dictionary from './components/Dictionary'
import GrammarBank from './components/GrammarBank'
import AttendanceList from './components/AttendanceList'
import { useEffect, useState, useRef } from 'react'
import { auth, rtdb } from './firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { ref, onValue, set, get, remove } from 'firebase/database'
import { classroomConfig } from './classroomConfig'
import { mapData } from './mapData'

function App() {
  const [user, setUser] = useState(null)
  const [activeZone, setActiveZone] = useState(null)
  const [showSidebar, setShowSidebar] = useState(false)
  const [meetActive, setMeetActive] = useState(false)
  const [isJoinedMeet, setIsJoinedMeet] = useState(false)
  const [showDictionary, setShowDictionary] = useState(false)
  const [showGrammar, setShowGrammar] = useState(false)
  const [showAttendance, setShowAttendance] = useState(false)
  const [attendanceData, setAttendanceData] = useState({})
  const [unlockedLessons, setUnlockedLessons] = useState({})
  const [teacherNotification, setTeacherNotification] = useState(null)
  const [mySeatId, setMySeatId] = useState(null)
  const meetWindowRef = useRef(null)

  const email = user?.email?.toLowerCase() || ''
  const isTeacher = email && classroomConfig.teacherEmails.includes(email)

  useEffect(() => {
    if (!user) return
    onValue(ref(rtdb, 'world/config/meetStatus'), (snap) => {
      const active = snap.val() || false
      setMeetActive(active)
      if (!active && meetWindowRef.current) handleLeaveMeet()
    })
    onValue(ref(rtdb, 'world/attendance'), (snap) => setAttendanceData(snap.val() || {}))
    onValue(ref(rtdb, 'world/config/unlockedLessons'), (snap) => setUnlockedLessons(snap.val() || {}))
    onValue(ref(rtdb, 'world/seats'), (snap) => {
      const data = snap.val() || {}
      const found = Object.keys(data).find(id => data[id].uid === user.uid)
      setMySeatId(found || null)
    })
    onValue(ref(rtdb, 'world/events/teacherArrival'), (snap) => {
      const data = snap.val()
      if (data && !isTeacher && Date.now() - data.ts < 5000) {
        setTeacherNotification(`Thầy giáo ${data.email.split('@')[0]} đã vào lớp!`)
        setTimeout(() => setTeacherNotification(null), 5000)
      }
    })
  }, [user, isTeacher])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u))
    return () => unsub()
  }, [])

  const handleZoneChange = (zoneId) => setActiveZone(prev => (prev === zoneId ? prev : zoneId))

  const handleInteract = (zoneId) => {
    if (zoneId === 'table_reading') setShowDictionary(true)
    else if (zoneId === 'bookshelf_1') setShowGrammar(true)
    else if (zoneId === 'board_1') setShowAttendance(true)
    else if (zoneId.startsWith('seat_')) { if (!isTeacher) handleSitDown(zoneId) }
    else if (zoneId === 'desk_teacher' && isTeacher) handleTeacherArrival()
  }

  const handleSitDown = async (seatId) => {
    if (mySeatId) {
      if (mySeatId === seatId) alert("Bạn đang ngồi đây rồi!")
      else alert("Bạn đã ngồi ở một ghế khác!")
      return
    }
    const seatRef = ref(rtdb, `world/seats/${seatId}`)
    const snap = await get(seatRef)
    if (snap.exists()) { alert("Ghế đã có người ngồi!"); return }
    set(seatRef, { uid: user.uid, email: user.email, ts: Date.now() })
    set(ref(rtdb, `world/attendance/${user.uid}`), { email: user.email, ts: Date.now() })
  }

  const handleTeacherArrival = () => {
    set(ref(rtdb, 'world/events/teacherArrival'), { email: user.email, ts: Date.now() })
    alert("Đã thông báo tới học sinh!")
  }

  const handleEndClass = async () => {
    if (!isTeacher) return
    if (!window.confirm("Kết thúc tiết học và xuất báo cáo?")) return
    const attendance = (await get(ref(rtdb, 'world/attendance'))).val() || {}
    const lessons = (await get(ref(rtdb, 'world/config/unlockedLessons'))).val() || {}
    const report = { teacher: user.email, endTime: new Date().toLocaleString(), studentCount: Object.keys(attendance).length, attendanceList: attendance, lessonsLearned: lessons }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2))
    const dl = document.createElement('a'); dl.setAttribute("href", dataStr); dl.setAttribute("download", `BaoCao.json`); dl.click(); dl.remove()
    await remove(ref(rtdb, 'world/attendance')); await remove(ref(rtdb, 'world/seats')); await remove(ref(rtdb, 'world/events'))
    await set(ref(rtdb, 'world/config/meetStatus'), false); await remove(ref(rtdb, 'world/config/unlockedLessons'))
  }

  const toggleMeetStatus = () => {
    if (!isTeacher) return
    if (meetActive) handleEndClass()
    else set(ref(rtdb, 'world/config/meetStatus'), true)
  }

  const handleJoinMeet = () => {
    const roomName = `PixelClassroom_Lop1_2026` 
    const displayName = user?.displayName || user?.email?.split('@')[0] || 'User'
    const meetUrl = `https://meet.jit.si/${roomName}#config.prejoinPageEnabled=false&config.pips.enabled=true&userInfo.displayName="${displayName}"`
    meetWindowRef.current = window.open(meetUrl, 'JitsiMeetPopup', `width=450,height=550,left=${window.screen.width - 470},top=100,menubar=no,status=no,toolbar=no,location=no`)
    setIsJoinedMeet(true)
    const checkWindow = setInterval(() => { if (meetWindowRef.current && meetWindowRef.current.closed) { setIsJoinedMeet(false); meetWindowRef.current = null; clearInterval(checkWindow) } }, 1000)
  }

  const handleLeaveMeet = () => { if (meetWindowRef.current) { meetWindowRef.current.close(); meetWindowRef.current = null }; setIsJoinedMeet(false) }
  const bringMeetToFront = () => { if (meetWindowRef.current && !meetWindowRef.current.closed) meetWindowRef.current.focus() }

  // --- HÀM LOGOUT MỚI: DỌN DẸP TRƯỚC KHI THOÁT ---
  const handleLogout = async () => {
    if (!user) return
    try {
      // 1. Giải phóng ghế đang ngồi
      if (mySeatId) {
        await remove(ref(rtdb, `world/seats/${mySeatId}`))
      }
      // 2. Xóa dữ liệu nhân vật
      await remove(ref(rtdb, `world/players/${user.uid}`))
      // 3. Đóng cửa sổ Meet nếu còn mở
      handleLeaveMeet()
      // 4. Thực hiện đăng xuất chính thức
      await signOut(auth)
    } catch (err) {
      console.error("Lỗi khi đăng xuất:", err)
      await signOut(auth) // Vẫn cho thoát nếu có lỗi
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

  const getInteractionHint = () => {
    if (!activeZone || showDictionary || showGrammar || showAttendance) return null
    if (mapData.rooms.some(r => r.id === activeZone)) return null
    if (activeZone === 'table_reading') return 'tra Từ điển'
    if (activeZone === 'bookshelf_1') return 'xem Ngữ pháp'
    if (activeZone === 'board_1') return 'xem Điểm danh'
    if (activeZone.startsWith('seat_')) return isTeacher ? null : (mySeatId === activeZone ? 'vị trí của bạn' : 'ngồi xuống & Điểm danh')
    if (activeZone === 'desk_teacher' && isTeacher) return 'thông báo vào lớp'
    return 'tương tác'
  }

  const hintText = getInteractionHint()
  const isInClassroom = activeZone === 'classroom_1' || activeZone === 'board_1' || activeZone === 'desk_teacher' || activeZone?.startsWith('desk_student') || activeZone?.startsWith('seat_')

  if (!user) return <Auth />

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative', backgroundColor: '#000' }}>
      <Scene role={isTeacher ? 'teacher' : 'student'} onZoneChange={handleZoneChange} onInteract={handleInteract} />

      {showDictionary && <Dictionary onClose={() => setShowDictionary(false)} />}
      {showGrammar && <GrammarBank isTeacher={isTeacher} unlockedLessons={unlockedLessons} onClose={() => setShowGrammar(false)} />}
      {showAttendance && <AttendanceList attendance={attendanceData} onClose={() => setShowAttendance(false)} />}

      {teacherNotification && (
        <div style={{ position: 'fixed', top: '100px', left: '50%', transform: 'translateX(-50%)', background: '#d32f2f', color: 'white', padding: '15px 40px', borderRadius: '10px', fontWeight: 'bold', zIndex: 5000, boxShadow: '0 10px 30px rgba(0,0,0,0.5)', animation: 'slideDown 0.5s ease' }}>
          🔔 {teacherNotification}
        </div>
      )}

      {isInClassroom && (
        <div style={{
          position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000,
          background: 'rgba(255, 255, 255, 0.95)', padding: '12px 25px', borderRadius: '50px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: '15px', border: '2px solid #34a853', backdropFilter: 'blur(4px)'
        }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: meetActive ? '#34a853' : '#ea4335', animation: meetActive ? 'pulse 2s infinite' : 'none' }} />
          <span style={{ fontWeight: 'bold', color: '#1a1a1a', fontSize: '14px' }}>{meetActive ? 'Tiết học đang diễn ra' : 'Phòng học đang trống'}</span>
          {meetActive && !isJoinedMeet && <button onClick={handleJoinMeet} style={{ padding: '8px 20px', background: '#34a853', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>Vào học (Video)</button>}
          {isJoinedMeet && (
            <>
              <button onClick={bringMeetToFront} style={{ padding: '8px 20px', background: '#4285f4', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>Hiện Video ↗</button>
              <button onClick={handleLeaveMeet} style={{ padding: '8px 20px', background: '#ea4335', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>Rời lớp</button>
            </>
          )}
          {isTeacher && <button onClick={toggleMeetStatus} style={{ padding: '8px 20px', background: meetActive ? '#ea4335' : '#4285f4', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>{meetActive ? 'Kết thúc & Xuất báo cáo' : 'Bắt đầu tiết'}</button>}
        </div>
      )}

      {hintText && (
        <div style={{ position: 'fixed', bottom: '50px', left: '50%', transform: 'translateX(-50%)', zIndex: 2000, background: 'rgba(0,0,0,0.85)', color: 'white', padding: '15px 35px', borderRadius: '15px', fontWeight: 'bold', animation: 'bounce 2s infinite', border: '2px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: '12px', pointerEvents: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
          <div style={{ background: '#fff', color: '#000', width: '28px', height: '28px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', borderBottom: '4px solid #ccc' }}>E</div>
          <span style={{ fontSize: '16px', letterSpacing: '0.5px' }}>Nhấn để {hintText}</span>
        </div>
      )}

      <div style={{ position: 'fixed', left: 0, top: 0, height: '100%', width: '365px', transform: showSidebar ? 'translateX(0)' : 'translateX(-320px)', transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)', zIndex: 10000, display: 'flex' }}>
        <div style={{ width: '320px', height: '100%', backgroundColor: 'rgba(20, 20, 20, 0.95)', boxShadow: '10px 0 50px rgba(0,0,0,0.5)', padding: '30px', display: 'flex', flexDirection: 'column', color: '#fff', backdropFilter: 'blur(15px)', borderRight: '1px solid rgba(255,255,255,0.1)', boxSizing: 'border-box' }}>
          <h2 style={{ margin: '0 0 30px 0', fontSize: '24px', color: '#fff', display: 'flex', alignItems: 'center', gap: '12px' }}><span>🏫</span> PIXEL CLASS</h2>
          <div style={{ marginBottom: '30px', padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '11px', color: '#aaa', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '10px' }}>Tài khoản</div>
            <div style={{ fontWeight: 'bold', fontSize: '15px', wordBreak: 'break-all' }}>{user.email}</div>
            <div style={{ marginTop: '10px', display: 'inline-block', padding: '4px 12px', background: isTeacher ? '#ff4d4f' : '#1890ff', color: '#fff', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>{isTeacher ? 'GIÁO VIÊN' : 'HỌC SINH'}</div>
          </div>
          <div style={{ marginBottom: '30px', padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '11px', color: '#aaa', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '5px' }}>Vị trí hiện tại</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fbc02d' }}>{getZoneDisplay(activeZone)}</div>
          </div>
          <button 
            onClick={handleLogout} 
            style={{ width: '100%', padding: '15px', background: 'transparent', color: '#ff4d4f', border: '2px solid #ff4d4f', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.3s ease' }} 
            onMouseOver={(e) => { e.target.style.background = '#ff4d4f'; e.target.style.color = '#fff' }} 
            onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#ff4d4f' }}
          >
            Đăng xuất
          </button>
        </div>
        <div onClick={() => setShowSidebar(!showSidebar)} style={{ width: '45px', height: '100px', alignSelf: 'center', backgroundColor: 'rgba(20, 20, 20, 0.95)', backdropFilter: 'blur(15px)', borderRadius: '0 25px 25px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '8px 0 20px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderLeft: 'none', marginLeft: '-1px' }}>
          <div style={{ width: '12px', height: '12px', borderTop: '3px solid #fff', borderRight: '3px solid #fff', transform: showSidebar ? 'rotate(-135deg)' : 'rotate(45deg)', transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)', marginLeft: showSidebar ? '6px' : '-4px' }} />
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(52, 168, 83, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(52, 168, 83, 0); } 100% { box-shadow: 0 0 0 0 rgba(52, 168, 83, 0); } }
        @keyframes bounce { 0%, 20%, 50%, 80%, 100% {transform: translateX(-50%) translateY(0);} 40% {transform: translateX(-50%) translateY(-10px);} 60% {transform: translateX(-50%) translateY(-5px);} }
        @keyframes slideDown { from { transform: translate(-50%, -50px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
      `}</style>
    </div>
  )
}

export default App
