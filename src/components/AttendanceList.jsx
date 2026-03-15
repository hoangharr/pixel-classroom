import React from 'react'

export default function AttendanceList({ attendance, onClose }) {
  const list = Object.values(attendance || {})

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 3000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)'
    }}>
      <div style={{
        background: '#fff', width: '450px', borderRadius: '24px', overflow: 'hidden',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column'
      }}>
        <div style={{ background: '#2e7d32', padding: '25px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>📋 DANH SÁCH ĐIỂM DANH</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer' }}>×</button>
        </div>
        
        <div style={{ padding: '20px', maxHeight: '400px', overflowY: 'auto' }}>
          {list.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left', color: '#666', fontSize: '14px' }}>
                  <th style={{ padding: '10px' }}>Email</th>
                  <th style={{ padding: '10px' }}>Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {list.map((item, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ padding: '12px 10px', fontWeight: 'bold' }}>{item.email}</td>
                    <td style={{ padding: '12px 10px', color: '#888', fontSize: '13px' }}>
                      {new Date(item.ts).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>Chưa có ai điểm danh</div>
          )}
        </div>
        
        <div style={{ padding: '20px', background: '#f9f9f9', textAlign: 'center', fontSize: '13px', color: '#666' }}>
          Tổng số: <b>{list.length}</b> học sinh
        </div>
      </div>
    </div>
  )
}
