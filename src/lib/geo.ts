export type Point = {
  lat: number;
  lng: number;
  device_ts: number;
  segment_type?: string;
  address?: string | null;
  raw_address?: { city?: string; suburb?: string } | null;
};

function perpendicularDistance(
  p: Point,
  lineStart: Point,
  lineEnd: Point,
): number {
  const dx = lineEnd.lng - lineStart.lng;
  const dy = lineEnd.lat - lineStart.lat;
  const mag = Math.sqrt(dx * dx + dy * dy) || 1e-10;
  const u =
    ((p.lng - lineStart.lng) * dx + (p.lat - lineStart.lat) * dy) / (mag * mag);
  let x: number;
  let y: number;
  if (u < 0) {
    x = lineStart.lng;
    y = lineStart.lat;
  } else if (u > 1) {
    x = lineEnd.lng;
    y = lineEnd.lat;
  } else {
    x = lineStart.lng + u * dx;
    y = lineStart.lat + u * dy;
  }
  return Math.sqrt((p.lng - x) ** 2 + (p.lat - y) ** 2);
}

export function douglasPeucker(points: Point[], epsilon: number): Point[] {
  if (points.length <= 2) return points;
  let dmax = 0;
  let idx = 0;
  const end = points.length - 1;
  for (let i = 1; i < end; i++) {
    const d = perpendicularDistance(points[i], points[0], points[end]);
    if (d > dmax) {
      dmax = d;
      idx = i;
    }
  }
  if (dmax <= epsilon) return [points[0], points[end]];
  const left = douglasPeucker(points.slice(0, idx + 1), epsilon);
  const right = douglasPeucker(points.slice(idx), epsilon);
  return [...left.slice(0, -1), ...right];
}

function pointKey(p: Point): string {
  return `${p.lat},${p.lng},${p.device_ts}`;
}

export function downsampleTrack(
  points: Point[],
  maxPoints: number = 3000,
): Point[] {
  if (points.length <= maxPoints) return points;
  const boundaryIndices = new Set<number>();
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i].segment_type ?? "ground";
    const b = points[i + 1].segment_type ?? "ground";
    if (a !== b) {
      boundaryIndices.add(i);
      boundaryIndices.add(i + 1);
    }
  }
  if (points.length > 0) {
    boundaryIndices.add(0);
    boundaryIndices.add(points.length - 1);
  }
  const epsilonStep = 0.0001;
  let epsilon = epsilonStep;
  let result = douglasPeucker(points, epsilon);
  while (result.length > maxPoints && epsilon < 1) {
    epsilon += epsilonStep;
    result = douglasPeucker(points, epsilon);
  }
  const resultSet = new Set(result.map(pointKey));
  for (const i of boundaryIndices) {
    const p = points[i];
    if (!resultSet.has(pointKey(p))) {
      result.push(p);
      resultSet.add(pointKey(p));
    }
  }
  result.sort((a, b) => a.device_ts - b.device_ts);
  return result;
}

import {
  getDelayHours,
  getMediaByPointIds,
  isSharingEnabled,
  listPointsBeforeCutoff,
} from "@/lib/db";

export type PublicTrackMediaEntry = {
  pointIndex: number;
  type: "image" | "video";
  url: string;
  title: string;
  description: string;
};

export type PublicTrackData = {
  points: Point[];
  media: PublicTrackMediaEntry[];
  delay_hours: number;
};

export async function getPublicTrackData(): Promise<PublicTrackData> {
  const sharingEnabled = await isSharingEnabled();
  const delayHours = await getDelayHours();
  if (!sharingEnabled) {
    return { points: [], media: [], delay_hours: delayHours };
  }

  const cutoff = Date.now() - delayHours * 60 * 60 * 1000;
  const rows = await listPointsBeforeCutoff(cutoff);
  const trackPoints: Point[] = rows.map((r) => ({
    lat: r.lat,
    lng: r.lng,
    device_ts: r.deviceTs,
    segment_type: r.segmentType ?? "ground",
    address: r.address ?? null,
    raw_address: (r.rawAddress as Point["raw_address"]) ?? null,
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

  const mediaRows = await getMediaByPointIds(downsampledIds);
  const media: PublicTrackMediaEntry[] = mediaRows.map((m) => ({
    pointIndex: downsampledIds.indexOf(m.pointId),
    type: m.type as "image" | "video",
    url: m.url,
    title: m.title,
    description: m.description,
  }));

  return {
    points: downsampled,
    media,
    delay_hours: delayHours,
  };
}

