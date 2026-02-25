import type { APIRoute } from "astro";
import { getBetQuestionById, updateBetQuestion, deleteBetQuestion } from "@/lib/db";

const json = (data: object, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });

function parseId(id: string | undefined): number | null {
  if (id == null) return null;
  const n = parseInt(id, 10);
  return Number.isFinite(n) ? n : null;
}

export const PATCH: APIRoute = async ({ params, request }) => {
  const id = parseId(params.id);
  if (id == null) return json({ error: "Invalid id" }, 400);

  const existing = await getBetQuestionById(id);
  if (!existing) return json({ error: "Question not found" }, 404);

  try {
    const body = await request.json();
    const updates: { title?: string; answerType?: string; order?: number } = {};
    if (typeof body?.title === "string") updates.title = body.title.trim();
    if (typeof body?.answerType === "string") {
      const answerType = body.answerType.trim();
      if (["text", "number", "boolean"].includes(answerType)) updates.answerType = answerType;
    }
    if (typeof body?.order === "number") updates.order = body.order;

    const updated = await updateBetQuestion(id, updates);
    return json({ question: updated });
  } catch (err) {
    console.error("[PATCH /api/bets/questions/:id]", err);
    return json({ error: err instanceof Error ? err.message : String(err) }, 500);
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  const id = parseId(params.id);
  if (id == null) return json({ error: "Invalid id" }, 400);

  const existing = await getBetQuestionById(id);
  if (!existing) return json({ error: "Question not found" }, 404);

  try {
    await deleteBetQuestion(id);
    return json({ ok: true }, 200);
  } catch (err) {
    console.error("[DELETE /api/bets/questions/:id]", err);
    return json({ error: err instanceof Error ? err.message : String(err) }, 500);
  }
};
