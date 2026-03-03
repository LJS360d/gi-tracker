import { config, db, media, points } from "astro:db";
import seedQuestions from "./seed_questions";
import { getSeedPoints } from "./seed_points";

export default async function seed() {
  const now = Date.now();
  const allPointsToInsert = getSeedPoints(now);
  await db.insert(points).values(allPointsToInsert);

  await db.insert(config).values([
    { key: "sharing_enabled", value: "1" },
    { key: "public_delay_hours", value: "168" },
  ]);

  const insertedPoints = await db
    .select()
    .from(points)
    .orderBy(points.deviceTs);
  const n = insertedPoints.length;

  if (n === 0) return;

  const mediaTemplates = [
    { type: "image", url: "https://www.hastega.it/wp-content/uploads/2024/09/Gianni-Brancoli-sito.png", title: "Pelato", description: "Il più **PELATO**" },
    { type: "video", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", title: "Embed YT", description: "" },
    { type: "video", url: "https://cdn.discordapp.com/attachments/794730472395112491/1332077275184893955/2025-01-23_20-56-21.mp4?ex=69a14ee3&is=699ffd63&hm=4b9748f5851a1d3cf1f4b82947c4cc1149625cae49320f226464171147130714&", title: "Link video diretto", description: "" },
    { type: "image", url: "https://www.arteemusei.com/upload/blog/1750409082_TorrediPisa.jpg", title: "", description: "Conticelli domain expansion" },
  ];

  const mediaToInsert: any[] = [];
  const createdAt = Math.floor(Date.now() / 1000);

  const clusterPoints = [
    { index: 0, count: 3 },
    { index: 3, count: 1 },
  ];
  let templateIdx = 0;
  for (const { index, count } of clusterPoints) {
    const pointId = insertedPoints[Math.min(index, n - 1)].id;
    for (let k = 0; k < count; k++) {
      const template = mediaTemplates[templateIdx % mediaTemplates.length];
      templateIdx++;
      mediaToInsert.push({
        pointId,
        type: template.type,
        url: (template.url as string)
          .replace("photo-1", `photo-${(templateIdx % 20) + 1}`)
          .replace("clip-1", `clip-${(templateIdx % 10) + 1}`),
        title: `${(template as { title: string }).title} — ${k + 1}/${count}`,
        description: (template as { description: string }).description,
        createdAt,
      });
    }
  }

  const singleStep = Math.max(1, Math.floor(n / 4));
  for (let idx = 0; idx < n; idx += singleStep) {
    if (idx >= n) break;
    const template = mediaTemplates[templateIdx % mediaTemplates.length];
    templateIdx++;
    mediaToInsert.push({
      pointId: insertedPoints[idx].id,
      type: template.type,
      url: (template.url as string)
        .replace("photo-1", `photo-${(templateIdx % 20) + 1}`)
        .replace("clip-1", `clip-${(templateIdx % 10) + 1}`),
      title: (template as { title: string }).title,
      description: (template as { description: string }).description,
      createdAt,
    });
  }

  await db.insert(media).values(mediaToInsert);
  await seedQuestions();
  console.log(`Seed complete: ${allPointsToInsert.length} points, ${mediaToInsert.length} media`);
}
