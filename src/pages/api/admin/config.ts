import type { APIRoute } from "astro";
import { checkAdmin, jsonResponse, unauthorized } from "@/lib/auth";
import { getDelayHours, isSharingEnabled, setConfig } from "@/lib/db";

export const GET: APIRoute = async ({ request }) => {
  if (!checkAdmin(request)) return unauthorized();
  const delayHours = await getDelayHours();
  const sharingEnabled = await isSharingEnabled();
  return jsonResponse({ delay_hours: delayHours, sharing_enabled: sharingEnabled });
};

export const PATCH: APIRoute = async ({ request }) => {
  if (!checkAdmin(request)) return unauthorized();
  let body: { delay_hours?: number; sharing_enabled?: boolean };
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }
  if (typeof body.delay_hours === "number" && body.delay_hours >= 0) {
    const hours = Math.min(24 * 10, Math.round(body.delay_hours));
    await setConfig("public_delay_hours", String(hours));
  }
  if (typeof body.sharing_enabled === "boolean") {
    await setConfig("sharing_enabled", body.sharing_enabled ? "1" : "0");
  }
  const delayHours = await getDelayHours();
  const sharingEnabled = await isSharingEnabled();
  return jsonResponse({ delay_hours: delayHours, sharing_enabled: sharingEnabled });
};
