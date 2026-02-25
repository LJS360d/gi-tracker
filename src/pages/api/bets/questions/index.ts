import type { APIRoute } from "astro";
import { listBetQuestions, insertBetQuestion } from "@/lib/db";

const json = (data: object, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });

export const GET: APIRoute = async () => {
  try {
    const questions = await listBetQuestions();
    return json({ questions });
  } catch (err) {
    console.error("[GET /api/bets/questions]", err);
    return json({ error: err instanceof Error ? err.message : String(err) }, 500);
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const answerType = typeof body?.answerType === "string" ? body.answerType.trim() : "text";
    const order = typeof body?.order === "number" ? body.order : undefined;

    if (!title.length) {
      return json({ error: "title is required" }, 400);
    }
    const validTypes = ["text", "number", "boolean"];
    if (!validTypes.includes(answerType)) {
      return json({ error: "answerType must be text, number, or boolean" }, 400);
    }

    const inserted = await insertBetQuestion({ title, answerType, order });
    return json({ question: inserted }, 201);
  } catch (err) {
    console.error("[POST /api/bets/questions]", err);
    return json({ error: err instanceof Error ? err.message : String(err) }, 500);
  }
};
