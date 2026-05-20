const STEPS = [
  'Aadhaar',
  'Personal',
  'Contact',
  'Address',
  'Other Details',
  'Languages',
  'Photo',
  'Signature',
  'Declaration',
  'Submit',
]

export default function RegistrationLayout({ currentStep, children }) {
  return (
    <>
      <div className="page-heading">
        <h1>One Time Registration (OTR)</h1>
        <span className="guj">એક વખત નોંધણી</span>
      </div>

      <div className="otr-stepper">
        {STEPS.map((label, i) => {
          const n = i + 1
          const done = currentStep !== null && n < currentStep
          const active = n === currentStep
          return (
            <div key={n} className={`otr-step${done ? ' done' : ''}${active ? ' active' : ''}`}>
              {i > 0 && <span className="otr-step-line" />}
              <span className="otr-step-num" title={label}>{done ? '✓' : n}</span>
            </div>
          )
        })}
      </div>

      <div className="box" style={{ marginTop: 16 }}>
        {children}
      </div>
    </>
  )
}
