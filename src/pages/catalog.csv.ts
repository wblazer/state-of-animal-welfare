import type { APIRoute } from "astro";
import { catalog } from "../lib/catalog";

export const prerender = true;

const fields = [
  "id",
  "name",
  "domain",
  "url",
  "category",
  "annotation",
  "topics",
  "evidence_type",
  "access",
  "reuse",
  "references",
  "review_status",
  "scope_fit",
  "link_pattern",
] as const;

function cell(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

export const GET: APIRoute = () => {
  const rows = catalog.entries.map((entry) => {
    const values = {
      ...entry,
      topics: entry.topics.join(" | "),
      references: entry.references.map((reference) => `${reference.label}: ${reference.url}`).join(" | "),
      review_status: entry.review_status ?? "",
      scope_fit: entry.scope_fit ?? "",
      link_pattern: entry.link_pattern ?? "",
    };
    return fields.map((field) => cell(String(values[field]))).join(",");
  });
  const csv = [fields.map(cell).join(","), ...rows, ""].join("\n");

  return new Response(csv, {
    headers: { "Content-Type": "text/csv; charset=utf-8" },
  });
};
