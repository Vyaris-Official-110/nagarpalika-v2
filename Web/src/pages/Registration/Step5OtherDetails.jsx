import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RegistrationLayout from './RegistrationLayout'
import { saveStep } from '../../api/otr'
import { useCandidateAuth } from '../../context/CandidateAuthContext'

const PH_TYPES = ['VH', 'HH', 'OH', 'MH', 'ASD', 'ID', 'MD']
const MOTHER_TONGUES = ['Gujarati', 'Hindi', 'Urdu', 'Marathi', 'English', 'Other']

export default function Step5OtherDetails() {
  const navigate = useNavigate()
  const { candidate, refetch } = useCandidateAuth()
  const q = candidate?.qualification || {}
  const [form, setForm] = useState({
    maritalStatus: candidate?.maritalStatus || 'S',
    exServiceman: candidate?.exServiceman || false,
    motherTongue: candidate?.motherTongue || '',
    phStatus: candidate?.phStatus || false,
    phType: candidate?.phType || '',
    phPercentage: candidate?.phPercentage || '',
    qualification: {
      degree: q.degree || '',
      subject: q.subject || '',
      university: q.university || '',
      passYear: q.passYear || '',
      percentage: q.percentage || '',
    },
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  function handleQualChange(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, qualification: { ...f.qualification, [name]: value } }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (form.phStatus && !form.phType) {
      setError('Please select PH type')
      return
    }
    if (!form.qualification.degree || !form.qualification.university || !form.qualification.passYear) {
      setError('Degree, University and Year of Passing are required')
      return
    }
    setLoading(true)
    try {
      await saveStep(5, {
        maritalStatus: form.maritalStatus,
        exServiceman: form.exServiceman,
        motherTongue: form.motherTongue,
        phStatus: form.phStatus,
        phType: form.phStatus ? form.phType : '',
        phPercentage: form.phStatus ? form.phPercentage : '',
        qualification: form.qualification,
      })
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
        <span>Step 5 — Other Details</span>
        <span className="guj">અન્ય વિગતો</span>
      </div>
      <div className="box-body">
        {error && <div className="notice warn" style={{ marginBottom: 12 }}>{error}</div>}
        <form onSubmit={handleSubmit}>

          <p style={{ fontWeight: 600, marginBottom: 8, marginTop: 4 }}>Personal Particulars</p>
          <div className="form-row">
            <div className="form-field">
              <label>Marital Status</label>
              <select name="maritalStatus" value={form.maritalStatus} onChange={handleChange}>
                <option value="S">Single / Unmarried</option>
                <option value="M">Married</option>
                <option value="W">Widow / Widower</option>
                <option value="D">Divorced</option>
              </select>
            </div>
            <div className="form-field">
              <label>Mother Tongue</label>
              <select name="motherTongue" value={form.motherTongue} onChange={handleChange}>
                <option value="">Select</option>
                {MOTHER_TONGUES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" name="exServiceman" checked={form.exServiceman} onChange={handleChange} />
              Ex-Serviceman / Ex-Servicewoman
            </label>
          </div>

          <p style={{ fontWeight: 600, marginBottom: 8 }}>Person with Disability (PH)</p>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" name="phStatus" checked={form.phStatus} onChange={handleChange} />
              I am a Person with Disability (PH / Divyang)
            </label>
          </div>
          {form.phStatus && (
            <div className="form-row">
              <div className="form-field">
                <label>Disability Type <span style={{ color: 'var(--ojas-red)' }}>*</span></label>
                <select name="phType" value={form.phType} onChange={handleChange}>
                  <option value="">Select</option>
                  {PH_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Disability Percentage (%)</label>
                <input
                  type="number"
                  name="phPercentage"
                  value={form.phPercentage}
                  onChange={handleChange}
                  min={1}
                  max={100}
                  placeholder="e.g. 40"
                />
              </div>
            </div>
          )}

          <p style={{ fontWeight: 600, marginBottom: 8, marginTop: 16 }}>Educational Qualification</p>
          <div className="notice info" style={{ marginBottom: 12 }}>
            Enter your highest qualification. Additional qualifications can be added during the application step.
          </div>
          <div className="form-row">
            <div className="form-field">
              <label>Degree / Qualification <span style={{ color: 'var(--ojas-red)' }}>*</span></label>
              <input type="text" name="degree" value={form.qualification.degree} onChange={handleQualChange} required placeholder="e.g. B.A., B.Sc., HSC" />
            </div>
            <div className="form-field">
              <label>Subject / Stream</label>
              <input type="text" name="subject" value={form.qualification.subject} onChange={handleQualChange} placeholder="e.g. Arts, Science" />
            </div>
            <div className="form-field">
              <label>Board / University <span style={{ color: 'var(--ojas-red)' }}>*</span></label>
              <input type="text" name="university" value={form.qualification.university} onChange={handleQualChange} required />
            </div>
            <div className="form-field">
              <label>Year of Passing <span style={{ color: 'var(--ojas-red)' }}>*</span></label>
              <input type="text" name="passYear" value={form.qualification.passYear} onChange={handleQualChange} required placeholder="e.g. 2020" maxLength={4} />
            </div>
            <div className="form-field">
              <label>Percentage / Grade</label>
              <input type="text" name="percentage" value={form.qualification.percentage} onChange={handleQualChange} placeholder="e.g. 72.5 or A+" />
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
