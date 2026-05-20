import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function InstructionsStep() {
  const navigate = useNavigate()
  const scrollRef = useRef(null)
  const [scrolledToBottom, setScrolledToBottom] = useState(false)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    function handleScroll() {
      if (el.scrollHeight - el.scrollTop - el.clientHeight < 30) {
        setScrolledToBottom(true)
      }
    }
    el.addEventListener('scroll', handleScroll)
    return () => el.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <div className="page-heading">
        <h1>One Time Registration — Instructions</h1>
        <span className="guj">એક વખત નોંધણી — સૂચનાઓ</span>
      </div>

      <div className="box">
        <div className="box-title saffron">
          <span>Important Instructions</span>
          <span className="guj">મહત્વની સૂચનાઓ</span>
        </div>
        <div
          ref={scrollRef}
          style={{ maxHeight: 440, overflowY: 'auto', padding: '16px 20px', fontSize: 14, lineHeight: 1.8 }}
        >
          <p style={{ fontWeight: 700, marginBottom: 10 }}>General Instructions / સામાન્ય સૂચનાઓ</p>
          <ol style={{ paddingLeft: 20, marginBottom: 16 }}>
            <li>One-Time Registration (OTR) is mandatory before applying for any post advertised by NagarPalika.</li>
            <li>Each candidate may register only once. Duplicate registrations will be cancelled.</li>
            <li>Your Aadhaar number will be verified via OTP. Ensure your mobile number is linked to Aadhaar.</li>
            <li>All information entered must match your official documents exactly.</li>
            <li>Upload a recent passport-size photograph (JPG/PNG, max 2 MB) with white background.</li>
            <li>Upload a clear scanned signature on white paper (JPG/PNG, max 1 MB).</li>
            <li>A valid email address is required — you will receive important communications on this email.</li>
            <li>You may edit your registration within 48 hours of submission. After that, details are locked.</li>
            <li>Keep your Registration ID and password safe. Do not share them with anyone.</li>
            <li>NagarPalika will never ask for your password via phone or email.</li>
          </ol>

          <p style={{ fontWeight: 700, marginBottom: 10, fontFamily: 'var(--font-guj)' }}>
            મહત્વની સૂચનાઓ
          </p>
          <ol style={{ paddingLeft: 20, marginBottom: 16, fontFamily: 'var(--font-guj)', lineHeight: 2 }}>
            <li>નગરપાલિકા દ્વારા જાહેર કરાયેલ કોઈ પણ જગ્યા માટે અરજી કરતા પહેલા OTR ફરજિયાત છે.</li>
            <li>દરેક ઉમેદવાર ફક્ત એક જ વખત નોંધણી કરી શકે છે. નકલ નોંધણી રદ કરવામાં આવશે.</li>
            <li>આધાર ચકાસણી OTP દ્વારા થશે. ખાતરી કરો કે તમારો મોબાઈલ નંબર આધાર સાથે જોડાયેલ છે.</li>
            <li>ભરેલ તમામ માહિતી સત્તાવાર દસ્તાવેજો સાથે બિલકુલ મળતી આવવી જોઈએ.</li>
            <li>તાજો પાસપોર્ટ-સાઈઝ ફોટો (JPG/PNG, મહત્તમ 2 MB) સફેદ પૃષ્ઠભૂ સાથે અપલોડ કરો.</li>
            <li>સફેદ કાગળ પર સ્પષ્ટ સ્કૅન કરેલ સહી (JPG/PNG, મહત્તમ 1 MB) અપલોડ કરો.</li>
            <li>માન્ય ઇ-મેઇલ સરનામું જરૂરી છે — મહત્વના સંદેશા આ ઇ-મેઇલ પર મળશે.</li>
            <li>સબમિટ કર્યા પછી 48 કલાક સુધી નોંધણીમાં ફેરફાર કરી શકાય છે.</li>
            <li>તમારો નોંધણી ID અને પાસવર્ડ સુરક્ષિત રાખો. કોઈ સાથે શેર ન કરો.</li>
            <li>નગરપાલિકા ક્યારેય ફોન અથવા ઇ-મેઇલ દ્વારા પાસવર્ડ માંગતી નથી.</li>
          </ol>

          <p style={{ fontWeight: 700, marginBottom: 8 }}>Password Requirements</p>
          <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
            <li>Minimum 8 characters</li>
            <li>At least one uppercase letter (A–Z)</li>
            <li>At least one digit (0–9)</li>
            <li>At least one special character (!@#$%^&amp;* etc.)</li>
          </ul>

          <p style={{ color: '#555', fontSize: 13 }}>
            By clicking "I Agree &amp; Proceed", you confirm that you have read and understood these instructions
            and agree to the terms of this registration.
          </p>
        </div>

        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--ojas-line)' }}>
          {!scrolledToBottom && (
            <p style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>
              Scroll to the bottom to enable the button.{' '}
              <span style={{ fontFamily: 'var(--font-guj)' }}>/ બટન સક્ષમ કરવા નીચે સ્ક્રોલ કરો.</span>
            </p>
          )}
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn secondary" onClick={() => navigate(-1)}>Back</button>
            <button
              type="button"
              className="btn-primary"
              disabled={!scrolledToBottom}
              onClick={() => navigate('/otr')}
            >
              I Agree &amp; Proceed to Registration
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
