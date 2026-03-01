import type { APIRoute } from "astro";
import { join } from "node:path";
import { readFileSync, existsSync } from "node:fs";

const MEDIA_DIR = process.env.UPLOAD_DIR ?? join(process.cwd(), "public", "media");

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
};

export const GET: APIRoute = ({ params }) => {
  const filePath = params.path;
  if (!filePath || filePath.includes("..")) {
    return new Response("Not found", { status: 404 });
  }

  const fullPath = join(MEDIA_DIR, filePath);
  if (!existsSync(fullPath)) {
    return new Response("Not found", { status: 404 });
  }

  const ext = filePath.substring(filePath.lastIndexOf(".")).toLowerCase();
  const contentType = MIME_TYPES[ext] ?? "application/octet-stream";

  const data = readFileSync(fullPath);
  return new Response(data, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400",
    },
  });
};
