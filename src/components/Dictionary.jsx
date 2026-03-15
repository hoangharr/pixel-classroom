import React, { useState, useEffect } from 'react'

export default function Dictionary({ onClose }) {
  const [word, setWord] = useState('')
  const [result, setResult] = useState(null)
  const [translation, setTranslation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Đóng bằng phím Escape
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  const searchWord = async (e) => {
    e.preventDefault()
    if (!word.trim()) return

    setLoading(true)
    setError(null)
    setResult(null)
    setTranslation(null)

    try {
      const isVietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(word)
      const sl = isVietnamese ? 'vi' : 'en'
      const tl = isVietnamese ? 'en' : 'vi'

      // 1. Lấy bản dịch cực chuẩn từ Google Translate (Gtx)
      const transRes = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(word)}`)
      const transData = await transRes.json()
      const translatedText = transData[0][0][0]
      setTranslation(translatedText)

      // 2. Lấy định nghĩa Anh-Anh chi tiết (Nếu có thể)
      const englishWord = isVietnamese ? translatedText : word
      const dictRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${englishWord.toLowerCase()}`)
      if (dictRes.ok) {
        const dictData = await dictRes.json()
        setResult(dictData[0])
      }
    } catch (err) {
      setError('Không thể kết nối dữ liệu. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const playAudio = () => {
    const audioSrc = result?.phonetics?.find(p => p.audio)?.audio
    if (audioSrc) {
      const audio = new Audio(audioSrc)
      audio.play()
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 3000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)'
    }}>
      <div style={{
        background: 'white', width: '550px', maxHeight: '85vh', borderRadius: '24px',
        display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 30px 70px rgba(0,0,0,0.6)'
      }}>
        <div style={{ background: '#33691e', padding: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '20px' }}>
            <span>📖</span> TỪ ĐIỂN SONG NGỮ
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>[ESC] để thoát</span>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', color: 'white', fontWeight: 'bold' }}>×</button>
          </div>
        </div>

        <form onSubmit={searchWord} style={{ padding: '25px', display: 'flex', gap: '12px', background: '#f1f8e9' }}>
          <input
            autoFocus
            type="text"
            placeholder="Gõ tiếng Anh hoặc tiếng Việt..."
            value={word}
            onChange={(e) => setWord(e.target.value)}
            style={{ flex: 1, padding: '15px 20px', borderRadius: '12px', border: '2px solid #c5e1a5', fontSize: '16px', outline: 'none' }}
          />
          <button type="submit" style={{ padding: '0 30px', background: '#558b2f', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}>Tra cứu</button>
        </form>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 25px 25px 25px' }}>
          {loading && <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>🔍 Đang tra cứu dữ liệu...</div>}
          {error && <div style={{ textAlign: 'center', color: '#d32f2f', padding: '40px', background: '#ffebee', borderRadius: '12px', marginTop: '20px' }}>{error}</div>}
          
          {(translation || result) && (
            <div style={{ animation: 'fadeIn 0.4s ease', marginTop: '20px' }}>
              <div style={{ marginBottom: '25px', padding: '20px', background: '#fff9c4', borderRadius: '16px', borderLeft: '6px solid #fbc02d' }}>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#827717', marginBottom: '8px', textTransform: 'uppercase' }}>Kết quả dịch</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a1a' }}>{translation}</div>
              </div>

              {result && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                    <h1 style={{ margin: 0, fontSize: '28px', color: '#1a1a1a' }}>{result.word}</h1>
                    <button onClick={playAudio} style={{ background: '#e8f5e9', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', fontSize: '20px' }}>🔊</button>
                  </div>
                  <div style={{ color: '#666', fontStyle: 'italic', marginBottom: '20px', fontSize: '16px' }}>{result.phonetic}</div>

                  {result.meanings.map((m, i) => (
                    <div key={i} style={{ marginBottom: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '12px' }}>
                      <div style={{ fontWeight: 'bold', color: '#558b2f', textTransform: 'uppercase', fontSize: '12px', marginBottom: '10px' }}>{m.partOfSpeech}</div>
                      <ul style={{ paddingLeft: '20px', margin: 0 }}>
                        {m.definitions.slice(0, 2).map((d, di) => (
                          <li key={di} style={{ marginBottom: '10px', lineHeight: '1.5' }}>
                            <div style={{ color: '#333' }}>{d.definition}</div>
                            {d.example && <div style={{ color: '#777', fontSize: '14px', marginTop: '5px' }}>Example: "{d.example}"</div>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>
      <style>{` @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } } `}</style>
    </div>
  )
}
