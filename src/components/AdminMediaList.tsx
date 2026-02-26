import { For } from "solid-js";
import {
  cancelDelete,
  confirmDelete,
  deleteConfirmId,
  doDelete,
  mediaList,
  openEdit,
  page,
  pointLabel,
  setPage,
  totalPages,
} from "@/stores/adminMediaStore";
import MdiChevronLeft from "virtual:icons/mdi/chevron-left";
import MdiChevronRight from "virtual:icons/mdi/chevron-right";
import MdiImage from "virtual:icons/mdi/image";
import MdiVideo from "virtual:icons/mdi/video";
import { formatTs, thumbUrl } from "./adminMediaUtils";

function PaginationButtons() {
  return (
    <div class="flex gap-2 justify-between md:justify-start">
      <button
        type="button"
        disabled={page() <= 0}
        onClick={() => setPage((p) => Math.max(0, p - 1))}
        class="min-h-[44px] px-4 py-2.5 rounded-xl bg-neutral-700 text-neutral-200 text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 touch-manipulation active:bg-neutral-600 md:hover:bg-neutral-600"
      >
        <MdiChevronLeft class="w-5 h-5" />
        Precedente
      </button>
      <button
        type="button"
        disabled={page() >= totalPages() - 1}
        onClick={() => setPage((p) => Math.min(totalPages() - 1, p + 1))}
        class="min-h-[44px] px-4 py-2.5 rounded-xl bg-neutral-700 text-neutral-200 text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 touch-manipulation active:bg-neutral-600 md:hover:bg-neutral-600"
      >
        Successivo
        <MdiChevronRight class="w-5 h-5" />
      </button>
    </div>
  );
}

export default function AdminMediaList() {
  return (
    <div class="pb-12 flex flex-col gap-4">
      <PaginationButtons />
      <ul class="space-y-3 list-none p-0 m-0 md:pb-0">
        <For each={mediaList()}>
          {(row) => (
          <li class="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-900/50">
            <div class="flex gap-3 p-3 md:p-4">
              <div
                class="shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg bg-neutral-800 overflow-hidden flex items-center justify-center"
                aria-hidden
              >
                {thumbUrl(row) ? (
                  <img
                    src={thumbUrl(row)!}
                    alt=""
                    class="w-full h-full object-cover"
                  />
                ) : row.type === "video" ? (
                  <MdiVideo class="w-8 h-8 text-neutral-500" />
                ) : (
                  <MdiImage class="w-8 h-8 text-neutral-500" />
                )}
              </div>
              <div class="min-w-0 flex-1 flex flex-col justify-center gap-0.5">
                <span class="text-neutral-200 font-medium truncate">
                  {row.title || "—"}
                </span>
                <span class="text-sm text-neutral-500 truncate">
                  {pointLabel(row.point_id)}
                </span>
                <span class="text-xs text-neutral-600">
                  {row.type} · {formatTs(row.created_at)}
                </span>
              </div>
              <div class="shrink-0 flex flex-col justify-center gap-2">
                {deleteConfirmId() === row.id ? (
                  <div class="flex flex-col gap-1.5">
                    <button
                      type="button"
                      onClick={doDelete}
                      class="min-h-[40px] px-3 py-2 rounded-lg bg-red-900/50 text-red-300 text-sm touch-manipulation"
                    >
                      Elimina
                    </button>
                    <button
                      type="button"
                      onClick={cancelDelete}
                      class="min-h-[40px] px-3 py-2 text-neutral-500 text-sm touch-manipulation"
                    >
                      Annulla
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => openEdit(row)}
                      class="min-h-[40px] px-3 py-2 rounded-lg bg-neutral-700 text-neutral-200 text-sm touch-manipulation active:bg-neutral-600 md:hover:bg-neutral-600"
                    >
                      Modifica
                    </button>
                    <button
                      type="button"
                      onClick={() => confirmDelete(row.id)}
                      class="min-h-[40px] px-3 py-2 rounded-lg text-neutral-500 text-sm touch-manipulation active:text-red-400 md:hover:text-red-400"
                    >
                      Elimina
                    </button>
                  </>
                )}
              </div>
            </div>
          </li>
          )}
        </For>
      </ul>
      <PaginationButtons />
    </div>

  );
}
