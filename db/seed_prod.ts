import { config, db } from "astro:db";
import seedQuestions from "./seed_questions";

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
  await seedQuestions();
  console.log("Production seed complete");
}
