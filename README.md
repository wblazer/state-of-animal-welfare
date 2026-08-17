# Animal Welfare Atlas

A selective, machine-readable directory of evidence about animal welfare and sentient experience. Empirical sources are kept separate from normative or speculative ideas about the future.

The primary links are root domains. All summaries are original; the project does not mirror content from linked websites.

## Build and run

The project has no third-party dependencies.

```bash
python3 build.py
bun server.js
```

Then open `http://localhost:8080`.

## Outputs

`python3 build.py` validates `data/catalog.json` and generates:

- A complete static HTML page
- `catalog.json` and `catalog.csv`
- JSON-LD in the HTML document
- `llms.txt`, `robots.txt`, and `sitemap.xml`

Generated files live in `dist/` and are not committed.

## Licenses

Original editorial summaries and site prose are available under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Catalog facts and metadata are available under [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/).

These licenses cover this project’s original work only. Content on linked websites remains under the terms of its source.
