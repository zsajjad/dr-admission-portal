/**
 * The portal's only way to the core API.
 *
 * Browser code calls /api/core/<path>; this handler forwards it to the API with the user's access
 * token (from the encrypted session cookie), the API key, the portal secret and the user's IP.
 * So the API's admin routes accept only this server, and the tokens never reach the browser.
 * On 401 the browser asks Auth.js to refresh the login (services/index.ts) and retries once.
 */
import { getToken } from 'next-auth/jwt';

import { type NextRequest, NextResponse } from 'next/server';

import { CORE_TIMEOUT_MS, clientIpFrom, coreHeaders, coreUrl } from '@/server/core';

export const dynamic = 'force-dynamic';

/** Routes the browser may call without being logged in (the forgot and reset password pages). */
const NO_LOGIN_PATHS = new Set(['admin/auth/password/forgot', 'admin/auth/password/reset']);

/** Routes that hand out tokens: only the server's sign-in and refresh may call them. */
const SERVER_ONLY_PATHS = [/^admin\/auth\/login/, /^admin\/auth\/refresh$/];

/** Request headers passed on from the browser; everything else (cookies, Authorization) stays here. */
const FORWARDED_REQUEST_HEADERS = ['accept', 'content-type', 'x-captcha-token'];

/** Response headers passed back: content type and the file and count headers the printing routes send. */
const FORWARDED_RESPONSE_HEADERS = [
  'content-type',
  'content-disposition',
  'x-firebase-path',
  'x-card-count',
  'x-slip-count',
  'x-student-count',
  'x-total-count',
];

function json(status: number, message: string) {
  return NextResponse.json({ statusCode: status, message }, { status, headers: { 'Cache-Control': 'no-store' } });
}

async function forward(request: NextRequest, segments: string[]): Promise<NextResponse> {
  // Each segment arrives decoded; refuse anything that could step outside the API's paths.
  if (!segments.length || segments.some((s) => !s || s === '.' || s === '..' || s.includes('/') || s.includes('\\'))) {
    return json(400, 'Bad path');
  }
  const path = segments.join('/');
  if (SERVER_ONLY_PATHS.some((pattern) => pattern.test(path))) {
    return json(404, 'Not found');
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: request.nextUrl.protocol === 'https:',
  });
  const accessToken = token && !token.error ? token.accessToken : undefined;
  if (!accessToken && !NO_LOGIN_PATHS.has(path)) {
    return json(401, 'Unauthorized');
  }

  const headers: Record<string, string> = coreHeaders({ accessToken, clientIp: clientIpFrom(request.headers) });
  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers[name] = value;
  }

  const method = request.method.toUpperCase();
  const hasBody = method !== 'GET' && method !== 'HEAD';

  let upstream: Response;
  try {
    upstream = await fetch(`${coreUrl(path)}${request.nextUrl.search}`, {
      method,
      headers,
      body: hasBody ? await request.arrayBuffer() : undefined,
      cache: 'no-store',
      redirect: 'manual',
      signal: AbortSignal.timeout(CORE_TIMEOUT_MS),
    });
  } catch (error) {
    const timedOut = error instanceof DOMException && error.name === 'TimeoutError';
    console.error(`core proxy: ${method} /${path} failed`, timedOut ? 'timeout' : error);
    return json(timedOut ? 504 : 502, timedOut ? 'The server took too long to answer' : 'Could not reach the server');
  }

  const responseHeaders = new Headers({ 'Cache-Control': 'no-store' });
  for (const name of FORWARDED_RESPONSE_HEADERS) {
    const value = upstream.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }
  return new NextResponse(upstream.body, { status: upstream.status, headers: responseHeaders });
}

type RouteContext = { params: Promise<{ path: string[] }> };

async function handle(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return forward(request, path);
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
