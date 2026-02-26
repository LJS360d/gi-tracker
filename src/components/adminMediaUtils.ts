export type RawAddress = Record<string, unknown> & {
  city?: string;
  suburb?: string;
  road?: string;
  country?: string;
  postcode?: string;
  state?: string;
};
export type PointOption = {
  id: number;
  device_ts: number;
  lat: number;
  lng: number;
  address?: string | null;
  raw_address?: RawAddress | null;
};
export type MediaRow = {
  id: number;
  point_id: number;
  point_device_ts: number | null;
  point_lat: number | null;
  point_lng: number | null;
  type: string;
  url: string;
  title: string;
  description: string;
  created_at: number;
  taken_at: number | null;
  taken_lat: number | null;
  taken_lng: number | null;
};
export type SortCol = "id" | "created_at" | "taken_at" | "title";

export function mediaRowFromDb(r: {
  id: number;
  pointId: number;
  point_device_ts?: number | null;
  point_lat?: number | null;
  point_lng?: number | null;
  type: string;
  url: string;
  title: string;
  description: string;
  createdAt: number;
  takenAt?: number | null;
  takenLat?: number | null;
  takenLng?: number | null;
}): MediaRow {
  return {
    id: r.id,
    point_id: r.pointId,
    point_device_ts: r.point_device_ts ?? null,
    point_lat: r.point_lat ?? null,
    point_lng: r.point_lng ?? null,
    type: r.type,
    url: r.url,
    title: r.title,
    description: r.description,
    created_at: r.createdAt,
    taken_at: r.takenAt ?? null,
    taken_lat: r.takenLat ?? null,
    taken_lng: r.takenLng ?? null,
  };
}

function str(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v.trim();
  return String(v);
}

export function pointOptionLabel(p: PointOption): string {
  const raw = p.raw_address;
  const city = raw ? str(raw.city) : "";
  const suburb = raw ? str(raw.suburb) : "";
  if (city || suburb) {
    return [city, suburb].filter(Boolean).join(" – ");
  }
  const addr = str(p.address);
  if (addr) return addr;
  return `${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}`;
}

export function uniquePointOptionsByLabel(
  list: PointOption[],
): { id: number; label: string }[] {
  const seen = new Set<string>();
  const out: { id: number; label: string }[] = [];
  for (const p of list) {
    const label = pointOptionLabel(p);
    if (seen.has(label)) continue;
    seen.add(label);
    out.push({ id: p.id, label });
  }
  return out;
}

export function formatPoint(p: PointOption) {
  const d = new Date(p.device_ts);
  return `#${p.id} ${d.toLocaleDateString("it-IT")} ${p.lat.toFixed(2)},${p.lng.toFixed(2)}`;
}

export function formatTs(sec: number | null): string {
  if (sec == null) return "—";
  return new Date(sec * 1000).toLocaleString("it-IT", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function thumbUrl(row: MediaRow): string | null {
  if (row.type === "image" && row.url) return row.url;
  return null;
}
