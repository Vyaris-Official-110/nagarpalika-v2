import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RegistrationLayout from './RegistrationLayout'
import { submitRegistration } from '../../api/otr'
import { useCandidateAuth } from '../../context/CandidateAuthContext'

function Row({ label, value }) {
  return (
    <tr>
      <td style={{ fontWeight: 600, width: '40%' }}>{label}</td>
      <td>{value || <span style={{ color: '#aaa' }}>—</span>}</td>
    </tr>
  )
}

export default function Step10Preview() {
  const navigate = useNavigate()
  const { candidate, refetch } = useCandidateAuth()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!agreed) { setError('You must accept the declaration'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    if (password !== confirmPassword) { setError('Passwords do not match'); return }
    setLoading(true)
    try {
      const res = await submitRegistration({ password, confirmPassword })
      setSuccess(res.data)
      await refetch()
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <RegistrationLayout currentStep={10}>
        <div className="box-title saffron"><span>Registration Complete!</span></div>
        <div className="box-body" style={{ textAlign: 'center', padding: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Your Registration ID</p>
          <p style={{
            fontSize: 24, fontWeight: 700, color: 'var(--ojas-navy)',
            letterSpacing: 2, border: '2px solid var(--ojas-navy)',
            display: 'inline-block', padding: '8px 24px', marginBottom: 16,
          }}>
            {success.registrationId}
          </p>
          <p style={{ marginBottom: 8 }}>Your Registration ID has been sent to your registered mobile number.</p>
          <p style={{ color: '#666', fontSize: 13 }}>
            Edit window closes: <strong>{success.editWindowExpiresAt ? new Date(success.editWindowExpiresAt).toLocaleString() : '48 hours'}</strong>
          </p>
          <div style={{ marginTop: 20 }}>
            <button className="btn-primary" onClick={() => navigate('/')}>Go to Home</button>
          </div>
        </div>
      </RegistrationLayout>
    )
  }

  if (!candidate) return null

  const addr = candidate.permanentAddress
  const addrStr = addr
    ? [addr.line1, addr.city, addr.district, addr.state, addr.pincode].filter(Boolean).join(', ')
    : ''

  const q = candidate.qualification

  return (
    <RegistrationLayout currentStep={10}>
      <div className="box-title">
        <span>Step 10 — Preview &amp; Submit</span>
        <span className="guj">પ્રિવ્યૂ અને સબમિટ</span>
      </div>
      <div className="box-body">
        {error && <div className="notice warn" style={{ marginBottom: 12 }}>{error}</div>}
        <div className="notice info" style={{ marginBottom: 16 }}>
          Review all details carefully. After submission, you may edit within <strong>48 hours</strong>.
        </div>

        <table className="ojas" style={{ marginBottom: 16 }}>
          <tbody>
            <Row label="Registration ID" value={candidate.registrationId} />
            <Row label="Name" value={candidate.name} />
            <Row label="Father / Husband" value={candidate.fatherName} />
            <Row label="Date of Birth" value={candidate.dob ? new Date(candidate.dob).toLocaleDateString('en-IN') : ''} />
            <Row label="Gender" value={{ M: 'Male', F: 'Female', O: 'Other' }[candidate.gender]} />
            <Row label="Category" value={candidate.category} />
            <Row label="Mobile" value={candidate.mobile} />
            <Row label="Email" value={candidate.email} />
            <Row label="Permanent Address" value={addrStr} />
            <Row label="Qualification" value={q ? `${q.degree || ''} — ${q.university || ''} (${q.passYear || ''})` : ''} />
            <Row label="PH Status" value={candidate.phStatus ? `Yes — ${candidate.phType} (${candidate.phPercentage}%)` : 'No'} />
            <Row label="Photo" value={candidate.photoPath ? 'Uploaded ✓' : 'Not uploaded'} />
            <Row label="Signature" value={candidate.signaturePath ? 'Uploaded ✓' : 'Not uploaded'} />
          </tbody>
        </table>

        <form onSubmit={handleSubmit}>
          <div style={{ padding: 16, border: '1px solid var(--ojas-line)', marginBottom: 16 }}>
            <p style={{ fontWeight: 700, marginBottom: 10 }}>Set Login Password</p>
            <div className="form-row">
              <div className="form-field">
                <label>Password <span style={{ color: 'var(--ojas-red)' }}>*</span></label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  required
                  minLength={8}
                />
              </div>
              <div className="form-field">
                <label>Confirm Password <span style={{ color: 'var(--ojas-red)' }}>*</span></label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ marginTop: 2 }} />
              <span>
                I hereby declare that all information provided is true and correct to the best of my knowledge.
                I understand that providing false information is a disqualification offense.
              </span>
            </label>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn secondary" onClick={() => navigate('/otr/step/9')}>Back</button>
            <button type="submit" className="btn-primary" disabled={loading || !agreed}>
              {loading ? 'Submitting…' : 'Submit Registration'}
            </button>
          </div>
        </form>
      </div>
    </RegistrationLayout>
  )
}
