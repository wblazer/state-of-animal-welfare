import data from "../data/catalog.json";
import additionalCandidates from "../data/additional-candidates.csv?raw";
import publicationCandidates from "../data/publication-candidates.csv?raw";
import { mergeCatalog } from "./candidate-catalog.js";

export interface CatalogCategory {
  id: string;
  title: string;
  description: string;
}

export interface CatalogReference {
  label: string;
  url: string;
}

export interface CatalogEntry {
  id: string;
  name: string;
  domain: string;
  url: string;
  category: string;
  annotation: string;
  topics: string[];
  evidence_type: string;
  access: string;
  reuse: string;
  references: CatalogReference[];
  policy_urls?: CatalogReference[];
  review_status?: "selected" | "candidate";
  scope_fit?: string;
  link_pattern?: string;
}

export interface Catalog {
  name: string;
  description: string;
  introduction: string;
  updated: string;
  categories: CatalogCategory[];
  entries: CatalogEntry[];
}

function validateCatalog(value: Catalog): Catalog {
  const categoryIds = new Set(value.categories.map((category) => category.id));
  const entryIds = new Set<string>();

  if (categoryIds.size !== value.categories.length) {
    throw new Error("Catalog contains duplicate category IDs");
  }

  for (const entry of value.entries) {
    if (entryIds.has(entry.id)) {
      throw new Error(`Catalog contains duplicate entry ID: ${entry.id}`);
    }
    if (!categoryIds.has(entry.category)) {
      throw new Error(`Unknown category for ${entry.id}: ${entry.category}`);
    }
    if (!entry.url.startsWith("https://")) {
      throw new Error(`Non-HTTPS primary URL for ${entry.id}`);
    }
    for (const reference of entry.references) {
      if (!reference.url.startsWith("https://")) {
        throw new Error(`Non-HTTPS reference URL for ${entry.id}: ${reference.url}`);
      }
    }
    entryIds.add(entry.id);
  }

  return value;
}

export const catalog = validateCatalog(
  mergeCatalog(data, [publicationCandidates, additionalCandidates]) as Catalog,
);

export function entriesFor(categoryId: string): CatalogEntry[] {
  return catalog.entries.filter((entry) => entry.category === categoryId);
}
