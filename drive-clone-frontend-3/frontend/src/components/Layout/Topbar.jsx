import React, { useState, useCallback, useRef } from 'react'
import { Search, Grid3x3, List, X, Menu } from 'lucide-react'
import { useDriveStore } from '../../hooks/useStore'
import { fileAPI } from '../../services/api'

const debounce = (fn, delay) => {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

export default function Topbar({ onMenuClick }) {
  const { viewMode, setViewMode, setSearchQuery, setSearchResults, setView } = useDriveStore()
  const [inputValue, setInputValue] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)

  const doSearch = useCallback(
    debounce(async (q) => {
      if (!q.trim()) { setSearchResults(null); return }
      setSearching(true)
      try {
        const res = await fileAPI.search(q)
        setSearchResults(res.data)
        setView('search')
      } catch (err) {
        console.error(err)
      } finally {
        setSearching(false)
      }
    }, 400), []
  )

  const handleInput = (e) => {
    setInputValue(e.target.value)
    setSearchQuery(e.target.value)
    doSearch(e.target.value)
  }

  const clearSearch = () => {
    setInputValue('')
    setSearchQuery('')
    setSearchResults(null)
    setView('myDrive')
  }

  return (
    <header className="h-14 sm:h-16 flex items-center px-3 sm:px-6 gap-2 sm:gap-4 border-b border-gray-100 bg-white shrink-0">
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600 shrink-0"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-2xl">
        <div className={`search-bar ${searchFocused ? 'ring-1 ring-primary-500/30 bg-white shadow-md' : ''}`}>
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            value={inputValue}
            onChange={handleInput}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search in Drive"
            className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 min-w-0"
          />
          {inputValue && (
            <button onClick={clearSearch} className="p-0.5 hover:bg-gray-200 rounded-full shrink-0">
              <X className="w-3.5 h-3.5 text-gray-500" />
            </button>
          )}
          {searching && (
            <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin shrink-0" />
          )}
        </div>
      </div>

      {/* View toggles */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5 shrink-0">
        <button
          onClick={() => setViewMode('grid')}
          className={`p-1.5 sm:p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Grid3x3 className="w-4 h-4" />
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`p-1.5 sm:p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <List className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}
