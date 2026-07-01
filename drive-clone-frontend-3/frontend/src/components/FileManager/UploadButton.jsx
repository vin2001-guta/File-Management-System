import React, { useRef } from 'react'
import { fileAPI } from '../../services/api'
import { useDriveStore } from '../../hooks/useStore'
import toast from 'react-hot-toast'

export default function UploadButton({ children, className }) {
  const inputRef = useRef()
  const { currentFolderId, addUpload, updateUpload, removeUpload } = useDriveStore()

  const handleFiles = async (files) => {
    for (const file of files) {
      const uploadId = addUpload(file.name)
      try {
        await fileAPI.upload(file, currentFolderId, (progress) => {
          updateUpload(uploadId, progress)
        })
        updateUpload(uploadId, 100, 'done')
        removeUpload(uploadId)
        toast.success(`${file.name} uploaded`)
        window.dispatchEvent(new Event('drive:refresh'))
      } catch (err) {
        updateUpload(uploadId, 0, 'error')
        removeUpload(uploadId)
        toast.error(err.response?.data?.message || `Failed to upload ${file.name}`)
      }
    }
  }

  return (
    <>
      <div
        onClick={() => inputRef.current.click()}
        className={className}
      >
        {children}
      </div>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(Array.from(e.target.files))}
      />
    </>
  )
}
