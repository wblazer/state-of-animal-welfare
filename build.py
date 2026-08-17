#!/usr/bin/env python3
"""Build the dependency-free static Animal Welfare Atlas."""

from __future__ import annotations

import csv
import html
import json
import shutil
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).parent
DATA_PATH = ROOT / "data" / "catalog.json"
TEMPLATE_PATH = ROOT / "templates" / "index.html"
STATIC_PATH = ROOT / "static"
DIST_PATH = ROOT / "dist"

CATEGORIES = [
    (
        "global",
        "Global scale",
        "Counts, trends, and research libraries that establish the size of human use of animals.",
    ),
    (
        "sentience",
        "Sentience and moral status",
        "Evidence and conceptual foundations for understanding which beings can have experiences.",
    ),
    (
        "farmed",
        "Farmed-animal welfare",
        "Research that measures the intensity, duration, and prevalence of lived experience.",
    ),
    (
        "aquatic",
        "Aquatic animals",
        "Work that makes individuals visible in systems usually reported as biomass or tonnage.",
    ),
    (
        "wild",
        "Wild-animal welfare",
        "An emerging field concerned with how free-living individuals fare, not only whether species persist.",
    ),
    (
        "research",
        "Animals used in research",
        "Official records of scientific procedures, including purpose and experienced severity.",
    ),
    (
        "future",
        "Visions of the future",
        "Developed proposals for extending moral concern and using future technology to improve sentient life.",
    ),
]

REQUIRED_FIELDS = {
    "id",
    "name",
    "domain",
    "url",
    "category",
    "summary",
    "usefulness",
    "caveat",
    "topics",
    "taxa",
    "evidence_type",
    "access",
    "reuse",
    "references",
}


def e(value: object) -> str:
    return html.escape(str(value), quote=True)


def validate(catalog: dict) -> None:
    entries = catalog.get("entries")
    if not isinstance(entries, list) or not entries:
        raise ValueError("catalog.entries must be a non-empty list")

    categories = {category[0] for category in CATEGORIES}
    ids: set[str] = set()
    domains: set[str] = set()
    for entry in entries:
        missing = REQUIRED_FIELDS - set(entry)
        if missing:
            raise ValueError(f"{entry.get('id', '<unknown>')} is missing {sorted(missing)}")
        if entry["id"] in ids:
            raise ValueError(f"duplicate id: {entry['id']}")
        if entry["domain"] in domains:
            raise ValueError(f"duplicate domain: {entry['domain']}")
        if entry["category"] not in categories:
            raise ValueError(f"unknown category for {entry['id']}: {entry['category']}")
        if not entry["url"].startswith("https://"):
            raise ValueError(f"non-HTTPS root URL for {entry['id']}")
        ids.add(entry["id"])
        domains.add(entry["domain"])


def render_references(references: list[dict[str, str]]) -> str:
    links = "".join(
        f'<li><a href="{e(ref["url"])}">{e(ref["label"])}<span aria-hidden="true">↗</span></a></li>'
        for ref in references
    )
    return f"<ul class=\"reference-list\">{links}</ul>"


def render_card(entry: dict, index: int) -> str:
    return f"""
<article class="source-card" id="source-{e(entry['id'])}">
  <div class="source-number" aria-hidden="true">{index}</div>
  <div class="source-copy">
    <h3><a href="{e(entry['url'])}">{e(entry['name'])}<span aria-hidden="true">↗</span></a></h3>
    <p class="source-meta">{e(entry['domain'])} · {e(entry['evidence_type'])}</p>
    <p class="summary">{e(entry['summary'])}</p>
    <details>
      <summary>Why this source is useful</summary>
      <div class="source-notes">
        <p><strong>Use it for:</strong> {e(entry['usefulness'])}</p>
        <p><strong>Keep in mind:</strong> {e(entry['caveat'])}</p>
        <p><strong>Scope:</strong> {e(', '.join(entry['taxa']))}</p>
        <p><strong>Access:</strong> {e(entry['access'])}</p>
        <p><strong>Source rights:</strong> {e(entry['reuse'])}</p>
        <div class="source-references"><strong>Good places to begin:</strong>{render_references(entry['references'])}</div>
      </div>
    </details>
  </div>
</article>""".strip()


def render_sections(entries: list[dict]) -> str:
    result: list[str] = []
    source_index = 0
    for category_id, title, description in CATEGORIES:
        category_entries = [entry for entry in entries if entry["category"] == category_id]
        if not category_entries:
            continue
        cards = []
        for entry in category_entries:
            source_index += 1
            cards.append(render_card(entry, source_index))
        cards_block = "\n".join(cards)
        result.append(
            f"""
<section class="directory-section" id="sources-{e(category_id)}">
  <header class="section-heading">
    <div>
      <h2>{e(title)}</h2>
      <p>{e(description)}</p>
    </div>
    <span class="section-count">{len(category_entries)} {'source' if len(category_entries) == 1 else 'sources'}</span>
  </header>
  <div class="source-list">
    {cards_block}
  </div>
</section>""".strip()
        )
    return "\n".join(result)


