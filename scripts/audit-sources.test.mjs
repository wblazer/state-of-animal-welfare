import assert from "node:assert/strict";
import test from "node:test";
import { candidatesFromCsv, mergeCatalog, parseCsv } from "../src/lib/candidate-catalog.js";

import {
  catalogErrors,
  classifyLink,
  comparePolicySnapshots,
  extractPageSignals,
  normalizePolicyText,
  parseRobots,
} from "./audit-sources.mjs";

const candidateCsv = `name,root_url,platform,subjects,reason_to_inspect,link_pattern,map_or_highlights,discovered_via,access_and_rights_snapshot,scope_fit,primary_category
"Example, with comma","https://example.com/","blog","animal ethics; welfare","A quoted, useful description.","root plus highlights","https://example.com/first-post","test","Public HTML; author copyright applies.","focused","sentience"
`;

test("candidate CSV parsing preserves quoted commas and highlights", () => {
  assert.equal(parseCsv(candidateCsv)[0].name, "Example, with comma");
  const [entry] = candidatesFromCsv(candidateCsv);
  assert.equal(entry.category, "sentience");
  assert.deepEqual(entry.topics, ["animal ethics", "welfare"]);
  assert.deepEqual(entry.references, [{ label: "First post", url: "https://example.com/first-post" }]);
  assert.match(entry.reuse, /copyright/);
});

test("candidate merge keeps section roots but removes matching curated sources and duplicate URLs", () => {
  const base = {
    entries: [{ id: "curated", name: "Example, with comma", url: "https://example.com/selected" }],
  };
  const otherCsv = candidateCsv.replaceAll("example.com", "other.example");
  const merged = mergeCatalog(base, [candidateCsv, otherCsv, otherCsv]);

  assert.equal(merged.entries.length, 2);
  assert.equal(merged.entries[0].review_status, "selected");
  assert.equal(merged.entries[1].url, "https://other.example/");
});

test("catalog validation checks nested links", () => {
  const catalog = {
    name: "Reading list",
    description: "Description",
    introduction: "Introduction",
    updated: "2026-08-19",
    categories: [{ id: "one", title: "One", description: "Description" }],
    entries: [
      {
        id: "entry",
        name: "Entry",
        domain: "example.com",
        url: "https://example.com/",
        category: "one",
        annotation: "Annotation",
        topics: ["topic"],
        evidence_type: "Research",
        access: "HTML",
        reuse: "Copyright applies",
        references: [{ label: "Bad", url: "http://example.com/bad" }],
      },
    ],
  };

  assert.deepEqual(catalogErrors(catalog), ["entries[0].references[0].url must use HTTPS"]);
});

test("link results distinguish restrictions from missing pages", () => {
  assert.equal(classifyLink({ status: 200 }), "ok");
  assert.equal(classifyLink({ status: 403 }), "restricted");
  assert.equal(classifyLink({ status: 404 }), "missing");
  assert.equal(classifyLink({ status: 503 }), "failed");
  assert.equal(classifyLink({ status: null }), "failed");
});

test("robots parser preserves wildcard and named AI-agent directives", () => {
  const parsed = parseRobots(`
User-agent: *
Allow: /

User-agent: GPTBot
User-agent: CCBot
Disallow: /
Content-Signal: search=yes, ai-input=yes, ai-train=no
`);

  assert.deepEqual(parsed.agents["*"], ["allow: /"]);
  assert.deepEqual(parsed.agents.GPTBot, ["disallow: /", "content-signal: search=yes, ai-input=yes, ai-train=no"]);
  assert.deepEqual(parsed.agents.CCBot, ["disallow: /", "content-signal: search=yes, ai-input=yes, ai-train=no"]);
  assert.deepEqual(parsed.contentSignals, ["search=yes, ai-input=yes, ai-train=no"]);
});

test("page signal extraction finds headers and machine-readable licenses", () => {
  const signals = extractPageSignals(
    `<link href="https://creativecommons.org/licenses/by/4.0/" rel="license">
     <meta name="dc.rights" content="Example author">`,
    { contentSignal: "ai-train=no", xRobotsTag: "noai" },
  );

  assert.deepEqual(signals, {
    contentSignals: ["ai-train=no"],
    xRobotsTags: ["noai"],
    licenseUrls: ["https://creativecommons.org/licenses/by/4.0/"],
    rights: ["Example author"],
  });
});

test("policy normalization ignores markup and executable content", () => {
  assert.equal(
    normalizePolicyText("<main><h1>Terms &amp; Rights</h1><script>changing()</script><p>Keep this.</p></main>"),
    "Terms & Rights Keep this.",
  );
});

test("policy comparison reports changes but not inconclusive fetches", () => {
  const baseline = {
    robots: {
      "https://example.com": {
        state: "available",
        status: 200,
        finalUrl: "https://example.com/robots.txt",
        hash: "before",
      },
    },
    pages: { example: { state: "available", signals: {} } },
    policies: {},
  };
  const current = {
    robots: { "https://example.com": { state: "available", hash: "after" } },
    pages: { example: { state: "unverified", error: "timeout" } },
    policies: {},
  };

  const comparison = comparePolicySnapshots(baseline, current);
  assert.equal(comparison.changes.length, 1);
  assert.equal(comparison.unverified.length, 1);
});

test("policy comparison does not infer a change from an inconclusive baseline", () => {
  const baseline = {
    pages: { example: { state: "unverified", status: 429 } },
  };
  const current = {
    pages: { example: { state: "available", status: 200, signals: {} } },
  };

  assert.deepEqual(comparePolicySnapshots(baseline, current), { changes: [], unverified: [] });
});

test("policy comparison ignores transport-only differences", () => {
  const baseline = {
    robots: { example: { state: "available", status: 200, finalUrl: "https://example.com/robots.txt", hash: "same" } },
  };
  const current = {
    robots: { example: { state: "available", status: 206, finalUrl: "https://www.example.com/robots.txt", hash: "same" } },
  };

  assert.equal(comparePolicySnapshots(baseline, current).changes.length, 0);
});
