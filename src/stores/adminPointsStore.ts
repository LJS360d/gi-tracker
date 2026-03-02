import { createSignal } from "solid-js";
import { adminFetchOpts, apiHeaders } from "@/lib/admin-client";

export type PointRow = {
  id: number;
  lat: number;
  lng: number;
  device_ts: number;
  server_ts: number;
  segment_type: string;
  identifier: string | null;
  address: string | null;
  altitude: number | null;
  satellites: number | null;
  angle: number | null;
  status: unknown;
  raw_address: unknown;
  device_parameter: unknown;
  obd_measurements: unknown;
  on_public_map: boolean;
  has_media: boolean;
  not_on_map_reason: null | "downsample" | "public_delay";
};

export type TrackPathPoint = { lat: number; lng: number; is_public: boolean };

const [pointsList, setPointsList] = createSignal<PointRow[]>([]);
const [total, setTotal] = createSignal(0);
const [trackPath, setTrackPath] = createSignal<TrackPathPoint[]>([]);
const [error, setError] = createSignal<string | null>(null);
const [page, setPage] = createSignal(0);
const [pageSize, setPageSize] = createSignal(100);
const [order, setOrder] = createSignal<"asc" | "desc">("asc");
const [showEditModal, setShowEditModal] = createSignal(false);
const [editingPoint, setEditingPoint] = createSignal<PointRow | null>(null);
const [deleteConfirmId, setDeleteConfirmId] = createSignal<number | null>(null);
const [formLat, setFormLat] = createSignal("");
const [formLng, setFormLng] = createSignal("");
const [formDeviceTs, setFormDeviceTs] = createSignal("");
const [formSegmentType, setFormSegmentType] = createSignal("ground");
const [formAddress, setFormAddress] = createSignal("");
const [formSubmitting, setFormSubmitting] = createSignal(false);
const [filterInMap, setFilterInMap] = createSignal(false);
const [filterHasMedia, setFilterHasMedia] = createSignal(false);
const [filterSearch, setFilterSearch] = createSignal("");
const [searchInput, setSearchInput] = createSignal("");

export {
  pointsList,
  setPointsList,
  total,
  setTotal,
  trackPath,
  setTrackPath,
  error,
  setError,
  page,
  setPage,
  pageSize,
  setPageSize,
  order,
  setOrder,
  showEditModal,
  setShowEditModal,
  editingPoint,
  setEditingPoint,
  deleteConfirmId,
  setDeleteConfirmId,
  formLat,
  setFormLat,
  formLng,
  setFormLng,
  formDeviceTs,
  setFormDeviceTs,
  formSegmentType,
  setFormSegmentType,
  formAddress,
  setFormAddress,
  formSubmitting,
  setFormSubmitting,
  filterInMap,
  setFilterInMap,
  filterHasMedia,
  setFilterHasMedia,
  filterSearch,
  setFilterSearch,
  searchInput,
  setSearchInput,
};

export function loadPoints() {
  const limit = pageSize();
  const offset = page() * limit;
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    order: order(),
  });
  if (filterInMap()) params.set("in_map", "true");
  if (filterHasMedia()) params.set("has_media", "true");
  if (filterSearch().trim()) params.set("search", filterSearch().trim());
  fetch(`/api/admin/points?${params}`, {
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
    .then((data) => {
      if (data?.points) {
        setPointsList(data.points);
        setTotal(data.total ?? 0);
      }
    });
}

export function loadTrack() {
  fetch("/api/admin/points/track", {
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
    .then((data) => {
      if (data?.path) setTrackPath(data.path);
    });
}

function deviceTsToDatetimeLocal(secOrMs: number): string {
  const ms = secOrMs >= 1e12 ? secOrMs : secOrMs * 1000;
  const d = new Date(ms);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day}T${h}:${min}`;
}

export function openEdit(point: PointRow) {
  setEditingPoint(point);
  setFormLat(String(point.lat));
  setFormLng(String(point.lng));
  setFormDeviceTs(deviceTsToDatetimeLocal(point.device_ts));
  setFormSegmentType(point.segment_type ?? "ground");
  setFormAddress(point.address ?? "");
  setError(null);
  setShowEditModal(true);
}

export function closeEditModal() {
  setShowEditModal(false);
  setEditingPoint(null);
}

export async function handlePointSubmit(e: Event) {
  e.preventDefault();
  const pt = editingPoint();
  if (!pt) return;
  const lat = parseFloat(formLat().trim());
  const lng = parseFloat(formLng().trim());
  const dateTimeStr = formDeviceTs().trim();
  const deviceTs = dateTimeStr ? Math.floor(new Date(dateTimeStr).getTime() / 1000) : 0;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    setError("Latitudine e longitudine devono essere numeri");
    return;
  }
  if (!dateTimeStr || !Number.isFinite(deviceTs) || deviceTs <= 0) {
    setError("Data e ora devono essere valide");
    return;
  }
  setFormSubmitting(true);
  setError(null);
  const res = await fetch(`/api/admin/points/${pt.id}`, {
    method: "PATCH",
    ...adminFetchOpts,
    headers: apiHeaders(),
    body: JSON.stringify({
      lat,
      lng,
      device_ts: deviceTs,
      segment_type: formSegmentType(),
      address: formAddress().trim() || null,
    }),
  });
  const data = await res.json().catch(() => ({}));
  setFormSubmitting(false);
  if (data.error) {
    setError(data.error);
    return;
  }
  closeEditModal();
  loadPoints();
  loadTrack();
}

export function confirmDelete(id: number) {
  setDeleteConfirmId(id);
}

export function cancelDelete() {
  setDeleteConfirmId(null);
}

export function doDeletePoint() {
  const id = deleteConfirmId();
  if (id == null) return;
  fetch(`/api/admin/points/${id}`, {
    method: "DELETE",
    ...adminFetchOpts,
    headers: apiHeaders(),
  }).then((r) => {
    if (r.status === 204 || r.ok) {
      setDeleteConfirmId(null);
      loadPoints();
      loadTrack();
    }
  });
}

export function totalPages() {
  return Math.max(1, Math.ceil(total() / pageSize()));
}

export function formatTs(secOrMs: number): string {
  const ms = secOrMs >= 1e12 ? secOrMs : secOrMs * 1000;
  return new Date(ms).toLocaleString("it-IT", {
    dateStyle: "short",
    timeStyle: "short",
  });
}
