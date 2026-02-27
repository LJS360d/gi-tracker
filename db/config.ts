import { defineDb, defineTable, column } from "astro:db";

const points = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    lat: column.number(),
    lng: column.number(),
    deviceTs: column.number(),
    serverTs: column.number(),
    segmentType: column.text({ default: "ground" }), // "ground" | "plane" | "boat"
    identifier: column.text({ optional: true }),
    address: column.text({ optional: true }),
    altitude: column.number({ optional: true }),
    satellites: column.number({ optional: true }),
    angle: column.number({ optional: true }),
    status: column.json({ optional: true }),
    rawAddress: column.json({ optional: true }),
    deviceParameter: column.json({ optional: true }),
    obdMeasurements: column.json({ optional: true }),
  },
  indexes: [{ on: ["deviceTs", "lat", "lng"], unique: true }],
});

const media = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    pointId: column.number({ references: () => points.columns.id }),
    type: column.text(), // "image" | "video"
    url: column.text(),
    title: column.text(),
    description: column.text(),
    createdAt: column.number({ default: 0 }),
    takenAt: column.number({ optional: true }),
    takenLat: column.number({ optional: true }),
    takenLng: column.number({ optional: true }),
  },
});

const config = defineTable({
  columns: {
    key: column.text({ primaryKey: true }),
    value: column.text(),
  },
});

const betQuestions = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    title: column.text(),
    answerType: column.text(), // "text" | "number" | "boolean"
  },
});

const betAnswers = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    questionId: column.number({ references: () => betQuestions.columns.id }),
    displayName: column.text(),
    value: column.text(),
    createdAt: column.number({ default: 0 }),
  },
});

// https://astro.build/db/config
export default defineDb({
  tables: {
    points,
    media,
    config,
    betQuestions,
    betAnswers,
  },
});
