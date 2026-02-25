import type { APIRoute } from "astro";
import { checkAdmin, jsonResponse, unauthorized } from "@/lib/auth";
import { deleteMedia, getMediaById, getPointById, updateMedia } from "@/lib/db";

export const PATCH: APIRoute = async ({ request, params }) => {
  if (!checkAdmin(request)) return unauthorized();
  const id = parseInt(params.id ?? "", 10);
  if (!Number.isFinite(id)) return jsonResponse({ error: "Invalid id" }, 400);
  const existing = await getMediaById(id);
  if (!existing) return jsonResponse({ error: "Not found" }, 404);
  let body: {
    title?: string;
    description?: string;
    point_id?: number;
    url?: string;
    taken_at?: number | null;
    taken_lat?: number | null;
    taken_lng?: number | null;
  };
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }
  if (body.point_id !== undefined) {
    if (typeof body.point_id !== "number") return jsonResponse({ error: "point_id must be number" }, 400);
    if (!(await getPointById(body.point_id))) return jsonResponse({ error: "Point not found" }, 400);
  }
  const row = await updateMedia(id, {
    title: body.title,
    description: body.description,
    point_id: body.point_id,
    url: body.url,
    taken_at: body.taken_at,
    taken_lat: body.taken_lat,
    taken_lng: body.taken_lng,
  });
  if (!row) return jsonResponse({ error: "Not found" }, 404);
  return jsonResponse({
    id: row.id,
    point_id: row.pointId,
    type: row.type,
    url: row.url,
    title: row.title,
    description: row.description,
    created_at: row.createdAt,
    taken_at: row.takenAt,
    taken_lat: row.takenLat,
    taken_lng: row.takenLng,
  });
};

export const DELETE: APIRoute = async ({ request, params }) => {
  if (!checkAdmin(request)) return unauthorized();
  const id = parseInt(params.id ?? "", 10);
  if (!Number.isFinite(id)) return jsonResponse({ error: "Invalid id" }, 400);
  const ok = await deleteMedia(id);
  if (!ok) return jsonResponse({ error: "Not found" }, 404);
  return new Response(null, { status: 204 });
};
