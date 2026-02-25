import type { APIRoute } from "astro";
import { checkAdmin, jsonResponse, unauthorized } from "@/lib/auth";
import { getLastSyncServerTs } from "@/lib/db";

export const GET: APIRoute = async ({ request }) => {
  if (!checkAdmin(request)) return unauthorized();
  const lastSync = await getLastSyncServerTs();
  return jsonResponse({ last_sync_server_ts: lastSync });
};
