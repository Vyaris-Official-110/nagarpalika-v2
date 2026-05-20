import { useState } from 'react'
import { submitHelpQuery } from '../api/index'
import { useLang } from '../context/LangContext'

const FAQS = [
  {
    q: 'What is OTR (One Time Registration)?',
    a: 'OTR is a one-time process where you register your personal and educational details once. You can then use your Registration ID to apply for any advertisement without re-entering details.',
  },
  {
    q: 'Is OTR the same as submitting an application?',
    a: 'No. OTR only creates your profile. You must separately apply for each advertisement and pay the application fee.',
  },
  {
    q: 'What documents are required for OTR?',
    a: 'Aadhaar card, recent passport-size photo, and scanned signature are mandatory. Educational certificates are uploaded during the application step.',
  },
  {
    q: 'When will the call letter be available?',
    a: 'Call letters are enabled by the exam authority after shortlisting is complete. Check this portal under "Call Letter" using your Registration ID.',
  },
  {
    q: 'Can I edit my application after submission?',
    a: 'Once submitted, applications cannot be edited. Contact the examination authority if there is a critical error.',
  },
]

export default function Help() {
  const { t } = useLang()
  const [open, setOpen] = useState(null)
  const [form, setForm] = useState({ name: '', registrationId: '', queryCategory: '', email: '', mobile: '', message: '' })
  const [status, setStatus] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  function toggle(i) { setOpen(o => (o === i ? null : i)) }

  function handleChange(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setStatus(null)
    try {
      await submitHelpQuery(form)
      setStatus('success')
      setForm({ name: '', registrationId: '', queryCategory: '', email: '', mobile: '', message: '' })
    } catch {
      setStatus('error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="page-heading">
        <h1>Help &amp; FAQ</h1>
        <span className="guj">સહાય અને વારંવાર પૂછાતા પ્રશ્નો</span>
      </div>

      <div className="box">
        <div className="box-title">
          <span>Frequently Asked Questions</span>
          <span className="guj">વારંવાર પૂછાતા પ્રશ્નો</span>
        </div>
        <div className="faq-list">
          {FAQS.map((f, i) => (
            <div key={i} className={`faq-item${open === i ? ' open' : ''}`}>
              <button
                type="button"
                className="faq-q"
                onClick={() => toggle(i)}
                aria-expanded={open === i}
              >
                <span>{f.q}</span>
                <span className="faq-chevron" aria-hidden="true">{open === i ? '▲' : '▼'}</span>
              </button>
              {open === i && <div className="faq-a">{f.a}</div>}
            </div>
          ))}
        </div>
      </div>

      <div className="box" style={{ marginTop: 16 }}>
        <div className="box-title">
          <span>Send a Query</span>
          <span className="guj">પ્રશ્ન મોકલો</span>
        </div>

        {status === 'success' && (
          <div className="notice info" style={{ margin: '12px 0' }}>
            <span>Your query has been submitted. We will respond within 3–5 working days.</span>
          </div>
        )}
        {status === 'error' && (
          <div className="notice info" style={{ margin: '12px 0', borderColor: 'var(--ojas-red)' }}>
            <span>Submission failed. Please try again or contact us by phone.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="help-form" noValidate>
          <div className="form-row">
            <label>
              Full Name <span aria-hidden="true" style={{ color: 'var(--ojas-red)' }}>*</span>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="e.g. Ramesh Patel"
              />
            </label>
            <label>
              Registration ID
              <input
                type="text"
                name="registrationId"
                value={form.registrationId}
                onChange={handleChange}
                placeholder="e.g. 10001234"
                maxLength={20}
              />
            </label>
          </div>
          <div className="form-row">
            <label>
              Query Category <span aria-hidden="true" style={{ color: 'var(--ojas-red)' }}>*</span>
              <select
                name="queryCategory"
                value={form.queryCategory}
                onChange={handleChange}
                required
              >
                <option value="">— Select category —</option>
                <option value="Registration">Registration (OTR)</option>
                <option value="Application">Online Application</option>
                <option value="Fee Payment">Fee Payment</option>
                <option value="Call Letter">Call Letter / Admit Card</option>
                <option value="Technical Issue">Technical Issue</option>
                <option value="Other">Other</option>
              </select>
            </label>
            <label>
              Mobile Number
              <input
                type="tel"
                name="mobile"
                value={form.mobile}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                maxLength={10}
              />
            </label>
          </div>
          <div className="form-full">
            <label>
              Description <span aria-hidden="true" style={{ color: 'var(--ojas-red)' }}>*</span>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                rows={5}
                placeholder="Describe your issue in detail…"
                style={{ resize: 'vertical' }}
              />
            </label>
          </div>
          <div className="form-actions" style={{ textAlign: 'right' }}>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit Query'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
