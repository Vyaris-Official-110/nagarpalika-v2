import api from './index'

export const sendOtp = (data) => api.post('/api/v1/otr/aadhaar/send-otp', data)
export const verifyOtp = (data) => api.post('/api/v1/otr/aadhaar/verify-otp', data)
export const getProfile = () => api.get('/api/v1/otr/me')
export const saveStep = (step, data) => api.put(`/api/v1/otr/step/${step}`, data)
export const submitRegistration = (data) => api.post('/api/v1/otr/submit', data)
export const login = (data) => api.post('/api/v1/otr/login', data)
export const logout = () => api.post('/api/v1/otr/logout')
export const findRegistration = (data) => api.post('/api/v1/otr/find', data)

export const uploadPhoto = (file) => {
  const fd = new FormData()
  fd.append('photo', file)
  return api.post('/api/v1/otr/upload/photo', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const uploadSignature = (file) => {
  const fd = new FormData()
  fd.append('signature', file)
  return api.post('/api/v1/otr/upload/signature', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
