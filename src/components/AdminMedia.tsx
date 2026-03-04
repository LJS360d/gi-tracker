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
  createEffect(() => {
    const im = props.initialMedia;
    const ip = props.initialPoints;
    if (
      im &&
      ip &&
      mediaList().length === 0 &&
      points().length === 0
    ) {
      hydrateFromInitial(im, props.initialTotal ?? 0, ip);
    }
  });
  onMount(() => {
    const im = props.initialMedia;
    const ip = props.initialPoints;
    if (
      im &&
      ip &&
      mediaList().length === 0 &&
      points().length === 0
    ) {
      hydrateFromInitial(im, props.initialTotal ?? 0, ip);
    }
    if (points().length === 0) loadPoints();
  });
  let initialSkip = !!(props.initialMedia && props.initialMedia.length > 0);
  createEffect(() => {
    page();
    pageSize();
    sort();
    order();
    if (initialSkip) {
      initialSkip = false;
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
