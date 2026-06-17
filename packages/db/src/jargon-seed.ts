import { readFileSync } from "node:fs";
import path from "node:path";
import Papa from "papaparse";
import { sqlite } from "./connection";

type CsvRow = {
  jargon: string;
  short_definition: string;
  definition: string;
  easy_understanding: string;
  use_example: string;
  bad_example: string;
};

// Synchronous: called from client.ts during module init, alongside other
// schema bootstrapping. better-sqlite3 transactions are sync, so we keep
// the whole pipeline sync too — no async/await leak into the import graph.
export function seedJargonFromCsv(): void {
  const csvPath = path.resolve(
    import.meta.dirname,
    "..",
    "data",
    "jargon.csv",
  );
  const csv = readFileSync(csvPath, "utf8");
  const parsed = Papa.parse<CsvRow>(csv, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });
  if (parsed.errors.length > 0) {
    throw new Error(
      `jargon.csv parse failed: ${parsed.errors[0]?.message ?? "unknown"}`,
    );
  }

  const insert = sqlite.prepare(
    `INSERT OR IGNORE INTO jargon
       (jargon, short_definition, definition, easy_understanding, use_example, bad_example)
     VALUES (?, ?, ?, ?, ?, ?)`,
  );
  const insertMany = sqlite.transaction((rows: CsvRow[]) => {
    for (const r of rows) {
      insert.run(
        r.jargon.trim(),
        r.short_definition,
        r.definition,
        r.easy_understanding,
        r.use_example,
        r.bad_example,
      );
    }
  });
  insertMany(parsed.data);
}
