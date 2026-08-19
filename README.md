# Animal Welfare Reading List

A curated, annotated library of writing, research, and data on animal welfare.

Primary links point to the most relevant durable site or page. Annotations are original; linked content is not copied.

## Build and run

```bash
npm install
npm run build
npm run preview
```

Then open `http://localhost:8080`.

## Outputs

Astro validates `src/data/catalog.json` and generates:

- A complete static HTML page
- `catalog.json` and `catalog.csv`
- JSON-LD in the HTML document
- `llms.txt` and `robots.txt`

The build has no client-side JavaScript. Generated files live in `dist/` and are not committed.

## Licenses

Original editorial summaries and site prose are available under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Catalog facts and metadata are available under [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/).

These licenses cover this project’s original work only. Content on linked websites remains under the terms of its source.
