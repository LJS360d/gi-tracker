import type { APIRoute } from "astro";
import { checkAdmin, jsonResponse, unauthorized } from "@/lib/auth";
import { getDownsampledPointOptions } from "@/lib/admin-data";

export const GET: APIRoute = async ({ request }) => {
  if (!checkAdmin(request)) return unauthorized();
  const list = await getDownsampledPointOptions();
  return jsonResponse(list);
};
