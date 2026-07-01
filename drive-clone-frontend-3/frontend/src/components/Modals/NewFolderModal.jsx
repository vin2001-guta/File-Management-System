import React, { useState, useEffect, useRef } from 'react'
import { X, Folder, Share2, Copy, Check } from 'lucide-react'
import { folderAPI, fileAPI } from '../../services/api'
import { useDriveStore } from '../../hooks/useStore'
import { FOLDER_COLORS } from '../../utils/helpers'
import toast from 'react-hot-toast'

// ===== NEW FOLDER MODAL =====
export default function NewFolderModal({ onClose }) {
  const [name, setName] = useState('Untitled folder')
  const [color, setColor] = useState('#4F46E5')
  const [loading, setLoading] = useState(false)
  const { currentFolderId } = useDriveStore()
  const inputRef = useRef()

  useEffect(() => {
    inputRef.current?.select()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    try {
      await folderAPI.create({ name: name.trim(), parentId: currentFolderId, color })
      toast.success('Folder created')
      window.dispatchEvent(new Event('drive:refresh'))
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create folder')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">New folder</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleCreate} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Folder name</label>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <div className="flex gap-2">
              {FOLDER_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                  style={{ backgroundColor: c, borderColor: color === c ? '#fff' : c, boxShadow: color === c ? `0 0 0 2px ${c}` : 'none' }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="drive-btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading || !name.trim()} className="drive-btn-primary flex-1 justify-center">
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ===== RENAME MODAL =====
export function RenameModal({ item, type, onClose }) {
  const [name, setName] = useState(item.name)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef()

  useEffect(() => { inputRef.current?.select() }, [])

  const handleRename = async (e) => {
    e.preventDefault()
    if (!name.trim() || name === item.name) { onClose(); return }
    setLoading(true)
    try {
      if (type === 'file') await fileAPI.rename(item.id, name.trim())
      else await folderAPI.rename(item.id, name.trim())
      toast.success('Renamed successfully')
      window.dispatchEvent(new Event('drive:refresh'))
      onClose()
    } catch (err) {
      toast.error('Failed to rename')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Rename</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleRename} className="p-6 space-y-4">
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 text-sm"
          />
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="drive-btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading || !name.trim()} className="drive-btn-primary flex-1 justify-center">
              {loading ? 'Renaming...' : 'Rename'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ===== SHARE MODAL =====
export function ShareModal({ file, onClose }) {
  const [email, setEmail] = useState('')
  const [permission, setPermission] = useState('VIEW')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [shareLink, setShareLink] = useState('')

  const handleShare = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await fileAPI.share(file.id, { email, permission })
      toast.success(`Shared with ${email}`)
      setEmail('')
    } catch (err) {
      toast.error('Failed to share')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLink = async () => {
    try {
      const res = await fileAPI.generateShareLink(file.id)
      const link = `${window.location.origin}/shared/${res.data.data}`
      setShareLink(link)
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error('Failed to generate link')
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Share "{file.name}"</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-5">
          <form onSubmit={handleShare} className="space-y-3">
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 text-sm"
              />
              <select
                value={permission}
                onChange={(e) => setPermission(e.target.value)}
                className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              >
                <option value="VIEW">Viewer</option>
                <option value="COMMENT">Commenter</option>
                <option value="EDIT">Editor</option>
              </select>
            </div>
            <button type="submit" disabled={loading || !email} className="drive-btn-primary w-full justify-center">
              <Share2 className="w-4 h-4" />
              {loading ? 'Sharing...' : 'Share'}
            </button>
          </form>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Share link</p>
            <button onClick={handleCopyLink} className="drive-btn-secondary w-full justify-center">
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy link'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
