import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RegistrationLayout from './RegistrationLayout'
import { saveStep } from '../../api/otr'
import { useCandidateAuth } from '../../context/CandidateAuthContext'

const COMMON_LANGUAGES = ['Gujarati', 'Hindi', 'English', 'Marathi', 'Urdu', 'Other']
const empty = { language: '', canRead: false, canWrite: false, canSpeak: false }

export default function Step6Languages() {
  const navigate = useNavigate()
  const { candidate, refetch } = useCandidateAuth()
  const [rows, setRows] = useState(
    candidate?.languages?.length ? candidate.languages : [{ ...empty }]
  )
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function addRow() { setRows(r => [...r, { ...empty }]) }
  function removeRow(i) { setRows(r => r.filter((_, idx) => idx !== i)) }
  function updateRow(i, field, value) {
    setRows(r => r.map((row, idx) => idx === i ? { ...row, [field]: value } : row))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const valid = rows.filter(r => r.language.trim())
    if (!valid.length) { setError('Add at least one language'); return }
    setError('')
    setLoading(true)
    try {
      await saveStep(6, { languages: valid })
      await refetch()
      navigate('/otr/step/7')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  return (
    <RegistrationLayout currentStep={6}>
      <div className="box-title">
        <span>Step 6 — Language Proficiency</span>
        <span className="guj">ભાષા કૌશલ્ય</span>
      </div>
      <div className="box-body">
        {error && <div className="notice warn" style={{ marginBottom: 12 }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <table className="ojas" style={{ marginBottom: 12 }}>
            <thead>
              <tr>
                <th>Language</th>
                <th style={{ textAlign: 'center' }}>Read</th>
                <th style={{ textAlign: 'center' }}>Write</th>
                <th style={{ textAlign: 'center' }}>Speak</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  <td>
                    <select
                      value={row.language}
                      onChange={e => updateRow(i, 'language', e.target.value)}
                      style={{ width: '100%', border: '1px solid var(--ojas-line)', padding: '4px 6px' }}
                    >
                      <option value="">Select</option>
                      {COMMON_LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </td>
                  {['canRead', 'canWrite', 'canSpeak'].map(skill => (
                    <td key={skill} style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={row[skill]}
                        onChange={e => updateRow(i, skill, e.target.checked)}
                      />
                    </td>
                  ))}
                  <td>
                    {rows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRow(i)}
                        style={{ color: 'var(--ojas-red)', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        ✕
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button type="button" className="btn ghost" onClick={addRow} style={{ marginBottom: 16 }}>
            + Add Language
          </button>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn secondary" onClick={() => navigate('/otr/step/5')}>Back</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving…' : 'Save & Continue'}
            </button>
          </div>
        </form>
      </div>
    </RegistrationLayout>
  )
}
