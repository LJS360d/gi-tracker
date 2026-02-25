import type { APIRoute } from "astro";
import { clearAuthCookie } from "@/lib/auth";

export const GET: APIRoute = async () => {
  return new Response(null, {
    status: 302,
    headers: {
      Location: "/admin",
      ...clearAuthCookie(),
    },
  });
};
