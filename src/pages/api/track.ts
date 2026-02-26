import type { APIRoute } from "astro";
import { jsonResponse } from "@/lib/auth";
import { getPublicTrackData } from "@/lib/geo";

export const GET: APIRoute = async () => {
  try {
    const data = await getPublicTrackData();
    return jsonResponse(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[GET /api/track]", err);
    return jsonResponse({ error: message }, 500);
  }
};
