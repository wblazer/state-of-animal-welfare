import type { APIRoute } from "astro";
import { catalog, entriesFor } from "../lib/catalog";

export const prerender = true;

export const GET: APIRoute = () => {
  const lines = [`# ${catalog.name}`, "", `> ${catalog.description}`, ""];

  for (const category of catalog.categories) {
    lines.push(`## ${category.title}`, "", category.description, "");
    for (const entry of entriesFor(category.id)) {
      lines.push(`- [${entry.name}](${entry.url}): ${entry.annotation}`);
      for (const reference of entry.references) {
        lines.push(`  - [${reference.label}](${reference.url})`);
      }
    }
    lines.push("");
  }

  lines.push(
    "## License",
    "",
    "Original annotations and site prose: CC BY 4.0. Catalog metadata: CC0 1.0. Linked works remain under their source terms.",
    "",
  );

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
