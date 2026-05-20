import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RegistrationLayout from './RegistrationLayout'

export default function StepDeclaration() {
  const navigate = useNavigate()
  const [agreed, setAgreed] = useState(false)

  return (
    <RegistrationLayout currentStep={9}>
      <div className="box-title">
        <span>Step 9 — Declaration</span>
        <span className="guj">ઘોષણા</span>
      </div>
      <div className="box-body">
        <div style={{ padding: 16, border: '1px solid var(--ojas-line)', marginBottom: 20, background: '#fafafa' }}>
          <p style={{ fontWeight: 700, marginBottom: 12 }}>Declaration / ઘોષણા</p>

          <p style={{ marginBottom: 10, lineHeight: 1.7 }}>
            I hereby solemnly declare that all the information furnished in this One-Time Registration form is true,
            correct and complete to the best of my knowledge and belief. I understand that any false statement or
            suppression of any fact will render me liable to disqualification at any stage of the recruitment process
            and may also result in criminal proceedings.
          </p>

          <p style={{ fontFamily: 'var(--font-guj)', lineHeight: 1.9, marginBottom: 10, color: '#444' }}>
            હું આથી સત્યનિષ્ઠાપૂર્વક જાહેર કરું છું કે આ એક-વખત નોંધણી ફોર્મમાં ભરેલ તમામ માહિતી, મારી શ્રેષ્ઠ
            જ્ઞાન અને માન્યતા અનુસાર, સત્ય, સાચી અને સંપૂર્ણ છે. હું સમજું છું કે કોઈ પણ ખોટું નિવેદન અથવા
            કોઈ હકીકત છૂપાવવી એ ભરતી પ્રક્રિયાના કોઈ પણ તબક્કે ગેરલાયકાત માટે જવાબદાર ઠરાવી શકે છે.
          </p>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer', marginTop: 16 }}>
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              style={{ marginTop: 3 }}
            />
            <span>
              I have read and understood the above declaration and I agree to abide by it.{' '}
              <span style={{ fontFamily: 'var(--font-guj)' }}>
                / મેં ઉપરોક્ત ઘોષણા વાંચી અને સમજી છે અને તેનું પાલન કરવા સંમત છું.
              </span>
            </span>
          </label>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" className="btn secondary" onClick={() => navigate('/otr/step/8')}>Back</button>
          <button
            type="button"
            className="btn-primary"
            disabled={!agreed}
            onClick={() => navigate('/otr/step/10')}
          >
            I Agree &amp; Continue
          </button>
        </div>
      </div>
    </RegistrationLayout>
  )
}
