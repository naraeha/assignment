import { useEffect, useRef, useState } from 'react'

export function useWebSocket<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5

  useEffect(() => {
    if (!url) return

    const connect = () => {
      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('WebSocket Connected')
        reconnectAttemptsRef.current = 0
        setError(null)
      }

      ws.onmessage = (event) => {
        try {
          const parsedData = JSON.parse(event.data)
          setData(parsedData)
        } catch (e) {
          console.error('Failed to parse WebSocket message', e)
        }
      }

      ws.onerror = (err) => {
        console.error('WebSocket error:', err)
        setError('WebSocket connection error')
      }

      ws.onclose = (event) => {
        console.log(`WebSocket closed: ${event.code}`)
        
        // 재연결 시도
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000)
          console.log(`Reconnecting in ${delay}ms... (attempt ${reconnectAttemptsRef.current})`)
          setTimeout(connect, delay)
        } else {
          setError('Max reconnection attempts reached')
        }
      }
    }

    connect()

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [url])

  return { data, error }
}