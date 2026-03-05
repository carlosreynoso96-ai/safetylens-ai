'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import clsx from 'clsx'
import { ChevronDown, Search, Check } from 'lucide-react'
import { SAFETY_CATEGORIES } from '@/lib/constants/categories'

interface CategorySelectProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
}

function CategorySelect({ value, onChange, disabled = false, className }: CategorySelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = SAFETY_CATEGORIES.filter((cat) =>
    cat.toLowerCase().includes(search.toLowerCase()),
  )

  const handleSelect = useCallback(
    (category: string) => {
      onChange(category)
      setSearch('')
      setIsOpen(false)
    },
    [onChange],
  )

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setSearch('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus input when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  return (
    <div ref={containerRef} className={clsx('relative', className)}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm text-left',
          'bg-white dark:bg-gray-900',
          'transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-offset-1',
          'disabled:cursor-not-allowed disabled:opacity-50',
          isOpen
            ? 'border-[#f97316] ring-2 ring-[#f97316]/30'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500',
        )}
      >
        <span
          className={clsx(
            value
              ? 'text-gray-900 dark:text-gray-100'
              : 'text-gray-400 dark:text-gray-500',
          )}
        >
          {value || 'Select category...'}
        </span>
        <ChevronDown
          size={16}
          className={clsx(
            'shrink-0 text-gray-400 transition-transform duration-150',
            isOpen && 'rotate-180',
          )}
        />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          className={clsx(
            'absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg',
            'dark:border-gray-700 dark:bg-gray-900',
            'overflow-hidden',
          )}
        >
          {/* Search Input */}
          <div className="relative border-b border-gray-200 dark:border-gray-700">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories..."
              className={clsx(
                'w-full border-0 bg-transparent py-2.5 pl-9 pr-3 text-sm',
                'text-gray-900 dark:text-gray-100',
                'placeholder:text-gray-400 dark:placeholder:text-gray-500',
                'focus:outline-none focus:ring-0',
              )}
            />
          </div>

          {/* Options List */}
          <ul className="max-h-60 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                No categories found
              </li>
            ) : (
              filtered.map((category) => (
                <li key={category}>
                  <button
                    type="button"
                    onClick={() => handleSelect(category)}
                    className={clsx(
                      'flex w-full items-center gap-2 px-3 py-2 text-sm text-left',
                      'transition-colors duration-100',
                      category === value
                        ? 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
                        : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800',
                    )}
                  >
                    {category === value && (
                      <Check size={14} className="shrink-0 text-orange-500" />
                    )}
                    <span className={category === value ? '' : 'ml-[22px]'}>
                      {category}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

export { CategorySelect }
