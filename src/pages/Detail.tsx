import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useAuthStore } from '../store/authStore'
import { useWebSocket } from '../hooks/useWebSocket'
import { getPenDetail } from '../api'
import '../styles/Detail.css'

interface TimeSeriesData {
  activity: number
  feeding_time: number
}

interface DetailData {
  id: number
  name: string
  time_series: TimeSeriesData[]
}

interface WSMessage {
  pen_id: string
  timestamp: string
  data: {
    activity: number
    feeding_time: number
  }
}

export default function Detail() {
  const { penId } = useParams<{ penId: string }>()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const { token } = useAuthStore()
  
  const [detailData, setDetailData] = useState<DetailData | null>(null)
  const [chartData, setChartData] = useState<TimeSeriesData[]>([])
  const [loading, setLoading] = useState(true)

  // WebSocket 실시간 데이터
  const wsUrl = token && penId
    ? `${import.meta.env.VITE_WS_BASE_URL}/ws/pens/${penId.replace('room_', '')}?token=${token}`
    : null
  const { data: wsData } = useWebSocket<WSMessage>(wsUrl)

  // 초기 데이터 로드
  useEffect(() => {
    if (!token || !penId) {
      navigate('/login')
      return
    }

    const fetchData = async () => {
      try {
        const data = await getPenDetail(token, penId)
        setDetailData(data)
        setChartData(data.time_series)
      } catch (error) {
        console.error('Failed to fetch detail:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token, penId, navigate])

  // WebSocket 데이터로 실시간 업데이트
  useEffect(() => {
    if (wsData) {
      setChartData((prev) => {
        const newData = [...prev, wsData.data]
        if (newData.length > 20) {
          return newData.slice(1)
        }
        return newData
      })
    }
  }, [wsData])

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ko' ? 'en' : 'ko'
    i18n.changeLanguage(newLang)
    localStorage.setItem('language', newLang)
  }

  if (loading) {
    return <div className="detail-container"><div className="loading-message">{t('common.loading')}</div></div>
  }

  return (
    <div className="detail-container">
      <div className="detail-header">
        <div className="detail-header-left">
          <button onClick={() => navigate('/dashboard')} className="back-button">
            ← {t('detail.back')}
          </button>
          <h1 className="detail-title">{detailData?.name}</h1>
        </div>
        <button onClick={toggleLanguage} className="language-btn">
          {i18n.language === 'ko' ? 'EN' : 'KO'}
        </button>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" label={{ value: 'Time', position: 'insideBottom', offset: -5 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="activity" 
              stroke="#8884d8" 
              name={t('detail.activity')}
              isAnimationActive={false}
            />
            <Line 
              type="monotone" 
              dataKey="feeding_time" 
              stroke="#82ca9d" 
              name={t('detail.feeding')}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}