import { createEffect, Show } from "solid-js";
import MdiPlus from "virtual:icons/mdi/plus";
import AdminMediaFilters from "./AdminMediaFilters";
import AdminMediaList from "./AdminMediaList";
import AdminMediaModal from "./AdminMediaModal";
import {
  error,
  showModal,
  mediaList,
  openCreate,
  loadMedia,
  loadPoints,
} from "@/stores/adminMediaStore";

export default function AdminMedia() {
  createEffect(() => {
    loadPoints();
  });
  createEffect(() => {
    loadMedia();
  });

  return (
    <div class="w-full max-w-4xl text-neutral-300">
      <h2 class="text-xl font-light text-neutral-100 mb-2">Media</h2>
      <p class="text-neutral-400 mb-4 text-sm md:text-base">
        Carica e gestisci foto e video sui punti del percorso.
      </p>
      {error() && (!showModal() || error() === "Sessione scaduta.") && (
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

      <button
        type="button"
        onClick={openCreate}
        class="w-full min-h-12 mb-6 flex items-center justify-center gap-2 rounded-xl bg-neutral-700 active:bg-neutral-600 text-neutral-100 text-base touch-manipulation md:max-w-xs md:hover:bg-neutral-600"
      >
        <MdiPlus class="h-5 w-5 shrink-0" />
        Aggiungi media
      </button>

      <Show when={showModal()}>
        <AdminMediaModal />
      </Show>

      <AdminMediaFilters />
      <AdminMediaList />
      {mediaList().length === 0 && (
        <p class="mt-6 text-neutral-500 text-base">Nessun media ancora.</p>
      )}
    </div>
  );
}
