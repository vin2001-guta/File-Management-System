import { format, formatDistanceToNow } from 'date-fns'

export const formatFileSize = (bytes) => {
  if (!bytes) return '—'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
}

export const formatDate = (date) => {
  if (!date) return '—'
  const d = new Date(date)
  const now = new Date()
  const diff = now - d
  if (diff < 7 * 24 * 60 * 60 * 1000) return formatDistanceToNow(d, { addSuffix: true })
  return format(d, 'MMM d, yyyy')
}

export const getFileIcon = (mimeType, extension) => {
  if (!mimeType) return '📄'
  if (mimeType.startsWith('image/')) return '🖼️'
  if (mimeType.startsWith('video/')) return '🎬'
  if (mimeType.startsWith('audio/')) return '🎵'
  if (mimeType.includes('pdf')) return '📕'
  if (mimeType.includes('spreadsheet') || ['xls', 'xlsx', 'csv'].includes(extension)) return '📗'
  if (mimeType.includes('presentation') || ['ppt', 'pptx'].includes(extension)) return '📙'
  if (mimeType.includes('word') || ['doc', 'docx'].includes(extension)) return '📘'
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) return '🗜️'
  if (mimeType.includes('text') || ['txt', 'md', 'json', 'xml'].includes(extension)) return '📝'
  if (['js', 'ts', 'py', 'java', 'cpp', 'c', 'go', 'rs'].includes(extension)) return '💻'
  return '📄'
}

export const getFileColor = (mimeType) => {
  if (!mimeType) return '#6B7280'
  if (mimeType.startsWith('image/')) return '#F59E0B'
  if (mimeType.startsWith('video/')) return '#8B5CF6'
  if (mimeType.startsWith('audio/')) return '#EC4899'
  if (mimeType.includes('pdf')) return '#EF4444'
  if (mimeType.includes('spreadsheet')) return '#10B981'
  if (mimeType.includes('presentation')) return '#F97316'
  if (mimeType.includes('word')) return '#3B82F6'
  return '#6B7280'
}

export const isImage = (mimeType) => mimeType?.startsWith('image/')
export const isVideo = (mimeType) => mimeType?.startsWith('video/')
export const isPDF = (mimeType) => mimeType?.includes('pdf')

export const getMimeTypeLabel = (mimeType) => {
  if (!mimeType) return 'File'
  if (mimeType.startsWith('image/')) return mimeType.replace('image/', '').toUpperCase()
  if (mimeType.startsWith('video/')) return mimeType.replace('video/', '').toUpperCase() + ' Video'
  if (mimeType.includes('pdf')) return 'PDF'
  if (mimeType.includes('spreadsheet')) return 'Spreadsheet'
  if (mimeType.includes('presentation')) return 'Presentation'
  if (mimeType.includes('word')) return 'Document'
  return mimeType.split('/')[1]?.toUpperCase() || 'File'
}

export const getInitials = (firstName, lastName) => {
  return `${(firstName || '')[0] || ''}${(lastName || '')[0] || ''}`.toUpperCase()
}

export const FOLDER_COLORS = [
  '#4F46E5', '#7C3AED', '#DB2777', '#DC2626',
  '#D97706', '#059669', '#0891B2', '#6B7280',
]
