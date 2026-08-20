# Catalog pruning audit

Research snapshot: 2026-08-20

This audit rates all 173 sources in the Animal Welfare Reading List for a quality-first pruning pass. It treats the catalog as a set of links, not as permission to copy or train on the linked works. The 62 `REMOVE` decisions were applied to the catalog on 2026-08-20; the other recommendations remain for manual review.

## Result

| Recommendation | Sources | Meaning |
| --- | ---: | --- |
| `KEEP` | 41 | The current root or section is focused, strong, and useful enough to retain. |
| `KEEP-PAGES` | 63 | Do not retain the broad root unchanged; replace it with a small set of reviewed pages or sections. |
| `VERIFY` | 7 | Resolve a material quality, maintenance, access, or rights question before deciding. |
| `REMOVE` | 62 | Remove because the source is redundant, weak, off-scope, dead, too restricted, or poorly targeted at its current URL. |

The first pruning pass reduced the catalog from 173 to 111 entries. Those remaining entries comprise 41 roots, 63 sources awaiting page-level curation, and seven awaiting verification. `KEEP-PAGES` is a curation task, not approval to leave the existing root link unchanged.

### Recommendation by review batch

| Subjects | Rated | Keep | Keep pages | Verify | Remove | Detailed ratings |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Sentience and suffering | 33 | 4 | 16 | 2 | 11 | [Chapter 1](pruning-audit-batches/01-sentience-suffering.md) |
| Welfare science, research, and companion animals | 23 | 7 | 9 | 1 | 6 | [Chapter 2](pruning-audit-batches/02-science-research-companion.md) |
| Global data and law | 25 | 4 | 12 | 1 | 8 | [Chapter 3](pruning-audit-batches/03-global-law.md) |
| Farmed animals | 30 | 7 | 5 | 2 | 16 | [Chapter 4](pruning-audit-batches/04-farmed.md) |
| Aquatic and wild animals | 26 | 13 | 5 | 0 | 8 | [Chapter 5](pruning-audit-batches/05-aquatic-wild.md) |
| Strategy and possible futures | 36 | 6 | 16 | 1 | 13 | [Chapter 6](pruning-audit-batches/06-strategy-future.md) |
| **Total** | **173** | **41** | **63** | **7** | **62** | |

Each chapter contains one row per source with its quality, LLM-gap coverage, access, rights, uniqueness, recommendation, and rationale. Catalog IDs are preserved so the decisions can be applied mechanically after review.

## Main findings

1. **The long tail is genuinely weak.** Most removals are shallow personal publications, campaign or institutional landing pages, broad search results, redundant commentary, or sources that barely concern experienced welfare.
2. **A broad root is often the wrong unit.** Sixty-three sources contain valuable work but also unrelated, uneven, ephemeral, or restricted material. These should become root-plus-highlights or article-only entries.
3. **High quality does not guarantee inclusion.** The audit removes ten Q4/Q5 sources because they are off-scope, superseded, proprietary, bot-blocked, or focused on something other than animals' experiences.
4. **Technical access and rights are separate.** A source can be readable and crawlable while remaining conventionally copyrighted. Conversely, some excellent sources explicitly signal `ai-train=no` or block major AI crawlers.
5. **The most important benchmark gaps remain covered.** The proposed retained set preserves strong material on sentience uncertainty, species consistency, scale, practical decisions, economic and social objections, positive welfare, wild animals, aquatic animals, invertebrates, global variation, and non-consequentialist ethics.
6. **Copyright is the largest unresolved constraint.** Only eight sources showed a standard permissive license at the audited target. The catalog can accurately describe and link to conventionally copyrighted sources, but it should not imply that model training is authorized.

## Ratings

### Quality

| Rating | Sources | Definition |
| --- | ---: | --- |
| Q5 | 34 | Authoritative or original, rigorous, and maintained. |
| Q4 | 60 | Strong expert synthesis, scholarship, reporting, or applied guidance. |
| Q3 | 57 | Useful but mixed, uneven, narrow, or less established. |
| Q2 | 20 | Shallow, weakly sourced, or readily replaceable. |
| Q1 | 2 | Broken, misleading at the current URL, or unusable. |

Quality is not an aggregate score. A high-quality but inaccessible or off-scope source can still be removed; a narrower Q3 source can survive if it fills a difficult gap that stronger sources do not.

