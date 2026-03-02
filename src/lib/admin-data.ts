import type { PointOption } from "@/components/adminMediaUtils";
import {
  getDelayHours,
  getPointIdsWithMedia,
  listAllPointsForDownsampling,
} from "@/lib/db";
import { downsampleTrack, type Point } from "@/lib/geo";

export type AdminPointsContext = {
  downsampledIds: Set<number>;
  delayCutoff: number;
  cutoffSec: number;
  mediaPointIds: Set<number>;
  onPublicMapIds: Set<number>;
};

type DownsampleRow = {
  id: number;
  deviceTs: number;
  lat: number;
  lng: number;
  segmentType: string | null;
};

export function enrichPoint(
  row: { id: number; deviceTs: number; [k: string]: unknown },
  ctx: AdminPointsContext,
) {
  const inDownsample = ctx.downsampledIds.has(row.id);
  const deviceTsMs = row.deviceTs >= 1e12 ? row.deviceTs : row.deviceTs * 1000;
  const onPublicMap = inDownsample && deviceTsMs < ctx.delayCutoff;
  const notOnMapReason: null | "downsample" | "public_delay" = onPublicMap
    ? null
    : !inDownsample
      ? "downsample"
      : "public_delay";
  return { inDownsample, onPublicMap, notOnMapReason };
}

export async function getAdminPointsContext(
  rows?: DownsampleRow[],
): Promise<AdminPointsContext> {
  const list = rows ?? (await listAllPointsForDownsampling(50000));
  const trackPoints: Point[] = list.map((r) => ({
    lat: r.lat,
    lng: r.lng,
    device_ts: r.deviceTs,
    segment_type: r.segmentType ?? "ground",
  }));
  const downsampled = downsampleTrack(trackPoints);
  const downsampledIds = new Set(
    downsampled.map(
      (p) =>
        list.find(
          (r) =>
            r.lat === p.lat &&
            r.lng === p.lng &&
            r.deviceTs === p.device_ts,
        )!.id,
    ),
  );
  const delayHours = await getDelayHours();
  const delayCutoff = Date.now() - delayHours * 60 * 60 * 1000;
  const cutoffSec = Math.floor(delayCutoff / 1000);
  const mediaIds = await getPointIdsWithMedia();
  const onPublicMapIds = new Set(
    list
      .filter((r) => {
        const ms = r.deviceTs >= 1e12 ? r.deviceTs : r.deviceTs * 1000;
        return downsampledIds.has(r.id) && ms < delayCutoff;
      })
      .map((r) => r.id),
  );
  return {
    downsampledIds,
    delayCutoff,
    cutoffSec,
    mediaPointIds: new Set(mediaIds),
    onPublicMapIds,
  };
}

export type AdminTrackPoint = { lat: number; lng: number; is_public: boolean };

export async function getAdminTrackForMap(): Promise<AdminTrackPoint[]> {
  const rows = await listAllPointsForDownsampling(50000);
  const ctx = await getAdminPointsContext(rows);
  return rows.map((r) => {
    const ms = r.deviceTs >= 1e12 ? r.deviceTs : r.deviceTs * 1000;
    return {
      lat: r.lat,
      lng: r.lng,
      is_public: ctx.downsampledIds.has(r.id) && ms < ctx.delayCutoff,
    };
  });
}

export type AdminPointRowApi = {
  id: number;
  lat: number;
  lng: number;
  device_ts: number;
  server_ts: number;
  segment_type: string;
  identifier: string | null;
  address: string | null;
  altitude: number | null;
  satellites: number | null;
  angle: number | null;
  status: unknown;
  raw_address: unknown;
  device_parameter: unknown;
  obd_measurements: unknown;
  on_public_map: boolean;
  has_media: boolean;
  not_on_map_reason: null | "downsample" | "public_delay";
};

export async function getAdminPointsPage(opts: {
  limit: number;
  offset: number;
  order: "asc" | "desc";
}): Promise<{ points: AdminPointRowApi[]; total: number }> {
  const { listPointsPage, countPoints } = await import("@/lib/db");
  const [ctx, total, pageRows] = await Promise.all([
    getAdminPointsContext(),
    countPoints(),
    listPointsPage(opts),
  ]);
  const points = pageRows.map((row) => {
    const { onPublicMap, notOnMapReason } = enrichPoint(row, ctx);
    const hasMedia = ctx.mediaPointIds.has(row.id);
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
      on_public_map: onPublicMap,
      has_media: hasMedia,
      not_on_map_reason: notOnMapReason,
    };
  });
  return { points, total };
}

export async function getAdminPointsSSR(opts: {
  limit?: number;
  offset?: number;
  order?: "asc" | "desc";
}): Promise<{
  points: AdminPointRowApi[];
  total: number;
  trackPath: AdminTrackPoint[];
}> {
  const { listPointsPage, countPoints } = await import("@/lib/db");
  const limit = opts.limit ?? 100;
  const offset = opts.offset ?? 0;
  const order = opts.order ?? "asc";
  const rows = await listAllPointsForDownsampling(50000);
  const ctx = await getAdminPointsContext(rows);
  const trackPath: AdminTrackPoint[] = rows.map((r) => ({
    lat: r.lat,
    lng: r.lng,
    is_public:
      ctx.downsampledIds.has(r.id) && r.deviceTs * 1000 < ctx.delayCutoff,
  }));
  const [total, pageRows] = await Promise.all([
    countPoints(),
    listPointsPage({ limit, offset, order }),
  ]);
  const points = pageRows.map((row) => {
    const { onPublicMap, notOnMapReason } = enrichPoint(row, ctx);
    const hasMedia = ctx.mediaPointIds.has(row.id);
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
      on_public_map: onPublicMap,
      has_media: hasMedia,
      not_on_map_reason: notOnMapReason,
    };
  });
  return { points, total, trackPath };
}

export async function getDownsampledPointOptions(): Promise<PointOption[]> {
  const rows = await listAllPointsForDownsampling();
  const trackPoints: Point[] = rows.map((r) => ({
    lat: r.lat,
    lng: r.lng,
    device_ts: r.deviceTs,
    segment_type: r.segmentType ?? "ground",
  }));
  const downsampled = downsampleTrack(trackPoints);
  const downsampledIds = downsampled.map(
    (p) =>
      rows.find(
        (r) =>
          r.lat === p.lat &&
          r.lng === p.lng &&
          r.deviceTs === p.device_ts,
      )!.id,
  );
  return downsampledIds
    .map((id) => {
      const r = rows.find((x) => x.id === id)!;
      return {
        id: r.id,
        device_ts: r.deviceTs,
        lat: r.lat,
        lng: r.lng,
        address: r.address ?? null,
        raw_address: r.rawAddress as Point["raw_address"] ?? null,
      };
    })
    .sort((a, b) => b.device_ts - a.device_ts);
}
