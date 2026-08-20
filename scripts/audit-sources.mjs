import { createHash } from "node:crypto";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalogPath = path.join(projectRoot, "src/data/catalog.json");
const defaultBaselinePath = path.join(projectRoot, "data/source-audit-baseline.json");
const defaultOutputDirectory = path.join(projectRoot, ".source-audit");
const userAgent =
  "AnimalWelfareReadingListAudit/1.0 (+https://github.com/wblazer/state-of-animal-welfare)";
const aiAgents = [
  "GPTBot",
  "Google-Extended",
  "CCBot",
  "ClaudeBot",
  "anthropic-ai",
  "Bytespider",
  "PerplexityBot",
  "Amazonbot",
  "Applebot-Extended",
  "FacebookBot",
];

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNonemptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function validateUrl(value, location, errors) {
  if (!isNonemptyString(value)) {
    errors.push(`${location} must be a nonempty URL`);
    return;
  }

  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "https:") {
      errors.push(`${location} must use HTTPS`);
    }
  } catch {
    errors.push(`${location} is not a valid URL`);
  }
}

export function catalogErrors(catalog) {
  const errors = [];
  if (!isRecord(catalog)) return ["Catalog must be an object"];

  for (const field of ["name", "description", "introduction", "updated"]) {
    if (!isNonemptyString(catalog[field])) errors.push(`Catalog ${field} must be a nonempty string`);
  }
  if (
    isNonemptyString(catalog.updated) &&
    (!/^\d{4}-\d{2}-\d{2}$/.test(catalog.updated) || Number.isNaN(Date.parse(`${catalog.updated}T00:00:00Z`)))
  ) {
    errors.push("Catalog updated must be an ISO date (YYYY-MM-DD)");
  }
  const assessmentValues = new Set(["high", "useful", "specialized", "unrated"]);
  if (!isRecord(catalog.assessment_scale)) {
    errors.push("Catalog assessment_scale must be an object");
  } else {
    for (const value of assessmentValues) {
      if (!isNonemptyString(catalog.assessment_scale[value])) {
        errors.push(`Catalog assessment_scale.${value} must be a nonempty string`);
      }
    }
  }

  const categories = Array.isArray(catalog.categories) ? catalog.categories : [];
  const entries = Array.isArray(catalog.entries) ? catalog.entries : [];
  if (!Array.isArray(catalog.categories)) errors.push("Catalog categories must be an array");
  if (!Array.isArray(catalog.entries)) errors.push("Catalog entries must be an array");

  const categoryIds = new Set();
  for (const [index, category] of categories.entries()) {
    const location = `categories[${index}]`;
    if (!isRecord(category)) {
      errors.push(`${location} must be an object`);
      continue;
    }
    for (const field of ["id", "title", "description"]) {
      if (!isNonemptyString(category[field])) errors.push(`${location}.${field} must be a nonempty string`);
    }
    if (categoryIds.has(category.id)) errors.push(`Duplicate category ID: ${category.id}`);
    categoryIds.add(category.id);
  }

  const entryIds = new Set();
  const primaryUrls = new Set();
  for (const [index, entry] of entries.entries()) {
    const location = `entries[${index}]`;
    if (!isRecord(entry)) {
      errors.push(`${location} must be an object`);
      continue;
    }
    for (const field of [
      "id",
      "name",
      "domain",
      "url",
      "category",
      "annotation",
      "evidence_type",
      "access",
      "reuse",
    ]) {
      if (!isNonemptyString(entry[field])) errors.push(`${location}.${field} must be a nonempty string`);
    }
    if (!Array.isArray(entry.topics) || entry.topics.length === 0) {
      errors.push(`${location}.topics must contain at least one topic`);
    } else if (entry.topics.some((topic) => !isNonemptyString(topic))) {
      errors.push(`${location}.topics must contain only nonempty strings`);
    }
    if (!isRecord(entry.assessment)) {
      errors.push(`${location}.assessment must be an object`);
    } else {
      if (!assessmentValues.has(entry.assessment.value)) {
        errors.push(`${location}.assessment.value must be high, useful, specialized, or unrated`);
      }
      if (entry.assessment.notes !== undefined && !isNonemptyString(entry.assessment.notes)) {
        errors.push(`${location}.assessment.notes must be a nonempty string when present`);
      }
    }

    if (entryIds.has(entry.id)) errors.push(`Duplicate entry ID: ${entry.id}`);
    entryIds.add(entry.id);
    if (isNonemptyString(entry.category) && !categoryIds.has(entry.category)) {
      errors.push(`${location}.category refers to unknown category: ${entry.category}`);
    }
    validateUrl(entry.url, `${location}.url`, errors);
    if (primaryUrls.has(entry.url)) errors.push(`Duplicate primary URL: ${entry.url}`);
    primaryUrls.add(entry.url);

    const urlsWithinEntry = new Set([entry.url]);
    for (const field of ["references", "policy_urls"]) {
      const links = entry[field];
      if (field === "references" && !Array.isArray(links)) {
        errors.push(`${location}.${field} must be an array`);
        continue;
      }
      if (links === undefined && field === "policy_urls") continue;
      if (!Array.isArray(links)) {
        errors.push(`${location}.${field} must be an array when present`);
        continue;
      }
      for (const [linkIndex, link] of links.entries()) {
        const linkLocation = `${location}.${field}[${linkIndex}]`;
        if (!isRecord(link)) {
          errors.push(`${linkLocation} must be an object`);
          continue;
        }
        if (!isNonemptyString(link.label)) errors.push(`${linkLocation}.label must be a nonempty string`);
        validateUrl(link.url, `${linkLocation}.url`, errors);
        if (urlsWithinEntry.has(link.url)) errors.push(`${location} repeats URL: ${link.url}`);
        urlsWithinEntry.add(link.url);
      }
    }
  }

  return errors;
}

