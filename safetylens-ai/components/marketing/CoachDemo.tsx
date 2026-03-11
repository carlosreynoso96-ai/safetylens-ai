import { Headphones, Mic, Bot, ClipboardCheck, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const conversation = [
  {
    role: 'coach' as const,
    text: "Welcome! I see we're starting in the excavation area. Let's begin with fall protection. Do you see any trenches deeper than 5 feet without protective systems?",
  },
  {
    role: 'user' as const,
    text: 'Yeah, there\'s an open trench near the south wall, about 6 feet deep. No shoring that I can see.',
  },
  {
    role: 'coach' as const,
    text: "Got it. I'm logging that as a negative observation: unprotected trench over 5 feet. OSHA 1926.652(a)(1) requires protective systems for excavations 5 feet or deeper. Let's keep going \u2014 any guardrails around the perimeter?",
  },
  {
    role: 'observation' as const,
    text: 'Observation auto-logged: Unshored trench >5ft \u2014 OSHA 1926.652(a)(1) \u2014 Negative \u2014 High Severity',
  },
  {
    role: 'user' as const,
    text: 'Guardrails are up on the east and north sides. Looks solid.',
  },
  {
    role: 'coach' as const,
    text: "Good catch \u2014 logging that as a positive observation for compliant guardrails on the east and north perimeter. Now let's check ladders and access points. Any ladder access into the excavation?",
  },
]

export default function CoachDemo() {
  return (
    <section id="coach" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: Description */}
          <div className="lg:sticky lg:top-32">
            <p className="text-sm font-semibold uppercase tracking-widest text-orange-500">
              AI Safety Coach
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Walk Your Site with an AI Companion
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-gray-600">
              Vorsa Coach listens to your voice, guides you through
              trade-by-trade checklists, and automatically logs every observation
              with OSHA citations. When you are done, get a complete debrief report.
            </p>

            <ul className="mt-8 space-y-4">
              {[
                {
                  icon: Mic,
                  title: 'Voice-Powered',
                  desc: 'Speak naturally \u2014 the coach understands construction context',
                },
                {
                  icon: ClipboardCheck,
                  title: 'Auto-Logged',
                  desc: 'Observations are recorded and cited as you walk',
                },
                {
                  icon: Headphones,
                  title: 'Real-Time Guidance',
                  desc: 'The coach prompts you through every trade area systematically',
                },
              ].map((item) => (
                <li key={item.title} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{item.title}</p>
                    <p className="mt-0.5 text-sm text-gray-500">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            <Link
              href="/signup"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:bg-orange-600 hover:shadow-xl active:scale-[0.98]"
            >
              Try the Coach
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Right: Simulated conversation */}
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 shadow-sm sm:p-6">
            {/* Header */}
            <div className="mb-4 flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-white">
                <Headphones className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Vorsa Coach</p>
                <p className="text-xs text-green-600 font-medium">Active session &middot; Excavation Area</p>
              </div>
            </div>

            {/* Messages */}
            <div className="space-y-3">
              {conversation.map((msg, i) => {
                if (msg.role === 'observation') {
                  return (
                    <div
                      key={i}
                      className="mx-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3"
                    >
                      <ClipboardCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                      <p className="text-xs font-medium leading-relaxed text-amber-800">
                        {msg.text}
                      </p>
                    </div>
                  )
                }

                const isCoach = msg.role === 'coach'
                return (
                  <div
                    key={i}
                    className={`flex gap-2.5 ${isCoach ? '' : 'flex-row-reverse'}`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        isCoach
                          ? 'bg-orange-100 text-orange-600'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {isCoach ? (
                        <Bot className="h-4 w-4" />
                      ) : (
                        <Mic className="h-4 w-4" />
                      )}
                    </div>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        isCoach
                          ? 'rounded-tl-sm bg-white shadow-sm'
                          : 'rounded-tr-sm bg-orange-500 text-white'
                      }`}
                    >
                      <p
                        className={`text-sm leading-relaxed ${
                          isCoach ? 'text-gray-700' : 'text-white'
                        }`}
                      >
                        {msg.text}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Input bar (static) */}
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white animate-pulse">
                <Mic className="h-4 w-4" />
              </div>
              <span className="flex-1 text-sm text-gray-400">Listening...</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
