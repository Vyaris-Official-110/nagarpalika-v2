import { useState } from 'react'
import { submitHelpQuery } from '../api/index'

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
  const [open, setOpen] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', mobile: '', subject: '', message: '' })
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
      setForm({ name: '', email: '', mobile: '', subject: '', message: '' })
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
              Email Address
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="e.g. ramesh@example.com"
              />
            </label>
          </div>
          <div className="form-row">
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
            <label>
              Subject <span aria-hidden="true" style={{ color: 'var(--ojas-red)' }}>*</span>
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                required
                placeholder="e.g. Call letter not showing"
              />
            </label>
          </div>
          <label style={{ display: 'block', marginTop: 10 }}>
            Message <span aria-hidden="true" style={{ color: 'var(--ojas-red)' }}>*</span>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              required
              rows={5}
              placeholder="Describe your issue in detail…"
              style={{ width: '100%', resize: 'vertical' }}
            />
          </label>
          <div style={{ marginTop: 12, textAlign: 'right' }}>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit Query'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
