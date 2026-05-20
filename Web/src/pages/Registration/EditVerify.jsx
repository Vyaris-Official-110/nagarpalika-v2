import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { editVerifyAccess, editVerifyAccessOtp } from '../../api/otr'
import { useCandidateAuth } from '../../context/CandidateAuthContext'

export default function EditVerify() {
  const navigate = useNavigate()
  const { refetch } = useCandidateAuth()
  const [mode, setMode] = useState('regid') // 'regid' | 'aadhaar'
  const [form, setForm] = useState({ registrationId: '', dob: '', aadhaar: '' })
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegid(e) {
    e.preventDefault()
    setError('')
    if (!form.registrationId || !form.dob) {
      setError('Registration ID and date of birth are required')
      return
    }
    setLoading(true)
    try {
      await editVerifyAccess({ mode: 'regid', registrationId: form.registrationId, dob: form.dob })
      await refetch()
      navigate('/registration/edit')
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleAadhaarSend(e) {
    e.preventDefault()
    setError('')
    if (!form.aadhaar || !/^\d{12}$/.test(form.aadhaar)) {
      setError('Enter valid 12-digit Aadhaar number')
      return
    }
    setLoading(true)
    try {
      await editVerifyAccess({ mode: 'aadhaar', aadhaar: form.aadhaar })
      setOtpSent(true)
      setOtp('')
    } catch (err) {
      setError(err.response?.data?.message || 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleAadhaarOtp(e) {
    e.preventDefault()
    setError('')
    if (!otp || !/^\d{6}$/.test(otp)) {
      setError('Enter valid 6-digit OTP')
      return
    }
    setLoading(true)
    try {
      await editVerifyAccessOtp({ otp })
      await refetch()
      navigate('/registration/edit')
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="page-heading">
        <h1>Edit Registration — Verify Identity</h1>
        <span className="guj">નોંધણી સુધારો — ઓળખ ચકાસો</span>
      </div>

      <div className="box" style={{ maxWidth: 480, margin: '0 auto' }}>
        <div className="box-title">
          <span>Verify Your Identity</span>
        </div>
        <div className="box-body">
          {error && <div className="notice warn" style={{ marginBottom: 12 }}>{error}</div>}

          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            <button
              type="button"
              className={mode === 'regid' ? 'btn-primary' : 'btn ghost'}
              onClick={() => { setMode('regid'); setError(''); setOtpSent(false) }}
            >
              Registration ID + DOB
            </button>
            <button
              type="button"
              className={mode === 'aadhaar' ? 'btn-primary' : 'btn ghost'}
              onClick={() => { setMode('aadhaar'); setError(''); setOtpSent(false) }}
            >
              Aadhaar + OTP
            </button>
          </div>

          {mode === 'regid' && (
            <form onSubmit={handleRegid}>
              <div className="form-field" style={{ marginBottom: 12 }}>
                <label>Registration ID <span style={{ color: 'var(--ojas-red)' }}>*</span></label>
                <input
                  type="text"
                  value={form.registrationId}
                  onChange={e => setForm(f => ({ ...f, registrationId: e.target.value.toUpperCase() }))}
                  placeholder="e.g. RP-PATAN-2025-0000001"
                  required
                />
              </div>
              <div className="form-field" style={{ marginBottom: 16 }}>
                <label>Date of Birth <span style={{ color: 'var(--ojas-red)' }}>*</span></label>
                <input
                  type="date"
                  value={form.dob}
                  onChange={e => setForm(f => ({ ...f, dob: e.target.value }))}
                  required
                />
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Verifying…' : 'Verify & Enter'}
              </button>
            </form>
          )}

          {mode === 'aadhaar' && !otpSent && (
            <form onSubmit={handleAadhaarSend}>
              <div className="form-field" style={{ marginBottom: 16 }}>
                <label>Aadhaar Number <span style={{ color: 'var(--ojas-red)' }}>*</span></label>
                <input
                  type="text"
                  value={form.aadhaar}
                  onChange={e => setForm(f => ({ ...f, aadhaar: e.target.value.replace(/\D/g, '').slice(0, 12) }))}
                  placeholder="12-digit Aadhaar"
                  maxLength={12}
                  required
                />
              </div>
              <div className="notice info" style={{ marginBottom: 16, fontSize: 13 }}>
                If your Aadhaar is registered, an OTP will be sent to your registered mobile number.
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Sending…' : 'Send OTP'}
              </button>
            </form>
          )}

          {mode === 'aadhaar' && otpSent && (
            <form onSubmit={handleAadhaarOtp}>
              <div className="notice info" style={{ marginBottom: 16, fontSize: 13 }}>
                OTP sent to your registered mobile number.
              </div>
              <div className="form-field" style={{ marginBottom: 16 }}>
                <label>OTP <span style={{ color: 'var(--ojas-red)' }}>*</span></label>
                <input
                  type="text"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="6-digit OTP"
                  maxLength={6}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn secondary" onClick={() => setOtpSent(false)}>Back</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Verifying…' : 'Verify OTP & Enter'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  )
}
