import type { APIRoute } from "astro";
import { checkAdmin, jsonResponse, unauthorized } from "@/lib/auth";
import { enrichPoint, getAdminPointsContext } from "@/lib/admin-data";
import { countPoints, listPointsPage } from "@/lib/db";

function pointRowToApi(row: Record<string, unknown>, enrichment: {
  onPublicMap: boolean;
  hasMedia: boolean;
  notOnMapReason: null | "downsample" | "public_delay";
}) {
  return {
    id: row.id,
    lat: row.lat,
    lng: row.lng,
    device_ts: row.deviceTs,
    server_ts: row.serverTs,
    segment_type: row.segmentType ?? "ground",
    identifier: row.identifier ?? null,
    address: row.address ?? null,
    altitude: row.altitude ?? null,
    satellites: row.satellites ?? null,
    angle: row.angle ?? null,
    status: row.status ?? null,
    raw_address: row.rawAddress ?? null,
    device_parameter: row.deviceParameter ?? null,
    obd_measurements: row.obdMeasurements ?? null,
    on_public_map: enrichment.onPublicMap,
    has_media: enrichment.hasMedia,
    not_on_map_reason: enrichment.notOnMapReason,
  };
}

export const GET: APIRoute = async ({ request }) => {
  if (!checkAdmin(request)) return unauthorized();
  const url = new URL(request.url);
  const limit = Math.min(500, Math.max(1, parseInt(url.searchParams.get("limit") ?? "100", 10) || 100));
  const offset = Math.max(0, parseInt(url.searchParams.get("offset") ?? "0", 10) || 0);
  const order = (url.searchParams.get("order") ?? "asc") === "desc" ? "desc" : "asc";
  const inMap = url.searchParams.get("in_map") === "true";
  const hasMedia = url.searchParams.get("has_media") === "true";
  const search = url.searchParams.get("search")?.trim() ?? "";

  const ctx = await getAdminPointsContext();
  let onlyIds: number[] | undefined;
  if (inMap && hasMedia) {
    onlyIds = [...ctx.onPublicMapIds].filter((id) => ctx.mediaPointIds.has(id));
  } else if (inMap) {
    onlyIds = [...ctx.onPublicMapIds];
  } else if (hasMedia) {
    onlyIds = [...ctx.mediaPointIds];
  }

  const countFilters = onlyIds !== undefined ? { onlyIds } : undefined;
  const listFilters: { onlyIds?: number[]; search?: string } = {};
  if (onlyIds !== undefined) listFilters.onlyIds = onlyIds;
  if (search !== "") listFilters.search = search;

  const [total, pageRows] = await Promise.all([
    countPoints({ ...countFilters, ...(search ? { search } : {}) }),
    listPointsPage({ limit, offset, order, ...listFilters }),
  ]);

  const pointsList = pageRows.map((row) => {
    const { onPublicMap, notOnMapReason } = enrichPoint(row, ctx);
    return pointRowToApi(row as Record<string, unknown>, {
      onPublicMap,
      hasMedia: ctx.mediaPointIds.has(row.id),
      notOnMapReason,
    });
  });

  return jsonResponse({ points: pointsList, total });
};
