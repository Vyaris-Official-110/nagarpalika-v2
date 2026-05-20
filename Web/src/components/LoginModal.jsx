import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login as apiLogin } from '../api/otr'
import { useCandidateAuth } from '../context/CandidateAuthContext'

export default function LoginModal({ onClose }) {
  const navigate = useNavigate()
  const { login } = useCandidateAuth()
  const [tab, setTab] = useState('regid') // 'regid' | 'aadhaar'
  const [registrationId, setRegistrationId] = useState('')
  const [aadhaar, setAadhaar] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = tab === 'aadhaar'
        ? { aadhaar, password }
        : { registrationId, password }
      const res = await apiLogin(payload)
      login(res.data.data)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  function handleForgotPassword() {
    onClose()
    navigate('/otr/password/reset')
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ background: '#fff', width: 380, maxWidth: '95vw' }}>
        <div className="box-title" style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ flex: 1 }}>Candidate Login</span>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer' }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="box-body">
          <div style={{ display: 'flex', borderBottom: '2px solid var(--ojas-line)', marginBottom: 16 }}>
            <button
              type="button"
              onClick={() => { setTab('regid'); setError('') }}
              style={{
                flex: 1, padding: '8px 0', background: 'none', border: 'none', cursor: 'pointer',
                fontWeight: tab === 'regid' ? 700 : 400,
                borderBottom: tab === 'regid' ? '2px solid var(--ojas-saffron-deep)' : 'none',
                marginBottom: -2,
              }}
            >
              Registration ID
            </button>
            <button
              type="button"
              onClick={() => { setTab('aadhaar'); setError('') }}
              style={{
                flex: 1, padding: '8px 0', background: 'none', border: 'none', cursor: 'pointer',
                fontWeight: tab === 'aadhaar' ? 700 : 400,
                borderBottom: tab === 'aadhaar' ? '2px solid var(--ojas-saffron-deep)' : 'none',
                marginBottom: -2,
              }}
            >
              Aadhaar
            </button>
          </div>

          {error && <div className="notice warn" style={{ marginBottom: 12 }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            {tab === 'regid' && (
              <div className="form-field" style={{ marginBottom: 12 }}>
                <label>Registration ID <span style={{ color: 'var(--ojas-red)' }}>*</span></label>
                <input
                  type="text"
                  value={registrationId}
                  onChange={e => setRegistrationId(e.target.value.toUpperCase())}
                  placeholder="RP-PATAN-2025-0000001"
                  required
                />
              </div>
            )}
            {tab === 'aadhaar' && (
              <div className="form-field" style={{ marginBottom: 12 }}>
                <label>Aadhaar Number <span style={{ color: 'var(--ojas-red)' }}>*</span></label>
                <input
                  type="text"
                  value={aadhaar}
                  onChange={e => setAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12))}
                  placeholder="12-digit Aadhaar"
                  maxLength={12}
                  required
                />
              </div>
            )}
            <div className="form-field" style={{ marginBottom: 16 }}>
              <label>Password <span style={{ color: 'var(--ojas-red)' }}>*</span></label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Logging in…' : 'Login'}
              </button>
              <a href="/otr/find" style={{ fontSize: 12 }}>Forgot Registration ID?</a>
              <button
                type="button"
                onClick={handleForgotPassword}
                style={{ background: 'none', border: 'none', color: 'var(--ojas-saffron-deep)', fontSize: 12, cursor: 'pointer', padding: 0 }}
              >
                Forgot Password?
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
