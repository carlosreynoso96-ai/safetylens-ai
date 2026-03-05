import {
  ClipboardList,
  PenLine,
  Clock,
  AlertTriangle,
  Camera,
  Zap,
  ShieldCheck,
  FileCheck,
} from 'lucide-react'

const beforeItems = [
  { icon: ClipboardList, text: 'Manual clipboards and paper checklists' },
  { icon: PenLine, text: 'Handwritten notes lost in filing cabinets' },
  { icon: Clock, text: 'Hours of paperwork after every walk' },
  { icon: AlertTriangle, text: 'Missed hazards from inconsistent processes' },
]

const afterItems = [
  { icon: Camera, text: 'Snap a photo, get an instant AI analysis' },
  { icon: Zap, text: 'OSHA-cited reports generated in seconds' },
  { icon: ShieldCheck, text: 'Consistent, comprehensive hazard detection' },
  { icon: FileCheck, text: 'Digital records with full audit history' },
]

export default function BeforeAfter() {
  return (
    <section className="bg-gray-50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-orange-500">
            The Transformation
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            From Paperwork to AI-Powered Safety
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-gray-600">
            See how SafetyLens replaces outdated manual processes with intelligent
            automation.
          </p>
        </div>

        {/* Before / After cards */}
        <div className="mx-auto mt-16 grid max-w-5xl gap-8 lg:grid-cols-2">
          {/* Before card */}
          <div className="relative rounded-2xl border border-red-100 bg-white p-8 shadow-sm sm:p-10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <span className="inline-block rounded-full bg-red-100 px-3 py-0.5 text-xs font-bold uppercase tracking-wide text-red-700">
                  Before
                </span>
                <h3 className="mt-1 text-lg font-bold text-gray-900">
                  The Old Way
                </h3>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-gray-500">
              Manual processes that drain time, introduce errors, and leave safety
              gaps on every project.
            </p>
            <ul className="mt-6 space-y-4">
              {beforeItems.map((item) => (
                <li key={item.text} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-400">
                    <item.icon className="h-4.5 w-4.5" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* After card */}
          <div className="relative rounded-2xl border border-green-100 bg-white p-8 shadow-sm sm:p-10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-500">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <span className="inline-block rounded-full bg-green-100 px-3 py-0.5 text-xs font-bold uppercase tracking-wide text-green-700">
                  After
                </span>
                <h3 className="mt-1 text-lg font-bold text-gray-900">
                  The SafetyLens Way
                </h3>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-gray-500">
              AI-powered workflows that turn minutes of effort into comprehensive,
              OSHA-compliant safety documentation.
            </p>
            <ul className="mt-6 space-y-4">
              {afterItems.map((item) => (
                <li key={item.text} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-500">
                    <item.icon className="h-4.5 w-4.5" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom comparison stat */}
        <div className="mx-auto mt-12 max-w-xl text-center">
          <div className="rounded-2xl border border-orange-100 bg-orange-50/50 p-6">
            <p className="text-sm font-semibold text-orange-700">
              Average time savings
            </p>
            <p className="mt-1 text-3xl font-extrabold text-gray-900">
              3+ hours per safety walk
            </p>
            <p className="mt-1 text-sm text-gray-500">
              From photo to finished report, in minutes instead of hours
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
