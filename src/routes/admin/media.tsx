import { useStore } from "@nanostores/solid";
import { createEffect, createSignal, onCleanup } from "solid-js";
import { useI18n } from "~/i18n";
import "easymde/dist/easymde.min.css";
import { apiHeaders } from "~/lib/admin-client";
import { adminTokenStore } from "~/lib/admin-store";
import { ChevronLeftIcon, ChevronRightIcon, ImageIcon, VideoIcon, PlusIcon, XIcon } from "lucide-solid";

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
  return `#${p.id} ${d.toLocaleDateString()} ${p.lat.toFixed(2)},${p.lng.toFixed(2)}`;
}

function formatTs(sec: number | null): string {
  if (sec == null) return "—";
  return new Date(sec * 1000).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" });
}

function thumbUrl(row: MediaRow): string | null {
  if (row.type === "image" && row.url) return row.url;
  return null;
}

export default function AdminMedia() {
  const { t } = useI18n();
  const token = useStore(adminTokenStore);
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

  let mdeContainer: HTMLTextAreaElement | undefined;
  let mdeInstance: import("easymde") | null = null;

  function loadMedia() {
    const tkn = token();
    if (!tkn) return;
    const limit = pageSize();
    const offset = page() * limit;
    const params = new URLSearchParams({ limit: String(limit), offset: String(offset), sort: sort(), order: order() });
    fetch(`/api/admin/media?${params}`, { headers: apiHeaders(tkn) })
      .then(r => {
        if (r.status === 401) return null;
        const totalHeader = r.headers.get("X-Total-Count");
        if (totalHeader != null) setTotal(parseInt(totalHeader, 10) || 0);
        return r.json();
      })
      .then(data => Array.isArray(data) && setMediaList(data));
  }

  function loadPoints() {
    const tkn = token();
    if (!tkn) return;
    fetch("/api/admin/points?limit=300", { headers: apiHeaders(tkn) })
      .then(r => r.json())
      .then(data => Array.isArray(data) && setPoints(data));
  }

  createEffect(() => {
    if (!token()) return;
    loadPoints();
  });
  createEffect(() => {
    if (!token()) return;
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

  createEffect(() => {
    if (!showModal() || !mdeContainer) return;
    const initial = formDescription();
    import("easymde").then(({ default: EasyMDE }) => {
      if (!showModal() || !mdeContainer) return;
      mdeInstance = new EasyMDE({
        element: mdeContainer,
        initialValue: initial ?? "",
        spellChecker: false,
        status: false,
        toolbar: ["bold", "italic", "heading", "|", "quote", "unordered-list", "ordered-list", "|", "link", "preview"]
      });
    });
    onCleanup(() => {
      if (mdeInstance) {
        mdeInstance.toTextArea();
        mdeInstance = null;
      }
    });
  });

  function handleFileChange(e: Event) {
    const input = e.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !token()) return;
    setUploading(true);
    setError(null);
    const fd = new FormData();
    fd.set("file", file);
    fetch("/api/admin/media/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${token()}` },
      body: fd
    })
      .then(r => r.json())
      .then(data => {
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
    const tkn = token();
    const pointId = formPointId();
    if (!tkn || pointId == null) {
      setError("Select a point");
      return;
    }
    const url = formUrl().trim();
    if (!url) {
      setError("Add a link or upload a file");
      return;
    }
    const title = formTitle().trim();
    const description = mdeInstance?.value() ?? formDescription();
    setFormSubmitting(true);
    setError(null);
    const row = editingRow();
    if (row) {
      fetch(`/api/admin/media/${row.id}`, {
        method: "PATCH",
        headers: apiHeaders(tkn),
        body: JSON.stringify({ point_id: pointId, url, title, description })
      })
        .then(r => r.json())
        .then(data => {
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
        headers: apiHeaders(tkn),
        body: JSON.stringify(payload)
      })
        .then(r => r.json())
        .then(data => {
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
    const tkn = token();
    if (id == null || !tkn) return;
    fetch(`/api/admin/media/${id}`, { method: "DELETE", headers: apiHeaders(tkn) }).then(r => {
      if (r.status === 204 || r.ok) {
        setDeleteConfirmId(null);
        loadMedia();
      }
    });
  }

  const totalPages = () => Math.max(1, Math.ceil(total() / pageSize()));
  const from = () => (total() === 0 ? 0 : page() * pageSize() + 1);
  const to = () => Math.min((page() + 1) * pageSize(), total());

  if (!token()) {
    return (
      <div class="w-full max-w-xl text-neutral-300">
        <h2 class="text-xl font-light text-neutral-100 mb-4">{t("admin.media")}</h2>
        <p class="text-neutral-400">{t("admin.mediaIntro")}</p>
        <p class="mt-4 text-base text-neutral-500">Log in from Config to manage media.</p>
      </div>
    );
  }

  const pointsList = () => points();
  const pointLabel = (id: number) => {
    const p = pointsList().find(x => x.id === id);
    return p ? formatPoint(p) : `#${id}`;
  };

  return (
    <div class="w-full max-w-4xl text-neutral-300">
      <h2 class="text-xl font-light text-neutral-100 mb-2">{t("admin.media")}</h2>
      <p class="text-neutral-400 mb-4 text-sm md:text-base">{t("admin.mediaIntro")}</p>
      {error() && <p class="mb-4 text-red-400">{error()}</p>}

      <button
        type="button"
        onClick={openCreate}
        class="w-full min-h-[48px] mb-6 flex items-center justify-center gap-2 rounded-xl bg-neutral-700 active:bg-neutral-600 text-neutral-100 text-base touch-manipulation md:max-w-xs md:hover:bg-neutral-600"
      >
        <PlusIcon class="h-5 w-5 shrink-0" />
        {t("admin.addMedia")}
      </button>

      {showModal() && (
        <div
          class="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/70 md:p-4"
          role="dialog"
          aria-modal="true"
          onClick={e => e.target === e.currentTarget && closeModal()}
        >
          <div
            class="bg-neutral-900 border border-neutral-700 md:rounded-xl shadow-xl w-full max-h-[95dvh] md:max-h-[90vh] md:max-w-2xl overflow-hidden flex flex-col rounded-t-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div class="flex items-center justify-between shrink-0 p-4 border-b border-neutral-700">
              <h3 class="text-lg text-neutral-100">
                {editingRow() ? t("admin.editMedia") : t("admin.addMedia")}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                class="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-neutral-400 active:bg-neutral-800 active:text-white touch-manipulation md:hover:bg-neutral-800 md:hover:text-white"
                aria-label={t("admin.cancel")}
              >
                <XIcon class="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} class="p-4 overflow-y-auto space-y-4 flex-1">
              <div>
                <label class="block text-sm text-neutral-400 mb-1">{t("admin.point")}</label>
                <select
                  required
                  value={formPointId() ?? ""}
                  onInput={e => setFormPointId(parseInt(e.currentTarget.value, 10) || null)}
                  class="w-full min-h-[48px] px-4 py-3 text-base rounded-xl bg-neutral-800 border border-neutral-600 text-neutral-100 touch-manipulation"
                >
                  <option value="">—</option>
                  {pointsList().map(p => (
                    <option value={p.id}>{formatPoint(p)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label class="block text-sm text-neutral-400 mb-1">{t("admin.url")}</label>
                <input
                  type="text"
                  value={formUrl()}
                  onInput={e => setFormUrl(e.currentTarget.value)}
                  class="w-full min-h-[48px] px-4 py-3 text-base rounded-xl bg-neutral-800 border border-neutral-600 text-neutral-100 mb-2 touch-manipulation"
                  placeholder="https://… or /media/…"
                />
                <div class="flex items-center gap-2 text-sm text-neutral-500 flex-wrap">
                  <span>{t("admin.or")}</span>
                  <label class="min-h-[44px] flex items-center cursor-pointer px-4 py-2.5 rounded-xl bg-neutral-700 active:bg-neutral-600 text-neutral-200 touch-manipulation md:hover:bg-neutral-600">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      class="sr-only"
                      onChange={handleFileChange}
                      disabled={uploading()}
                    />
                    {uploading() ? "…" : t("admin.uploadFile")}
                  </label>
                </div>
              </div>
              <div>
                <label class="block text-sm text-neutral-400 mb-1">{t("admin.title")}</label>
                <input
                  type="text"
                  value={formTitle()}
                  onInput={e => setFormTitle(e.currentTarget.value)}
                  class="w-full min-h-[48px] px-4 py-3 text-base rounded-xl bg-neutral-800 border border-neutral-600 text-neutral-100 touch-manipulation"
                />
              </div>
              <div>
                <label class="block text-sm text-neutral-400 mb-1">{t("admin.description")}</label>
                <textarea ref={el => (mdeContainer = el)} class="hidden" />
              </div>
              <div class="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={formSubmitting()}
                  class="flex-1 min-h-[48px] px-4 py-3 text-base rounded-xl bg-neutral-700 active:bg-neutral-600 text-neutral-100 disabled:opacity-50 touch-manipulation md:hover:bg-neutral-600"
                >
                  {t("admin.save")}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  class="min-h-[48px] px-4 py-3 text-base rounded-xl bg-neutral-800 text-neutral-400 active:text-neutral-200 touch-manipulation md:hover:text-neutral-200"
                >
                  {t("admin.cancel")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
        <label class="flex items-center gap-2 text-sm text-neutral-400">
          {t("admin.pageSize")}
          <select
            value={pageSize()}
            onInput={e => {
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
          <span class="text-sm text-neutral-500">Sort:</span>
          <select
            value={`${sort()}-${order()}`}
            onInput={e => {
              const v = (e.target as HTMLSelectElement).value;
              const [col, o] = v.split("-") as [SortCol, "asc" | "desc"];
              setSort(col);
              setOrder(o);
              setPage(0);
            }}
            class="min-h-[44px] rounded-xl bg-neutral-800 border border-neutral-600 text-neutral-100 px-3 py-2 text-base touch-manipulation"
          >
            <option value="created_at-desc">{t("admin.created")} ↓</option>
            <option value="created_at-asc">{t("admin.created")} ↑</option>
            <option value="taken_at-desc">{t("admin.taken")} ↓</option>
            <option value="taken_at-asc">{t("admin.taken")} ↑</option>
            <option value="title-asc">{t("admin.title")} ↑</option>
            <option value="title-desc">{t("admin.title")} ↓</option>
            <option value="id-desc">ID ↓</option>
            <option value="id-asc">ID ↑</option>
          </select>
        </div>
        <span class="text-sm text-neutral-500">
          {from()}–{to()} {t("admin.of")} {total()}
        </span>
        <div class="flex gap-2">
          <button
            type="button"
            disabled={page() <= 0}
            onClick={() => setPage(p => Math.max(0, p - 1))}
            class="min-h-[44px] px-4 py-2.5 rounded-xl bg-neutral-700 text-neutral-200 text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 touch-manipulation active:bg-neutral-600 md:hover:bg-neutral-600"
          >
            <ChevronLeftIcon class="w-5 h-5" />
            {t("admin.prev")}
          </button>
          <button
            type="button"
            disabled={page() >= totalPages() - 1}
            onClick={() => setPage(p => Math.min(totalPages() - 1, p + 1))}
            class="min-h-[44px] px-4 py-2.5 rounded-xl bg-neutral-700 text-neutral-200 text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 touch-manipulation active:bg-neutral-600 md:hover:bg-neutral-600"
          >
            {t("admin.next")}
            <ChevronRightIcon class="w-5 h-5" />
          </button>
        </div>
      </div>

      <ul class="space-y-3 list-none p-0 m-0">
        {mediaList().map(row => (
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
                ) : (
                  row.type === "video" ? (
                    <VideoIcon class="w-8 h-8 text-neutral-500" />
                  ) : (
                    <ImageIcon class="w-8 h-8 text-neutral-500" />
                  )
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
                      {t("admin.delete")}
                    </button>
                    <button
                      type="button"
                      onClick={cancelDelete}
                      class="min-h-[40px] px-3 py-2 text-neutral-500 text-sm touch-manipulation"
                    >
                      {t("admin.cancel")}
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => openEdit(row)}
                      class="min-h-[40px] px-3 py-2 rounded-lg bg-neutral-700 text-neutral-200 text-sm touch-manipulation active:bg-neutral-600 md:hover:bg-neutral-600"
                    >
                      {t("admin.editMedia")}
                    </button>
                    <button
                      type="button"
                      onClick={() => confirmDelete(row.id)}
                      class="min-h-[40px] px-3 py-2 rounded-lg text-neutral-500 text-sm touch-manipulation active:text-red-400 md:hover:text-red-400"
                    >
                      {t("admin.delete")}
                    </button>
                  </>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
      {mediaList().length === 0 && <p class="mt-6 text-neutral-500 text-base">No media yet.</p>}
    </div>
  );
}
