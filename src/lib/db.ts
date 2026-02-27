import {
  asc,
  betAnswers,
  betQuestions,
  config,
  db,
  desc,
  eq,
  inArray,
  lt,
  media,
  points,
  sql,
} from "astro:db";

export type MediaSortColumn = "id" | "created_at" | "taken_at" | "title";
export type ListMediaFilters = {
  point_id?: number;
  limit?: number;
  offset?: number;
  sort?: MediaSortColumn;
  order?: "asc" | "desc";
};

// CONFIG HELPERS
export async function getDelayHours(): Promise<number> {
  const [row] = await db
    .select()
    .from(config)
    .where(eq(config.key, "public_delay_hours"));
  const n = row ? parseInt(row.value, 10) : 48;
  return Number.isFinite(n) ? n : 48;
}

export async function isSharingEnabled(): Promise<boolean> {
  const [row] = await db
    .select()
    .from(config)
    .where(eq(config.key, "sharing_enabled"));
  return row?.value === "1";
}

export async function setConfig(key: string, value: string) {
  // Astro DB uses upsert via onConflictDoUpdate
  await db.insert(config).values({ key, value }).onConflictDoUpdate({
    target: config.key,
    set: { value },
  });
}

// POINT HELPERS
export async function getLastSyncServerTs(): Promise<number | null> {
  const [row] = await db
    .select({ serverTs: points.serverTs })
    .from(points)
    .orderBy(desc(points.serverTs))
    .limit(1);
  return row?.serverTs ?? null;
}

export async function listPointsBeforeCutoff(cutoff: number) {
  return await db
    .select({
      id: points.id,
      lat: points.lat,
      lng: points.lng,
      deviceTs: points.deviceTs,
      segmentType: points.segmentType,
      address: points.address,
      rawAddress: points.rawAddress,
    })
    .from(points)
    .where(lt(points.deviceTs, cutoff))
    .orderBy(asc(points.deviceTs));
}

export async function getMediaByPointIds(pointIds: number[]) {
  if (pointIds.length === 0) return [];
  return await db
    .select({
      pointId: media.pointId,
      type: media.type,
      url: media.url,
      title: media.title,
      description: media.description,
    })
    .from(media)
    .where(inArray(media.pointId, pointIds));
}

// MEDIA LISTING & COUNTING
export async function countMedia(
  filters: Omit<ListMediaFilters, "limit" | "offset" | "sort" | "order"> = {},
) {
  let query = db
    .select({ count: sql<number>`count(*)` })
    .from(media)
    .$dynamic();
  if (filters.point_id != null)
    query = query.where(eq(media.pointId, filters.point_id));

  const [row] = await query;
  return Number(row?.count ?? 0);
}

export async function listMedia(filters: ListMediaFilters = {}) {
  const {
    point_id,
    limit = 100,
    offset = 0,
    sort = "created_at",
    order = "desc",
  } = filters;

  let query = db.select().from(media).$dynamic();

  if (point_id != null) query = query.where(eq(media.pointId, point_id));

  const orderByCol =
    sort === "id"
      ? media.id
      : sort === "title"
        ? media.title
        : sort === "taken_at"
          ? media.takenAt
          : media.createdAt;

  const ordered =
    order === "asc"
      ? query.orderBy(asc(orderByCol))
      : query.orderBy(desc(orderByCol));
  return await ordered.limit(limit).offset(offset);
}

// MUTATIONS
export async function insertMedia(row: any) {
  const createdAt = row.createdAt ?? Math.floor(Date.now() / 1000);
  const [inserted] = await db
    .insert(media)
    .values({
      pointId: row.pointId,
      type: row.type,
      url: row.url,
      title: row.title,
      description: row.description,
      createdAt,
      takenAt: row.takenAt ?? null,
      takenLat: row.takenLat ?? null,
      takenLng: row.takenLng ?? null,
    })
    .returning();
  return inserted;
}

export async function deleteMedia(id: number): Promise<boolean> {
  const result = await db.delete(media).where(eq(media.id, id));
  return !!result.rowsAffected;
}

export async function getMediaById(id: number) {
  const [row] = await db.select().from(media).where(eq(media.id, id));
  return row ?? null;
}

export async function listMediaWithPoints(filters: ListMediaFilters = {}) {
  const rows = await listMedia(filters);
  if (rows.length === 0) return [];
  const pointIds = [...new Set(rows.map((r) => r.pointId))];
  const pointRows = await db
    .select({ id: points.id, deviceTs: points.deviceTs, lat: points.lat, lng: points.lng })
    .from(points)
    .where(inArray(points.id, pointIds));
  const byId = Object.fromEntries(pointRows.map((p) => [p.id, p]));
  return rows.map((r) => {
    const p = byId[r.pointId];
    return {
      ...r,
      point_device_ts: p?.deviceTs ?? null,
      point_lat: p?.lat ?? null,
      point_lng: p?.lng ?? null,
    };
  });
}

export async function listPointsForAdmin(limit = 200) {
  return await db
    .select({ id: points.id, deviceTs: points.deviceTs, lat: points.lat, lng: points.lng })
    .from(points)
    .orderBy(desc(points.deviceTs))
    .limit(limit);
}

export async function listAllPointsForDownsampling(limit = 10000) {
  return await db
    .select({
      id: points.id,
      deviceTs: points.deviceTs,
      lat: points.lat,
      lng: points.lng,
      address: points.address,
      rawAddress: points.rawAddress,
    })
    .from(points)
    .orderBy(asc(points.deviceTs))
    .limit(limit);
}

export async function getPointById(id: number) {
  const [row] = await db.select().from(points).where(eq(points.id, id));
  return row ?? null;
}

