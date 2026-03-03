import { createEffect, onMount, Show } from "solid-js";
import MdiPlus from "virtual:icons/mdi/plus";
import AdminSection from "./admin/AdminSection";
import AdminMediaFilters from "./AdminMediaFilters";
import AdminMediaList from "./AdminMediaList";
import AdminMediaModal from "./AdminMediaModal";
import type { MediaRow, PointOption } from "@/components/adminMediaUtils";
import {
  error,
  showModal,
  mediaList,
  points,
  total,
  page,
  pageSize,
  sort,
  order,
  openCreate,
  loadMedia,
  loadPoints,
  hydrateFromInitial,
} from "@/stores/adminMediaStore";

type Props = {
  initialMedia?: MediaRow[];
  initialTotal?: number;
  initialPoints?: PointOption[];
};

export default function AdminMedia(props: Props) {
  if (
    props.initialMedia &&
    props.initialPoints &&
    mediaList().length === 0 &&
    points().length === 0
  ) {
    hydrateFromInitial(
      props.initialMedia,
      props.initialTotal ?? 0,
      props.initialPoints,
    );
  }
  onMount(() => {
    if (points().length === 0) loadPoints();
  });
  let skipMediaOnce = false;
  createEffect(() => {
    page();
    pageSize();
    sort();
    order();
    if (mediaList().length > 0 && total() > 0 && !skipMediaOnce) {
      skipMediaOnce = true;
      return;
    }
    loadMedia();
  });

  return (
    <AdminSection
      title="Media"
      description="Carica e gestisci foto e video sui punti del percorso."
      error={
        error() && (!showModal() || error() === "Sessione scaduta.")
          ? error() ?? null
          : null
      }
      maxWidth="4xl"
    >
      <button
        type="button"
        onClick={openCreate}
        class="btn btn-neutral w-full min-h-12 mb-6 md:max-w-xs gap-2 touch-manipulation"
      >
        <MdiPlus class="h-5 w-5 shrink-0" />
        Aggiungi media
      </button>

      <Show when={showModal()}>
        <AdminMediaModal />
      </Show>

      <AdminMediaFilters />
      <Show
        when={mediaList().length > 0}
        fallback={
          <p class="mt-6 text-base-content/60 text-base">
            Nessun media pubblicato
          </p>
        }
      >
        <AdminMediaList />
      </Show>
    </AdminSection>
  );
}
