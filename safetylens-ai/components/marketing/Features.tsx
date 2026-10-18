import {
  Camera,
  Headphones,
  Upload,
  FileText,
  ToggleRight,
  FileSpreadsheet,
  Mic,
  ClipboardList,
  HardHat,
  FileBarChart,
} from 'lucide-react'

const features = [
  {
    title: 'Vorsa Analyze',
    icon: Camera,
    color: 'orange' as const,
    description:
      'Drag and drop jobsite photos and let AI instantly identify hazards, cite OSHA standards, and generate detailed safety reports ready for your records.',
    bullets: [
      { icon: Upload, text: 'AI photo analysis with drag-and-drop upload' },
      { icon: FileText, text: 'Automatic OSHA standard citations' },
      { icon: ToggleRight, text: 'Positive / Negative observation toggle' },
      { icon: FileSpreadsheet, text: 'Export to CSV and PDF in one click' },
    ],
  },
  {
    title: 'Vorsa Coach',
    icon: Headphones,
    color: 'blue' as const,
    description:
      'Walk your site with an AI safety companion that listens, observes, and coaches you through every trade area with structured checklists and real-time feedback.',
    bullets: [
      { icon: Mic, text: 'Real-time voice guidance during safety walks' },
      { icon: ClipboardList, text: 'Auto-logged observations as you walk' },
      { icon: HardHat, text: 'Trade-by-trade safety checklists' },
      { icon: FileBarChart, text: 'Comprehensive debrief summary report' },
    ],
  },
]

const colorMap = {
  orange: {
    iconBg: 'bg-orange-50',
    iconText: 'text-orange-500',
    bulletBg: 'bg-orange-50',
    bulletText: 'text-orange-500',
    border: 'border-orange-100',
    badge: 'bg-orange-100 text-orange-700',
  },
  blue: {
    iconBg: 'bg-blue-50',
    iconText: 'text-blue-500',
    bulletBg: 'bg-blue-50',
    bulletText: 'text-blue-500',
    border: 'border-blue-100',
    badge: 'bg-blue-100 text-blue-700',
  },
}

export default function Features() {
  return (
    <section id="features" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-orange-500">
            Features
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Two Powerful Tools, One Platform
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-gray-600">
            Whether you prefer to analyze photos at your desk or walk the site with
            an AI companion, Vorsa has you covered.
          </p>
        </div>

        {/* Feature cards */}
        <div className="mx-auto mt-16 grid max-w-5xl gap-8 lg:grid-cols-2">
          {features.map((feature) => {
            const colors = colorMap[feature.color]
            return (
              <div
                key={feature.title}
                className={`group relative rounded-2xl border ${colors.border} bg-white p-8 shadow-sm transition-all hover:shadow-lg sm:p-10`}
              >
                {/* Icon and title */}
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${colors.iconBg} ${colors.iconText} transition-transform group-hover:scale-105`}
                  >
                    <feature.icon className="h-7 w-7" />
                  </div>
                  <div>
                    <span
                      className={`inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${colors.badge}`}
                    >
                      {feature.color === 'orange' ? 'Photo Analysis' : 'Voice Coach'}
                    </span>
                    <h3 className="mt-2 text-xl font-bold text-gray-900">
                      {feature.title}
                    </h3>
                  </div>
                </div>

                {/* Description */}
                <p className="mt-5 text-base leading-relaxed text-gray-600">
                  {feature.description}
                </p>

                {/* Bullet points */}
                <ul className="mt-6 space-y-3">
                  {feature.bullets.map((bullet) => (
                    <li key={bullet.text} className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${colors.bulletBg} ${colors.bulletText}`}
                      >
                        <bullet.icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {bullet.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
