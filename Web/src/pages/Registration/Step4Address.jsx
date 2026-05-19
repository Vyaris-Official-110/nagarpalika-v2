import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RegistrationLayout from './RegistrationLayout'
import { saveStep } from '../../api/otr'
import { useCandidateAuth } from '../../context/CandidateAuthContext'

const emptyAddr = { line1: '', line2: '', city: '', district: '', state: 'Gujarat', pincode: '' }

function AddressFields({ value, onChange }) {
  const fields = [
    { key: 'line1', label: 'Address Line 1', required: true },
    { key: 'line2', label: 'Line 2 / Landmark', required: false },
    { key: 'city', label: 'City / Village', required: true },
    { key: 'district', label: 'District', required: true },
    { key: 'state', label: 'State', required: true },
    { key: 'pincode', label: 'PIN Code', required: true, maxLength: 6 },
  ]
  return (
    <div className="form-row" style={{ marginBottom: 0 }}>
      {fields.map(({ key, label, required, maxLength }) => (
        <div className="form-field" key={key}>
          <label>
            {label}
            {required && <span style={{ color: 'var(--ojas-red)' }}> *</span>}
          </label>
          <input
            type="text"
            value={value[key]}
            onChange={e => onChange(key, e.target.value)}
            required={required}
            maxLength={maxLength}
          />
        </div>
      ))}
    </div>
  )
}

export default function Step4Address() {
  const navigate = useNavigate()
  const { candidate, refetch } = useCandidateAuth()
  const [perm, setPerm] = useState({ ...emptyAddr, ...(candidate?.permanentAddress || {}) })
  const [curr, setCurr] = useState({ ...emptyAddr, ...(candidate?.currentAddress || {}) })
  const [same, setSame] = useState(candidate?.currentSameAsPermanent || false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await saveStep(4, {
        permanentAddress: perm,
        currentAddress: same ? perm : curr,
        currentSameAsPermanent: same,
      })
      await refetch()
      navigate('/otr/step/5')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  return (
    <RegistrationLayout currentStep={4}>
      <div className="box-title">
        <span>Step 4 — Address Details</span>
        <span className="guj">સરનામાની વિગત</span>
      </div>
      <div className="box-body">
        {error && <div className="notice warn" style={{ marginBottom: 12 }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <p style={{ fontWeight: 700, marginBottom: 10, color: 'var(--ojas-navy)' }}>Permanent Address</p>
          <AddressFields value={perm} onChange={(f, v) => setPerm(a => ({ ...a, [f]: v }))} />

          <div style={{ margin: '16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" id="same" checked={same} onChange={e => setSame(e.target.checked)} />
            <label htmlFor="same" style={{ cursor: 'pointer', fontWeight: 600 }}>
              Current address same as permanent address
            </label>
          </div>

          {!same && (
            <>
              <p style={{ fontWeight: 700, marginBottom: 10, color: 'var(--ojas-navy)' }}>Current Address</p>
              <AddressFields value={curr} onChange={(f, v) => setCurr(a => ({ ...a, [f]: v }))} />
            </>
          )}

          <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
            <button type="button" className="btn secondary" onClick={() => navigate('/otr/step/3')}>Back</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving…' : 'Save & Continue'}
            </button>
          </div>
        </form>
      </div>
    </RegistrationLayout>
  )
}
