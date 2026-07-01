import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),

  login: (user, token) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    set({ user, token, isAuthenticated: true })
  },
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ user: null, token: null, isAuthenticated: false })
  },
  updateUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user))
    set({ user })
  },
}))

export const useDriveStore = create((set, get) => ({
  currentView: 'myDrive',
  currentFolderId: null,
  breadcrumbs: [],
  folders: [],
  files: [],
  selectedItems: new Set(),
  viewMode: localStorage.getItem('viewMode') || 'grid',
  searchQuery: '',
  searchResults: null,
  storageInfo: null,
  isLoading: false,
  uploadProgress: [],

  setView: (view) => set({
    currentView: view,
    selectedItems: new Set(),
    searchResults: null,
    // Reset folder only when switching away from myDrive
    ...(view !== 'myDrive' ? { currentFolderId: null, breadcrumbs: [] } : {}),
  }),

  setCurrentFolder: (folderId, breadcrumbs) => set({
    currentFolderId: folderId,
    breadcrumbs: breadcrumbs || [],
  }),

  setContents: (folders, files) => set({ folders, files }),
  setLoading: (isLoading) => set({ isLoading }),

  setViewMode: (mode) => {
    localStorage.setItem('viewMode', mode)
    set({ viewMode: mode })
  },

  setSearchQuery: (q) => set({ searchQuery: q }),
  setSearchResults: (results) => set({ searchResults: results }),
  setStorageInfo: (info) => set({ storageInfo: info }),

  selectItem: (id, type, multi = false) => {
    const key = `${type}:${id}`
    set((state) => {
      const newSet = new Set(multi ? state.selectedItems : [])
      if (newSet.has(key)) newSet.delete(key)
      else newSet.add(key)
      return { selectedItems: newSet }
    })
  },
  clearSelection: () => set({ selectedItems: new Set() }),
  selectAll: () => {
    const { folders, files } = get()
    set({
      selectedItems: new Set([
        ...folders.map(f => `folder:${f.id}`),
        ...files.map(f => `file:${f.id}`),
      ])
    })
  },

  addUpload: (name) => {
    const id = Date.now()
    set((state) => ({
      uploadProgress: [...state.uploadProgress, { id, name, progress: 0, status: 'uploading' }]
    }))
    return id
  },
  updateUpload: (id, progress, status = 'uploading') => {
    set((state) => ({
      uploadProgress: state.uploadProgress.map(u =>
        u.id === id ? { ...u, progress, status } : u
      )
    }))
  },
  removeUpload: (id) => {
    setTimeout(() => {
      set((state) => ({
        uploadProgress: state.uploadProgress.filter(u => u.id !== id)
      }))
    }, 2000)
  },
}))
