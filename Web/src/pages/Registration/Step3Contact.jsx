import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RegistrationLayout from './RegistrationLayout'
import { saveStep, sendEmailOtp, verifyEmailOtp } from '../../api/otr'
import { useCandidateAuth } from '../../context/CandidateAuthContext'

export default function Step3Contact() {
  const navigate = useNavigate()
  const { candidate, refetch } = useCandidateAuth()
  const [form, setForm] = useState({
    email: candidate?.email || '',
    altMobile: candidate?.altMobile || '',
  })
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [emailVerified, setEmailVerified] = useState(Boolean(candidate?.emailVerified))
  const [error, setError] = useState('')
  const [otpError, setOtpError] = useState('')
  const [loading, setLoading] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)

  async function handleSendOtp() {
    setError('')
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Enter a valid email address')
      return
    }
    setLoading(true)
    try {
      await sendEmailOtp({ email: form.email })
      setOtpSent(true)
      setEmailVerified(false)
      setOtp('')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp() {
    setOtpError('')
    if (!otp || !/^\d{6}$/.test(otp)) {
      setOtpError('Enter valid 6-digit OTP')
      return
    }
    setOtpLoading(true)
    try {
      await verifyEmailOtp({ otp })
      setEmailVerified(true)
      setOtpSent(false)
      await refetch()
    } catch (err) {
      setOtpError(err.response?.data?.message || 'OTP verification failed')
    } finally {
      setOtpLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!emailVerified) {
      setError('Please verify your email address before continuing')
      return
    }
    setLoading(true)
    try {
      await saveStep(3, { email: form.email, altMobile: form.altMobile })
      await refetch()
      navigate('/otr/step/4')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  return (
    <RegistrationLayout currentStep={3}>
      <div className="box-title">
        <span>Step 3 — Contact Details</span>
        <span className="guj">સંપર્ક વિગતો</span>
      </div>
      <div className="box-body">
        {error && <div className="notice warn" style={{ marginBottom: 12 }}>{error}</div>}
        <div className="notice info" style={{ marginBottom: 12 }}>
          Primary mobile: <strong>{candidate?.mobile}</strong> (registered via OTP — cannot be changed here)
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-field">
              <label>
                Email Address <span style={{ color: 'var(--ojas-red)' }}>*</span>
                {emailVerified && (
                  <span style={{ color: 'green', marginLeft: 8, fontSize: 12 }}>✓ Verified</span>
                )}
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={e => {
                    setForm(f => ({ ...f, email: e.target.value }))
                    setEmailVerified(false)
                    setOtpSent(false)
                  }}
                  required
                  disabled={otpSent}
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  className="btn ghost"
                  onClick={handleSendOtp}
                  disabled={loading || emailVerified}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {loading ? 'Sending…' : otpSent ? 'Resend OTP' : 'Send OTP'}
                </button>
              </div>
            </div>
          </div>

          {otpSent && !emailVerified && (
            <div style={{ marginBottom: 16, padding: 12, border: '1px solid var(--ojas-line)' }}>
              <p style={{ marginBottom: 8, fontSize: 13 }}>
                OTP sent to <strong>{form.email}</strong>. Enter it below to verify.
              </p>
              {otpError && <div className="notice warn" style={{ marginBottom: 8 }}>{otpError}</div>}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="text"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="6-digit OTP"
                  maxLength={6}
                  style={{ width: 140 }}
                />
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleVerifyOtp}
                  disabled={otpLoading}
                >
                  {otpLoading ? 'Verifying…' : 'Verify OTP'}
                </button>
              </div>
            </div>
          )}

          <div className="form-row">
            <div className="form-field">
              <label>Alternate Mobile</label>
              <input
                type="text"
                name="altMobile"
                value={form.altMobile}
                onChange={e => setForm(f => ({ ...f, altMobile: e.target.value.replace(/\D/g, '') }))}
                maxLength={10}
                placeholder="10-digit (optional)"
              />
            </div>
          </div>

          <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
            <button type="button" className="btn secondary" onClick={() => navigate('/otr/step/2')}>Back</button>
            <button type="submit" className="btn-primary" disabled={loading || !emailVerified}>
              {loading ? 'Saving…' : 'Save & Continue'}
            </button>
          </div>
        </form>
      </div>
    </RegistrationLayout>
  )
}
