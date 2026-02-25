import { createEffect, createSignal } from "solid-js";
import { adminFetchOpts, apiHeaders } from "@/lib/admin-client";
import MdiChevronLeft from "virtual:icons/mdi/chevron-left";
import MdiChevronRight from "virtual:icons/mdi/chevron-right";
import MdiImage from "virtual:icons/mdi/image";
import MdiVideo from "virtual:icons/mdi/video";
import MdiPlus from "virtual:icons/mdi/plus";
import MdiClose from "virtual:icons/mdi/close";

type PointOption = { id: number; device_ts: number; lat: number; lng: number };
type MediaRow = {
  id: number;
  point_id: number;
  point_device_ts: number | null;
  point_lat: number | null;
  point_lng: number | null;
  type: string;
  url: string;
  title: string;
  description: string;
  created_at: number;
  taken_at: number | null;
  taken_lat: number | null;
  taken_lng: number | null;
};

type SortCol = "id" | "created_at" | "taken_at" | "title";

function formatPoint(p: PointOption) {
  const d = new Date(p.device_ts);
  return `#${p.id} ${d.toLocaleDateString("it-IT")} ${p.lat.toFixed(2)},${p.lng.toFixed(2)}`;
}

function formatTs(sec: number | null): string {
  if (sec == null) return "—";
  return new Date(sec * 1000).toLocaleString("it-IT", { dateStyle: "short", timeStyle: "short" });
}

function thumbUrl(row: MediaRow): string | null {
  if (row.type === "image" && row.url) return row.url;
  return null;
}

