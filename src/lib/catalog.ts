import data from "../data/catalog.json";

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
    entryIds.add(entry.id);
  }

  return value;
}

export const catalog = validateCatalog(data as Catalog);

export function entriesFor(categoryId: string): CatalogEntry[] {
  return catalog.entries.filter((entry) => entry.category === categoryId);
}
