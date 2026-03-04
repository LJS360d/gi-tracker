import { For } from "solid-js";
import {
  cancelDelete,
  confirmDelete,
  deleteConfirmId,
  doDelete,
  mediaList,
  openEdit,
  page,
  pageSize,
  pointLabel,
  setPage,
  total,
  totalPages,
} from "@/stores/adminMediaStore";
import AdminPagination from "./admin/AdminPagination";
import MdiImage from "virtual:icons/mdi/image";
import MdiVideo from "virtual:icons/mdi/video";
import { formatTs, thumbUrl } from "./adminMediaUtils";

const cardClass =
  "border border-base-300 overflow-hidden bg-base-200/50";
const btnClass = "min-h-[40px] px-3 py-2 btn btn-neutral btn-sm touch-manipulation";
const btnDangerClass = "min-h-[40px] px-3 py-2 btn btn-error btn-sm touch-manipulation";
const btnGhostClass = "min-h-[40px] px-3 py-2 text-base-content/60 btn btn-ghost btn-sm touch-manipulation";

export default function AdminMediaList() {
  return (
    <div class="pb-12 flex flex-col gap-4">
      <AdminPagination
        page={page}
        totalPages={totalPages}
        setPage={setPage}
        total={total}
        pageSize={pageSize}
        itemLabel="media"
      />
      <ul class="space-y-3 list-none p-0 m-0 md:pb-0">
        <For each={mediaList()}>
          {(row) => (
            <li class={cardClass}>
              <div class="flex gap-3 p-3 md:p-4">
                <div
                  class="shrink-0 w-16 h-16 md:w-20 md:h-20 bg-base-300 overflow-hidden flex items-center justify-center"
                  aria-hidden
                >
                  {thumbUrl(row) ? (
                    <img
                      src={thumbUrl(row)!}
                      alt=""
                      class="w-full h-full object-cover"
                    />
                  ) : row.type === "video" ? (
                    <MdiVideo class="w-8 h-8 text-base-content/50" />
                  ) : (
                    <MdiImage class="w-8 h-8 text-base-content/50" />
                  )}
                </div>
                <div class="min-w-0 flex-1 flex flex-col justify-center gap-0.5">
                  <span class="font-medium truncate text-base-content">
                    {row.title || "—"}
                  </span>
                  <span class="text-sm text-base-content/60 truncate">
                    {pointLabel(row.point_id)}
                  </span>
                  <span class="text-xs text-base-content/50">
                    {row.type} · {formatTs(row.created_at)}
                  </span>
                </div>
                <div class="shrink-0 flex flex-col justify-center gap-2">
                  {deleteConfirmId() === row.id ? (
                    <div class="flex flex-col gap-1.5">
                      <button
                        type="button"
                        onClick={doDelete}
                        class={btnDangerClass}
                      >
                        Elimina
                      </button>
                      <button
                        type="button"
                        onClick={cancelDelete}
                        class={btnGhostClass}
                      >
                        Annulla
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          const r = mediaList().find((m) => m.id === row.id);
                          if (r) openEdit(r);
                        }}
                        class={btnClass}
                      >
                        Modifica
                      </button>
                      <button
                        type="button"
                        onClick={() => confirmDelete(row.id)}
                        class={btnGhostClass}
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
      <AdminPagination
        page={page}
        totalPages={totalPages}
        setPage={setPage}
        total={total}
        pageSize={pageSize}
        itemLabel="media"
      />
    </div>
  );
}
