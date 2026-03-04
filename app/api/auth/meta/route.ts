import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_APP_URL!))
  }

  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/meta/callback`,
    scope: [
      'pages_manage_posts',
      'pages_read_engagement',
      'pages_show_list',
      'instagram_basic',
      'instagram_content_publish',
    ].join(','),
    response_type: 'code',
    state: user.id,
  })

  return NextResponse.redirect(`https://www.facebook.com/v21.0/dialog/oauth?${params.toString()}`)
}