function assertValidCatalog(catalog) {
  const errors = catalogErrors(catalog);
  if (errors.length > 0) throw new Error(`Catalog validation failed:\n- ${errors.join("\n- ")}`);
}

function linksForEntry(entry) {
  return [
    { url: entry.url, kind: "primary", label: entry.name },
    ...entry.references.map((reference) => ({ ...reference, kind: "reference" })),
    ...(entry.policy_urls ?? []).map((policy) => ({ ...policy, kind: "policy" })),
  ];
}

function collectLinks(catalog, previousCatalog) {
  const previousEntries = new Map(
    (previousCatalog?.entries ?? []).map((entry) => [entry.id, new Set(linksForEntry(entry).map((link) => link.url))]),
  );
  const links = new Map();

  for (const entry of catalog.entries) {
    const previousUrls = previousCatalog ? (previousEntries.get(entry.id) ?? new Set()) : null;
    for (const link of linksForEntry(entry)) {
      if (previousUrls?.has(link.url)) continue;
      const existing = links.get(link.url) ?? { url: link.url, owners: [] };
      existing.owners.push({ entry: entry.name, entryId: entry.id, kind: link.kind, label: link.label });
      links.set(link.url, existing);
    }
  }

  return [...links.values()].sort((a, b) => a.url.localeCompare(b.url));
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function fetchResource(url, { includeBody = false, bodyLimit = 1_000_000, retries = 2 } = {}) {
  let lastError;

  for (let attempt = 1; attempt <= retries + 1; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          accept: "text/html,application/xhtml+xml,application/json,text/plain,application/pdf;q=0.8,*/*;q=0.5",
          range: `bytes=0-${includeBody ? bodyLimit - 1 : 0}`,
          "user-agent": userAgent,
        },
        redirect: "follow",
        signal: AbortSignal.timeout(20_000),
      });
      const responseBody = Buffer.from(await response.arrayBuffer());
      const result = {
        url,
        finalUrl: response.url,
        status: response.status,
        attempts: attempt,
        headers: {
          contentType: response.headers.get("content-type"),
          contentSignal: response.headers.get("content-signal"),
          xRobotsTag: response.headers.get("x-robots-tag"),
        },
        body: includeBody ? responseBody.subarray(0, bodyLimit).toString("utf8") : null,
      };

      if ([408, 425, 500, 502, 503, 504].includes(response.status) && attempt <= retries) {
        lastError = result;
        await delay(attempt * 750);
        continue;
      }
      return result;
    } catch (error) {
      lastError = {
        url,
        finalUrl: null,
        status: null,
        attempts: attempt,
        headers: { contentType: null, contentSignal: null, xRobotsTag: null },
        body: null,
        error: error instanceof Error ? `${error.name}: ${error.message}` : String(error),
      };
      if (attempt <= retries) await delay(attempt * 750);
    }
  }

  return lastError;
}

