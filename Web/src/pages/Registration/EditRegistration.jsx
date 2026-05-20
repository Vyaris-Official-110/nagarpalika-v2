import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCandidateAuth } from '../../context/CandidateAuthContext'
import { editConfirmSend, editConfirmVerify } from '../../api/otr'

const SECTIONS = [
  { label: 'Aadhaar / Mobile Verification', guj: 'આધાર / મોબાઇલ ચકાસણી', step: 1 },
  { label: 'Personal Details', guj: 'વ્યક્તિગત વિગત', step: 2 },
  { label: 'Contact Details', guj: 'સંપર્ક વિગત', step: 3 },
  { label: 'Address', guj: 'સરનામું', step: 4 },
  { label: 'Other Details', guj: 'અન્ય વિગતો', step: 5 },
  { label: 'Languages Known', guj: 'ભાષા જ્ઞાન', step: 6 },
  { label: 'Photograph', guj: 'ફોટોગ્રાફ', step: 7 },
  { label: 'Signature', guj: 'સહી', step: 8 },
  { label: 'Declaration', guj: 'ઘોષણા', step: 9 },
  { label: 'Preview & Submit', guj: 'પૂર્વાવલોકન અને સબમિટ', step: 10 },
]

export default function EditRegistration() {
  const navigate = useNavigate()
  const { candidate, loading } = useCandidateAuth()

  // gap 11: redirect to edit/verify instead of /otr/find
  useEffect(() => {
    if (!loading && !candidate) {
      navigate('/registration/edit/verify')
    }
  }, [candidate, loading, navigate])

  // gap 10: OTP confirm section state
  const [confirmStage, setConfirmStage] = useState('idle') // 'idle' | 'sent' | 'verified'
  const [otp, setOtp] = useState('')
  const [otpError, setOtpError] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)

  async function handleSendConfirmOtp() {
    setOtpError('')
    setOtpLoading(true)
    try {
      await editConfirmSend()
      setConfirmStage('sent')
      setOtp('')
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Failed to send OTP')
    } finally {
      setOtpLoading(false)
    }
  }

  async function handleVerifyConfirmOtp(e) {
    e.preventDefault()
    setOtpError('')
    if (!otp || !/^\d{6}$/.test(otp)) { setOtpError('Enter valid 6-digit OTP'); return }
    setOtpLoading(true)
    try {
      await editConfirmVerify({ otp })
      setConfirmStage('verified')
    } catch (err) {
      setOtpError(err.response?.data?.message || 'OTP verification failed')
    } finally {
      setOtpLoading(false)
    }
  }

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

      {/* gap 10: OTP confirmation for final edit save */}
      {submitted && withinEditWindow && (
        <div className="box" style={{ marginTop: 16 }}>
          <div className="box-title">
            <span>Confirm Changes</span>
            <span className="guj">ફેરફારો કન્ફર્મ કરો</span>
          </div>
          <div className="box-body">
            {confirmStage === 'verified' ? (
              <div className="notice success">
                <strong>Changes confirmed via OTP.</strong> Your edits have been saved.
              </div>
            ) : (
              <>
                <p style={{ marginBottom: 12, fontSize: 14 }}>
                  After making all required edits above, confirm your changes by verifying an OTP sent to your registered mobile number.
                </p>
                {otpError && <div className="notice warn" style={{ marginBottom: 12 }}>{otpError}</div>}
                {confirmStage === 'idle' && (
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={handleSendConfirmOtp}
                    disabled={otpLoading}
                  >
                    {otpLoading ? 'Sending…' : 'Send Confirmation OTP'}
                  </button>
                )}
                {confirmStage === 'sent' && (
                  <form onSubmit={handleVerifyConfirmOtp} style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="6-digit OTP"
                      maxLength={6}
                      style={{ width: 140 }}
                      required
                    />
                    <button type="submit" className="btn-primary" disabled={otpLoading}>
                      {otpLoading ? 'Verifying…' : 'Confirm Changes'}
                    </button>
                    <button
                      type="button"
                      className="btn ghost"
                      onClick={handleSendConfirmOtp}
                      disabled={otpLoading}
                    >
                      Resend OTP
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
