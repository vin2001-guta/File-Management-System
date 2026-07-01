import React from 'react'
import { ChevronRight, HardDrive } from 'lucide-react'
import { useDriveStore } from '../../hooks/useStore'
import { fileAPI } from '../../services/api'
import toast from 'react-hot-toast'

export default function Breadcrumb({ onOpenFolder }) {
  const { breadcrumbs, setCurrentFolder, setContents, setView } = useDriveStore()

  const navigateTo = async (folderId) => {
    try {
      const res = folderId
        ? await fileAPI.getFolder(folderId)
        : await fileAPI.getRoot()
      const { folders, files, breadcrumbs: crumbs } = res.data
      setCurrentFolder(folderId, crumbs || [])
      setContents(folders || [], files || [])
      setView('myDrive')
    } catch (err) {
      toast.error('Failed to navigate')
    }
  }

  return (
    <nav className="flex items-center gap-1 px-3 sm:px-6 py-2 sm:py-3 text-sm border-b border-gray-100 bg-white overflow-x-auto">
      <button
        onClick={() => navigateTo(null)}
        className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap shrink-0"
      >
        <HardDrive className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span className="font-medium text-xs sm:text-sm">My Drive</span>
      </button>

      {breadcrumbs.map((crumb, i) => (
        <React.Fragment key={crumb.id}>
          <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
          <button
            onClick={() => navigateTo(crumb.id)}
            className={`font-medium transition-colors whitespace-nowrap text-xs sm:text-sm ${
              i === breadcrumbs.length - 1
                ? 'text-gray-900 cursor-default'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {crumb.name}
          </button>
        </React.Fragment>
      ))}
    </nav>
  )
}
