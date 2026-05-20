import { useState } from 'react'
import RegistrationLayout from './RegistrationLayout'
import { findSendOtp, findVerifyOtp } from '../../api/otr'

export default function FindRegistration() {
  const [mode, setMode] = useState('mobile') // 'mobile' | 'aadhaar'
  const [mobile, setMobile] = useState('')
  const [aadhaar, setAadhaar] = useState('')
  const [dob, setDob] = useState('')
  const [otp, setOtp] = useState('')
  const [stage, setStage] = useState('form') // 'form' | 'otp' | 'done'
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSend(e) {
    e.preventDefault()
    setError('')
    if (!dob) { setError('Date of birth is required'); return }
    if (mode === 'mobile' && !/^\d{10}$/.test(mobile)) {
      setError('Enter valid 10-digit mobile number')
      return
    }
    if (mode === 'aadhaar' && !/^\d{12}$/.test(aadhaar)) {
      setError('Enter valid 12-digit Aadhaar number')
      return
    }
    setLoading(true)
    try {
      await findSendOtp({
        mode,
        mobile: mode === 'mobile' ? mobile : undefined,
        aadhaar: mode === 'aadhaar' ? aadhaar : undefined,
        dob,
      })
      setStage('otp')
      setOtp('')
    } catch (err) {
      setError(err.response?.data?.message || 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify(e) {
    e.preventDefault()
    setError('')
    if (!otp || !/^\d{6}$/.test(otp)) { setError('Enter valid 6-digit OTP'); return }
    setLoading(true)
    try {
      await findVerifyOtp({ otp })
      setStage('done')
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed')
    } finally {
      setLoading(false)
    }
  }

  if (stage === 'done') {
    return (
      <RegistrationLayout currentStep={null}>
        <div className="box-title saffron"><span>Request Processed</span></div>
        <div className="box-body" style={{ textAlign: 'center', padding: 32 }}>
          <p style={{ fontWeight: 700, marginBottom: 8 }}>OTP Verified</p>
          <p>Your Registration ID has been sent to your registered mobile number and email address.</p>
          <p style={{ fontFamily: 'var(--font-guj)', marginTop: 8, color: '#555' }}>
            તમારો Registration ID તમારા નોંધાયેલ મોબાઈલ નંબર અને ઇ-મેઇલ પર મોકલ્યો છે.
          </p>
        </div>
      </RegistrationLayout>
    )
  }

  return (
    <RegistrationLayout currentStep={null}>
      <div className="box-title">
        <span>Find Registration ID</span>
        <span className="guj">નોંધણી ID શોધો</span>
      </div>
      <div className="box-body">
        {error && <div className="notice warn" style={{ marginBottom: 12 }}>{error}</div>}

        {stage === 'form' && (
          <>
            <div className="notice info" style={{ marginBottom: 16 }}>
              Enter your details to receive your Registration ID via SMS and email.
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              <button
                type="button"
                className={mode === 'mobile' ? 'btn-primary' : 'btn ghost'}
                onClick={() => { setMode('mobile'); setError('') }}
              >
                Mobile + DOB
              </button>
              <button
                type="button"
                className={mode === 'aadhaar' ? 'btn-primary' : 'btn ghost'}
                onClick={() => { setMode('aadhaar'); setError('') }}
              >
                Aadhaar + DOB
              </button>
            </div>

            <form onSubmit={handleSend}>
              {mode === 'mobile' && (
                <div className="form-field" style={{ marginBottom: 12 }}>
                  <label>Registered Mobile <span style={{ color: 'var(--ojas-red)' }}>*</span></label>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit mobile"
                    maxLength={10}
                    required
                  />
                </div>
              )}
              {mode === 'aadhaar' && (
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
                <label>Date of Birth <span style={{ color: 'var(--ojas-red)' }}>*</span></label>
                <input
                  type="date"
                  value={dob}
                  onChange={e => setDob(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Sending…' : 'Send OTP'}
              </button>
            </form>
          </>
        )}

        {stage === 'otp' && (
          <>
            <div className="notice info" style={{ marginBottom: 16 }}>
              If your details match our records, an OTP has been sent to your registered mobile number.
              Enter it below to retrieve your Registration ID.
            </div>
            <form onSubmit={handleVerify}>
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
                <button type="button" className="btn secondary" onClick={() => { setStage('form'); setError('') }}>Back</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Verifying…' : 'Verify OTP'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </RegistrationLayout>
  )
}
