import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RegistrationLayout from './RegistrationLayout'
import { saveStep } from '../../api/otr'
import { useCandidateAuth } from '../../context/CandidateAuthContext'

export default function Step5Qualification() {
  const navigate = useNavigate()
  const { candidate, refetch } = useCandidateAuth()
  const q = candidate?.qualification || {}
  const [form, setForm] = useState({
    degree: q.degree || '',
    subject: q.subject || '',
    university: q.university || '',
    passYear: q.passYear || '',
    percentage: q.percentage || '',
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
      await saveStep(5, { qualification: form })
      await refetch()
      navigate('/otr/step/6')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  return (
    <RegistrationLayout currentStep={5}>
      <div className="box-title">
        <span>Step 5 — Educational Qualification</span>
        <span className="guj">શૈક્ષણિક લાયકાત</span>
      </div>
      <div className="box-body">
        {error && <div className="notice warn" style={{ marginBottom: 12 }}>{error}</div>}
        <div className="notice info" style={{ marginBottom: 12 }}>
          Enter your highest qualification. Additional qualifications can be added during the application step.
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-field">
              <label>Degree / Qualification <span style={{ color: 'var(--ojas-red)' }}>*</span></label>
              <input type="text" name="degree" value={form.degree} onChange={handleChange} required placeholder="e.g. B.A., B.Sc., HSC" />
            </div>
            <div className="form-field">
              <label>Subject / Stream</label>
              <input type="text" name="subject" value={form.subject} onChange={handleChange} placeholder="e.g. Arts, Science, Commerce" />
            </div>
            <div className="form-field">
              <label>Board / University <span style={{ color: 'var(--ojas-red)' }}>*</span></label>
              <input type="text" name="university" value={form.university} onChange={handleChange} required />
            </div>
            <div className="form-field">
              <label>Year of Passing <span style={{ color: 'var(--ojas-red)' }}>*</span></label>
              <input type="text" name="passYear" value={form.passYear} onChange={handleChange} required placeholder="e.g. 2020" maxLength={4} />
            </div>
            <div className="form-field">
              <label>Percentage / Grade</label>
              <input type="text" name="percentage" value={form.percentage} onChange={handleChange} placeholder="e.g. 72.5 or A+" />
            </div>
          </div>
          <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
            <button type="button" className="btn secondary" onClick={() => navigate('/otr/step/4')}>Back</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving…' : 'Save & Continue'}
            </button>
          </div>
        </form>
      </div>
    </RegistrationLayout>
  )
}
