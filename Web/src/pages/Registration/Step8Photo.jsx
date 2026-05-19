import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import RegistrationLayout from './RegistrationLayout'
import { uploadPhoto } from '../../api/otr'
import { useCandidateAuth } from '../../context/CandidateAuthContext'

export default function Step8Photo() {
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
    if (f.size > 2 * 1024 * 1024) { setError('Photo must be under 2 MB'); return }
    setError('')
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!file && !candidate?.photoPath) { setError('Please upload a photo'); return }
    if (!file) { navigate('/otr/step/9'); return }
    setError('')
    setLoading(true)
    try {
      await uploadPhoto(file)
      await refetch()
      navigate('/otr/step/9')
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <RegistrationLayout currentStep={8}>
      <div className="box-title">
        <span>Step 8 — Photo Upload</span>
        <span className="guj">ફોટો અપલોડ</span>
      </div>
      <div className="box-body">
        {error && <div className="notice warn" style={{ marginBottom: 12 }}>{error}</div>}
        <div className="notice info" style={{ marginBottom: 16 }}>
          <strong>Requirements:</strong> Passport-size photo. JPG or PNG. Max 2 MB. Colour photo on white background. Taken within last 6 months.
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div>
              <div
                style={{
                  width: 140, height: 180, border: '2px dashed var(--ojas-line)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: '#fafafa', cursor: 'pointer', overflow: 'hidden',
                }}
                onClick={() => inputRef.current.click()}
              >
                {preview ? (
                  <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ color: '#aaa', fontSize: 12, textAlign: 'center', padding: 8 }}>
                    Click to select photo
                  </span>
                )}
              </div>
              <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
              <button
                type="button"
                className="btn ghost"
                onClick={() => inputRef.current.click()}
                style={{ marginTop: 8, width: 140 }}
              >
                {candidate?.photoPath ? 'Change Photo' : 'Select Photo'}
              </button>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              {candidate?.photoPath && !preview && (
                <div className="notice success">Photo already uploaded. You can change it or continue.</div>
              )}
            </div>
          </div>
          <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
            <button type="button" className="btn secondary" onClick={() => navigate('/otr/step/7')}>Back</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Uploading…' : 'Save & Continue'}
            </button>
          </div>
        </form>
      </div>
    </RegistrationLayout>
  )
}
