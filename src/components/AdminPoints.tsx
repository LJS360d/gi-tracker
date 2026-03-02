import { createEffect, onMount, Show } from "solid-js";
import AdminPointsMap from "./AdminPointsMap";
import AdminPointsTable from "./AdminPointsTable";
import AdminPointModal from "./AdminPointModal";
import {
  error,
  filterHasMedia,
  filterInMap,
  filterSearch,
  loadPoints,
  loadTrack,
  order,
  page,
  pageSize,
  pointsList,
  setPointsList,
  setTotal,
  setTrackPath,
  showEditModal,
  trackPath,
} from "@/stores/adminPointsStore";
import type { PointRow, TrackPathPoint } from "@/stores/adminPointsStore";

type Props = {
  initialPoints?: PointRow[];
  initialTotal?: number;
  initialTrackPath?: TrackPathPoint[];
};

export default function AdminPoints(props: Props) {
  if (
    props.initialPoints &&
    props.initialTotal != null &&
    pointsList().length === 0 &&
    trackPath().length === 0
  ) {
    setPointsList(props.initialPoints);
    setTotal(props.initialTotal);
    if (props.initialTrackPath?.length) setTrackPath(props.initialTrackPath);
  }
  onMount(() => loadTrack());
  createEffect(() => {
    page();
    pageSize();
    order();
    filterInMap();
    filterHasMedia();
    filterSearch();
    loadPoints();
  });

  return (
    <div class="w-full max-w-6xl text-neutral-300">
      <h2 class="text-xl font-light text-neutral-100 mb-2">Punti</h2>
      <p class="text-neutral-400 mb-4 text-sm">
        Tutti i punti del percorso. In mappa: solo quelli dopo il downsample e
        prima del public_delay. Grigio = non ancora pubblico.
      </p>
      {error() && (!showEditModal() || error() === "Sessione scaduta.") && (
        <p class="mb-4 text-red-400">
          {error()}
          {error() === "Sessione scaduta." && (
            <>
              {" "}
              <a href="/admin" class="underline">
                Accedi di nuovo
              </a>
            </>
          )}
        </p>
      )}

      <div class="mb-6 relative z-0">
        <AdminPointsMap path={trackPath()} class="h-[240px]" />
      </div>

      <Show when={showEditModal()}>
        <AdminPointModal />
      </Show>

      <AdminPointsTable />
    </div>
  );
}