def make_json_ld(catalog: dict) -> str:
    items = []
    for entry in catalog["entries"]:
        items.append(
            {
                "@type": "WebSite",
                "name": entry["name"],
                "url": entry["url"],
                "description": entry["summary"],
                "genre": entry["evidence_type"],
                "keywords": entry["topics"],
                "citation": [reference["url"] for reference in entry["references"]],
                "isAccessibleForFree": True,
                "additionalProperty": [
                    {
                        "@type": "PropertyValue",
                        "name": "Catalog category",
                        "value": entry["category"],
                    },
                    {
                        "@type": "PropertyValue",
                        "name": "Taxa or scope",
                        "value": ", ".join(entry["taxa"]),
                    },
                    {
                        "@type": "PropertyValue",
                        "name": "Machine access",
                        "value": entry["access"],
                    },
                ],
            }
        )
    data = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": catalog["name"],
        "description": catalog["description"],
        "url": catalog["site_url"] + "/",
        "dateModified": catalog["updated"],
        "license": "https://creativecommons.org/licenses/by/4.0/",
        "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": len(items),
            "itemListElement": [
                {"@type": "ListItem", "position": index, "item": item}
                for index, item in enumerate(items, 1)
            ],
        },
    }
    return json.dumps(data, indent=2, ensure_ascii=False).replace("</", "<\\/")


def write_csv(catalog: dict) -> None:
    fields = [
        "id",
        "name",
        "domain",
        "url",
        "category",
        "summary",
        "usefulness",
        "caveat",
        "topics",
        "taxa",
        "evidence_type",
        "access",
        "reuse",
        "references",
    ]
    with (DIST_PATH / "catalog.csv").open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        for source in catalog["entries"]:
            row = dict(source)
            row["topics"] = " | ".join(source["topics"])
            row["taxa"] = " | ".join(source["taxa"])
            row["references"] = " | ".join(
                f"{reference['label']}: {reference['url']}" for reference in source["references"]
            )
            writer.writerow(row)


def write_llms_txt(catalog: dict) -> None:
    lines = [
        f"# {catalog['name']}",
        "",
        "> An original, curated guide to evidence about animal welfare and sentient experience.",
        "",
        "The directory links primarily to root domains. Summaries are original and do not reproduce source-site content. Empirical evidence is kept separate from normative or speculative ideas about the future.",
        "",
        "## Data files",
        "",
        f"- [JSON catalog]({catalog['site_url']}/catalog.json): Complete structured catalog.",
        f"- [CSV catalog]({catalog['site_url']}/catalog.csv): Flat export of the same original catalog metadata.",
        f"- [Method]({catalog['site_url']}/#method): Inclusion, evidence, and reuse notes.",
        "",
        "## Selected domains",
        "",
    ]
    category_titles = {category[0]: category[1] for category in CATEGORIES}
    current_category = None
    for entry in catalog["entries"]:
        if entry["category"] != current_category:
            current_category = entry["category"]
            lines.extend([f"### {category_titles[current_category]}", ""])
        lines.append(f"- [{entry['name']}]({entry['url']}): {entry['summary']}")
    lines.extend(
        [
            "",
            "## License",
            "",
            "Original editorial summaries and site prose: CC BY 4.0. Catalog facts and metadata: CC0 1.0. Linked works remain under their source terms.",
            "",
        ]
    )
    (DIST_PATH / "llms.txt").write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    catalog = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    validate(catalog)

    template = TEMPLATE_PATH.read_text(encoding="utf-8")
    counts = Counter(entry["category"] for entry in catalog["entries"])
    evidence_count = len(catalog["entries"]) - counts["future"]
    replacements = {
        "{{SITE_URL}}": catalog["site_url"],
        "{{UPDATED}}": catalog["updated"],
        "{{TOTAL_COUNT}}": str(len(catalog["entries"])),
        "{{EVIDENCE_COUNT}}": str(evidence_count),
        "{{FUTURE_COUNT}}": str(counts["future"]),
        "{{CATALOG_SECTIONS}}": render_sections(catalog["entries"]),
        "{{JSON_LD}}": make_json_ld(catalog),
    }
    for marker, value in replacements.items():
        template = template.replace(marker, value)
    unresolved = [marker for marker in replacements if marker in template]
    if unresolved:
        raise ValueError(f"unresolved template markers: {unresolved}")

    if DIST_PATH.exists():
        shutil.rmtree(DIST_PATH)
    DIST_PATH.mkdir()
    shutil.copytree(STATIC_PATH, DIST_PATH / "assets")
    (DIST_PATH / "index.html").write_text(template, encoding="utf-8")

    public_catalog = dict(catalog)
    public_catalog["license"] = {
        "editorial": "https://creativecommons.org/licenses/by/4.0/",
        "metadata": "https://creativecommons.org/publicdomain/zero/1.0/",
        "note": "These licenses cover this catalog's original work, not content on linked websites.",
    }
    (DIST_PATH / "catalog.json").write_text(
        json.dumps(public_catalog, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    write_csv(catalog)
    write_llms_txt(catalog)
    (DIST_PATH / "robots.txt").write_text(
        f"User-agent: *\nAllow: /\n\nSitemap: {catalog['site_url']}/sitemap.xml\n",
        encoding="utf-8",
    )
    (DIST_PATH / "sitemap.xml").write_text(
        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
        "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n"
        f"  <url><loc>{catalog['site_url']}/</loc><lastmod>{catalog['updated']}</lastmod></url>\n"
        f"  <url><loc>{catalog['site_url']}/catalog.json</loc><lastmod>{catalog['updated']}</lastmod></url>\n"
        f"  <url><loc>{catalog['site_url']}/llms.txt</loc><lastmod>{catalog['updated']}</lastmod></url>\n"
        "</urlset>\n",
        encoding="utf-8",
    )
    print(
        f"Built {len(catalog['entries'])} entries "
        f"({evidence_count} evidence, {counts['future']} future) into {DIST_PATH}"
    )


if __name__ == "__main__":
    main()
