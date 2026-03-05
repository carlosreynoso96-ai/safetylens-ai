'use client'

import clsx from 'clsx'

interface ComplianceToggleProps {
  value: 'compliant' | 'non_compliant'
  onChange: (value: 'compliant' | 'non_compliant') => void
  disabled?: boolean
}

function ComplianceToggle({ value, onChange, disabled = false }: ComplianceToggleProps) {
  return (
    <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange('compliant')}
        className={clsx(
          'px-3 py-1.5 text-xs font-semibold transition-colors duration-150',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500/50 focus-visible:ring-inset',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          value === 'compliant'
            ? 'bg-green-600 text-white'
            : 'bg-transparent text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20',
        )}
      >
        POS
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange('non_compliant')}
        className={clsx(
          'px-3 py-1.5 text-xs font-semibold transition-colors duration-150',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50 focus-visible:ring-inset',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          value === 'non_compliant'
            ? 'bg-red-600 text-white'
            : 'bg-transparent text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20',
        )}
      >
        NEG
      </button>
    </div>
  )
}

export { ComplianceToggle }
