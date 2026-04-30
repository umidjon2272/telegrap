import { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import styles from './Auth.module.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function Register() {
  const { login } = useAuth()
  const [form, setForm] = useState({ username: '', phone: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await axios.post(`${API}/api/auth/register`, form)
      login(res.data.user, res.data.token)
    } catch (err) {
      setError(err.response?.data?.message || 'Xato yuz berdi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.bg}>
        <div className={styles.blob1} />
        <div className={styles.blob2} />
      </div>
      <div className={styles.card}>
        <div className={styles.logo}>💬</div>
        <h1 className={styles.title}>Ro'yxatdan o'tish</h1>
        <p className={styles.sub}>Yangi akkaunt yarating</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Username</label>
            <input
              type="text"
              placeholder="masalan: alibek99"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              required
              minLength={3}
            />
          </div>
          <div className={styles.field}>
            <label>Telefon raqam</label>
            <input
              type="text"
              placeholder="+998901234567"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              required
            />
          </div>
          <div className={styles.field}>
            <label>Parol</label>
            <input
              type="password"
              placeholder="kamida 6 ta belgi"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.btn} disabled={loading}>
            {loading ? 'Yaratilmoqda...' : "Ro'yxatdan o'tish →"}
          </button>
        </form>

        <p className={styles.link}>
          Akkaunt bormi? <Link to="/login">Kiring</Link>
        </p>
      </div>
    </div>
  )
}
