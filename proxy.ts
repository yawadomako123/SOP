import { type NextRequest, NextResponse } from "next/server"

export async function proxy(request: NextRequest) {
    // Check for either secure or standard better-auth session cookie
    const hasSessionCookie = request.cookies.getAll().some(c => c.name.includes("better-auth.session_token"));
    const { pathname, search } = request.nextUrl;
    
    // Protect routes
    const isProtected = pathname.startsWith('/cashier') || pathname.startsWith('/manager') || pathname.startsWith('/admin');

    if (isProtected) {
        if (!hasSessionCookie) {
            return NextResponse.redirect(new URL(`/`, request.url));
        }

        try {
            // Check session via standard fetch to resolve PENDING status natively on the edge
            // This prevents React FOUC (Flash of Unauthenticated Content)
            const res = await fetch(`${request.nextUrl.origin}/api/auth/get-session`, {
                headers: { cookie: request.headers.get("cookie") || "" },
            });
            
            if (res.ok) {
                const sessionData = await res.json();
                if (sessionData && sessionData.user?.status === 'PENDING') {
                    return NextResponse.redirect(new URL('/account/pending', request.url));
                }
            }
        } catch (e) {
            // Fallback gracefully
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/cashier/:path*", "/manager/:path*", "/admin/:path*", "/account/:path*"]
}