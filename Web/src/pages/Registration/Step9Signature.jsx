import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import RegistrationLayout from './RegistrationLayout'
import { uploadSignature } from '../../api/otr'
import { useCandidateAuth } from '../../context/CandidateAuthContext'

export default function Step9Signature() {
  const navigate = useNavigate()
  const { candidate, refetch } = useCandidateAuth()
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef()

  function handleFile(e) {
    const f = e.target.files[0]
    if (!f) return
    if (!f.type.startsWith('image/')) { setError('Only image files allowed (JPG/PNG)'); return }
    if (f.size > 1 * 1024 * 1024) { setError('Signature must be under 1 MB'); return }
    setError('')
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!file && !candidate?.signaturePath) { setError('Please upload your signature'); return }
    if (!file) { navigate('/otr/step/10'); return }
    setError('')
    setLoading(true)
    try {
      await uploadSignature(file)
      await refetch()
      navigate('/otr/step/10')
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <RegistrationLayout currentStep={9}>
      <div className="box-title">
        <span>Step 9 — Signature Upload</span>
        <span className="guj">સહી અપલોડ</span>
      </div>
      <div className="box-body">
        {error && <div className="notice warn" style={{ marginBottom: 12 }}>{error}</div>}
        <div className="notice info" style={{ marginBottom: 16 }}>
          <strong>Requirements:</strong> Scanned signature on white paper. JPG or PNG. Max 1 MB.
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div>
              <div
                style={{
                  width: 280, height: 90, border: '2px dashed var(--ojas-line)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: '#fafafa', cursor: 'pointer', overflow: 'hidden',
                }}
                onClick={() => inputRef.current.click()}
              >
                {preview ? (
                  <img src={preview} alt="Signature preview" style={{ maxWidth: '100%', maxHeight: '100%' }} />
                ) : (
                  <span style={{ color: '#aaa', fontSize: 12 }}>Click to select signature image</span>
                )}
              </div>
              <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
              <button
                type="button"
                className="btn ghost"
                onClick={() => inputRef.current.click()}
                style={{ marginTop: 8 }}
              >
                {candidate?.signaturePath ? 'Change Signature' : 'Select Signature'}
              </button>
            </div>
          </div>
          {candidate?.signaturePath && !preview && (
            <div className="notice success" style={{ marginTop: 12 }}>
              Signature already uploaded. You can change it or continue.
            </div>
          )}
          <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
            <button type="button" className="btn secondary" onClick={() => navigate('/otr/step/8')}>Back</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Uploading…' : 'Save & Continue'}
            </button>
          </div>
        </form>
      </div>
    </RegistrationLayout>
  )
}
