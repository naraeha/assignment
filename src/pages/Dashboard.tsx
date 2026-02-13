import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../store/authStore'
import { useWebSocket } from '../hooks/useWebSocket'
import { getPens } from '../api'
import '../styles/Dashboard.css'

interface AbnormalPig {
  wid: number
  thumbnail_url: string
  activity: number
  feeding_time: number
}

interface Pen {
  pen_id: string
  pen_name: string
  current_pig_count: number
  avg_activity_level: number
  avg_feeding_time_minutes: number
  avg_temperature_celsius: number
  abnormal_pigs: AbnormalPig[]
}

interface Piggery {
  piggery_id: string
  piggery_name: string
  total_pigs: number
  pens: Pen[]
}

interface PensData {
  piggeies: Piggery[]
}

export default function Dashboard() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { token, logout } = useAuthStore()
  const [pensData, setPensData] = useState<PensData | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedPens, setExpandedPens] = useState<Set<string>>(new Set())

  // WebSocket 실시간 데이터
  const wsUrl = token 
    ? `${import.meta.env.VITE_WS_BASE_URL}/ws/pens?token=${token}`
    : null
  const { data: wsData, error: wsError } = useWebSocket<PensData>(wsUrl)

  // 초기 데이터 로드
  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }

    const fetchData = async () => {
      try {
        const data = await getPens(token)
        setPensData(data)
      } catch (e) {
        console.error('Failed to fetch pens:', e)
        setPensData({ piggeies: [] })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token, navigate])

  // WebSocket 데이터로 업데이트
  useEffect(() => {
    if (wsData) {
      setPensData(wsData)
    }
  }, [wsData])

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ko' ? 'en' : 'ko'
    i18n.changeLanguage(newLang)
    localStorage.setItem('language', newLang)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handlePenClick = (penId: string) => {
    navigate(`/detail/${penId}`)
  }

  const togglePenExpand = (penId: string) => {
    setExpandedPens(prev => {
      const newSet = new Set(prev)
      if (newSet.has(penId)) {
        newSet.delete(penId)
      } else {
        newSet.add(penId)
      }
      return newSet
    })
  }

  if (loading) {
    return <div className="dashboard-container" style={{ textAlign: 'center', marginTop: 50 }}>{t('common.loading')}</div>
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">{t('dashboard.title')}</h1>
        <div className="dashboard-buttons">
          <button onClick={toggleLanguage}>
            {i18n.language === 'ko' ? 'EN' : 'KO'}
          </button>
          <button onClick={handleLogout}>{t('common.logout')}</button>
        </div>
      </div>

      {wsError && <div className="ws-error">WebSocket: {wsError}</div>}

      {pensData?.piggeies.map((piggery) => (
        <div key={piggery.piggery_id} className="piggery-section">
          <h2 className="piggery-title">{piggery.piggery_name} ({piggery.total_pigs} {t('dashboard.pigs')})</h2>
          
          <div className="pens-grid">
            {piggery.pens.map((pen) => {
              const isExpanded = expandedPens.has(pen.pen_id)
              
              return (
                <div key={pen.pen_id} className="pen-card">
                  <div className="pen-header" onClick={() => handlePenClick(pen.pen_id)}>
                    <h3>{pen.pen_name}</h3>
                    <p>{pen.current_pig_count} {t('dashboard.pigs')}</p>
                    <p>{t('dashboard.activity')}: {pen.avg_activity_level.toFixed(1)}</p>
                    <p>{t('dashboard.feeding')}: {pen.avg_feeding_time_minutes.toFixed(1)}min</p>
                    <p>{t('dashboard.temperature')}: {pen.avg_temperature_celsius.toFixed(1)}°C</p>
                  </div>
                  
                  {pen.abnormal_pigs.length > 0 && (
                    <div className="abnormal-section">
                      <div 
                        className="abnormal-toggle"
                        onClick={() => togglePenExpand(pen.pen_id)}
                      >
                        {t('dashboard.abnormal')}: {pen.abnormal_pigs.length} {isExpanded ? '▲' : '▼'}
                      </div>
                      
                      {isExpanded && (
                        <div className="abnormal-list">
                          {pen.abnormal_pigs.map((pig) => (
                            <div key={pig.wid} className="abnormal-pig">
                              <img 
                                src={pig.thumbnail_url} 
                                alt={`Pig ${pig.wid}`}
                                onError={(e) => {
                                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60"%3E%3Crect fill="%23ddd" width="60" height="60"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E'
                                }}
                              />
                              <div className="abnormal-pig-info">
                                <div><strong>ID:</strong> {pig.wid}</div>
                                <div><strong>{t('dashboard.activity')}:</strong> {pig.activity}</div>
                                <div><strong>{t('dashboard.feeding')}:</strong> {pig.feeding_time}min</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}