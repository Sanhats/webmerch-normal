import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    await supabase.auth.signOut()

    // Usar la URL de la solicitud actual para construir la URL de redirección
    const redirectUrl = new URL('/login', request.url)
    
    return NextResponse.redirect(redirectUrl, {
      // Asegurarse de que la redirección sea inmediata
      status: 307
    })
  } catch (error) {
    console.error('Logout error:', error)
    // En caso de error, intentar redireccionar a /login de todas formas
    return NextResponse.redirect(new URL('/login', request.url), {
      status: 307
    })
  }
}