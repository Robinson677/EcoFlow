import { readFileSync } from "node:fs";
import pg from "pg";

const file = process.argv[2];
const url = process.env.DATABASE_URL;

if (!file) {
  console.error("Uso: node apply-sql.mjs <archivo.sql>");
  process.exit(1);
}
if (!url) {
  console.error("Falta la variable DATABASE_URL en esta terminal.");
  process.exit(1);
}

const sql = readFileSync(file, "utf8").replace(/^\uFEFF/, "");
const client = new pg.Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  await client.query("begin");
  await client.query(sql);
  await client.query("commit");
  console.log(`OK: ${file} aplicado correctamente.`);
} catch (err) {
  try {
    await client.query("rollback");
  } catch {}
  console.error("ERROR:", err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
