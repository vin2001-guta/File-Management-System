import React from 'react'
import { useDriveStore } from '../../hooks/useStore'
import { CheckCircle, XCircle, Upload } from 'lucide-react'

export default function UploadProgress() {
  const { uploadProgress } = useDriveStore()

  if (uploadProgress.length === 0) return null

  return (
    <div className="upload-progress animate-fadeIn">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <Upload className="w-4 h-4 text-primary-500" />
        <span className="text-sm font-medium text-gray-800">
          Uploading {uploadProgress.length} {uploadProgress.length === 1 ? 'file' : 'files'}
        </span>
      </div>
      <div className="max-h-48 overflow-y-auto">
        {uploadProgress.map((upload) => (
          <div key={upload.id} className="px-4 py-3 border-b border-gray-50 last:border-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-sm text-gray-700 truncate flex-1">{upload.name}</span>
              {upload.status === 'done' && <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />}
              {upload.status === 'error' && <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
              {upload.status === 'uploading' && (
                <span className="text-xs text-gray-400">{upload.progress}%</span>
              )}
            </div>
            {upload.status === 'uploading' && (
              <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 rounded-full transition-all duration-300"
                  style={{ width: `${upload.progress}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
