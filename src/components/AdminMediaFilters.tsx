import {
  page,
  setPage,
  pageSize,
  setPageSize,
  sort,
  setSort,
  order,
  setOrder,
  total,
  setPageToZero,
  totalPages,
} from "@/stores/adminMediaStore";

const selectClass =
  "min-h-[44px] select select-bordered select-sm md:select-md touch-manipulation";

export default function AdminMediaFilters() {
  const from = () => (total() === 0 ? 0 : page() * pageSize() + 1);
  const to = () => Math.min((page() + 1) * pageSize(), total());
  return (
    <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
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
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
      </label>
      <div class="flex items-center gap-2">
        <span class="text-sm text-base-content/60">Ordina:</span>
        <select
          value={`${sort()}-${order()}`}
          onInput={(e) => {
            const v = (e.target as HTMLSelectElement).value;
            const [col, o] = v.split("-") as [
              "id" | "created_at" | "taken_at" | "title",
              "asc" | "desc",
            ];
            setSort(col);
            setOrder(o);
            setPageToZero();
          }}
          class={selectClass}
        >
          <option value="created_at-desc">Creato ↓</option>
          <option value="created_at-asc">Creato ↑</option>
          <option value="taken_at-desc">Scattata ↓</option>
          <option value="taken_at-asc">Scattata ↑</option>
          <option value="title-asc">Titolo ↑</option>
          <option value="title-desc">Titolo ↓</option>
          <option value="id-desc">ID ↓</option>
          <option value="id-asc">ID ↑</option>
        </select>
      </div>
      <span class="text-sm text-base-content/60">
        {from()}–{to()} di {total()}
      </span>
    </div>
  );
}
