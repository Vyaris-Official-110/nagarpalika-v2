import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RegistrationLayout from './RegistrationLayout'
import { saveStep } from '../../api/otr'
import { useCandidateAuth } from '../../context/CandidateAuthContext'

const PH_TYPES = ['Locomotor', 'Visual', 'Hearing', 'Speech', 'Intellectual', 'Multiple']

export default function Step7Physical() {
  const navigate = useNavigate()
  const { candidate, refetch } = useCandidateAuth()
  const [phStatus, setPhStatus] = useState(candidate?.phStatus || false)
  const [phType, setPhType] = useState(candidate?.phType || '')
  const [phPercentage, setPhPercentage] = useState(candidate?.phPercentage || '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (phStatus && (!phType || !phPercentage)) {
      setError('Enter disability type and percentage')
      return
    }
    setLoading(true)
    try {
      await saveStep(7, {
        phStatus,
        phType: phStatus ? phType : '',
        phPercentage: phStatus ? Number(phPercentage) : 0,
      })
      await refetch()
      navigate('/otr/step/8')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  return (
    <RegistrationLayout currentStep={7}>
      <div className="box-title">
        <span>Step 7 — Physical Disability Status</span>
        <span className="guj">શારીરિક અક્ષમતા</span>
      </div>
      <div className="box-body">
        {error && <div className="notice warn" style={{ marginBottom: 12 }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={phStatus}
                onChange={e => {
                  setPhStatus(e.target.checked)
                  if (!e.target.checked) { setPhType(''); setPhPercentage('') }
                }}
              />
              <span style={{ fontWeight: 600 }}>I am a Physically Handicapped (PH) candidate</span>
            </label>
          </div>

          {phStatus && (
            <div className="form-row">
              <div className="form-field">
                <label>Type of Disability <span style={{ color: 'var(--ojas-red)' }}>*</span></label>
                <select value={phType} onChange={e => setPhType(e.target.value)} required>
                  <option value="">Select</option>
                  {PH_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Disability Percentage (%) <span style={{ color: 'var(--ojas-red)' }}>*</span></label>
                <input
                  type="number"
                  value={phPercentage}
                  onChange={e => setPhPercentage(e.target.value)}
                  min={1}
                  max={100}
                  required
                />
              </div>
            </div>
          )}

          <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
            <button type="button" className="btn secondary" onClick={() => navigate('/otr/step/6')}>Back</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving…' : 'Save & Continue'}
            </button>
          </div>
        </form>
      </div>
    </RegistrationLayout>
  )
}
