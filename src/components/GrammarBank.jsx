import React, { useState } from 'react'
import { GRAMMAR_DATA } from '../grammarData'
import { rtdb } from '../firebase'
import { ref, set } from 'firebase/database'

export default function GrammarBank({ isTeacher, unlockedLessons, onClose }) {
  const [selectedTopic, setSelectedTopic] = useState(null)

  // Đóng bằng phím Escape
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  const toggleLesson = (lessonId) => {
    if (!isTeacher) return
    const lessonRef = ref(rtdb, `world/config/unlockedLessons/${lessonId}`)
    set(lessonRef, !unlockedLessons[lessonId])
  }

  // Lọc danh sách: Thầy giáo thấy hết, Học sinh chỉ thấy bài đã unlock
  const visibleLessons = isTeacher 
    ? GRAMMAR_DATA 
    : GRAMMAR_DATA.filter(lesson => unlockedLessons[lesson.id])

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 3000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)'
    }}>
      <div style={{
        background: 'white', width: '700px', height: '80vh', borderRadius: '24px',
        display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 30px 70px rgba(0,0,0,0.6)'
      }}>
        {/* Header */}
        <div style={{ background: '#1b5e20', padding: '20px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: 'white' }}>
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span>📚</span> THƯ VIỆN NGỮ PHÁP
            </h2>
            {isTeacher && <small style={{ opacity: 0.8 }}>Chế độ Giáo viên: Bật/tắt bài học cho học sinh</small>}
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', color: 'white', fontWeight: 'bold' }}>×</button>
        </div>

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Sidebar */}
          <div style={{ width: '250px', background: '#f1f8e9', borderRight: '1px solid #c5e1a5', overflowY: 'auto', padding: '15px' }}>
            {visibleLessons.length > 0 ? visibleLessons.map(topic => (
              <div key={topic.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                {isTeacher && (
                  <input 
                    type="checkbox" 
                    checked={!!unlockedLessons[topic.id]} 
                    onChange={() => toggleLesson(topic.id)}
                    style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                  />
                )}
                <div
                  onClick={() => setSelectedTopic(topic)}
                  style={{
                    flex: 1, padding: '12px', borderRadius: '10px', cursor: 'pointer',
                    fontSize: '14px', fontWeight: '500', transition: 'all 0.2s',
                    background: selectedTopic?.id === topic.id ? '#33691e' : 'transparent',
                    color: selectedTopic?.id === topic.id ? 'white' : '#333',
                    opacity: isTeacher && !unlockedLessons[topic.id] ? 0.5 : 1
                  }}
                >
                  {topic.title} {isTeacher && !unlockedLessons[topic.id] && '🔒'}
                </div>
              </div>
            )) : (
              <div style={{ padding: '20px', color: '#888', textAlign: 'center', fontSize: '14px' }}>
                Chưa có bài học nào được mở khóa.
              </div>
            )}
          </div>

          {/* Content */}
          <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
            {selectedTopic ? (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h1 style={{ color: '#1b5e20', marginTop: 0, fontSize: '28px' }}>{selectedTopic.title}</h1>
                </div>
                <hr style={{ border: 'none', height: '2px', background: '#e8f5e9', margin: '20px 0' }} />
                <div style={{ lineHeight: '1.8', color: '#333', fontSize: '17px', whiteSpace: 'pre-wrap' }}>
                  {selectedTopic.content}
                </div>
              </div>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', flexDirection: 'column', gap: '20px' }}>
                <span style={{ fontSize: '60px' }}>📖</span>
                <span style={{ fontSize: '18px' }}>Chọn một bài học để bắt đầu</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{` @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } `}</style>
    </div>
  )
}
