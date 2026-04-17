import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const demoParam = searchParams.get('demo');

  if (demoParam === 'true') {
    const url = request.nextUrl.clone();
    url.searchParams.delete('demo');
    const response = NextResponse.redirect(url);
    response.cookies.set('demo_mode', '1', { path: '/', sameSite: 'lax', httpOnly: false });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon|manifest|apple-touch-icon|api).*)'],
};
