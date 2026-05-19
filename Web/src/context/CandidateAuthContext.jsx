import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../api/index'

const CandidateAuthContext = createContext(null)

export function CandidateAuthProvider({ children }) {
  const [candidate, setCandidate] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async () => {
    try {
      const res = await api.get('/api/v1/otr/me')
      setCandidate(res.data.data)
    } catch {
      setCandidate(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  const login = (data) => setCandidate(data)

  const logout = async () => {
    try {
      await api.post('/api/v1/otr/logout')
    } catch {
      // session already gone
    }
    setCandidate(null)
  }

  return (
    <CandidateAuthContext.Provider value={{ candidate, loading, login, logout, refetch: fetchProfile }}>
      {children}
    </CandidateAuthContext.Provider>
  )
}

export function useCandidateAuth() {
  return useContext(CandidateAuthContext)
}
