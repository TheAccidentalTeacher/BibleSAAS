import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Middleware — runs on every matched request before any route handler.
 *
 * Responsibilities:
 *  1. Refresh Supabase auth session (required for SSR auth persistence)
 *  2. Rate limit AI/content routes (in-memory sliding window)
 *  3. Protect authenticated routes — redirect to /auth/login if not logged in
 */

// ── Rate limiter (in-memory sliding window) ────────────────────────────────────
//
// NOTE: This is a simple per-instance rate limiter. In a multi-instance serverless
// environment each Vercel function instance has its own Map. For hard rate limits
// across all instances, replace with Upstash Redis + @upstash/ratelimit.
//
// Current limits (per userId, per 60-second window):
//  - /api/chat/**       → 20 requests
//  - /api/sermon/**     → 10 requests
//  - /api/content/**    → 30 requests (Charles cards, word studies etc.)

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

const RATE_LIMITS: { pattern: RegExp; windowMs: number; max: number }[] = [
  { pattern: /^\/api\/chat\//, windowMs: 60_000, max: 20 },
  { pattern: /^\/api\/sermon\//, windowMs: 60_000, max: 10 },
  { pattern: /^\/api\/content\//, windowMs: 60_000, max: 30 },
  { pattern: /^\/api\/map\//, windowMs: 30_000, max: 60 },
];

function checkRateLimit(key: string, windowMs: number, max: number): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(key) ?? { timestamps: [] };

  // Prune timestamps outside the window
  record.timestamps = record.timestamps.filter((t) => now - t < windowMs);

  if (record.timestamps.length >= max) {
    rateLimitStore.set(key, record);
    return false; // over limit
  }

  record.timestamps.push(now);
  rateLimitStore.set(key, record);
  return true; // ok
}

// ── Auth-protected route prefixes ─────────────────────────────────────────────

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/read",
  "/journey",
  "/trails",
  "/library",
  "/profile",
  "/onboarding",
  "/api/chat",
  "/api/content",
  "/api/reading-progress",
  "/api/sermon",
  "/api/map",
  "/api/on-this-day",
];

const PUBLIC_ROUTES = new Set([
  "/",
  "/auth/login",
  "/auth/signup",
  "/auth/verify",
  "/auth/callback",
  "/privacy",
  "/terms",
  "/credits",
  "/offline",
]);

// ── Middleware ─────────────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── 1. Refresh Supabase session ──────────────────────────────────────────
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // ── 2. Rate limiting (API routes only) ──────────────────────────────────
  if (pathname.startsWith("/api/")) {
    for (const limit of RATE_LIMITS) {
      if (limit.pattern.test(pathname)) {
        // Key: userId if authenticated, else IP
        const userId = user?.id ?? request.headers.get("x-forwarded-for") ?? "anon";
        const key = `${userId}:${pathname.replace(/\/[^/]+$/, "/*")}`;

        if (!checkRateLimit(key, limit.windowMs, limit.max)) {
          return NextResponse.json(
            { error: "Too many requests. Please wait a moment before trying again." },
            {
              status: 429,
              headers: {
                "Retry-After": String(Math.ceil(limit.windowMs / 1000)),
                "X-RateLimit-Limit": String(limit.max),
              },
            }
          );
        }
        break; // First matching rule wins
      }
    }
  }

  // ── 3. Auth protection ───────────────────────────────────────────────────
  const isPublic =
    PUBLIC_ROUTES.has(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.includes("."); // static assets

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isProtected && !isPublic && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/auth/login";
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── 4. Redirect authenticated users away from auth pages ────────────────
  if (user && (pathname === "/" || pathname === "/auth/login" || pathname === "/auth/signup")) {
    const dashUrl = request.nextUrl.clone();
    dashUrl.pathname = "/dashboard";
    dashUrl.search = "";
    return NextResponse.redirect(dashUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - /_next/static (static files)
     * - /_next/image (image optimization)
     * - /favicon.ico, /icons/**, /manifest.json, /sw.js (PWA/static)
     */
    "/((?!_next/static|_next/image|favicon.ico|icons/|manifest.json|sw.js|workbox-).*)",
  ],
};