export function classifyLink(result) {
  if (result.status === null) return "failed";
  if (result.status >= 200 && result.status < 400) return "ok";
  if ([401, 403, 405, 406, 418, 429, 451].includes(result.status)) return "restricted";
  if ([404, 410].includes(result.status)) return "missing";
  return "failed";
}

function comparisonUrl(value) {
  if (!value) return null;
  const url = new URL(value);
  url.hash = "";
  if (url.pathname !== "/") url.pathname = url.pathname.replace(/\/$/, "");
  return url.toString();
}

async function runPool(items, worker, concurrency = 4) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function runWorker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await worker(items[index]);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, runWorker));
  return results;
}

function markdownCell(value) {
  return String(value ?? "").replaceAll("|", "\\|").replaceAll("\n", " ");
}

function linkDetail(result) {
  if (result.status !== null) return `HTTP ${result.status}`;
  return result.error ?? "Request failed";
}

function renderLinkReport(report) {
  const lines = [
    "# Source link audit",
    "",
    `Checked ${report.summary.checked} URL${report.summary.checked === 1 ? "" : "s"}. ${report.summary.ok} responded successfully, ${report.summary.missing} appear missing, ${report.summary.failed} failed, and ${report.summary.restricted} could not be verified because the server restricted the request.`,
    "",
  ];

  const attention = report.results.filter((result) => ["missing", "failed"].includes(result.classification));
  if (attention.length > 0) {
    lines.push("## Needs review", "", "| Source | Result | URL |", "| --- | --- | --- |");
    for (const result of attention) {
      lines.push(
        `| ${markdownCell(result.owners.map((owner) => owner.entry).join(", "))} | ${markdownCell(linkDetail(result))} | ${result.url} |`,
      );
    }
    lines.push("");
  }

  const restricted = report.results.filter((result) => result.classification === "restricted");
  if (restricted.length > 0) {
    lines.push(
      "## Could not verify",
      "",
      "These responses often reflect bot protection or rate limiting, not dead pages.",
      "",
      "| Source | Result | URL |",
      "| --- | --- | --- |",
    );
    for (const result of restricted) {
      lines.push(
        `| ${markdownCell(result.owners.map((owner) => owner.entry).join(", "))} | ${markdownCell(linkDetail(result))} | ${result.url} |`,
      );
    }
    lines.push("");
  }

  const redirects = report.results.filter((result) => result.redirected);
  if (redirects.length > 0) {
    lines.push("## Redirects", "", "| From | To |", "| --- | --- |");
    for (const result of redirects) lines.push(`| ${result.url} | ${result.finalUrl} |`);
    lines.push("");
  }

  if (!report.summary.needsAttention) lines.push("No dead or failing links need review.", "");
  lines.push("Restrictions and policy signals are reported as observations, not as legal conclusions.", "");
  return lines.join("\n");
}

