import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { passwordResetSend, passwordResetVerify } from '../../api/otr'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [stage, setStage] = useState('form') // 'form' | 'otp' | 'done'
  const [form, setForm] = useState({ registrationId: '', dob: '' })
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSend(e) {
    e.preventDefault()
    setError('')
    if (!form.registrationId || !form.dob) {
      setError('Registration ID and date of birth are required')
      return
    }
    setLoading(true)
    try {
      await passwordResetSend(form)
      setStage('otp')
    } catch (err) {
      setError(err.response?.data?.message || 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleReset(e) {
    e.preventDefault()
    setError('')
    if (!otp || !newPassword || !confirmPassword) {
      setError('All fields are required')
      return
    }
    setLoading(true)
    try {
      await passwordResetVerify({ otp, newPassword, confirmPassword })
      setStage('done')
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed')
    } finally {
      setLoading(false)
    }
  }

  if (stage === 'done') {
    return (
      <>
        <div className="page-heading">
          <h1>Password Reset</h1>
        </div>
        <div className="box">
          <div className="box-body" style={{ textAlign: 'center', padding: 32 }}>
            <p style={{ fontSize: 32, marginBottom: 12 }}>✅</p>
            <p style={{ fontWeight: 700, marginBottom: 8 }}>Password reset successful</p>
            <p style={{ marginBottom: 20 }}>You can now log in with your new password.</p>
            <button className="btn-primary" onClick={() => navigate('/')}>Go to Home</button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="page-heading">
        <h1>Forgot Password</h1>
        <span className="guj">પાસવર્ડ ભૂલ્યા</span>
      </div>
      <div className="box" style={{ maxWidth: 480, margin: '0 auto' }}>
        <div className="box-title">
          <span>{stage === 'form' ? 'Verify Identity' : 'Reset Password'}</span>
        </div>
        <div className="box-body">
          {error && <div className="notice warn" style={{ marginBottom: 12 }}>{error}</div>}

          {stage === 'form' && (
            <form onSubmit={handleSend}>
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
              <div className="notice info" style={{ marginBottom: 16, fontSize: 13 }}>
                If your details match, an OTP will be sent to your registered mobile number.
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn secondary" onClick={() => navigate(-1)}>Back</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Sending…' : 'Send OTP'}
                </button>
              </div>
            </form>
          )}

          {stage === 'otp' && (
            <form onSubmit={handleReset}>
              <div className="notice info" style={{ marginBottom: 16, fontSize: 13 }}>
                OTP sent to your registered mobile number. Enter it below along with your new password.
              </div>
              <div className="form-field" style={{ marginBottom: 12 }}>
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
              <div className="form-field" style={{ marginBottom: 12 }}>
                <label>New Password <span style={{ color: 'var(--ojas-red)' }}>*</span></label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Min 8 chars, uppercase, digit, special"
                  required
                />
              </div>
              <div className="form-field" style={{ marginBottom: 16 }}>
                <label>Confirm Password <span style={{ color: 'var(--ojas-red)' }}>*</span></label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn secondary" onClick={() => setStage('form')}>Back</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Resetting…' : 'Reset Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  )
}
