import { Metadata } from 'next'
import Link from 'next/link'
import { blogPosts } from '@/lib/blog/posts'

export const metadata: Metadata = {
  title: 'Blog — Vorsa AI',
  description:
    'Construction safety insights, OSHA compliance guides, and AI inspection tips from the Vorsa AI team. Stay ahead of regulations and protect your crew.',
  openGraph: {
    title: 'Blog — Vorsa AI',
    description:
      'Construction safety insights, OSHA compliance guides, and AI inspection tips from the Vorsa AI team.',
    url: 'https://getvorsa.ai/blog',
  },
  alternates: {
    canonical: 'https://getvorsa.ai/blog',
  },
}

export default function BlogIndexPage() {
  const posts = [...blogPosts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <>
      {/* Page header */}
      <section className="bg-gradient-to-b from-orange-50 to-white py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Blog
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-gray-600">
            Construction safety insights, OSHA compliance guides, and practical
            tips for running safer jobsites — powered by AI.
          </p>
        </div>
      </section>

      {/* Post grid */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-orange-300"
              >
                {/* Tags */}
                <div className="mb-3 flex flex-wrap gap-2">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="inline-block rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Title */}
                <h2 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                  {post.title}
                </h2>

                {/* Description */}
                <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-600">
                  {post.description}
                </p>

                {/* Meta */}
                <div className="mt-4 flex items-center gap-3 text-xs text-gray-500">
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                  <span aria-hidden="true">&middot;</span>
                  <span>{post.readTime}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
