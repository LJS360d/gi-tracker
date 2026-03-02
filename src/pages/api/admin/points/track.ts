import type { APIRoute } from "astro";
import { checkAdmin, jsonResponse, unauthorized } from "@/lib/auth";
import { getAdminTrackForMap } from "@/lib/admin-data";

export const GET: APIRoute = async ({ request }) => {
  if (!checkAdmin(request)) return unauthorized();
  const path = await getAdminTrackForMap();
  return jsonResponse({ path });
};