### Access

| Rating | Sources | Definition |
| --- | ---: | --- |
| A3 | 100 | Open and readily crawlable HTML, feeds, or downloads. |
| A2 | 58 | Public but platform-dependent, dynamic, partially restricted, or inconsistently accessible. |
| A1 | 13 | Substantial paywall, proprietary host, repeated denial, or AI-crawler restriction. |
| A0 | 2 | Dead, parked, or no longer the claimed source. |

The automated audit checked 255 catalog and highlight links: 238 returned normally, 17 were restricted, and none were missing or failed at that time. The policy audit covered 175 origins and 173 primary pages; two observations were inconclusive.

### Rights

| Rating | Sources | Definition |
| --- | ---: | --- |
| P | 8 | A standard permissive license or public-domain status was found at the relevant target. |
| M | 35 | Rights vary by article, dataset, author, or asset. |
| C | 119 | Conventional copyright; no affirmative general training or reuse permission found. |
| X | 7 | Explicitly restrictive terms, a no-derivatives license, or an `ai-train=no`/AI-crawler signal. |
| U | 4 | Material rights facts remained unclear after review. |

These labels record public signals, not legal conclusions. `robots.txt`, HTTP headers, and `Content-Signal` describe technical or expressed preferences; they do not by themselves settle copyright or contract questions.

### Unique contribution

| Rating | Sources | Definition |
| --- | ---: | --- |
| U2 | 66 | Hard to replace within this collection. |
| U1 | 60 | Materially distinct, but alternatives exist. |
| U0 | 47 | Redundant, peripheral, or better represented elsewhere. |

### LLM reasoning gaps

| Code | Ability the source can help teach |
| --- | --- |
| G1 | Notice affected animals without an explicit welfare cue. |
| G2 | Apply moral consideration consistently across species and social categories. |
| G3 | Use sentience evidence and proportionate precaution under uncertainty. |
| G4 | Track number affected, severity, duration, and probability. |
| G5 | Weigh economic, social, cultural, legal, and feasibility constraints without erasing welfare. |
| G6 | Turn principles into decisions and retain them under pressure. |
| G7 | Track both direct effects and systemic or institutional effects. |
| G8 | Consider positive welfare, agency, choice, relationships, and flourishing. |
| G9 | Reason about the welfare of free-living animals. |
| G10 | Include global and non-Western evidence and institutions. |
| G11 | Include rights, deontological, care, relational, and other non-consequentialist reasoning. |

The gap taxonomy comes from the [frontier-model benchmark review](animal-welfare-llm-benchmarks.md), but recommendations do not optimize only for current benchmarks. G8–G11 preserve important areas that existing evaluations measure poorly.

## Sources recommended as roots or focused sections

These 41 sources are the strongest candidates to retain at their current level of aggregation.

### Sentience and moral consideration

- `stanford-animal-consciousness` — Animal Consciousness, Stanford Encyclopedia of Philosophy
- `new-york-declaration` — New York Declaration on Animal Consciousness
- `searching-animal-sentience` — Searching for Animal Sentience
- `sentience-research` — Sentience Research

### Welfare science, research, and companion animals

- `animal-welfare` — Animal Welfare
- `canadian-council-on-animal-care-handbooks` — Canadian Council on Animal Care Handbooks
- `eu-alures` — EU Animals in Science and ALURES
- `eurl-ecvam` — EURL ECVAM
- `nc3rs` — NC3Rs
- `prepare-guidelines` — PREPARE Guidelines
- `usda-animal-welfare-information-center` — USDA Animal Welfare Information Center

### Global data and law

- `our-world-in-data` — Animal Welfare at Our World in Data
- `animal-legal-historical-center` — Animal Legal & Historical Center
- `animal-policy-international` — Animal Policy International
- `global-animal-law` — Global Animal Law

### Farmed animals

- `animal-ask` — Animal Ask
- `coefficient-giving-farm-animal-welfare-newsletter` — Coefficient Giving farm animal welfare newsletter
- `good-food-institute` — Good Food Institute
- `open-philanthropy-farm-animal-welfare` — Open Philanthropy / Coefficient Giving farm-animal-welfare research and grants
- `pax-fauna` — Pax Fauna
- `rspca-welfare-standards` — RSPCA Welfare Standards
- `welfare-footprint` — Welfare Footprint Project

