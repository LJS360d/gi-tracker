import { createEffect, onMount, Show, untrack } from "solid-js";
import AdminSection from "./admin/AdminSection";
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
  onMount(() => {
    if (trackPath().length === 0) loadTrack();
  });
  let skipPointsOnce = false;
  createEffect(() => {
    page();
    pageSize();
    order();
    filterInMap();
    filterHasMedia();
    filterSearch();
    const hasPoints = untrack(() => pointsList().length > 0);
    if (hasPoints && !skipPointsOnce) {
      skipPointsOnce = true;
      return;
    }
    loadPoints();
  });

  return (
    <AdminSection
      title="Punti"
      description="Nella mappa viene mostrato il downsaple della traccia. La traccia non ancora pubblica è in grigio."
      error={
        error() && (!showEditModal() || error() === "Sessione scaduta.")
          ? error() ?? null
          : null
      }
      maxWidth="6xl"
    >
      <div class="mb-6 relative z-0">
        <AdminPointsMap path={trackPath()} class="h-[240px]" />
      </div>

      <Show when={showEditModal()}>
        <AdminPointModal />
      </Show>

      <AdminPointsTable />
    </AdminSection>
  );
}
