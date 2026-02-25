import type { APIRoute } from "astro";
import { getBetAnswerCountsByQuestion, insertBetAnswer, listBetQuestions } from "@/lib/db";

export const GET: APIRoute = async ({ url }) => {
  try {
    const questionIdParam = url.searchParams.get("questionId");
    const questionId = questionIdParam ? parseInt(questionIdParam, 10) : null;
    if (questionId != null && !Number.isFinite(questionId)) {
      return new Response(JSON.stringify({ error: "Invalid questionId" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const questions = await listBetQuestions();
    const qIds = questionId != null ? [questionId] : questions.map((q) => q.id);
    const countsByQuestionId: Record<number, { value: string; count: number }[]> = {};
    for (const qid of qIds) {
      countsByQuestionId[qid] = await getBetAnswerCountsByQuestion(qid);
    }
    return new Response(JSON.stringify({ countsByQuestionId }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[GET /api/bets/answers]", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const questionId = typeof body?.questionId === "number" ? body.questionId : parseInt(body?.questionId, 10);
    const displayName = typeof body?.displayName === "string" ? body.displayName.trim() : "";
    const value = typeof body?.value === "string" ? body.value.trim() : String(body?.value ?? "");

    if (!Number.isFinite(questionId) || questionId < 1) {
      return new Response(JSON.stringify({ error: "Invalid questionId" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (displayName.length === 0 || displayName.length > 100) {
      return new Response(JSON.stringify({ error: "displayName required (max 100 chars)" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    await insertBetAnswer(questionId, displayName, value);
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[POST /api/bets/answers]", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
