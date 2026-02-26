import type { PointOption } from "@/components/adminMediaUtils";
import { listAllPointsForDownsampling } from "@/lib/db";
import { downsampleTrack, type Point } from "@/lib/geo";

export async function getDownsampledPointOptions(): Promise<PointOption[]> {
  const rows = await listAllPointsForDownsampling();
  const trackPoints: Point[] = rows.map((r) => ({
    lat: r.lat,
    lng: r.lng,
    device_ts: r.deviceTs,
    segment_type: "ground",
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
