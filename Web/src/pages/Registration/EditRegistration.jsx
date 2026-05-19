import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCandidateAuth } from '../../context/CandidateAuthContext'

const SECTIONS = [
  { label: 'Aadhaar / Mobile Verification', guj: 'આધાર / મોબાઇલ ચકાસણી', step: 1 },
  { label: 'Personal Details', guj: 'વ્યક્તિગત વિગત', step: 2 },
  { label: 'Contact Details', guj: 'સંપર્ક વિગત', step: 3 },
  { label: 'Address', guj: 'સરનામું', step: 4 },
  { label: 'Qualification', guj: 'શૈક્ષણિક લાયકાત', step: 5 },
  { label: 'Languages Known', guj: 'ભાષા જ્ઞાન', step: 6 },
  { label: 'Physical Standards', guj: 'શારીરિક ધોરણ', step: 7 },
  { label: 'Photograph', guj: 'ફોટોગ્રાફ', step: 8 },
  { label: 'Signature', guj: 'સહી', step: 9 },
  { label: 'Preview & Submit', guj: 'પૂર્વાવલોકન અને સબમિટ', step: 10 },
]

export default function EditRegistration() {
  const navigate = useNavigate()
  const { candidate, loading } = useCandidateAuth()

  useEffect(() => {
    if (!loading && !candidate) {
      navigate('/otr/find')
    }
  }, [candidate, loading, navigate])

  if (loading || !candidate) return null

  const withinEditWindow = candidate.editWindowExpiresAt
    ? new Date(candidate.editWindowExpiresAt) > new Date()
    : false

  const submitted = Boolean(candidate.registrationCompleted)

  return (
    <div>
      <div className="page-heading">
        <h1>Edit Registration</h1>
        <span className="guj">નોંધણી સુધારો</span>
      </div>

      {submitted && !withinEditWindow && (
        <div className="notice error" style={{ marginBottom: 16 }}>
          <div className="title">Edit Window Closed · સંપાદન વિન્ડો બંધ</div>
          Your 48-hour edit window has expired. Registration details are locked.{' '}
          <span style={{ fontFamily: 'var(--font-guj)' }}>૪૮ કલાકની સંપાદન વિન્ડો સમાપ્ત થઈ છે.</span>
        </div>
      )}

      {submitted && withinEditWindow && (
        <div className="notice info" style={{ marginBottom: 16 }}>
          <div className="title">Edit Window Active · સંપાદન વિન્ડો ખુલ્લી</div>
          You can edit your details until{' '}
          <strong>{new Date(candidate.editWindowExpiresAt).toLocaleString('en-IN')}</strong>.{' '}
          <span style={{ fontFamily: 'var(--font-guj)' }}>નીચેના વિભાગો સુધારી શકો છો.</span>
        </div>
      )}

      {!submitted && (
        <div className="notice info" style={{ marginBottom: 16 }}>
          <div className="title">Registration in Progress</div>
          Complete all steps and submit your registration.
        </div>
      )}

      <div className="box">
        <div className="box-title">
          <span>Registration ID: {candidate.registrationId || '—'}</span>
        </div>
        <div className="box-body" style={{ padding: 0 }}>
          <table className="ojas">
            <thead>
              <tr>
                <th style={{ width: 40 }}>Step</th>
                <th>Section</th>
                <th style={{ width: 120 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {SECTIONS.map(({ label, guj, step }) => {
                // Step 1 (Aadhaar/Mobile) is always view-only — Aadhaar is immutable
                // Step 2 (Personal Details) is editable but name/DOB are Aadhaar-linked (locked in form)
                const alwaysView = step === 1
                const canEdit = !alwaysView && (!submitted || withinEditWindow)
                return (
                  <tr key={step}>
                    <td>{step}</td>
                    <td>
                      {label}
                      <div style={{ fontSize: 11, color: 'var(--ojas-ink-3)', fontFamily: 'var(--font-guj)' }}>{guj}</div>
                      {step === 2 && (
                        <div style={{ fontSize: 11, color: 'var(--ojas-ink-3)', marginTop: 2 }}>
                          Name &amp; Date of Birth are locked (Aadhaar-linked)
                        </div>
                      )}
                    </td>
                    <td>
                      {canEdit ? (
                        <Link
                          to={`/otr/step/${step}`}
                          style={{ color: 'var(--ojas-saffron-deep)', fontWeight: 700 }}
                        >
                          Edit ▶
                        </Link>
                      ) : (
                        <Link
                          to={`/otr/step/${step}`}
                          style={{ color: 'var(--ojas-ink-3)' }}
                        >
                          View ▶
                        </Link>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
