import React from 'react'
import { Folder, Star } from 'lucide-react'
import { formatFileSize, formatDate, getFileIcon, getFileColor } from '../../utils/helpers'
import { useDriveStore } from '../../hooks/useStore'

function FolderCard({ folder, selected, onContextMenu, onClick, onDoubleClick }) {
  return (
    <div
      className={`drive-item flex-col p-3 border rounded-xl group cursor-pointer select-none transition-all
        ${selected ? 'selected border-primary-300 bg-blue-50' : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'}`}
      onContextMenu={(e) => onContextMenu(e, folder, 'folder')}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      <div className="flex items-center justify-between w-full mb-2">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: (folder.color || '#4F46E5') + '20' }}>
          <Folder className="w-5 h-5 sm:w-6 sm:h-6" style={{ fill: folder.color || '#4F46E5', color: folder.color || '#4F46E5' }} />
        </div>
        {folder.starred && <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-400 fill-yellow-400 shrink-0" />}
      </div>
      <p className="text-xs sm:text-sm font-medium text-gray-800 truncate w-full">{folder.name}</p>
      <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">{formatDate(folder.updatedAt)}</p>
    </div>
  )
}

function FileCard({ file, selected, onContextMenu, onClick }) {
  const icon = getFileIcon(file.mimeType, file.fileExtension)
  const color = getFileColor(file.mimeType)
  return (
    <div
      className={`drive-item flex-col p-3 border rounded-xl group cursor-pointer select-none transition-all
        ${selected ? 'selected border-primary-300 bg-blue-50' : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'}`}
      onContextMenu={(e) => onContextMenu(e, file, 'file')}
      onClick={onClick}
    >
      <div className="flex items-center justify-between w-full mb-2">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-xl sm:text-2xl shrink-0"
          style={{ backgroundColor: color + '15' }}>
          {icon}
        </div>
        {file.starred && <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-400 fill-yellow-400 shrink-0" />}
      </div>
      <p className="text-xs sm:text-sm font-medium text-gray-800 truncate w-full">{file.name}</p>
      <p className="text-xs text-gray-400 mt-0.5">{formatFileSize(file.fileSize)}</p>
    </div>
  )
}

function FolderRow({ folder, selected, onContextMenu, onClick, onDoubleClick }) {
  return (
    <tr
      className={`group border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${selected ? 'bg-blue-50' : ''}`}
      onContextMenu={(e) => onContextMenu(e, folder, 'folder')}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      <td className="py-2 px-3 sm:px-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded flex items-center justify-center shrink-0"
            style={{ backgroundColor: (folder.color || '#4F46E5') + '20' }}>
            <Folder className="w-4 h-4 sm:w-5 sm:h-5" style={{ fill: folder.color || '#4F46E5', color: folder.color || '#4F46E5' }} />
          </div>
          <span className="text-xs sm:text-sm text-gray-800 font-medium truncate max-w-[120px] sm:max-w-none">{folder.name}</span>
          {folder.starred && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 shrink-0" />}
        </div>
      </td>
      <td className="py-2 px-3 sm:px-4 text-xs sm:text-sm text-gray-500 hidden sm:table-cell">—</td>
      <td className="py-2 px-3 sm:px-4 text-xs sm:text-sm text-gray-500 hidden md:table-cell">Folder</td>
      <td className="py-2 px-3 sm:px-4 text-xs sm:text-sm text-gray-500 hidden sm:table-cell">{formatDate(folder.updatedAt)}</td>
    </tr>
  )
}

function FileRow({ file, selected, onContextMenu, onClick }) {
  const icon = getFileIcon(file.mimeType, file.fileExtension)
  return (
    <tr
      className={`group border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${selected ? 'bg-blue-50' : ''}`}
      onContextMenu={(e) => onContextMenu(e, file, 'file')}
      onClick={onClick}
    >
      <td className="py-2 px-3 sm:px-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-lg sm:text-xl shrink-0">{icon}</span>
          <span className="text-xs sm:text-sm text-gray-800 truncate max-w-[120px] sm:max-w-none">{file.name}</span>
          {file.starred && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 shrink-0" />}
        </div>
      </td>
      <td className="py-2 px-3 sm:px-4 text-xs sm:text-sm text-gray-500 hidden sm:table-cell">{formatFileSize(file.fileSize)}</td>
      <td className="py-2 px-3 sm:px-4 text-xs sm:text-sm text-gray-500 hidden md:table-cell">{file.mimeType?.split('/')[1]?.toUpperCase() || '—'}</td>
      <td className="py-2 px-3 sm:px-4 text-xs sm:text-sm text-gray-500 hidden sm:table-cell">{formatDate(file.updatedAt)}</td>
    </tr>
  )
}

export default function FileGrid({ folders, files, onContextMenu, onOpenFolder, onSelectItem }) {
  const { viewMode, selectedItems } = useDriveStore()

  if (viewMode === 'list') {
    return (
      <div className="overflow-x-auto -mx-3 sm:mx-0">
        <table className="w-full min-w-[320px] sm:min-w-[520px]">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-2 px-3 sm:px-4 text-xs font-medium text-gray-500">Name</th>
              <th className="text-left py-2 px-3 sm:px-4 text-xs font-medium text-gray-500 hidden sm:table-cell">Size</th>
              <th className="text-left py-2 px-3 sm:px-4 text-xs font-medium text-gray-500 hidden md:table-cell">Type</th>
              <th className="text-left py-2 px-3 sm:px-4 text-xs font-medium text-gray-500 hidden sm:table-cell">Modified</th>
            </tr>
          </thead>
          <tbody>
            {folders.map((folder) => (
              <FolderRow
                key={`folder-${folder.id}`}
                folder={folder}
                selected={selectedItems.has(`folder:${folder.id}`)}
                onContextMenu={onContextMenu}
                onClick={(e) => onSelectItem(folder.id, 'folder', e.ctrlKey || e.metaKey)}
                onDoubleClick={() => onOpenFolder(folder)}
              />
            ))}
            {files.map((file) => (
              <FileRow
                key={`file-${file.id}`}
                file={file}
                selected={selectedItems.has(`file:${file.id}`)}
                onContextMenu={onContextMenu}
                onClick={(e) => onSelectItem(file.id, 'file', e.ctrlKey || e.metaKey)}
              />
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="grid gap-2 sm:gap-3"
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 132px), 1fr))' }}>
      {folders.map((folder) => (
        <FolderCard
          key={`folder-${folder.id}`}
          folder={folder}
          selected={selectedItems.has(`folder:${folder.id}`)}
          onContextMenu={onContextMenu}
          onClick={(e) => onSelectItem(folder.id, 'folder', e.ctrlKey || e.metaKey)}
          onDoubleClick={() => onOpenFolder(folder)}
        />
      ))}
      {files.map((file) => (
        <FileCard
          key={`file-${file.id}`}
          file={file}
          selected={selectedItems.has(`file:${file.id}`)}
          onContextMenu={onContextMenu}
          onClick={(e) => onSelectItem(file.id, 'file', e.ctrlKey || e.metaKey)}
        />
      ))}
    </div>
  )
}
