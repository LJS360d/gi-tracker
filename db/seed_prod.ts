import { db, config, betQuestions } from "astro:db";

export default async function seedProd() {
  for (const row of [
    { key: "sharing_enabled", value: "1" },
    { key: "public_delay_hours", value: "168" },
  ]) {
    await db.insert(config).values(row).onConflictDoUpdate({
      target: config.key,
      set: { value: row.value },
    });
  }

  const questionsToInsert = [
    { id: 1, title: "Dove fora la prima volta?", answerType: "text", order: 1 },
    { id: 5, title: "Dove prende il cagotto la prima volta?", answerType: "text", order: 5 },
    { id: 3, title: "Se e dove l'arrestano?", answerType: "text", order: 3 },
    { id: 2, title: "Dove ferma il viaggio?", answerType: "text", order: 2 },
    { id: 4, title: "Animale più grosso che incontra", answerType: "text", order: 4 },
    { id: 6, title: "Dove accetterà sostanze stupefacenti per la prima volta?", answerType: "text", order: 6 },
    { id: 7, title: "Dove gli rubano la bicicletta?", answerType: "text", order: 7 },
    { id: 8, title: "Torna?", answerType: "boolean", order: 8 },
    { id: 9, title: "Quanto dura il viaggio? (numero di giorni)", answerType: "number", order: 9 },
  ];
  for (const q of questionsToInsert) {
    await db.insert(betQuestions).values(q).onConflictDoUpdate({
      target: betQuestions.id,
      set: { title: q.title, answerType: q.answerType, order: q.order },
    });
  }

  console.log("Production seed complete: config and bet questions.");
}
