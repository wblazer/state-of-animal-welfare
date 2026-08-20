const knownCategories = new Set([
  "sentience",
  "welfare-science",
  "global",
  "farmed",
  "aquatic",
  "wild",
  "companion",
  "research",
  "law",
  "strategy",
  "suffering",
  "future",
]);

export function parseCsv(input) {
  const records = [];
  let record = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    if (quoted) {
      if (character === '"' && input[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
    } else if (character === '"' && field === "") {
      quoted = true;
    } else if (character === ",") {
      record.push(field);
      field = "";
    } else if (character === "\n") {
      record.push(field.replace(/\r$/, ""));
      if (record.some((value) => value !== "")) records.push(record);
      record = [];
      field = "";
    } else {
      field += character;
    }
  }

  if (field !== "" || record.length > 0) {
    record.push(field.replace(/\r$/, ""));
    records.push(record);
  }

  const [headers = [], ...rows] = records;
  return rows.map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""])));
}

function values(value) {
  return value
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);
}

function slug(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72);
}

function categoryFor(row) {
  if (knownCategories.has(row.primary_category)) return row.primary_category;

  const text = `${row.name} ${row.subjects} ${row.reason_to_inspect}`.toLowerCase();
  if (/\b(ai|artificial intelligence|future|longterm|s-risk|bioeconomy|abolition|post-animal)\b/.test(text)) return "future";
  if (/laborator|research animal|animals in science|\b3rs\b|toxicolog|animal experimentation|animal testing|vivisection|non-animal method|in vivo/.test(text)) return "research";
  if (/wild[- ]animal|free-living|wildlife|predation|ecolog/.test(text)) return "wild";
  if (/aquatic|fish|shrimp|crustace|cephalopod|insect|invertebrate|honeybee|mollusk/.test(text)) return "aquatic";
  if (/animal law|legal|legislation|litigation|jurisprudence|constitutional|policy alliance/.test(text)) return "law";
  if (/welfare science|welfare measurement|welfare assessment|pain measurement|five domains|severity|veterinary|animal behavior|animal behaviour/.test(text)) return "welfare-science";
  if (/companion animal|animal shelter|shelter medicine|dogs?\b|cats?\b|equine|working animal/.test(text)) return "companion";
  if (/factory|farm[- ]animal|farmed|agricultur|food system|meat|slaughter|poultry|chicken|pig\b|cattle|dairy|alternative protein/.test(text)) return "farmed";
  if (/advocacy|movement|campaign|philanthrop|communication|media|career|grantmaking|charity|social change|behavior change|strategy/.test(text)) return "strategy";
  if (/statistics|global data|global burden|international development|global south/.test(text)) return "global";
  return "sentience";
}

function linkLabel(value) {
  const url = new URL(value);
  const parts = url.pathname.split("/").filter(Boolean);
  let text = decodeURIComponent(parts.at(-1) ?? url.hostname.replace(/^www\./, ""));
  if (/^(?:index|articles?|blog|reports?|research|resources?)$/i.test(text) && parts.length > 1) {
    text = `${parts.at(-2)} ${text}`;
  }
  text = text.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
  return text ? text[0].toUpperCase() + text.slice(1) : "Selected page";
}

function accessAndReuse(snapshot) {
  const sentences = snapshot
    .split(/;\s*/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
  const rightsPattern = /copyright|license|rights|terms|reuse|permission|all rights|creative commons|\bcc\s?by\b/i;
  const reuse = sentences.filter((sentence) => rightsPattern.test(sentence));
  const access = sentences.filter((sentence) => !rightsPattern.test(sentence));

  return {
    access: access.join("; ") || "Public web pages; access should be checked before reuse.",
    reuse: reuse.join("; ") || "No general reuse license was recorded; source copyright applies.",
  };
}

function normalizedUrl(value) {
  const url = new URL(value);
  url.hash = "";
  url.hostname = url.hostname.toLowerCase().replace(/^www\./, "");
  if (url.pathname !== "/") url.pathname = url.pathname.replace(/\/$/, "");
  return url.toString();
}

export function candidatesFromCsv(input) {
  return parseCsv(input).map((row) => {
    const url = new URL(row.root_url);
    const primaryUrl = normalizedUrl(url.toString());
    const { access, reuse } = accessAndReuse(row.access_and_rights_snapshot);
    const referenceUrls = values(row.map_or_highlights).filter((reference, index, allReferences) => {
      const normalizedReference = normalizedUrl(reference);
      return normalizedReference !== primaryUrl &&
        allReferences.findIndex((other) => normalizedUrl(other) === normalizedReference) === index;
    });
    return {
      id: `candidate-${slug(row.name)}`,
      name: row.name,
      domain: url.hostname.replace(/^www\./, ""),
      url: url.toString(),
      category: categoryFor(row),
      annotation: row.reason_to_inspect,
      topics: values(row.subjects),
      evidence_type: row.platform,
      access,
      reuse,
      references: referenceUrls.map((reference) => ({
        label: linkLabel(reference),
        url: reference,
      })),
      review_status: "candidate",
      scope_fit: row.scope_fit,
      link_pattern: row.link_pattern,
    };
  });
}

export function mergeCatalog(baseCatalog, candidateCsvs) {
  const curatedEntries = baseCatalog.entries.map((entry) => ({
    name: entry.name.toLowerCase(),
    origin: new URL(normalizedUrl(entry.url)).origin,
  }));
  const seenUrls = new Set(baseCatalog.entries.map((entry) => normalizedUrl(entry.url)));
  const seenIds = new Set(baseCatalog.entries.map((entry) => entry.id));
  const candidates = [];

  for (const input of candidateCsvs) {
    for (const entry of candidatesFromCsv(input)) {
      const normalized = normalizedUrl(entry.url);
      const name = entry.name.toLowerCase();
      const duplicatesCuratedEntry = curatedEntries.some(
        (curated) => curated.origin === new URL(normalized).origin &&
          (curated.name.includes(name) || name.includes(curated.name)),
      );
      if (duplicatesCuratedEntry || seenUrls.has(normalized)) continue;

      let id = entry.id;
      let suffix = 2;
      while (seenIds.has(id)) {
        id = `${entry.id}-${suffix}`;
        suffix += 1;
      }
      seenIds.add(id);
      seenUrls.add(normalized);
      candidates.push({ ...entry, id });
    }
  }

  return {
    ...baseCatalog,
    entries: [
      ...baseCatalog.entries.map((entry) => ({ ...entry, review_status: "selected" })),
      ...candidates,
    ],
  };
}
