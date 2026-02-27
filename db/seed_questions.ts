import { betQuestions, db } from "astro:db";

export default async function seedQuestions() {
 const questionsToInsert = [
  { title: "Dove fora la prima volta?", answerType: "text" },
  { title: "Dove prende il cagotto la prima volta?", answerType: "text" },
  { title: "Se e dove l'arrestano?", answerType: "text" },
  { title: "Dove ferma il viaggio?", answerType: "text" },
  { title: "Animale più grosso che incontra", answerType: "text" },
  { title: "Dove accetterà sostanze stupefacenti per la prima volta?", answerType: "text" },
  { title: "Dove gli rubano la bicicletta?", answerType: "text" },
  { title: "Torna?", answerType: "boolean" },
  { title: "Torna con famiglia?", answerType: "boolean" },
  { title: "Quanto dura il viaggio? (numero di giorni)", answerType: "number" },
 ];
 for (const q of questionsToInsert) {
  await db.insert(betQuestions).values(q).onConflictDoUpdate({
   target: betQuestions.id,
   set: { title: q.title, answerType: q.answerType },
  });
 }
 console.log(`Seeded: ${questionsToInsert.length} betQuestions.`);
}