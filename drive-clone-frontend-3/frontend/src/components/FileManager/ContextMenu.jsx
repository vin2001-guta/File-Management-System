import React, { useEffect, useRef } from 'react'
import {
  Download, Star, StarOff, Edit2, Move, Trash2, RotateCcw,
  Trash, Share2, Link, Info, FolderOpen
} from 'lucide-react'

export default function ContextMenu({ x, y, item, type, isTrash, onAction, onClose }) {
  const ref = useRef()

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  // Adjust position to stay in viewport
  const style = {
    top: Math.min(y, window.innerHeight - 320),
    left: Math.min(x, window.innerWidth - 200),
  }

  const action = (name) => (e) => {
    e.stopPropagation()
    onAction(name, item, type)
    onClose()
  }

  if (isTrash) {
    return (
      <div ref={ref} className="context-menu animate-fadeIn" style={style}>
        <button className="context-menu-item" onClick={action('restore')}>
          <RotateCcw className="w-4 h-4" /> Restore
        </button>
        <div className="context-menu-divider" />
        <button className="context-menu-item danger" onClick={action('deletePermanent')}>
          <Trash className="w-4 h-4" /> Delete forever
        </button>
      </div>
    )
  }

  return (
    <div ref={ref} className="context-menu animate-fadeIn" style={style}>
      {type === 'file' && (
        <button className="context-menu-item" onClick={action('download')}>
          <Download className="w-4 h-4 text-gray-400" /> Download
        </button>
      )}
      {type === 'folder' && (
        <button className="context-menu-item" onClick={action('open')}>
          <FolderOpen className="w-4 h-4 text-gray-400" /> Open
        </button>
      )}
      <div className="context-menu-divider" />
      <button className="context-menu-item" onClick={action('share')}>
        <Share2 className="w-4 h-4 text-gray-400" /> Share
      </button>
      {type === 'file' && (
        <button className="context-menu-item" onClick={action('shareLink')}>
          <Link className="w-4 h-4 text-gray-400" /> Copy link
        </button>
      )}
      <div className="context-menu-divider" />
      <button className="context-menu-item" onClick={action('rename')}>
        <Edit2 className="w-4 h-4 text-gray-400" /> Rename
      </button>
      <button className="context-menu-item" onClick={action('move')}>
        <Move className="w-4 h-4 text-gray-400" /> Move to
      </button>
      <button className="context-menu-item" onClick={action('star')}>
        {item.starred
          ? <><StarOff className="w-4 h-4 text-gray-400" /> Remove from starred</>
          : <><Star className="w-4 h-4 text-gray-400" /> Add to starred</>
        }
      </button>
      <div className="context-menu-divider" />
      <button className="context-menu-item danger" onClick={action('trash')}>
        <Trash2 className="w-4 h-4" /> Move to trash
      </button>
    </div>
  )
}
