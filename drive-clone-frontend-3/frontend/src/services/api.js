import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'
const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ===== AUTH =====
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
}

// ===== FILES =====
export const fileAPI = {
  upload: (file, folderId, onProgress) => {
    const formData = new FormData()
    formData.append('file', file)
    if (folderId) formData.append('folderId', folderId)
    return api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress) onProgress(Math.round((e.loaded * 100) / e.total))
      },
    })
  },
  download: (fileId, filename) =>
    api.get(`/files/download/${fileId}`, { responseType: 'blob' }).then((res) => {
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename || 'download')
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    }),
  getRoot: () => api.get('/files/root'),
  getFolder: (folderId) => api.get(`/files/folder/${folderId}`),
  getStarred: () => api.get('/files/starred'),
  getTrash: () => api.get('/files/trash'),
  getRecent: (limit = 20) => api.get(`/files/recent?limit=${limit}`),
  search: (q) => api.get(`/files/search?q=${encodeURIComponent(q)}`),
  rename: (fileId, name) => api.put(`/files/${fileId}/rename`, { name }),
  move: (fileId, targetFolderId) => api.put(`/files/${fileId}/move`, { targetFolderId }),
  star: (fileId) => api.put(`/files/${fileId}/star`),
  trash: (fileId) => api.put(`/files/${fileId}/trash`),
  restore: (fileId) => api.put(`/files/${fileId}/restore`),
  delete: (fileId) => api.delete(`/files/${fileId}`),
  share: (fileId, data) => api.post(`/files/${fileId}/share`, data),
  generateShareLink: (fileId) => api.post(`/files/${fileId}/share-link`),
  getStorage: () => api.get('/files/storage'),
}

// ===== FOLDERS =====
export const folderAPI = {
  create: (data) => api.post('/folders', data),
  rename: (folderId, name) => api.put(`/folders/${folderId}/rename`, { name }),
  move: (folderId, targetFolderId) => api.put(`/folders/${folderId}/move`, { targetFolderId }),
  star: (folderId) => api.put(`/folders/${folderId}/star`),
  trash: (folderId) => api.put(`/folders/${folderId}/trash`),
  restore: (folderId) => api.put(`/folders/${folderId}/restore`),
  delete: (folderId) => api.delete(`/folders/${folderId}`),
  updateColor: (folderId, color) => api.put(`/folders/${folderId}/color`, { color }),
}

// ===== USER =====
export const userAPI = {
  getMe: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/me', data),
  getActivity: (limit = 20) => api.get(`/users/activity?limit=${limit}`),
}

export default api
