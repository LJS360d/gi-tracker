import { createSignal } from "solid-js";
import { adminFetchOpts, apiHeaders } from "@/lib/admin-client";
import type { MediaRow, PointOption, SortCol } from "@/components/adminMediaUtils";
import { pointOptionLabel } from "@/components/adminMediaUtils";

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

export {
  mediaList,
  setMediaList,
  points,
  setPoints,
  error,
  setError,
  showModal,
  setShowModal,
  editingRow,
  setEditingRow,
  deleteConfirmId,
  setDeleteConfirmId,
  page,
  setPage,
  pageSize,
  setPageSize,
  total,
  setTotal,
  sort,
  setSort,
  order,
  setOrder,
  formPointId,
  setFormPointId,
  formUrl,
  setFormUrl,
  formTitle,
  setFormTitle,
  formDescription,
  setFormDescription,
  formSubmitting,
  setFormSubmitting,
  uploading,
  setUploading,
};

function getNavigatorCoords(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Geolocalizzazione non supportata"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      () => reject(new Error("Impossibile ottenere la posizione")),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  });
}

export function loadMedia() {
  const limit = pageSize();
  const offset = page() * limit;
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    sort: sort(),
    order: order(),
  });
  fetch(`/api/admin/media?${params}`, {
    ...adminFetchOpts,
    headers: apiHeaders(),
  })
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

export function loadPoints() {
  fetch("/api/admin/points/downsampled", {
    ...adminFetchOpts,
    headers: apiHeaders(),
  })
    .then((r) => {
      if (r.status === 401) {
        setError("Sessione scaduta.");
        return null;
      }
      return r.json();
    })
    .then((data) => Array.isArray(data) && setPoints(data));
}

export function openCreate() {
  setEditingRow(null);
  setFormPointId(null);
  setFormUrl("");
  setFormTitle("");
  setFormDescription("");
  setFormTakenAt(null);
  setFormTakenLat(null);
  setFormTakenLng(null);
  setError(null);
  setShowModal(true);
}

export function openEdit(row: MediaRow) {
  setEditingRow(row);
  setFormPointId(row.point_id);
  setFormUrl(row.url);
  setFormTitle(row.title);
  setFormDescription(row.description);
  setError(null);
  setShowModal(true);
}

export function closeModal() {
  setShowModal(false);
  setEditingRow(null);
}

export function handleFileChange(e: Event) {
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

export async function handleSubmit(e: Event) {
  e.preventDefault();
  const url = formUrl().trim();
  if (!url) {
    setError("Aggiungi un link o carica un file");
    return;
  }
  const title = formTitle().trim();
  const description = formDescription();
  const row = editingRow();
  setFormSubmitting(true);
  setError(null);

  if (row) {
    const pointId = formPointId();
    if (pointId == null) {
      setError("Seleziona un punto");
      setFormSubmitting(false);
      return;
    }
    fetch(`/api/admin/media/${row.id}`, {
      method: "PATCH",
      ...adminFetchOpts,
      headers: apiHeaders(),
      body: JSON.stringify({
        point_id: pointId,
        url,
        title,
        description,
      }),
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
    return;
  }

  const pointId = formPointId();
  const ta = formTakenAt();
  const tlat = formTakenLat();
  const tlng = formTakenLng();
  const payload: Record<string, unknown> = {
    url,
    title,
    description,
  };
  if (ta != null) payload.taken_at = ta;
  if (tlat != null) payload.taken_lat = tlat;
  if (tlng != null) payload.taken_lng = tlng;
  if (pointId != null) {
    payload.point_id = pointId;
  } else {
    const hasExif =
      tlat != null &&
      tlng != null &&
      Number.isFinite(tlat) &&
      Number.isFinite(tlng);
    if (!hasExif) {
      try {
        const coords = await getNavigatorCoords();
        payload.taken_lat = coords.lat;
        payload.taken_lng = coords.lng;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Impossibile ottenere la posizione",
        );
        setFormSubmitting(false);
        return;
      }
    }
  }
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

export function confirmDelete(id: number) {
  setDeleteConfirmId(id);
}

export function cancelDelete() {
  setDeleteConfirmId(null);
}

export function doDelete() {
  const id = deleteConfirmId();
  if (id == null) return;
  fetch(`/api/admin/media/${id}`, {
    method: "DELETE",
    ...adminFetchOpts,
    headers: apiHeaders(),
  }).then((r) => {
    if (r.status === 204 || r.ok) {
      setDeleteConfirmId(null);
      loadMedia();
    }
  });
}

export function setPageToZero() {
  setPage(0);
}

export function hydrateFromInitial(
  media: MediaRow[],
  totalCount: number,
  pointOptions: PointOption[],
) {
  setMediaList(media);
  setTotal(totalCount);
  setPoints(pointOptions);
  setError(null);
}

export function totalPages() {
  return Math.max(1, Math.ceil(total() / pageSize()));
}

export function pointLabel(id: number) {
  const pts = points();
  const p = pts.find((x) => x.id === id);
  return p ? pointOptionLabel(p) : `#${id}`;
}
