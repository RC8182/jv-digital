// middleware.js
import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { i18n } from '../i18n'
import Negotiator from 'negotiator'
import { match as matchLocale } from '@formatjs/intl-localematcher'

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET

/** 
 * Elige la mejor locale según las cabeceras Accept-Language 
 */
function getLocale(request) {
  const negotiatorHeaders = {}
  request.headers.forEach((value, key) => {
    negotiatorHeaders[key] = value
  })

  const locales = i18n.locales
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages(locales)
  return matchLocale(languages, locales, i18n.defaultLocale)
}

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // 1) Excepciones estáticas y APIs que no queremos tocar
  if (
    pathname.startsWith('/public') ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname.startsWith('/icons/dia/') ||
    pathname.startsWith('/icons/vp') ||
    pathname.startsWith('/photos') ||
    pathname.startsWith('/data') ||
    pathname.startsWith('/uploads') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next/static') ||
    pathname.startsWith('/_next/image') ||
    pathname === '/favicon.ico' ||
    pathname === '/manifest.json'
  ) {
    return
  }

  // 2) Protección de la sección privada
  if (pathname.includes('/dashboard')) {
    const token = await getToken({ req: request, secret: NEXTAUTH_SECRET })
    if (!token) {
      const locale = getLocale(request)
      return NextResponse.redirect(
        new URL(`/${locale}/auth/signin`, request.url)
      )
    }
    // si está autenticado, dejamos continuar
  }

  // 3) i18n: añadir locale a la ruta si falta
  const hasLocale = i18n.locales.some(
    (loc) => pathname === `/${loc}` || pathname.startsWith(`/${loc}/`)
  )
  if (!hasLocale) {
    const locale = getLocale(request)
    return NextResponse.redirect(
      new URL(`/${locale}${pathname}`, request.url)
    )
  }

  // si ya tiene locale y/o es ruta protegida con sesión válida, no hacemos nada
  return
}

export const config = {
  matcher: [
    // Aplica a todas las rutas excepto api, _next, archivos estáticos y manifest
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json).*)'
  ],
}
