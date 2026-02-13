import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

const api = axios.create({
  baseURL: BASE_URL,
})

// 로그인
export const login = async (username: string, password: string) => {
  const formData = new URLSearchParams()
  formData.append('username', username)
  formData.append('password', password)

  const response = await api.post('/auth/login', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  return response.data
}

// 돈사 목록 조회
export const getPens = async (token: string) => {
  const response = await api.get('/pens', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

// 돈사 상세 조회
export const getPenDetail = async (token: string, penId: string) => {
  const id = penId.replace('room_', '')
  const response = await api.get(`/pens/${id}/detail`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}
