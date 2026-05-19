import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RegistrationLayout from './RegistrationLayout'
import { saveStep } from '../../api/otr'
import { useCandidateAuth } from '../../context/CandidateAuthContext'

export default function Step3Contact() {
  const navigate = useNavigate()
  const { candidate, refetch } = useCandidateAuth()
  const [form, setForm] = useState({
    email: candidate?.email || '',
    altMobile: candidate?.altMobile || '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await saveStep(3, form)
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
              <label>Email Address <span style={{ color: 'var(--ojas-red)' }}>*</span></label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required />
            </div>
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
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving…' : 'Save & Continue'}
            </button>
          </div>
        </form>
      </div>
    </RegistrationLayout>
  )
}
