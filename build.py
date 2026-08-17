#!/usr/bin/env python3
"""Build the dependency-free static State of Animal Welfare site."""

from __future__ import annotations

import csv
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
    ("global", "Global scale"),
    ("sentience", "Sentience and moral status"),
    ("farmed", "Farmed-animal welfare"),
    ("aquatic", "Aquatic animals"),
    ("wild", "Wild-animal welfare"),
    ("research", "Animals used in research"),
    ("future", "Possible futures"),
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
            raise ValueError(f"non-HTTPS primary URL for {entry['id']}")
        ids.add(entry["id"])
        domains.add(entry["domain"])


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
        "> Evidence about animal welfare and sentient experience.",
        "",
        "## Selected sources",
        "",
    ]
    category_titles = dict(CATEGORIES)
    current_category = None
    for entry in catalog["entries"]:
        if entry["category"] != current_category:
            if current_category is not None:
                lines.append("")
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
        "User-agent: *\nAllow: /\n",
        encoding="utf-8",
    )
    print(
        f"Built {len(catalog['entries'])} entries "
        f"({evidence_count} evidence, {counts['future']} future) into {DIST_PATH}"
    )


if __name__ == "__main__":
    main()