export async function insertPointFromCoords(
  lat: number,
  lng: number,
  deviceTs?: number,
): Promise<{ id: number } | null> {
  const now = Math.floor(Date.now() / 1000);
  const row = {
    lat,
    lng,
    deviceTs: deviceTs ?? now,
    serverTs: now,
    segmentType: "ground",
  };
  const [inserted] = await db.insert(points).values(row).returning();
  return inserted ? { id: inserted.id } : null;
}

export type IngestPayload = {
  identifier?: string;
  device_parameter?: Record<string, unknown>;
  address?: string;
  obd_measurements?: Record<string, unknown>;
  timestamp?: { $date?: string };
  status?: string[];
  measurements?: {
    satellites?: { $numberLong?: string };
    altitude?: number;
    angle?: number;
    gps?: { lat?: number; long?: number };
  };
  raw_address?: Record<string, unknown>;
};

function parseIngestTimestamp(payload: IngestPayload): number {
  const raw = payload.timestamp?.$date;
  if (!raw) return Math.floor(Date.now() / 1000);
  const ms = Date.parse(raw);
  return Number.isFinite(ms) ? Math.floor(ms / 1000) : Math.floor(Date.now() / 1000);
}

export async function insertPointFromIngest(payload: IngestPayload): Promise<{ id: number } | null> {
  const gps = payload.measurements?.gps;
  const lat = gps?.lat;
  const lng = gps?.long;
  if (typeof lat !== "number" || typeof lng !== "number") return null;

  const deviceTs = parseIngestTimestamp(payload);
  const serverTs = Math.floor(Date.now() / 1000);
  const satellites =
    payload.measurements?.satellites?.$numberLong != null
      ? parseInt(String(payload.measurements.satellites.$numberLong), 10)
      : payload.measurements?.satellites;

  const row = {
    lat,
    lng,
    deviceTs,
    serverTs,
    segmentType: "ground",
    identifier: payload.identifier ?? null,
    address: payload.address ?? null,
    altitude: payload.measurements?.altitude ?? null,
    satellites: Number.isFinite(satellites) ? (satellites as number) : null,
    angle: payload.measurements?.angle ?? null,
    status: payload.status ?? null,
    rawAddress: payload.raw_address ?? null,
    deviceParameter: payload.device_parameter ?? null,
    obdMeasurements: payload.obd_measurements ?? null,
  };
  const [inserted] = await db.insert(points).values(row).returning();
  return inserted ? { id: inserted.id } : null;
}

export async function updateMedia(
  id: number,
  updates: {
    title?: string;
    description?: string;
    point_id?: number;
    url?: string;
    taken_at?: number | null;
    taken_lat?: number | null;
    taken_lng?: number | null;
  },
) {
  const v: Record<string, unknown> = {};
  if (updates.title !== undefined) v.title = updates.title;
  if (updates.description !== undefined) v.description = updates.description;
  if (updates.point_id !== undefined) v.pointId = updates.point_id;
  if (updates.url !== undefined) v.url = updates.url;
  if (updates.taken_at !== undefined) v.takenAt = updates.taken_at;
  if (updates.taken_lat !== undefined) v.takenLat = updates.taken_lat;
  if (updates.taken_lng !== undefined) v.takenLng = updates.taken_lng;
  if (Object.keys(v).length === 0) {
    return getMediaById(id);
  }
  const result = await db
    .update(media)
    .set(v as Record<string, string | number | null>)
    .where(eq(media.id, id))
    .returning();
  const row = result[0] ?? null;
  return row;
}

export async function listBetQuestions() {
  return await db
    .select()
    .from(betQuestions)
    .orderBy(asc(betQuestions.id));
}

export async function getBetAnswerCountsByQuestion(questionId: number): Promise<{ value: string; count: number }[]> {
  const rows = await db
    .select({ value: betAnswers.value })
    .from(betAnswers)
    .where(eq(betAnswers.questionId, questionId));
  const counts = new Map<string, number>();
  for (const r of rows) {
    const v = r.value ?? "";
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count);
}

export async function insertBetAnswer(questionId: number, displayName: string, value: string) {
  const createdAt = Math.floor(Date.now() / 1000);
  const [inserted] = await db
    .insert(betAnswers)
    .values({ questionId, displayName, value, createdAt })
    .returning();
  return inserted;
}

async function getMaxBetQuestionId(): Promise<number> {
  const [row] = await db
    .select({ id: betQuestions.id })
    .from(betQuestions)
    .orderBy(desc(betQuestions.id))
    .limit(1);
  return row?.id ?? 0;
}

export async function insertBetQuestion(payload: { title: string; answerType: string; order?: number }) {
  const id = (await getMaxBetQuestionId()) + 1;
  const [inserted] = await db
    .insert(betQuestions)
    .values({ id, title: payload.title, answerType: payload.answerType })
    .returning();
  return inserted;
}

export async function updateBetQuestion(
  id: number,
  updates: { title?: string; answerType?: string; order?: number },
) {
  const v: Record<string, string | number> = {};
  if (updates.title !== undefined) v.title = updates.title;
  if (updates.answerType !== undefined) v.answerType = updates.answerType;
  if (updates.order !== undefined) v.order = updates.order;
  if (Object.keys(v).length === 0) return getBetQuestionById(id);
  const [row] = await db
    .update(betQuestions)
    .set(v)
    .where(eq(betQuestions.id, id))
    .returning();
  return row ?? null;
}

export async function getBetQuestionById(id: number) {
  const [row] = await db.select().from(betQuestions).where(eq(betQuestions.id, id));
  return row ?? null;
}

export async function deleteBetQuestion(id: number): Promise<boolean> {
  await db.delete(betAnswers).where(eq(betAnswers.questionId, id));
  const result = await db.delete(betQuestions).where(eq(betQuestions.id, id));
  return !!result.rowsAffected;
}
