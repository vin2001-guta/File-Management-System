import React, { useState } from 'react'
import { useDriveStore, useAuthStore } from '../../hooks/useStore'
import { formatFileSize, getInitials } from '../../utils/helpers'
import {
  HardDrive, Star, Trash2, Clock, Share2, Upload, FolderPlus,
  ChevronDown, LogOut, User, X
} from 'lucide-react'
import NewFolderModal from '../Modals/NewFolderModal'
import UploadButton from '../FileManager/UploadButton'

export default function Sidebar({ onClose }) {
  const { currentView, setView, storageInfo } = useDriveStore()
  const { user, logout } = useAuthStore()
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [showNewMenu, setShowNewMenu] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const navItems = [
    { id: 'myDrive', label: 'My Drive', icon: HardDrive },
    { id: 'recent', label: 'Recent', icon: Clock },
    { id: 'starred', label: 'Starred', icon: Star },
    { id: 'shared', label: 'Shared with me', icon: Share2 },
    { id: 'trash', label: 'Trash', icon: Trash2 },
  ]

  const storagePercent = storageInfo
    ? Math.min(100, (storageInfo.storageUsed / storageInfo.storageLimit) * 100)
    : 0

  return (
    <aside className="w-64 shrink-0 flex flex-col h-full border-r border-gray-100 bg-white">
      {/* Header with close button on mobile */}
      <div className="px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <HardDrive className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-800">Drive</span>
        </div>
        {/* Close button only on mobile */}
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* New Button */}
      <div className="px-4 pb-4">
        <div className="relative">
          <button
            onClick={() => setShowNewMenu(!showNewMenu)}
            className="flex items-center gap-2 px-5 py-3 bg-surface-100 hover:bg-surface-200 rounded-2xl text-sm font-medium text-gray-700 transition-colors shadow-sm hover:shadow w-full"
          >
            <span className="text-xl leading-none">+</span>
            <span>New</span>
            <ChevronDown className="w-4 h-4 ml-auto" />
          </button>
          {showNewMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowNewMenu(false)} />
              <div className="absolute top-full left-0 mt-1 w-full bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
                <UploadButton
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 cursor-pointer"
                  onUploadDone={() => setShowNewMenu(false)}
                >
                  <Upload className="w-4 h-4 text-gray-500" />
                  Upload files
                </UploadButton>
                <button
                  onClick={() => { setShowNewFolder(true); setShowNewMenu(false) }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                >
                  <FolderPlus className="w-4 h-4 text-gray-500" />
                  New folder
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { setView(id); onClose?.() }}
            className={`sidebar-item w-full text-left ${currentView === id ? 'active' : ''}`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* Storage */}
      <div className="px-4 py-4 border-t border-gray-100">
        <div className="storage-bar mb-2">
          <div className="storage-bar-fill" style={{ width: `${storagePercent}%` }} />
        </div>
        <p className="text-xs text-gray-500">
          {formatFileSize(storageInfo?.storageUsed || 0)} of {formatFileSize(storageInfo?.storageLimit || 15 * 1024 * 1024 * 1024)} used
        </p>
      </div>

      {/* User */}
      <div className="px-3 py-3 border-t border-gray-100 relative">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
            {getInitials(user?.firstName, user?.lastName)}
          </div>
          <div className="flex-1 text-left min-w-0">
            <div className="text-sm font-medium text-gray-800 truncate">{user?.firstName} {user?.lastName}</div>
            <div className="text-xs text-gray-500 truncate">{user?.email}</div>
          </div>
        </button>

        {showUserMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
            <div className="absolute bottom-full left-3 right-3 mb-1 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
              <div className="px-4 py-2.5 border-b border-gray-100">
                <div className="text-sm font-medium text-gray-800">{user?.firstName} {user?.lastName}</div>
                <div className="text-xs text-gray-500">{user?.email}</div>
              </div>
              <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                <User className="w-4 h-4" /> Profile
              </button>
              <button
                onClick={logout}
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
              >
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </div>
          </>
        )}
      </div>

      {showNewFolder && <NewFolderModal onClose={() => setShowNewFolder(false)} />}
    </aside>
  )
}
