import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { login } from '../api'
import { useAuthStore } from '../store/authStore'
import '../styles/Login.css'

export default function Login() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const setToken = useAuthStore((state) => state.setToken)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await login(email, password)
      setToken(data.access_token)
      navigate('/dashboard')
    } catch (e) {
      setError(t('login.error'))
    } finally {
      setLoading(false)
    }
  }

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ko' ? 'en' : 'ko'
    i18n.changeLanguage(newLang)
    localStorage.setItem('language', newLang)
  }

  return (
    <div className="login-container">
      <button onClick={toggleLanguage} className="language-button">
        {i18n.language === 'ko' ? 'EN' : 'KO'}
      </button>

      <div className="login-box">
        <h1 className="login-title">{t('login.title')}</h1>

        <input
          type="email"
          placeholder={t('login.email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="login-input"
        />
        <input
          type="password"
          placeholder={t('login.password')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="login-input"
        />

        {error && <p className="error-message">{error}</p>}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="login-button"
        >
          {loading ? t('common.loading') : t('login.button')}
        </button>
      </div>
    </div>
  )
}