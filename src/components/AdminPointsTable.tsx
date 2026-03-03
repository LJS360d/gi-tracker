import type { PointRow } from "@/stores/adminPointsStore";
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
  pointsList,
  searchInput,
  setFilterHasMedia,
  setFilterInMap,
  setOrder,
  setPage,
  setPageSize,
  setSearchInput,
  total,
  totalPages
} from "@/stores/adminPointsStore";
import { Index } from "solid-js";
import AdminPagination from "./admin/AdminPagination";

const SEARCH_DEBOUNCE_MS = 300;

const inputClass =
  "min-h-10 md:min-h-[44px] flex-1 min-w-[160px] px-3 py-2 input input-bordered input-sm md:input-md w-full";
const selectClass =
  "min-h-10 md:min-h-[44px] px-3 py-2 select select-bordered select-sm md:select-md";
const filterBarClass =
  "flex flex-wrap items-center gap-3 p-3 bg-base-200/50 border border-base-300";
const tableWrapClass = "overflow-x-auto border border-base-300";
const tableHeadClass = "bg-base-300 text-base-content/70";
const btnSmallClass = "btn btn-neutral btn-xs md:btn-sm touch-manipulation";
const btnDangerSmallClass = "btn btn-error btn-xs md:btn-sm touch-manipulation";
const btnGhostSmallClass = "btn btn-ghost btn-xs md:btn-sm touch-manipulation text-base-content/60";

function NotOnMapReason({ reason }: { reason: PointRow["not_on_map_reason"] }) {
  if (reason === null) return <span class="text-base-content/50">-</span>;
  if (reason === "downsample")
    return <span class="text-warning">downsample</span>;
  return <span class="text-info">ritardo pubblico</span>;
}

export default function AdminPointsTable() {

  return (
    <div class="space-y-2">
      <div class={filterBarClass}>
        <input
          type="search"
          placeholder="Cerca per indirizzo…"
          value={searchInput()}
          onInput={(e) => setSearchInput((e.target as HTMLInputElement).value)}
          class={inputClass}
        />
        <label class="flex items-center gap-2 text-sm text-base-content/70 cursor-pointer">
          <input
            type="checkbox"
            checked={filterInMap()}
            onInput={(e) => {
              setFilterInMap((e.target as HTMLInputElement).checked);
              setPage(0);
            }}
            class="checkbox checkbox-sm checkbox-primary"
          />
          Solo in mappa
        </label>
        <label class="flex items-center gap-2 text-sm text-base-content/70 cursor-pointer">
          <input
            type="checkbox"
            checked={filterHasMedia()}
            onInput={(e) => {
              setFilterHasMedia((e.target as HTMLInputElement).checked);
              setPage(0);
            }}
            class="checkbox checkbox-sm checkbox-primary"
          />
          Solo con media
        </label>
        <label class="flex items-center gap-2 text-sm text-base-content/70">
          Per pagina
          <select
            value={pageSize()}
            onInput={(e) => {
              setPageSize(Number((e.target as HTMLSelectElement).value));
              setPage(0);
            }}
            class={selectClass}
          >
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
            <option value={500}>500</option>
          </select>
        </label>
      </div>
      <div class={tableWrapClass}>
        <table class="table table-pin-rows w-full text-sm text-left">
          <thead class={tableHeadClass}>
            <tr>
              <th class="px-3 py-2 font-medium">ID</th>
              <th class="px-3 py-2 font-medium">
                <button
                  type="button"
                  onClick={() => setOrder((o) => (o === "asc" ? "desc" : "asc"))}
                  class="hover:opacity-80"
                >
                  Data e ora {order() === "asc" ? "↑" : "↓"}
                </button>
              </th>
              <th class="px-3 py-2 font-medium">Lat</th>
              <th class="px-3 py-2 font-medium">Lng</th>
              <th class="px-3 py-2 font-medium">In mappa</th>
              <th class="px-3 py-2 font-medium">Media</th>
              {/* <th class="px-3 py-2 font-medium">Motivo escluso</th> */}
              {/* <th class="px-3 py-2 font-medium">Tipo</th> */}
              <th class="px-3 py-2 font-medium max-w-[120px] truncate">Indirizzo</th>
              <th class="px-3 py-2 font-medium w-[140px]">Azioni</th>
            </tr>
          </thead>
          <tbody>
            <Index each={pointsList()}>
              {(row) => (
                  <tr class="border-t border-base-300 hover:bg-base-300/30">
                    <td class="px-3 py-2">{row().id}</td>
                    <td class="px-3 py-2 whitespace-nowrap">
                      {formatTs(row().device_ts)}
                    </td>
                    <td class="px-3 py-2">{row().lat.toFixed(5)}</td>
                    <td class="px-3 py-2">{row().lng.toFixed(5)}</td>
                    <td class="px-3 py-2">
                      {row().on_public_map ? (
                        <span class="text-success">sì</span>
                      ) : (
                        <span class="text-base-content/50">no</span>
                      )}
                    </td>
                    <td class="px-3 py-2">
                      {row().has_media ? (
                        <span class="text-success">sì</span>
                      ) : (
                        <span class="text-base-content/50">no</span>
                      )}
                    </td>
                    {/* <td class="px-3 py-2">
                      <NotOnMapReason reason={row().not_on_map_reason} />
                    </td> */}
                    {/* <td class="px-3 py-2 text-base-content/70">{row().segment_type}</td> */}
                    <td class="px-3 py-2 text-base-content/70 max-w-[120px] truncate" title={row().address ?? ""}>
                      {row().address ?? "—"}
                    </td>
                    <td class="px-3 py-2">
                      {deleteConfirmId() === row().id ? (
                        <div class="flex gap-1">
                          <button
                            type="button"
                            onClick={doDeletePoint}
                            class={btnDangerSmallClass}
                          >
                            Elimina
                          </button>
                          <button
                            type="button"
                            onClick={cancelDelete}
                            class={btnGhostSmallClass}
                          >
                            Annulla
                          </button>
                        </div>
                      ) : (
                        <div class="flex gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(row())}
                            class={btnSmallClass}
                          >
                            Modifica
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const r = row();
                              if (r != null) confirmDelete(r.id);
                            }}
                            class={btnGhostSmallClass}
                          >
                            Elimina
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
              )}
            </Index>
          </tbody>
        </table>
      </div>
      <div class="p-3 border border-base-300 bg-base-200/30">
        <AdminPagination
          page={page}
          totalPages={totalPages}
          setPage={setPage}
          total={total}
          pageSize={pageSize}
          itemLabel="punti"
        />
      </div>
    </div>
  );
}
