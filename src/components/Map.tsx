import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { createSignal, onCleanup, onMount } from "solid-js";
import MediaModal, { type MediaItem } from "@/components/MediaModal";

const TILES_PROVIDER =
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

type TrackPoint = {
  lat: number;
  lng: number;
  device_ts: number;
  segment_type?: string;
};

type MediaEntry = {
  pointIndex: number;
  type: "image" | "video";
  url: string;
  title: string;
  description: string;
};

const SEGMENT_STYLE: Record<string, L.PolylineOptions> = {
  ground: { color: "#fff", weight: 3 },
  plane: { color: "#7dd3fc", weight: 3, dashArray: "8,8" },
  boat: { color: "#38bdf8", weight: 3, dashArray: "12,6" },
};

const REVEAL_DURATION_MS = 1500;

type Props = {
  class?: string;
  initialCenter?: [number, number];
  initialZoom?: number;
  animateTrack?: boolean;
};

type Segment = { type: string; startIndex: number; endIndex: number };

const CLUSTER_RADIUS_DEG = 0.001;

function distDeg(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  return Math.sqrt((a.lat - b.lat) ** 2 + (a.lng - b.lng) ** 2);
}

function clusterMedia(
  media: MediaEntry[],
  points: TrackPoint[],
): { lat: number; lng: number; entries: MediaEntry[] }[] {
  const clusters: { lat: number; lng: number; entries: MediaEntry[] }[] = [];
  for (const entry of media) {
    if (entry.pointIndex >= points.length) continue;
    const p = points[entry.pointIndex];
    const lat = p.lat;
    const lng = p.lng;
    let found = clusters.find(
      (c) => distDeg({ lat, lng }, { lat: c.lat, lng: c.lng }) <= CLUSTER_RADIUS_DEG,
    );
    if (found) {
      found.entries.push(entry);
      const n = found.entries.length;
      found.lat = (found.lat * (n - 1) + lat) / n;
      found.lng = (found.lng * (n - 1) + lng) / n;
    } else {
      clusters.push({ lat, lng, entries: [entry] });
    }
  }
  return clusters;
}

function groupPointsBySegment(points: TrackPoint[]): Segment[] {
  const segments: Segment[] = [];
  let start = 0;
  for (let i = 1; i <= points.length; i++) {
    const prev = points[i - 1]?.segment_type ?? "ground";
    const curr =
      i < points.length ? (points[i]?.segment_type ?? "ground") : null;
    if (curr !== prev || i === points.length) {
      segments.push({ type: prev, startIndex: start, endIndex: i });
      start = i;
    }
  }
  return segments;
}

export default function Map(props: Props) {
  let container: HTMLDivElement | undefined;
  let map: L.Map | null = null;
  let polylines: L.Polyline[] = [];
  let revealFrameId: number | null = null;
  const mediaMarkers: L.Layer[] = [];
  const [modalMediaList, setModalMediaList] = createSignal<MediaItem[] | null>(null);
  const [modalIndex, setModalIndex] = createSignal(0);
  const animate = props.animateTrack !== false;

  const isMobile = window.innerWidth <= 768;
  const center: [number, number] = props.initialCenter ?? [40, 75];
  const zoom = props.initialZoom ?? isMobile ? 1 : 3.5;
  const padding: [number, number] = isMobile ? [10, 10] : [20, 20];

  onMount(() => {
    if (!container) return;
    map = L.map(container, {
      center,
      zoom,
      zoomControl: false,
      attributionControl: false,
    });
    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.tileLayer(TILES_PROVIDER, {
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map);

    fetch("/api/track")
      .then((r) => r.json())
      .then((data: { points?: TrackPoint[]; media?: MediaEntry[] }) => {
        const points = data?.points ?? [];
        const media = data?.media ?? [];
        if (points.length === 0) return;
        const latLngs: L.LatLngExpression[] = points.map((p) => [p.lat, p.lng]);
        const bounds = L.latLngBounds(latLngs);
        const segments = groupPointsBySegment(points);

        const addMediaMarkers = () => {
          const clusters = clusterMedia(media, points);
          for (const cluster of clusters) {
            const count = cluster.entries.length;
            const items: MediaItem[] = cluster.entries.map((e) => ({
              type: e.type,
              url: e.url,
              title: e.title,
              description: e.description,
            }));
            const marker = L.marker([cluster.lat, cluster.lng], {
              icon: L.divIcon({
                className: "",
                html: `<div style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;background:#fff;color:#333;border:2px solid #333;font-size:11px;font-weight:700;box-sizing:border-box;cursor:pointer;">${count}</div>`,
                iconSize: [28, 28],
                iconAnchor: [14, 14],
              }),
            }).addTo(map!);
            mediaMarkers.push(marker);
            marker.on("click", () => {
              setModalMediaList(items);
              setModalIndex(0);
            });
          }
        };

        const style = (type: string) =>
          SEGMENT_STYLE[type] ?? SEGMENT_STYLE.ground;

        if (animate && points.length > 1) {
          for (const seg of segments) {
            const opts = style(seg.type);
            const line = L.polyline([], opts).addTo(map!);
            polylines.push(line);
          }
          const start = performance.now();
          const tick = () => {
            const elapsed = performance.now() - start;
            const t = Math.min(1, elapsed / REVEAL_DURATION_MS);
            const targetIndex = 1 + Math.floor(t * (points.length - 1));
            segments.forEach((seg, i) => {
              const from = Math.min(seg.startIndex, targetIndex);
              const to = Math.min(seg.endIndex, targetIndex);
              const slice = from < to ? latLngs.slice(from, to) : [];
              polylines[i]?.setLatLngs(slice);
            });
            if (t < 1) {
              revealFrameId = requestAnimationFrame(tick);
            } else {
              addMediaMarkers();
              map!.fitBounds(bounds, { padding, maxZoom: 10 });
            }
          };
          revealFrameId = requestAnimationFrame(tick);
        } else {
          for (const seg of segments) {
            const slice = latLngs.slice(seg.startIndex, seg.endIndex);
            if (slice.length > 0) {
              const line = L.polyline(slice, style(seg.type)).addTo(map!);
              polylines.push(line);
            }
          }
          addMediaMarkers();
          map!.fitBounds(bounds, { padding: [20, 20], maxZoom: 10 });
        }
      })
      .catch(() => {});

    const onResize = () => map?.invalidateSize();
    window.addEventListener("resize", onResize);
    onCleanup(() => {
      if (revealFrameId != null) cancelAnimationFrame(revealFrameId);
      window.removeEventListener("resize", onResize);
      for (const m of mediaMarkers) m.remove();
      mediaMarkers.length = 0;
      for (const pl of polylines) pl.remove();
      polylines = [];
      map?.remove();
      map = null;
    });
  });

  return (
    <>
      <div
        ref={(el) => (container = el)}
        class={props.class}
        style={{ width: "100%", height: "100%", "min-height": "200px" }}
        aria-hidden="true"
      />
      <MediaModal
        list={modalMediaList}
        index={modalIndex}
        onClose={() => setModalMediaList(null)}
        onPrev={() => setModalIndex((i) => Math.max(0, i - 1))}
        onNext={(len) => setModalIndex((i) => Math.min(len - 1, i + 1))}
      />
    </>
  );
}
