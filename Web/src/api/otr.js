import api from './index'

export const sendOtp = (data) => api.post('/api/v1/otr/aadhaar/send-otp', data)
export const verifyOtp = (data) => api.post('/api/v1/otr/aadhaar/verify-otp', data)
export const getProfile = () => api.get('/api/v1/otr/me')
export const saveStep = (step, data) => api.put(`/api/v1/otr/step/${step}`, data)
export const submitRegistration = (data) => api.post('/api/v1/otr/submit', data)
export const login = (data) => api.post('/api/v1/otr/login', data)
export const logout = () => api.post('/api/v1/otr/logout')

// Email OTP (gap 2)
export const sendEmailOtp = (data) => api.post('/api/v1/otr/email/send-otp', data)
export const verifyEmailOtp = (data) => api.post('/api/v1/otr/email/verify-otp', data)

// Find Registration — two-step (gap 3)
export const findSendOtp = (data) => api.post('/api/v1/otr/find/send-otp', data)
export const findVerifyOtp = (data) => api.post('/api/v1/otr/find/verify-otp', data)

// Password Reset (gap 8)
export const passwordResetSend = (data) => api.post('/api/v1/otr/password-reset/send', data)
export const passwordResetVerify = (data) => api.post('/api/v1/otr/password-reset/verify', data)

// Edit Confirm OTP (gap 10)
export const editConfirmSend = () => api.post('/api/v1/otr/edit/confirm/send')
export const editConfirmVerify = (data) => api.post('/api/v1/otr/edit/confirm/verify', data)

// Edit Verify Access (gap 11)
export const editVerifyAccess = (data) => api.post('/api/v1/otr/edit/verify-access', data)
export const editVerifyAccessOtp = (data) => api.post('/api/v1/otr/edit/verify-access/otp', data)

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
