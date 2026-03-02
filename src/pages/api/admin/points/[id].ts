import type { APIRoute } from "astro";
import { checkAdmin, jsonResponse, unauthorized } from "@/lib/auth";
import { deletePoint, getPointById, updatePoint } from "@/lib/db";

export const PATCH: APIRoute = async ({ request, params }) => {
  if (!checkAdmin(request)) return unauthorized();
  const id = parseInt(params.id ?? "", 10);
  if (!Number.isFinite(id)) return jsonResponse({ error: "Invalid id" }, 400);
  const body = await request.json().catch(() => ({}));
  const updates: Parameters<typeof updatePoint>[1] = {};
  if (typeof body.lat === "number") updates.lat = body.lat;
  if (typeof body.lng === "number") updates.lng = body.lng;
  if (typeof body.device_ts === "number") updates.deviceTs = body.device_ts;
  if (typeof body.segment_type === "string") updates.segmentType = body.segment_type;
  if (body.address !== undefined) updates.address = body.address ?? null;
  if (body.raw_address !== undefined) updates.rawAddress = body.raw_address ?? null;
  const row = await updatePoint(id, updates);
  if (!row) return jsonResponse({ error: "Point not found" }, 404);
  return jsonResponse({
    id: row.id,
    lat: row.lat,
    lng: row.lng,
    device_ts: row.deviceTs,
    server_ts: row.serverTs,
    segment_type: row.segmentType,
    address: row.address,
    raw_address: row.rawAddress,
  });
};

export const DELETE: APIRoute = async ({ request, params }) => {
  if (!checkAdmin(request)) return unauthorized();
  const id = parseInt(params.id ?? "", 10);
  if (!Number.isFinite(id)) return jsonResponse({ error: "Invalid id" }, 400);
  const exists = await getPointById(id);
  if (!exists) return jsonResponse({ error: "Point not found" }, 404);
  const ok = await deletePoint(id);
  return ok ? new Response(null, { status: 204 }) : jsonResponse({ error: "Delete failed" }, 500);
};
