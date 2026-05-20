import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RegistrationLayout from './RegistrationLayout'
import { saveStep } from '../../api/otr'
import { useCandidateAuth } from '../../context/CandidateAuthContext'

const CATEGORIES = ['GEN', 'OBC', 'SC', 'ST', 'EWS']
const RELIGIONS = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Jain', 'Buddhist', 'Parsi', 'Other']

export default function Step2Personal() {
  const navigate = useNavigate()
  const { candidate, refetch } = useCandidateAuth()
  const [form, setForm] = useState({
    name: candidate?.name || '',
    fatherName: candidate?.fatherName || '',
    dob: candidate?.dob ? candidate.dob.slice(0, 10) : '',
    gender: candidate?.gender || 'M',
    category: candidate?.category || 'GEN',
    nationality: candidate?.nationality || 'Indian',
    religion: candidate?.religion || '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await saveStep(2, form)
      await refetch()
      navigate('/otr/step/3')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  return (
    <RegistrationLayout currentStep={2}>
      <div className="box-title">
        <span>Step 2 — Personal Information</span>
        <span className="guj">વ્યક્તિગત માહિતી</span>
      </div>
      <div className="box-body">
        {error && <div className="notice warn" style={{ marginBottom: 12 }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-field">
              <label>Full Name (as per Aadhaar) <span style={{ color: 'var(--ojas-red)' }}>*</span></label>
              <input type="text" name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="form-field">
              <label>Father / Husband Name <span style={{ color: 'var(--ojas-red)' }}>*</span></label>
              <input type="text" name="fatherName" value={form.fatherName} onChange={handleChange} required />
            </div>
            <div className="form-field">
              <label>Date of Birth <span style={{ color: 'var(--ojas-red)' }}>*</span></label>
              <input type="date" name="dob" value={form.dob} onChange={handleChange} required />
            </div>
            <div className="form-field">
              <label>Gender <span style={{ color: 'var(--ojas-red)' }}>*</span></label>
              <select name="gender" value={form.gender} onChange={handleChange}>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="O">Other</option>
              </select>
            </div>
            <div className="form-field">
              <label>Category <span style={{ color: 'var(--ojas-red)' }}>*</span></label>
              <select name="category" value={form.category} onChange={handleChange}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Religion</label>
              <select name="religion" value={form.religion} onChange={handleChange}>
                <option value="">Select</option>
                {RELIGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
            <button type="button" className="btn secondary" onClick={() => navigate('/otr/step/1')}>Back</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving…' : 'Save & Continue'}
            </button>
          </div>
        </form>
      </div>
    </RegistrationLayout>
  )
}
