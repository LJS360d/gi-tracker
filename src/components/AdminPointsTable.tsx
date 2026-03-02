import { createEffect, For } from "solid-js";
import {
  cancelDelete,
  confirmDelete,
  deleteConfirmId,
  doDeletePoint,
  filterHasMedia,
  filterInMap,
  formatTs,
  openEdit,
  order,
  page,
  pageSize,
  setFilterHasMedia,
  setFilterInMap,
  setFilterSearch,
  setOrder,
  setPage,
  setPageSize,
  setSearchInput,
  pointsList,
  searchInput,
  totalPages,
  total,
} from "@/stores/adminPointsStore";
import type { PointRow } from "@/stores/adminPointsStore";
import MdiChevronLeft from "virtual:icons/mdi/chevron-left";
import MdiChevronRight from "virtual:icons/mdi/chevron-right";

const SEARCH_DEBOUNCE_MS = 300;

function Pagination() {
  return (
    <div class="flex flex-wrap gap-2 justify-between items-center w-full">
      <span class="text-sm text-neutral-500">
        {total()} punti totali · pagina {page() + 1} di {totalPages()}
      </span>
      <div class="flex gap-2">
        <button
          type="button"
          disabled={page() <= 0}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          class="min-h-[40px] px-3 py-2 rounded-lg bg-neutral-700 text-neutral-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
        >
          <MdiChevronLeft class="w-5 h-5 inline" />
        </button>
        <button
          type="button"
          disabled={page() >= totalPages() - 1}
          onClick={() => setPage((p) => Math.min(totalPages() - 1, p + 1))}
          class="min-h-[40px] px-3 py-2 rounded-lg bg-neutral-700 text-neutral-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
        >
          <MdiChevronRight class="w-5 h-5 inline" />
        </button>
      </div>
    </div>
  );
}

function NotOnMapReason({ reason }: { reason: PointRow["not_on_map_reason"] }) {
  if (reason === null) return <span class="text-neutral-500">—</span>;
  if (reason === "downsample")
    return <span class="text-amber-400">downsample</span>;
  return <span class="text-sky-400">ritardo pubblico</span>;
}

export default function AdminPointsTable() {
  createEffect(() => {
    const q = searchInput();
    const t = setTimeout(() => {
      setFilterSearch(q);
      setPage(0);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  });

  return (
    <div class="space-y-2">
      <div class="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-neutral-800/50 border border-neutral-800">
        <input
          type="search"
          placeholder="Cerca per indirizzo…"
          value={searchInput()}
          onInput={(e) => setSearchInput((e.target as HTMLInputElement).value)}
          class="min-h-10 flex-1 min-w-[160px] px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-600 text-neutral-100 placeholder-neutral-500 text-sm"
        />
        <label class="flex items-center gap-2 text-sm text-neutral-400 cursor-pointer">
          <input
            type="checkbox"
            checked={filterInMap()}
            onInput={(e) => {
              setFilterInMap((e.target as HTMLInputElement).checked);
              setPage(0);
            }}
            class="rounded border-neutral-600 bg-neutral-800"
          />
          Solo in mappa
        </label>
        <label class="flex items-center gap-2 text-sm text-neutral-400 cursor-pointer">
          <input
            type="checkbox"
            checked={filterHasMedia()}
            onInput={(e) => {
              setFilterHasMedia((e.target as HTMLInputElement).checked);
              setPage(0);
            }}
            class="rounded border-neutral-600 bg-neutral-800"
          />
          Solo con media
        </label>
        <label class="flex items-center gap-2 text-sm text-neutral-400">
          Righe per pagina
          <select
            value={pageSize()}
            onInput={(e) => {
              setPageSize(Number((e.target as HTMLSelectElement).value));
              setPage(0);
            }}
            class="min-h-10 px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-600 text-neutral-100 text-sm"
          >
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
            <option value={500}>500</option>
          </select>
        </label>
      </div>
      <div class="overflow-x-auto rounded-xl border border-neutral-800">
        <table class="w-full text-sm text-left">
          <thead class="bg-neutral-800/80 text-neutral-400">
            <tr>
              <th class="px-3 py-2 font-medium">ID</th>
              <th class="px-3 py-2 font-medium">
                <button
                  type="button"
                  onClick={() => setOrder((o) => (o === "asc" ? "desc" : "asc"))}
                  class="hover:text-neutral-200"
                >
                  Data e ora {order() === "asc" ? "↑" : "↓"}
                </button>
              </th>
              <th class="px-3 py-2 font-medium">Lat</th>
              <th class="px-3 py-2 font-medium">Lng</th>
              <th class="px-3 py-2 font-medium">In mappa</th>
              <th class="px-3 py-2 font-medium">Media</th>
              <th class="px-3 py-2 font-medium">Motivo escluso</th>
              <th class="px-3 py-2 font-medium">Tipo</th>
              <th class="px-3 py-2 font-medium max-w-[120px] truncate">Indirizzo</th>
              <th class="px-3 py-2 font-medium w-[140px]">Azioni</th>
            </tr>
          </thead>
          <tbody>
            <For each={pointsList()}>
              {(row) => (
                <tr class="border-t border-neutral-800 hover:bg-neutral-800/40">
                  <td class="px-3 py-2 text-neutral-300">{row.id}</td>
                  <td class="px-3 py-2 text-neutral-300 whitespace-nowrap">
                    {formatTs(row.device_ts)}
                  </td>
                  <td class="px-3 py-2 text-neutral-300">{row.lat.toFixed(5)}</td>
                  <td class="px-3 py-2 text-neutral-300">{row.lng.toFixed(5)}</td>
                  <td class="px-3 py-2">
                    {row.on_public_map ? (
                      <span class="text-emerald-400">sì</span>
                    ) : (
                      <span class="text-neutral-500">no</span>
                    )}
                  </td>
                  <td class="px-3 py-2">
                    {row.has_media ? (
                      <span class="text-emerald-400">sì</span>
                    ) : (
                      <span class="text-neutral-500">no</span>
                    )}
                  </td>
                  <td class="px-3 py-2">
                    <NotOnMapReason reason={row.not_on_map_reason} />
                  </td>
                  <td class="px-3 py-2 text-neutral-400">{row.segment_type}</td>
                  <td class="px-3 py-2 text-neutral-400 max-w-[120px] truncate" title={row.address ?? ""}>
                    {row.address ?? "—"}
                  </td>
                  <td class="px-3 py-2">
                    {deleteConfirmId() === row.id ? (
                      <div class="flex gap-1">
                        <button
                          type="button"
                          onClick={doDeletePoint}
                          class="px-2 py-1 rounded bg-red-900/50 text-red-300 text-xs touch-manipulation"
                        >
                          Elimina
                        </button>
                        <button
                          type="button"
                          onClick={cancelDelete}
                          class="px-2 py-1 rounded text-neutral-500 text-xs touch-manipulation"
                        >
                          Annulla
                        </button>
                      </div>
                    ) : (
                      <div class="flex gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(row)}
                          class="px-2 py-1 rounded bg-neutral-700 text-neutral-200 text-xs touch-manipulation"
                        >
                          Modifica
                        </button>
                        <button
                          type="button"
                          onClick={() => confirmDelete(row.id)}
                          class="px-2 py-1 rounded text-neutral-500 text-xs touch-manipulation hover:text-red-400"
                        >
                          Elimina
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </div>
      <div class="p-3 rounded-xl border border-neutral-800 bg-neutral-800/30">
        <Pagination />
      </div>
    </div>
  );
}
