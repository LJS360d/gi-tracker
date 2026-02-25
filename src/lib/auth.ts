const ADMIN_TOKEN = process.env.ADMIN_ACCESS_TOKEN ?? "admin";
const COOKIE_NAME = "admin_session";

export function validateAdminToken(value: string): boolean {
  if (!ADMIN_TOKEN) return true;
  return value === ADMIN_TOKEN;
}

export function isAdminCookieValid(value: string | undefined): boolean {
  if (!value) return false;
  return value === ADMIN_TOKEN;
}

function getCookie(request: Request, name: string): string | null {
  const raw = request.headers.get("Cookie");
  if (!raw) return null;
  const match = raw.match(new RegExp(`(?:^|;)\\s*${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1].trim()) : null;
}

export function checkAdmin(request: Request): boolean {
  if (!ADMIN_TOKEN) return true;
  const fromCookie = getCookie(request, COOKIE_NAME);
  if (fromCookie === ADMIN_TOKEN) return true;
  return request.headers.get("Authorization") === `Bearer ${ADMIN_TOKEN}`;
}

function cookieOpts(): string {
  const isProd = import.meta.env.PROD;
  const base = `Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`;
  return isProd ? `${base}; Secure` : base;
}

export function setAuthCookie(): HeadersInit {
  if (!ADMIN_TOKEN) return {};
  return {
    "Set-Cookie": `${COOKIE_NAME}=${encodeURIComponent(ADMIN_TOKEN)}; ${cookieOpts()}`,
  };
}

export function clearAuthCookie(): HeadersInit {
  return {
    "Set-Cookie": `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
  };
}

export function unauthorized() {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}

export function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