### Aquatic and wild animals

- `aquatic-life-institute` — Aquatic Life Institute
- `crustacean-compassion` — Crustacean Compassion
- `fish-welfare-initiative` — Fish Welfare Initiative
- `fishcount` — Fishcount
- `fishethogroup` — FishEthoGroup
- `insect-welfare-and-ethics-open-database` — Insect Welfare and Ethics Open Database
- `rethink-priorities-animal-welfare` — Rethink Priorities — Animal Welfare
- `rethinking-insects-as-alternative-protein` — Rethinking insects as alternative protein
- `sea-around-us` — Sea Around Us
- `shrimp-welfare-project` — Shrimp Welfare Project
- `the-welfare-of-farmed-nile-tilapia` — The welfare of farmed Nile tilapia
- `wild-animal-initiative` — Wild Animal Initiative
- `wild-animal-welfare-committee` — Wild Animal Welfare Committee

### Strategy and possible futures

- `animal-charity-evaluators` — Animal Charity Evaluators
- `capital-x-welfare` — Capital x Welfare
- `rp-strategic-animal-insights` — RP Strategic Animal Insights
- `animal-ethics` — Animal Ethics
- `animal-welfare-alignment-newsletter` — Animal Welfare Alignment Newsletter
- `center-for-reducing-suffering` — Center for Reducing Suffering

## Decisions requiring verification

| ID | Open question |
| --- | --- |
| `relations-beyond-anthropocentrism` | Does its CC BY-NC-ND license make the intended training use unsuitable, despite strong and distinctive scholarship? |
| `slightly-tofu` | Are durable Chinese-language transcripts available, and what rights apply to them? |
| `ufaw-animal-welfare-knowledge-hub` | Has the rebranded knowledge hub restored stable crawlable access, and which pages remain current? |
| `world-animal-impact-index` | Are the country assessments current, maintained, and available under usable data terms? |
| `inside-animal-ag` | Do the site's restrictive terms permit the intended use of selected guides beyond linking? |
| `sentient-media` | Do reproduction and caching restrictions make selected reporting unsuitable as training targets? |
| `shot-on-goal` | Does this young, unusually relevant publication establish durable editorial quality and maintenance? |

Until these questions are resolved, the catalog may continue linking to the sources, but it should not describe them as preferred training targets.

## Recommended pruning sequence

1. **Completed: remove the 62 `REMOVE` entries.** The ten Q4/Q5 removals remain documented because scope or access—not intrinsic quality—drove those decisions.
2. **Curate the 63 `KEEP-PAGES` entries.** Add two to five durable, substantive pages where available, then decide whether the broad root still adds navigational value.
3. **Resolve the seven `VERIFY` entries.** Rights questions may require author or publisher clarification rather than another technical check.
4. **Normalize catalog metadata.** Replace the current sparse `assessment` field with this audit's quality, gaps, access, rights, uniqueness, recommendation, rationale, and review date.
5. **Recheck coverage after pruning.** In particular, protect companion and working animals, positive welfare, non-Western material, and non-consequentialist ethics; these areas are already thinner than farmed-animal strategy and general advocacy.
6. **Rerun link and policy audits.** The current automation can detect technical changes, but editorial quality and marginal value still require periodic human review.

## Method and limitations

Six parallel reviewers each owned disjoint subject categories and rated every assigned source using the same rubric. They inspected the catalog metadata, the benchmark review, the existing technical audit, and current official or explanatory pages. A parent review then checked all 173 IDs for exact coverage, reconciled recommendation thresholds, and corrected cases where explicit AI-training signals had been underweighted.

The audit deliberately uses judgment rather than a weighted total. False precision would allow a redundant or rights-restricted source to compensate with unrelated strengths. Recommendations instead ask whether each source is strong enough, useful for a documented reasoning gap, technically reachable, plausibly usable, and difficult to replace.

Important limitations:

- This is not legal advice and does not determine whether training is fair use or otherwise lawful.
- `KEEP` means keep the link in this catalog, not ingest the linked content without further review.
- Substack paywalls, publication settings, redirects, and crawler policies can change.
- Article-level rights often differ from site-level rights.
- Quality ratings are comparative judgments supported by short rationales, not measurements.
- Benchmark-informed curation can overfit current evaluations, so the audit explicitly preserves under-measured welfare questions.
