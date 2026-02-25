import type { APIRoute } from "astro";
import { checkAdmin, jsonResponse, unauthorized } from "@/lib/auth";
import { listPointsForAdmin } from "@/lib/db";

export const GET: APIRoute = async ({ request }) => {
  if (!checkAdmin(request)) return unauthorized();
  const url = new URL(request.url);
  const limit = Math.min(500, Math.max(1, parseInt(url.searchParams.get("limit") ?? "200", 10) || 200));
  const pointsList = await listPointsForAdmin(limit);
  const list = pointsList.map((p) => ({
    id: p.id,
    device_ts: p.deviceTs,
    lat: p.lat,
    lng: p.lng,
  }));
  return jsonResponse(list);
};
