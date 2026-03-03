import { createEffect, createMemo, createSignal, onCleanup, onMount, Show } from "solid-js";
import type { TrackPathPoint } from "@/stores/adminPointsStore";

type Leaflet = typeof import("leaflet");
type LeafletMap = import("leaflet").Map;

const TILES_PROVIDER =
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

type Props = {
  path: TrackPathPoint[];
  class?: string;
};

export default function AdminPointsMap(props: Props) {
  let container: HTMLDivElement | undefined;
  let map: LeafletMap | null = null;
  let polylines: import("leaflet").Polyline[] = [];
  const [leafletLib, setLeafletLib] = createSignal<Leaflet | null>(null);
  const [mapReady, setMapReady] = createSignal(false);

  const publicLatLngs = createMemo(() =>
    props.path
      .filter((p) => p.is_public)
      .map((p) => [p.lat, p.lng] as [number, number]),
  );
  const privateLatLngs = createMemo(() =>
    props.path
      .filter((p) => !p.is_public)
      .map((p) => [p.lat, p.lng] as [number, number]),
  );
  const allLatLngs = createMemo(() =>
    props.path.map((p) => [p.lat, p.lng] as [number, number]),
  );

  onCleanup(() => {
    for (const pl of polylines) pl.remove();
    polylines = [];
    map?.remove();
    map = null;
  });

  onMount(async () => {
    const L = (await import("leaflet")).default;
    await import("leaflet/dist/leaflet.css");
    setLeafletLib(L);
    if (!container) return;
    map = L.map(container, {
      center: [40, 10],
      zoom: 2,
      zoomControl: false,
      attributionControl: false,
    });
    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.tileLayer(TILES_PROVIDER, {
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map);
    setMapReady(true);
  });

  createEffect(() => {
    const L = leafletLib();
    if (!L || !mapReady() || !map) return;
    const path = props.path;
    if (path.length === 0) return;

    for (const pl of polylines) pl.remove();
    polylines = [];

    const privateList = privateLatLngs();
    const publicList = publicLatLngs();
    if (privateList.length >= 2) {
      const line = L.polyline(privateList, {
        color: "#6b7280",
        weight: 2,
        opacity: 0.7,
      }).addTo(map!);
      polylines.push(line);
    }
    if (publicList.length >= 2) {
      const line = L.polyline(publicList, {
        color: "#fff",
        weight: 3,
      }).addTo(map!);
      polylines.push(line);
    }

    const bounds = L.latLngBounds(allLatLngs());
    map!.fitBounds(bounds, { padding: [20, 20], maxZoom: 12 });
  });

  return (
    <div
      class={`relative w-full min-h-[200px] overflow-hidden border border-base-300 ${props.class ?? ""}`.trim()}
    >
      <div
        ref={(el) => (container = el)}
        class="w-full h-full min-h-[200px]"
        aria-hidden="true"
      />
      <Show when={props.path.length === 0}>
        <div class="absolute inset-0 flex items-center justify-center bg-base-300/80 text-base-content/60 text-sm">
          Nessun punto
        </div>
      </Show>
    </div>
  );
}