export function parseRobots(body) {
  const groups = new Map();
  const contentSignals = [];
  let currentAgents = [];
  let groupHasDirectives = false;

  for (const sourceLine of body.replace(/^\uFEFF/, "").split(/\r?\n/)) {
    const line = sourceLine.replace(/\s+#.*$/, "").trim();
    if (!line) continue;
    const separator = line.indexOf(":");
    if (separator < 0) continue;
    const field = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();

    if (field === "user-agent") {
      if (groupHasDirectives) currentAgents = [];
      currentAgents.push(value.toLowerCase());
      groupHasDirectives = false;
      continue;
    }
    if (field === "content-signal") contentSignals.push(value);
    if (currentAgents.length === 0) continue;

    groupHasDirectives = true;
    for (const agent of currentAgents) {
      const directives = groups.get(agent) ?? [];
      directives.push(`${field}: ${value}`);
      groups.set(agent, directives);
    }
  }

  const agents = { "*": groups.get("*") ?? [] };
  for (const agent of aiAgents) agents[agent] = groups.get(agent.toLowerCase()) ?? [];
  return {
    agents,
    contentSignals: [...new Set(contentSignals)],
  };
}

function decodeHtml(value) {
  return value
    .replace(/&#(\d+);/g, (_, number) => String.fromCodePoint(Number(number)))
    .replace(/&#x([\da-f]+);/gi, (_, number) => String.fromCodePoint(Number.parseInt(number, 16)))
    .replaceAll("&nbsp;", " ")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'");
}

function attributesFromTag(tag) {
  const attributes = {};
  const pattern = /([^\s=<>/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  for (const match of tag.replace(/^<\/?[^\s>]+/, "").matchAll(pattern)) {
    attributes[match[1].toLowerCase()] = decodeHtml(match[2] ?? match[3] ?? match[4] ?? "");
  }
  return attributes;
}

export function extractPageSignals(html, headers = {}) {
  const licenseUrls = new Set();
  const rights = new Set();

  for (const match of html.matchAll(/<(?:link|meta)\b[^>]*>/gi)) {
    const attributes = attributesFromTag(match[0]);
    const rel = (attributes.rel ?? "").toLowerCase().split(/\s+/);
    const name = (attributes.name ?? attributes.property ?? "").toLowerCase();
    if (rel.includes("license") && attributes.href) licenseUrls.add(attributes.href);
    if (["license", "dc.rights", "dcterms.license", "copyright", "rights"].includes(name) && attributes.content) {
      rights.add(attributes.content);
      if (/^https?:\/\//i.test(attributes.content)) licenseUrls.add(attributes.content);
    }
  }
  for (const match of html.matchAll(/"license"\s*:\s*"([^"]+)"/gi)) licenseUrls.add(decodeHtml(match[1]));
  for (const match of html.matchAll(/https?:\/\/creativecommons\.org\/(?:licenses|publicdomain)\/[^\s"'<>\\]+/gi)) {
    licenseUrls.add(match[0].replace(/[),.;]+$/, ""));
  }

  return {
    contentSignals: headers.contentSignal ? [headers.contentSignal] : [],
    xRobotsTags: headers.xRobotsTag ? [headers.xRobotsTag] : [],
    licenseUrls: [...licenseUrls].sort(),
    rights: [...rights].sort(),
  };
}

export function normalizePolicyText(html) {
  return decodeHtml(
    html
      .replace(/<!--[^]*?-->/g, " ")
      .replace(/<(script|style|svg|noscript|template)\b[^>]*>[^]*?<\/\1\s*>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function compactRobotsAgents(agents) {
  return Object.fromEntries(
    Object.entries(agents).flatMap(([agent, directives]) => {
      if (directives.length === 0) return [];
      const rootRules = directives.filter((directive) =>
        /^(?:allow|disallow):\s*\/?$|^content-signal:/i.test(directive),
      );
      return [[agent, { directiveCount: directives.length, hash: sha256(directives.join("\n")), rootRules }]];
    }),
  );
}

function observationState(response, { missingIsAbsent = false } = {}) {
  if (response.status === null || response.status >= 500) return "unverified";
  if (missingIsAbsent && response.status === 404) return "absent";
  if (response.status === 429) return "unverified";
  if ([401, 403, 405, 406, 418, 451].includes(response.status)) return "restricted";
  if (response.status >= 400) return "unverified";
  return "available";
}

async function collectPolicySnapshot(catalog) {
  const allLinks = collectLinks(catalog);
  const origins = [...new Set(allLinks.map((link) => new URL(link.url).origin))].sort();
  const robotsResults = await runPool(origins, async (origin) => {
    const url = new URL("/robots.txt", origin).toString();
    const response = await fetchResource(url, { includeBody: true, bodyLimit: 500_000 });
    const state = observationState(response, { missingIsAbsent: true });
    const parsed = state === "available" ? parseRobots(response.body) : { agents: {}, contentSignals: [] };
    const normalized =
      state === "available"
        ? response.body
            .replace(/^\uFEFF/, "")
            .split(/\r?\n/)
            .map((line) => line.replace(/\s+#.*$/, "").trim())
            .filter(Boolean)
            .join("\n")
        : "";
    return [
      origin,
      {
        url,
        state,
        status: response.status,
        finalUrl: response.finalUrl,
        hash: normalized ? sha256(normalized) : null,
        agents: compactRobotsAgents(parsed.agents),
        contentSignals: parsed.contentSignals,
        error: state === "unverified" ? (response.error ?? `HTTP ${response.status}`) : null,
      },
    ];
  });

  const pageResults = await runPool(catalog.entries, async (entry) => {
    const response = await fetchResource(entry.url, { includeBody: true });
    const state = observationState(response);
    return [
      entry.id,
      {
        name: entry.name,
        url: entry.url,
        state,
        status: response.status,
        finalUrl: response.finalUrl,
        signals: state === "available" ? extractPageSignals(response.body, response.headers) : null,
        error: state === "unverified" ? (response.error ?? `HTTP ${response.status}`) : null,
      },
    ];
  });

  const policyLinks = catalog.entries.flatMap((entry) =>
    (entry.policy_urls ?? []).map((policy) => ({ ...policy, entryId: entry.id, entryName: entry.name })),
  );
  const policyResults = await runPool(policyLinks, async (policy) => {
    const response = await fetchResource(policy.url, { includeBody: true, bodyLimit: 2_000_000 });
    const state = observationState(response);
    const text = state === "available" ? normalizePolicyText(response.body) : "";
    return [
      `${policy.entryId}:${policy.label}`,
      {
        name: `${policy.entryName}: ${policy.label}`,
        url: policy.url,
        state,
        status: response.status,
        finalUrl: response.finalUrl,
        textHash: text ? sha256(text) : null,
        signals: state === "available" ? extractPageSignals(response.body, response.headers) : null,
        error: state === "unverified" ? (response.error ?? `HTTP ${response.status}`) : null,
      },
    ];
  });

  return {
    robots: Object.fromEntries(robotsResults),
    pages: Object.fromEntries(pageResults),
    policies: Object.fromEntries(policyResults),
  };
}

function comparableObservation(observation) {
  if (!observation) return null;
  const {
    error: _error,
    finalUrl: _finalUrl,
    name: _name,
    status: _status,
    url: _url,
    ...comparable
  } = observation;
  return comparable;
}

export function comparePolicySnapshots(baseline, current) {
  const changes = [];
  const unverified = [];

  for (const section of ["robots", "pages", "policies"]) {
    const stablePageKeys = (observations) =>
      section === "pages"
        ? Object.fromEntries(
            Object.entries(observations).map(([key, observation]) => [observation?.url ?? key, observation]),
          )
        : observations;
    const beforeSection = stablePageKeys(baseline?.[section] ?? {});
    const afterSection = stablePageKeys(current?.[section] ?? {});
    const keys = Object.keys(afterSection).sort();

    for (const key of keys) {
      const before = beforeSection[key];
      const after = afterSection[key];
      if (after?.state === "unverified") {
        unverified.push({ section, key, observation: after });
        continue;
      }
      if (before?.state === "unverified") continue;
      if (JSON.stringify(comparableObservation(before)) !== JSON.stringify(comparableObservation(after))) {
        changes.push({ section, key, before: before ?? null, after: after ?? null });
      }
    }
  }

  return { changes, unverified };
}

function conciseAgentRules(agent) {
  const otherCount = agent.directiveCount - agent.rootRules.length;
  return [
    ...agent.rootRules,
    ...(otherCount > 0 ? [`${otherCount} other directive${otherCount === 1 ? "" : "s"}`] : []),
  ].join(", ");
}

function summarizeObservation(observation, section) {
  if (!observation) return "not monitored";
  if (observation.state !== "available") {
    return `${observation.state}${observation.status ? ` (HTTP ${observation.status})` : ""}`;
  }
  if (section === "robots") {
    const groupedAgents = new Map();
    for (const [agentName, agent] of Object.entries(observation.agents ?? {})) {
      if (agentName === "*" || agent.directiveCount === 0) continue;
      const signature = JSON.stringify(agent);
      const group = groupedAgents.get(signature) ?? { agentNames: [], agent };
      group.agentNames.push(agentName);
      groupedAgents.set(signature, group);
    }
    const details = [...groupedAgents.values()].map(
      (group) => `${group.agentNames.join(", ")}: ${conciseAgentRules(group.agent)}`,
    );
    const wildcard = observation.agents?.["*"];
    if (wildcard?.rootRules.length > 0) {
      details.unshift(`all crawlers: ${wildcard.rootRules.join(", ")}`);
    }
    for (const signal of observation.contentSignals ?? []) details.push(`Content-Signal: ${signal}`);
    if (observation.hash) details.push(`fingerprint ${observation.hash.slice(0, 12)}`);
    return details.join("; ") || "available; empty robots.txt";
  }
  const signals = observation.signals ?? {};
  const details = [
    ...(signals.contentSignals ?? []).map((signal) => `Content-Signal: ${signal}`),
    ...(signals.xRobotsTags ?? []).map((signal) => `X-Robots-Tag: ${signal}`),
    ...(signals.licenseUrls ?? []).map((license) => `license: ${license}`),
    ...(signals.rights ?? []).map((rights) => `rights: ${rights}`),
  ];
  if (section === "policies" && observation.textHash) details.push(`text fingerprint ${observation.textHash.slice(0, 12)}`);
  return details.join("; ") || "available; no machine-readable signals found";
}

function renderPolicyReport(report) {
  const lines = [
    "# Source policy audit",
    "",
    `Compared crawl and reuse signals for ${report.summary.origins} origins and ${report.summary.pages} primary pages.`,
    "",
  ];

  if (report.changes.length > 0) {
    lines.push("## Changes needing review", "", "| Target | Before | Now |", "| --- | --- | --- |");
    for (const change of report.changes) {
      lines.push(
        `| ${markdownCell(change.after?.name ?? change.before?.name ?? change.key)} | ${markdownCell(summarizeObservation(change.before, change.section))} | ${markdownCell(summarizeObservation(change.after, change.section))} |`,
      );
    }
    lines.push("");
  } else {
    lines.push("No monitored policy signals changed.", "");
  }

  if (report.unverified.length > 0) {
    lines.push(
      "## Could not verify",
      "",
      "These observations were not compared with the baseline because the request failed.",
      "",
      "| Target | Result |",
      "| --- | --- |",
    );
    for (const item of report.unverified) {
      lines.push(
        `| ${markdownCell(item.observation.name ?? item.key)} | ${markdownCell(item.observation.error ?? summarizeObservation(item.observation, item.section))} |`,
      );
    }
    lines.push("");
  }

  lines.push(
    "This report detects public technical and licensing signals. It does not determine whether copying or model training is legally permitted.",
    "",
  );
  return lines.join("\n");
}

async function readJson(filename) {
  return JSON.parse(await readFile(filename, "utf8"));
}

async function readCatalog(filename) {
  return readJson(filename);
}

async function writeReport(directory, name, report, markdown) {
  await mkdir(directory, { recursive: true });
  await Promise.all([
    writeFile(path.join(directory, `${name}.json`), `${JSON.stringify(report, null, 2)}\n`),
    writeFile(path.join(directory, `${name}.md`), markdown),
  ]);
}

function parseArguments(argv) {
  const [mode = "validate", ...rest] = argv;
  const options = { mode };
  for (let index = 0; index < rest.length; index += 1) {
    const argument = rest[index];
    if (!argument.startsWith("--")) throw new Error(`Unexpected argument: ${argument}`);
    const name = argument.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    if (["failOnAttention", "updateBaseline"].includes(name)) options[name] = true;
    else {
      index += 1;
      if (index >= rest.length) throw new Error(`Missing value for ${argument}`);
      options[name] = rest[index];
    }
  }
  return options;
}

async function auditLinks(catalog, options) {
  const previousCatalog = options.previousCatalog
    ? await readCatalog(path.resolve(options.previousCatalog))
    : null;
  if (previousCatalog) assertValidCatalog(previousCatalog);
  const links = collectLinks(catalog, previousCatalog);
  const results = await runPool(links, async (link) => {
    const response = await fetchResource(link.url);
    const classification = classifyLink(response);
    return {
      ...link,
      classification,
      status: response.status,
      finalUrl: response.finalUrl,
      redirected: comparisonUrl(link.url) !== comparisonUrl(response.finalUrl),
      attempts: response.attempts,
      contentType: response.headers.contentType,
      contentSignal: response.headers.contentSignal,
      xRobotsTag: response.headers.xRobotsTag,
      error: response.error ?? null,
    };
  });
  const counts = Object.fromEntries(
    ["ok", "missing", "failed", "restricted"].map((classification) => [
      classification,
      results.filter((result) => result.classification === classification).length,
    ]),
  );
  const report = {
    generatedAt: new Date().toISOString(),
    scope: previousCatalog ? "new and changed URLs" : "all catalog URLs",
    summary: {
      checked: results.length,
      ...counts,
      needsAttention: counts.missing + counts.failed > 0,
    },
    results,
  };
  await writeReport(options.outputDirectory, "links", report, renderLinkReport(report));
  console.log(
    `Checked ${results.length} links: ${counts.ok} ok, ${counts.missing} missing, ${counts.failed} failed, ${counts.restricted} restricted.`,
  );
  if (options.failOnAttention && report.summary.needsAttention) process.exitCode = 1;
}

async function auditPolicies(catalog, options) {
  const snapshot = await collectPolicySnapshot(catalog);
  if (options.updateBaseline) {
    await mkdir(path.dirname(options.baseline), { recursive: true });
    await writeFile(
      options.baseline,
      `${JSON.stringify({ version: 1, generatedAt: new Date().toISOString().slice(0, 10), snapshot }, null, 2)}\n`,
    );
    console.log(`Updated policy baseline at ${path.relative(projectRoot, options.baseline)}.`);
    return;
  }

  const baseline = await readJson(options.baseline);
  if (baseline.version !== 1 || !isRecord(baseline.snapshot)) throw new Error("Unsupported policy baseline format");
  const comparison = comparePolicySnapshots(baseline.snapshot, snapshot);
  const report = {
    generatedAt: new Date().toISOString(),
    baselineGeneratedAt: baseline.generatedAt,
    summary: {
      origins: Object.keys(snapshot.robots).length,
      pages: Object.keys(snapshot.pages).length,
      policyPages: Object.keys(snapshot.policies).length,
      changes: comparison.changes.length,
      unverified: comparison.unverified.length,
      needsAttention: comparison.changes.length > 0,
    },
    ...comparison,
    snapshot,
  };
  await writeReport(options.outputDirectory, "policies", report, renderPolicyReport(report));
  console.log(`Found ${comparison.changes.length} policy changes; ${comparison.unverified.length} checks were inconclusive.`);
  if (options.failOnAttention && report.summary.needsAttention) process.exitCode = 1;
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  options.outputDirectory = path.resolve(options.outputDirectory ?? defaultOutputDirectory);
  options.baseline = path.resolve(options.baseline ?? defaultBaselinePath);
  const catalog = await readCatalog(catalogPath);
  assertValidCatalog(catalog);

  if (options.mode === "validate") {
    console.log(`Catalog is valid: ${catalog.entries.length} entries in ${catalog.categories.length} categories.`);
  } else if (options.mode === "links") {
    await auditLinks(catalog, options);
  } else if (options.mode === "policies") {
    await auditPolicies(catalog, options);
  } else {
    throw new Error(`Unknown audit mode: ${options.mode}`);
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
