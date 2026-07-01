import React, { useEffect, useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import Sidebar from '../components/Layout/Sidebar'
import Topbar from '../components/Layout/Topbar'
import FileGrid from '../components/FileManager/FileGrid'
import Breadcrumb from '../components/FileManager/Breadcrumb'
import ContextMenu from '../components/FileManager/ContextMenu'
import UploadProgress from '../components/FileManager/UploadProgress'
import { RenameModal, ShareModal } from '../components/Modals/NewFolderModal'
import { useDriveStore } from '../hooks/useStore'
import { fileAPI, folderAPI } from '../services/api'
import { Cloud, Menu, X } from 'lucide-react'

export default function DrivePage() {
  const {
    currentView, currentFolderId, folders, files,
    setContents, setCurrentFolder, setLoading, isLoading,
    setStorageInfo, searchResults, clearSelection, selectItem,
    addUpload, updateUpload, removeUpload,
  } = useDriveStore()

  const [contextMenu, setContextMenu] = useState(null)
  const [modal, setModal] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const loadContents = useCallback(async () => {
    setLoading(true)
    try {
      let res
      if (currentView === 'myDrive') {
        res = currentFolderId
          ? await fileAPI.getFolder(currentFolderId)
          : await fileAPI.getRoot()
        setContents(res.data.folders || [], res.data.files || [])
        if (!currentFolderId) setCurrentFolder(null, [])
        else if (res.data.breadcrumbs) setCurrentFolder(currentFolderId, res.data.breadcrumbs)
      } else if (currentView === 'starred') {
        res = await fileAPI.getStarred()
        setContents(res.data.folders || [], res.data.files || [])
      } else if (currentView === 'trash') {
        res = await fileAPI.getTrash()
        setContents(res.data.folders || [], res.data.files || [])
      } else if (currentView === 'recent') {
        res = await fileAPI.getRecent(50)
        setContents([], res.data || [])
      }
    } catch (err) {
      console.error('Failed to load contents', err)
    } finally {
      setLoading(false)
    }
  }, [currentView, currentFolderId])

  const loadStorage = async () => {
    try {
      const res = await fileAPI.getStorage()
      setStorageInfo(res.data)
    } catch (err) {}
  }

  useEffect(() => {
    loadContents()
    loadStorage()
  }, [loadContents])

  useEffect(() => {
    const handler = () => { loadContents(); loadStorage() }
    window.addEventListener('drive:refresh', handler)
    return () => window.removeEventListener('drive:refresh', handler)
  }, [loadContents])

  // Close sidebar on route/view change on mobile
  useEffect(() => { setSidebarOpen(false) }, [currentView, currentFolderId])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    noClick: true,
    onDrop: async (acceptedFiles) => {
      for (const file of acceptedFiles) {
        const uploadId = addUpload(file.name)
        try {
          await fileAPI.upload(file, currentFolderId, (progress) => updateUpload(uploadId, progress))
          updateUpload(uploadId, 100, 'done')
          removeUpload(uploadId)
          toast.success(`${file.name} uploaded`)
        } catch (err) {
          updateUpload(uploadId, 0, 'error')
          removeUpload(uploadId)
          toast.error(`Failed to upload ${file.name}`)
        }
      }
      loadContents()
      loadStorage()
    },
  })

  const handleContextMenu = (e, item, type) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ x: e.clientX, y: e.clientY, item, type })
  }

  const handleContextAction = async (action, item, type) => {
    setContextMenu(null)
    const isFile = type === 'file'
    const api = isFile ? fileAPI : folderAPI
    try {
      switch (action) {
        case 'download':
          await fileAPI.download(item.id, item.originalName || item.name); break
        case 'open':
          if (!isFile) handleOpenFolder(item); break
        case 'rename':
          setModal({ type: 'rename', item, itemType: type }); break
        case 'share':
          if (isFile) setModal({ type: 'share', item }); break
        case 'shareLink':
          const linkRes = await fileAPI.generateShareLink(item.id)
          await navigator.clipboard.writeText(`${window.location.origin}/shared/${linkRes.data.data}`)
          toast.success('Link copied!'); break
        case 'star':
          await api.star(item.id)
          toast.success(item.starred ? 'Removed from starred' : 'Added to starred')
          loadContents(); break
        case 'trash':
          await api.trash(item.id)
          toast.success('Moved to trash')
          loadContents(); loadStorage(); break
        case 'restore':
          await api.restore(item.id)
          toast.success('Restored')
          loadContents(); loadStorage(); break
        case 'deletePermanent':
          if (window.confirm('Delete forever? This cannot be undone.')) {
            await api.delete(item.id)
            toast.success('Deleted permanently')
            loadContents(); loadStorage()
          }; break
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed')
    }
  }

  const handleOpenFolder = async (folder) => {
    setLoading(true)
    try {
      const res = await fileAPI.getFolder(folder.id)
      setCurrentFolder(folder.id, res.data.breadcrumbs || [])
      setContents(res.data.folders || [], res.data.files || [])
      // Switch to myDrive view so breadcrumb shows
      useDriveStore.getState().setView('myDrive')
    } catch (err) {
      toast.error('Failed to open folder')
    } finally {
      setLoading(false)
    }
  }

  const getTitle = () => {
    const { breadcrumbs } = useDriveStore.getState()
    if (currentView === 'myDrive' && breadcrumbs.length > 0) {
      return breadcrumbs[breadcrumbs.length - 1].name
    }
    const titles = { myDrive: 'My Drive', starred: 'Starred', trash: 'Trash', recent: 'Recent', search: 'Search results', shared: 'Shared with me' }
    return titles[currentView] || 'Drive'
  }

  const displayFolders = currentView === 'search' ? (searchResults?.folders || []) : folders
  const displayFiles = currentView === 'search' ? (searchResults?.files || []) : files
  const isEmpty = !isLoading && displayFolders.length === 0 && displayFiles.length === 0

  return (
    <div className="flex h-screen overflow-hidden bg-white" {...getRootProps()}>
      <input {...getInputProps()} />

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — hidden on mobile unless open */}
      <div className={`
        fixed inset-y-0 left-0 z-50 lg:relative lg:z-auto
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Breadcrumb — always shown in myDrive */}
        {currentView === 'myDrive' && <Breadcrumb onOpenFolder={handleOpenFolder} />}

        {/* Content area */}
        <div
          className="flex-1 overflow-y-auto px-3 sm:px-6 py-4"
          onClick={() => clearSelection()}
        >
          <h1 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">{getTitle()}</h1>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : isEmpty ? (
            <div className="flex flex-col items-center justify-center h-64 text-center px-4">
              <Cloud className="w-14 h-14 sm:w-16 sm:h-16 text-gray-200 mb-4" />
              <p className="text-gray-500 font-medium text-sm sm:text-base">
                {currentView === 'trash' ? 'Trash is empty' :
                 currentView === 'starred' ? 'No starred items' :
                 currentView === 'search' ? 'No results found' :
                 'This folder is empty'}
              </p>
              <p className="text-gray-400 text-xs sm:text-sm mt-1">
                {currentView === 'myDrive' ? 'Upload files or create a new folder' : ''}
              </p>
            </div>
          ) : (
            <div className="animate-fadeIn">
              {displayFolders.length > 0 && (
                <div className="mb-6">
                  {currentView !== 'trash' && (
                    <h2 className="text-xs sm:text-sm font-medium text-gray-500 mb-3">Folders</h2>
                  )}
                  <FileGrid
                    folders={displayFolders}
                    files={[]}
                    onContextMenu={handleContextMenu}
                    onOpenFolder={handleOpenFolder}
                    onSelectItem={(id, type, multi) => selectItem(id, type, multi)}
                  />
                </div>
              )}
              {displayFiles.length > 0 && (
                <div>
                  {displayFolders.length > 0 && currentView !== 'trash' && (
                    <h2 className="text-xs sm:text-sm font-medium text-gray-500 mb-3">Files</h2>
                  )}
                  <FileGrid
                    folders={[]}
                    files={displayFiles}
                    onContextMenu={handleContextMenu}
                    onOpenFolder={handleOpenFolder}
                    onSelectItem={(id, type, multi) => selectItem(id, type, multi)}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Drag overlay */}
      {isDragActive && (
        <div className="upload-overlay animate-fadeIn">
          <div className="text-center">
            <Cloud className="w-16 h-16 sm:w-20 sm:h-20 text-primary-500 mx-auto mb-4" />
            <p className="text-xl sm:text-2xl font-bold text-primary-600">Drop files to upload</p>
          </div>
        </div>
      )}

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          item={contextMenu.item}
          type={contextMenu.type}
          isTrash={currentView === 'trash'}
          onAction={handleContextAction}
          onClose={() => setContextMenu(null)}
        />
      )}

      {modal?.type === 'rename' && (
        <RenameModal item={modal.item} type={modal.itemType} onClose={() => setModal(null)} />
      )}
      {modal?.type === 'share' && (
        <ShareModal file={modal.item} onClose={() => setModal(null)} />
      )}

      <UploadProgress />
    </div>
  )
}
