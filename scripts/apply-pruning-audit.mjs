import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const auditDirectory = path.join(projectRoot, "research/pruning-audit-batches");
const catalogPath = path.join(projectRoot, "src/data/catalog.json");
const recommendations = new Set(["KEEP", "KEEP-PAGES", "VERIFY", "REMOVE"]);

function auditRows(markdown, filename) {
  return markdown.split("\n").flatMap((line, index) => {
    if (!line.startsWith("| ") || line.startsWith("| ID ") || line.startsWith("| ---")) return [];
    const cells = line
      .slice(1, -1)
      .split("|")
      .map((cell) => cell.trim());
    if (cells.length !== 9) throw new Error(`${filename}:${index + 1} must contain nine table columns`);
    const [id, , , , , , , recommendation] = cells;
    if (!id || !recommendations.has(recommendation)) {
      throw new Error(`${filename}:${index + 1} has an invalid ID or recommendation`);
    }
    return [{ id, recommendation }];
  });
}

const auditFiles = (await readdir(auditDirectory)).filter((filename) => filename.endsWith(".md")).sort();
const rows = (
  await Promise.all(
    auditFiles.map(async (filename) =>
      auditRows(await readFile(path.join(auditDirectory, filename), "utf8"), filename),
    ),
  )
).flat();
const decisions = new Map();
for (const row of rows) {
  if (decisions.has(row.id)) throw new Error(`Duplicate audit decision for ${row.id}`);
  decisions.set(row.id, row.recommendation);
}

const catalog = JSON.parse(await readFile(catalogPath, "utf8"));
const unreviewed = catalog.entries.filter((entry) => !decisions.has(entry.id));
if (unreviewed.length > 0) {
  throw new Error(`Catalog entries missing from the pruning audit: ${unreviewed.map((entry) => entry.id).join(", ")}`);
}

const removed = catalog.entries.filter((entry) => decisions.get(entry.id) === "REMOVE");
const entries = catalog.entries.filter((entry) => decisions.get(entry.id) !== "REMOVE");
const populatedCategories = new Set(entries.map((entry) => entry.category));
const categories = catalog.categories.filter((category) => populatedCategories.has(category.id));
const removedCategories = catalog.categories.filter((category) => !populatedCategories.has(category.id));

if (process.argv.includes("--check")) {
  console.log(
    `Audit covers all ${catalog.entries.length} current sources; ${removed.length} source${removed.length === 1 ? "" : "s"} and ${removedCategories.length} categor${removedCategories.length === 1 ? "y" : "ies"} would be removed.`,
  );
} else if (removed.length === 0 && removedCategories.length === 0) {
  console.log(`Catalog already reflects the pruning audit: ${entries.length} sources remain.`);
} else {
  const prunedCatalog = {
    ...catalog,
    updated: new Date().toISOString().slice(0, 10),
    categories,
    entries,
  };
  await writeFile(catalogPath, `${JSON.stringify(prunedCatalog, null, 2)}\n`);
  console.log(
    `Removed ${removed.length} source${removed.length === 1 ? "" : "s"} and ${removedCategories.length} empty categor${removedCategories.length === 1 ? "y" : "ies"}; ${entries.length} sources remain.`,
  );
}
