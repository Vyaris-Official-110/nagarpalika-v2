import { useState } from 'react'
import RegistrationLayout from './RegistrationLayout'
import { findRegistration } from '../../api/otr'

export default function FindRegistration() {
  const [form, setForm] = useState({ aadhaar: '', mobile: '' })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!/^\d{12}$/.test(form.aadhaar)) { setError('Enter valid 12-digit Aadhaar number'); return }
    if (!/^\d{10}$/.test(form.mobile)) { setError('Enter valid 10-digit mobile number'); return }
    setLoading(true)
    try {
      await findRegistration(form)
      setSubmitted(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <RegistrationLayout currentStep={null}>
      <div className="box-title">
        <span>Find Registration ID</span>
        <span className="guj">નોંધણી ID શોધો</span>
      </div>
      <div className="box-body">
        {submitted ? (
          <div className="notice success" style={{ padding: 20, textAlign: 'center' }}>
            <p style={{ fontWeight: 700, marginBottom: 8 }}>Request Processed</p>
            <p>If your Aadhaar and mobile match our records, your Registration ID has been sent via SMS.</p>
          </div>
        ) : (
          <>
            {error && <div className="notice warn" style={{ marginBottom: 12 }}>{error}</div>}
            <div className="notice info" style={{ marginBottom: 16 }}>
              Enter the Aadhaar number and mobile used during registration. Your Registration ID will be sent via SMS.
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-field">
                  <label>Aadhaar Number <span style={{ color: 'var(--ojas-red)' }}>*</span></label>
                  <input
                    type="text"
                    name="aadhaar"
                    value={form.aadhaar}
                    onChange={handleChange}
                    maxLength={12}
                    placeholder="12-digit Aadhaar"
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Registered Mobile <span style={{ color: 'var(--ojas-red)' }}>*</span></label>
                  <input
                    type="tel"
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
                  {loading ? 'Sending…' : 'Send Registration ID via SMS'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </RegistrationLayout>
  )
}