export default function AdminMedia() {
  const [mediaList, setMediaList] = createSignal<MediaRow[]>([]);
  const [points, setPoints] = createSignal<PointOption[]>([]);
  const [error, setError] = createSignal<string | null>(null);
  const [showModal, setShowModal] = createSignal(false);
  const [editingRow, setEditingRow] = createSignal<MediaRow | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = createSignal<number | null>(null);

  const [page, setPage] = createSignal(0);
  const [pageSize, setPageSize] = createSignal(25);
  const [total, setTotal] = createSignal(0);
  const [sort, setSort] = createSignal<SortCol>("created_at");
  const [order, setOrder] = createSignal<"asc" | "desc">("desc");

  const [formPointId, setFormPointId] = createSignal<number | null>(null);
  const [formUrl, setFormUrl] = createSignal("");
  const [formTitle, setFormTitle] = createSignal("");
  const [formDescription, setFormDescription] = createSignal("");
  const [formTakenAt, setFormTakenAt] = createSignal<number | null>(null);
  const [formTakenLat, setFormTakenLat] = createSignal<number | null>(null);
  const [formTakenLng, setFormTakenLng] = createSignal<number | null>(null);
  const [formSubmitting, setFormSubmitting] = createSignal(false);
  const [uploading, setUploading] = createSignal(false);

  function loadMedia() {
    const limit = pageSize();
    const offset = page() * limit;
    const params = new URLSearchParams({ limit: String(limit), offset: String(offset), sort: sort(), order: order() });
    fetch(`/api/admin/media?${params}`, { ...adminFetchOpts, headers: apiHeaders() })
      .then((r) => {
        if (r.status === 401) {
          setError("Sessione scaduta.");
          return null;
        }
        const totalHeader = r.headers.get("X-Total-Count");
        if (totalHeader != null) setTotal(parseInt(totalHeader, 10) || 0);
        return r.json();
      })
      .then((data) => Array.isArray(data) && setMediaList(data));
  }

  function loadPoints() {
    fetch("/api/admin/points?limit=300", { ...adminFetchOpts, headers: apiHeaders() })
      .then((r) => {
        if (r.status === 401) {
          setError("Sessione scaduta.");
          return null;
        }
        return r.json();
      })
      .then((data) => Array.isArray(data) && setPoints(data));
  }

  createEffect(() => {
    loadPoints();
  });
  createEffect(() => {
    loadMedia();
  });

  function openCreate() {
    const pts = points();
    setEditingRow(null);
    setFormPointId(pts[0]?.id ?? null);
    setFormUrl("");
    setFormTitle("");
    setFormDescription("");
    setFormTakenAt(null);
    setFormTakenLat(null);
    setFormTakenLng(null);
    setError(null);
    setShowModal(true);
  }

  function openEdit(row: MediaRow) {
    setEditingRow(row);
    setFormPointId(row.point_id);
    setFormUrl(row.url);
    setFormTitle(row.title);
    setFormDescription(row.description);
    setError(null);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingRow(null);
  }

  function handleFileChange(e: Event) {
    const input = e.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    const fd = new FormData();
    fd.set("file", file);
    fetch("/api/admin/media/upload", {
      method: "POST",
      ...adminFetchOpts,
      body: fd,
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else {
          if (data.url) setFormUrl(data.url);
          if (data.taken_at != null) setFormTakenAt(data.taken_at);
          if (data.taken_lat != null) setFormTakenLat(data.taken_lat);
          if (data.taken_lng != null) setFormTakenLng(data.taken_lng);
        }
      })
      .finally(() => {
        setUploading(false);
        input.value = "";
      });
  }

  function handleSubmit(e: Event) {
    e.preventDefault();
    const pointId = formPointId();
    if (pointId == null) {
      setError("Seleziona un punto");
      return;
    }
    const url = formUrl().trim();
    if (!url) {
      setError("Aggiungi un link o carica un file");
      return;
    }
    const title = formTitle().trim();
    const description = formDescription();
    setFormSubmitting(true);
    setError(null);
    const row = editingRow();
    if (row) {
      fetch(`/api/admin/media/${row.id}`, {
        method: "PATCH",
        ...adminFetchOpts,
        headers: apiHeaders(),
        body: JSON.stringify({ point_id: pointId, url, title, description }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.error) setError(data.error);
          else {
            closeModal();
            loadMedia();
          }
        })
        .finally(() => setFormSubmitting(false));
    } else {
      const payload: Record<string, unknown> = { point_id: pointId, url, title, description };
      const ta = formTakenAt();
      const tlat = formTakenLat();
      const tlng = formTakenLng();
      if (ta != null) payload.taken_at = ta;
      if (tlat != null) payload.taken_lat = tlat;
      if (tlng != null) payload.taken_lng = tlng;
      fetch("/api/admin/media", {
        method: "POST",
        ...adminFetchOpts,
        headers: apiHeaders(),
        body: JSON.stringify(payload),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.error) setError(data.error);
          else {
            closeModal();
            loadMedia();
          }
        })
        .finally(() => setFormSubmitting(false));
    }
  }

  function confirmDelete(id: number) {
    setDeleteConfirmId(id);
  }

  function cancelDelete() {
    setDeleteConfirmId(null);
  }

  function doDelete() {
    const id = deleteConfirmId();
    if (id == null) return;
    fetch(`/api/admin/media/${id}`, { method: "DELETE", ...adminFetchOpts, headers: apiHeaders() }).then((r) => {
      if (r.status === 204 || r.ok) {
        setDeleteConfirmId(null);
        loadMedia();
      }
    });
  }

  const totalPages = () => Math.max(1, Math.ceil(total() / pageSize()));
  const from = () => (total() === 0 ? 0 : page() * pageSize() + 1);
  const to = () => Math.min((page() + 1) * pageSize(), total());

  const pointsList = () => points();
  const pointLabel = (id: number) => {
    const p = pointsList().find((x) => x.id === id);
    return p ? formatPoint(p) : `#${id}`;
  };

  return (
    <div class="w-full max-w-4xl text-neutral-300">
      <h2 class="text-xl font-light text-neutral-100 mb-2">Media</h2>
      <p class="text-neutral-400 mb-4 text-sm md:text-base">Carica e gestisci foto e video sui punti del percorso.</p>
      {error() && (
        <p class="mb-4 text-red-400">
          {error()}
          {error() === "Sessione scaduta." && (
            <> <a href="/admin" class="underline">Accedi di nuovo</a></>
          )}
        </p>
      )}

      <button
        type="button"
        onClick={openCreate}
        class="w-full min-h-[48px] mb-6 flex items-center justify-center gap-2 rounded-xl bg-neutral-700 active:bg-neutral-600 text-neutral-100 text-base touch-manipulation md:max-w-xs md:hover:bg-neutral-600"
      >
        <MdiPlus class="h-5 w-5 shrink-0" />
        Aggiungi media
      </button>

      {showModal() && (
        <div
          class="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/70 md:p-4"
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div
            class="bg-neutral-900 border border-neutral-700 md:rounded-xl shadow-xl w-full max-h-[95dvh] md:max-h-[90vh] md:max-w-2xl overflow-hidden flex flex-col rounded-t-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div class="flex items-center justify-between shrink-0 p-4 border-b border-neutral-700">
              <h3 class="text-lg text-neutral-100">
                {editingRow() ? "Modifica" : "Aggiungi media"}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                class="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-neutral-400 active:bg-neutral-800 active:text-white touch-manipulation md:hover:bg-neutral-800 md:hover:text-white"
                aria-label="Annulla"
              >
                <MdiClose class="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} class="p-4 overflow-y-auto space-y-4 flex-1">
              <div>
                <label class="block text-sm text-neutral-400 mb-1">Punto</label>
                <select
                  required
                  value={formPointId() ?? ""}
                  onInput={(e) => setFormPointId(parseInt(e.currentTarget.value, 10) || null)}
                  class="w-full min-h-[48px] px-4 py-3 text-base rounded-xl bg-neutral-800 border border-neutral-600 text-neutral-100 touch-manipulation"
                >
                  <option value="">—</option>
                  {pointsList().map((p) => (
                    <option value={p.id}>{formatPoint(p)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label class="block text-sm text-neutral-400 mb-1">URL</label>
                <input
                  type="text"
                  value={formUrl()}
                  onInput={(e) => setFormUrl(e.currentTarget.value)}
                  class="w-full min-h-[48px] px-4 py-3 text-base rounded-xl bg-neutral-800 border border-neutral-600 text-neutral-100 mb-2 touch-manipulation"
                  placeholder="https://… oppure /media/…"
                />
                <div class="flex items-center gap-2 text-sm text-neutral-500 flex-wrap">
                  <span>oppure</span>
                  <label class="min-h-[44px] flex items-center cursor-pointer px-4 py-2.5 rounded-xl bg-neutral-700 active:bg-neutral-600 text-neutral-200 touch-manipulation md:hover:bg-neutral-600">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      class="sr-only"
                      onChange={handleFileChange}
                      disabled={uploading()}
                    />
                    {uploading() ? "…" : "Carica file"}
                  </label>
                </div>
              </div>
              <div>
                <label class="block text-sm text-neutral-400 mb-1">Titolo</label>
                <input
                  type="text"
                  value={formTitle()}
                  onInput={(e) => setFormTitle(e.currentTarget.value)}
                  class="w-full min-h-[48px] px-4 py-3 text-base rounded-xl bg-neutral-800 border border-neutral-600 text-neutral-100 touch-manipulation"
                />
              </div>
              <div>
                <label class="block text-sm text-neutral-400 mb-1">Descrizione</label>
                <textarea
                  value={formDescription()}
                  onInput={(e) => setFormDescription(e.currentTarget.value)}
                  class="w-full min-h-[120px] px-4 py-3 text-base rounded-xl bg-neutral-800 border border-neutral-600 text-neutral-100 touch-manipulation resize-y"
                />
              </div>
              <div class="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={formSubmitting()}
                  class="flex-1 min-h-[48px] px-4 py-3 text-base rounded-xl bg-neutral-700 active:bg-neutral-600 text-neutral-100 disabled:opacity-50 touch-manipulation md:hover:bg-neutral-600"
                >
                  Salva
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  class="min-h-[48px] px-4 py-3 text-base rounded-xl bg-neutral-800 text-neutral-400 active:text-neutral-200 touch-manipulation md:hover:text-neutral-200"
                >
                  Annulla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
        <label class="flex items-center gap-2 text-sm text-neutral-400">
          Per pagina
          <select
            value={pageSize()}
            onInput={(e) => {
              setPageSize(Number((e.target as HTMLSelectElement).value));
              setPage(0);
            }}
            class="min-h-[44px] rounded-xl bg-neutral-800 border border-neutral-600 text-neutral-100 px-3 py-2 text-base touch-manipulation"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </label>
        <div class="flex items-center gap-2">
          <span class="text-sm text-neutral-500">Ordina:</span>
          <select
            value={`${sort()}-${order()}`}
            onInput={(e) => {
              const v = (e.target as HTMLSelectElement).value;
              const [col, o] = v.split("-") as [SortCol, "asc" | "desc"];
              setSort(col);
              setOrder(o);
              setPage(0);
            }}
            class="min-h-[44px] rounded-xl bg-neutral-800 border border-neutral-600 text-neutral-100 px-3 py-2 text-base touch-manipulation"
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
        <span class="text-sm text-neutral-500">
          {from()}–{to()} di {total()}
        </span>
        <div class="flex gap-2">
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
      </div>

      <ul class="space-y-3 list-none p-0 m-0 pb-12 md:pb-0">
        {mediaList().map((row) => (
          <li class="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-900/50">
            <div class="flex gap-3 p-3 md:p-4">
              <div
                class="shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg bg-neutral-800 overflow-hidden flex items-center justify-center"
                aria-hidden
              >
                {thumbUrl(row) ? (
                  <img src={thumbUrl(row)!} alt="" class="w-full h-full object-cover" />
                ) : row.type === "video" ? (
                  <MdiVideo class="w-8 h-8 text-neutral-500" />
                ) : (
                  <MdiImage class="w-8 h-8 text-neutral-500" />
                )}
              </div>
              <div class="min-w-0 flex-1 flex flex-col justify-center gap-0.5">
                <span class="text-neutral-200 font-medium truncate">{row.title || "—"}</span>
                <span class="text-sm text-neutral-500 truncate">{pointLabel(row.point_id)}</span>
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
        ))}
      </ul>
      {mediaList().length === 0 && <p class="mt-6 text-neutral-500 text-base">Nessun media ancora.</p>}
    </div>
  );
}
