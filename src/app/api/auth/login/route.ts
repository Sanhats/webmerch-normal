import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return new NextResponse(error.message, { status: 401 })
    }

    return NextResponse.json({ message: 'Logged in successfully' })
  } catch (error) {
    console.error('Login error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}