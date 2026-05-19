import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RegistrationLayout from './RegistrationLayout'
import { sendOtp, verifyOtp } from '../../api/otr'
import { useCandidateAuth } from '../../context/CandidateAuthContext'

export default function Step1Aadhaar() {
  const navigate = useNavigate()
  const { refetch } = useCandidateAuth()
  const [phase, setPhase] = useState('form')
  const [form, setForm] = useState({ aadhaar: '', mobile: '' })
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const [devOtp, setDevOtp] = useState('')

  function handleChange(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value.replace(/\D/g, '') }))
  }

  async function handleSendOtp(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await sendOtp(form)
      setInfo(res.data.message)
      if (res.data._devOtp) setDevOtp(res.data._devOtp)
      setPhase('otp')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await verifyOtp({ otp })
      await refetch()
      navigate('/otr/step/2')
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <RegistrationLayout currentStep={1}>
      <div className="box-title">
        <span>Step 1 — Aadhaar Verification</span>
        <span className="guj">આધાર ચકાસણી</span>
      </div>
      <div className="box-body">
        <div className="notice info" style={{ marginBottom: 16 }}>
          <strong>Note:</strong> Enter your 12-digit Aadhaar number and the mobile number you wish to register with. An OTP will be sent for verification.
        </div>

        {error && <div className="notice warn" style={{ marginBottom: 12 }}>{error}</div>}
        {info && !error && <div className="notice success" style={{ marginBottom: 12 }}>{info}</div>}
        {devOtp && (
          <div className="notice info" style={{ marginBottom: 12 }}>
            <strong>[DEV] OTP:</strong> {devOtp}
          </div>
        )}

        {phase === 'form' ? (
          <form onSubmit={handleSendOtp}>
            <div className="form-row">
              <div className="form-field">
                <label>Aadhaar Number <span style={{ color: 'var(--ojas-red)' }}>*</span></label>
                <input
                  type="text"
                  name="aadhaar"
                  value={form.aadhaar}
                  onChange={handleChange}
                  maxLength={12}
                  placeholder="12-digit Aadhaar number"
                  required
                />
              </div>
              <div className="form-field">
                <label>Mobile Number <span style={{ color: 'var(--ojas-red)' }}>*</span></label>
                <input
                  type="text"
                  name="mobile"
                  value={form.mobile}
                  onChange={handleChange}
                  maxLength={10}
                  placeholder="10-digit mobile"
                  required
                />
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Sending…' : 'Send OTP'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerify}>
            <div className="form-row">
              <div className="form-field">
                <label>Enter OTP <span style={{ color: 'var(--ojas-red)' }}>*</span></label>
                <input
                  type="text"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  maxLength={6}
                  placeholder="6-digit OTP"
                  required
                />
              </div>
            </div>
            <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Verifying…' : 'Verify OTP'}
              </button>
              <button
                type="button"
                className="btn secondary"
                onClick={() => { setPhase('form'); setError(''); setInfo(''); setDevOtp('') }}
              >
                Back
              </button>
            </div>
          </form>
        )}
      </div>
    </RegistrationLayout>
  )
}
