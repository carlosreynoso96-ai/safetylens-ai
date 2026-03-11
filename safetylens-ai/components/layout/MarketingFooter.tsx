import Link from 'next/link'
import { Camera } from 'lucide-react'

const footerLinks = [
  { label: 'Terms', href: '/terms' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Contact', href: '/contact' },
]

export default function MarketingFooter() {
  return (
    <footer className="border-t border-gray-100 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">
          {/* Brand */}
          <div className="flex flex-col items-center gap-3 md:items-start">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-white">
                <Camera className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold tracking-tight text-gray-900">
                Vor<span className="text-orange-500">sa</span>
                <span className="ml-1 text-xs font-normal text-gray-400">AI</span>
              </span>
            </Link>
            <p className="max-w-xs text-center text-sm leading-relaxed text-gray-500 md:text-left">
              Built by construction professionals, for construction professionals.
            </p>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-6">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-500 transition-colors hover:text-orange-500"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Divider and copyright */}
        <div className="mt-8 border-t border-gray-200 pt-6 text-center">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} OSO Construction Tech. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
