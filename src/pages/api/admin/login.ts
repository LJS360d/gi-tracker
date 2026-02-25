import type { APIRoute } from "astro";
import { setAuthCookie, validateAdminToken } from "@/lib/auth";

export const POST: APIRoute = async ({ request }) => {
  let token = "";
  const contentType = request.headers.get("Content-Type") ?? "";
  if (contentType.includes("application/x-www-form-urlencoded")) {
    const fd = await request.formData();
    const t = fd.get("token");
    token = typeof t === "string" ? t.trim() : "";
  } else {
    try {
      const body = await request.json() as { token?: string };
      token = typeof body.token === "string" ? body.token.trim() : "";
    } catch {
      return new Response(null, { status: 302, headers: { Location: "/admin" } });
    }
  }
  if (!token || !validateAdminToken(token)) {
    return new Response(null, { status: 302, headers: { Location: "/admin?error=invalid" } });
  }
  return new Response(null, {
    status: 302,
    headers: {
      Location: "/admin",
      ...setAuthCookie(),
    },
  });
};
