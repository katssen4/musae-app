import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase-server'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-stone-200 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="font-serif text-2xl text-musae-ink tracking-wide">
            Musae
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/dashboard/posts"
              className="font-sans text-base text-stone-500 hover:text-musae-ink transition-colors"
            >
              Mes publications
            </Link>
            <Link
              href="/dashboard/settings"
              className="font-sans text-base text-stone-500 hover:text-musae-ink transition-colors"
            >
              Réglages
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        {children}
      </main>
    </div>
  )
}
