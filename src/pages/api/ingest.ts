import type { APIRoute } from "astro";
import { insertPointFromIngest, type IngestPayload } from "@/lib/db";

const INGEST_HEADER = "X-Ingest-Token";

export const POST: APIRoute = async ({ request }) => {
  const expected = process.env.INGEST_TOKEN;
  if (!expected) {
    return new Response(JSON.stringify({ error: "Ingest not configured" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
  const token = request.headers.get(INGEST_HEADER);
  if (token !== expected) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (request.headers.get("Content-Type")?.toLowerCase().includes("application/json") === false) {
    return new Response(JSON.stringify({ error: "Content-Type must be application/json" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (body == null || typeof body !== "object") {
    return new Response(JSON.stringify({ error: "Body must be an object" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const payload = body as IngestPayload;
  let result: { id: number } | null;
  try {
    result = await insertPointFromIngest(payload);
  } catch (err) {
    console.error("[POST /api/ingest]", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Database error" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  if (result == null) {
    return new Response(
      JSON.stringify({ error: "Missing or invalid measurements.gps (lat and long required)" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  return new Response(JSON.stringify({ id: result.id }), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
};
