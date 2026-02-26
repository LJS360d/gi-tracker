import type { APIRoute } from "astro";
import { mediaRowFromDb } from "@/components/adminMediaUtils";
import { checkAdmin, jsonResponse, unauthorized } from "@/lib/auth";
import {
  countMedia,
  getPointById,
  insertMedia,
  insertPointFromCoords,
  listMediaWithPoints,
  type ListMediaFilters,
  type MediaSortColumn,
} from "@/lib/db";

const SORT_COLUMNS: MediaSortColumn[] = ["id", "created_at", "taken_at", "title"];
const VIDEO_EXT = new Set([".mp4", ".webm", ".mov", ".m4v", ".avi", ".mkv"]);

function inferMediaType(url: string): "image" | "video" {
  const lower = url.trim().toLowerCase();
  if (VIDEO_EXT.has(lower.slice(lower.lastIndexOf(".")))) return "video";
  return "image";
}

export const GET: APIRoute = async ({ request }) => {
  if (!checkAdmin(request)) return unauthorized();
  const url = new URL(request.url);
  const point_id = url.searchParams.get("point_id");
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") ?? "25", 10) || 25));
  const offset = Math.max(0, parseInt(url.searchParams.get("offset") ?? "0", 10) || 0);
  const sortParam = url.searchParams.get("sort");
  const sort: MediaSortColumn = SORT_COLUMNS.includes(sortParam as MediaSortColumn)
    ? (sortParam as MediaSortColumn)
    : "created_at";
  const order = url.searchParams.get("order") === "asc" ? "asc" : "desc";
  const filters: ListMediaFilters = { limit, offset, sort, order };
  if (point_id != null) {
    const n = parseInt(point_id, 10);
    if (Number.isFinite(n)) filters.point_id = n;
  }
  const total = await countMedia({ point_id: filters.point_id });
  const rows = await listMediaWithPoints(filters);
  const list = rows.map(mediaRowFromDb);
  const res = jsonResponse(list);
  res.headers.set("X-Total-Count", String(total));
  return res;
};

export const POST: APIRoute = async ({ request }) => {
  if (!checkAdmin(request)) return unauthorized();
  let body: {
    point_id?: number;
    url?: string;
    title?: string;
    description?: string;
    taken_at?: number | null;
    taken_lat?: number | null;
    taken_lng?: number | null;
  };
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }
  const point_id = body.point_id;
  const url = body.url;
  const title = body.title ?? "";
  const description = body.description ?? "";
  if (!url || typeof url !== "string" || url.trim() === "") {
    return jsonResponse({ error: "url required" }, 400);
  }
  let resolvedPointId: number;
  if (point_id != null && typeof point_id === "number") {
    const point = await getPointById(point_id);
    if (!point) return jsonResponse({ error: "Point not found" }, 400);
    resolvedPointId = point_id;
  } else {
    const lat = body.taken_lat;
    const lng = body.taken_lng;
    if (typeof lat !== "number" || typeof lng !== "number") {
      return jsonResponse(
        { error: "point_id or both taken_lat and taken_lng required" },
        400,
      );
    }
    const created = await insertPointFromCoords(lat, lng, body.taken_at ?? undefined);
    if (!created) return jsonResponse({ error: "Failed to create point" }, 500);
    resolvedPointId = created.id;
  }
  const type = inferMediaType(url);
  const row = await insertMedia({
    pointId: resolvedPointId,
    type,
    url: url.trim(),
    title: title.trim(),
    description: description.trim(),
    takenAt: body.taken_at ?? null,
    takenLat: body.taken_lat ?? null,
    takenLng: body.taken_lng ?? null,
  });
  if (!row) return jsonResponse({ error: "Insert failed" }, 500);
  return jsonResponse(
    {
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
    },
    201,
  );
};
