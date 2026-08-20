# Catalog linked-content audit

Audited 2026-08-20. This review covered the 110 entries that remained after the initial pruning pass, other than Alice Crary, whose entry had already been corrected. It asks one question: does the linked page itself lead to substantial, publicly readable animal-welfare material, or does it mainly advertise an institution, author, program, book, or paywalled publication?

An index passes when it maps a real body of public material and links directly to it. A homepage fails when the useful material is absent, inaccessible, or only described.

## Results

| Result | Count |
| --- | ---: |
| Pass | 99 |
| Refine the primary link or highlights | 8 |
| Remove | 3 |
| **Total** | **110** |

## Refine the primary link or highlights

These sources contain useful material, but the current catalog link does not point readers or crawlers to it reliably.

| ID | Problem | Recommendation | Direct material |
| --- | --- | --- | --- |
| `josh-milburn` | The homepage foregrounds the author and books. The publications page is a useful index because it marks open-access work and links to full articles or accepted manuscripts. | Change the primary URL to the publications page and add a small set of open papers. | [Publications](https://josh-milburn.com/publications/); [Welcoming, Wild Animals, and Obligations to Assist](https://www.tandfonline.com/doi/full/10.1080/21550085.2023.2200730); [Sentientist Politics Gone Wild](https://journals.lub.lu.se/pa/article/view/18819) |
| `oxford-centre-for-animal-ethics` | The homepage is an institutional introduction, and the current Journal of Animal Ethics highlight mainly describes a separately published journal. The same domain does host full essays. | Change the primary URL to the commentary archive and replace the journal highlight with representative essays. | [Commentary archive](https://www.oxfordanimalethics.com/what-we-do/commentary/); [The Ethics of Rewilding](https://www.oxfordanimalethics.com/what-we-do/commentary/the-ethics-of-rewilding/); [Seeing Creatures through God’s Eyes](https://www.oxfordanimalethics.com/what-we-do/commentary/seeing-creatures-through-gods-eyes/) |
| `the-disagreement-theorem` | The Substack says “Coming Soon” and has no posts. A separate personal site contains the animal-welfare economics essay the entry appears to describe. | Replace the empty publication with the essay. One essay does not justify presenting this as a publication archive. | [A quick economic model of humane meat consumption](https://tejassubramaniam.github.io/blog/free-range/) |
| `africa-network-for-animal-welfare` | The homepage is mostly program descriptions, event promotion, activity updates, and fundraising. ANAW separately publishes substantial regional magazines. | Use a recent magazine as the primary link and another issue as a highlight. The archive is useful for humans but returned `406` to a direct automated request, while the issue PDFs returned `200`. | [January–June 2025 issue](https://www.anaw.org/AnimalWelfareMagazines/Animal_Welfare_Magazine_January_to_June_2025.pdf); [January–June 2024 issue](https://www.anaw.org/AnimalWelfareMagazines/Animal_Welfare_Magazine_January_to_June_2024.pdf); [magazine archive](https://www.site.anaw.org/index.php/resources-and-media-centre/animal-welfare-magazines) |
| `animal-welfare-and-antimicrobial-use` | The LSHTM project page is bot-restricted and is not the research itself. The catalog annotation promises more than the linked page exposes. | Replace it with a direct open review of welfare and antimicrobial use; retain the LSHTM thesis as a complementary treatment of smallholder farms and policy tradeoffs. | [Systematic review](https://pmc.ncbi.nlm.nih.gov/articles/PMC9032364/); [LSHTM thesis and download](https://researchonline.lshtm.ac.uk/id/eprint/4675731/) |
| `marina-bolotnikova` | The Substack root contains very little of the journalist’s animal-welfare work. Most of that body of work was published elsewhere. | Present this as selected reporting: use the substantive Substack essay as the primary link and add a few reported articles, rather than implying that the Substack is a large archive. | [Ridglan Farms beagle rescue](https://mbolotnikova.substack.com/p/ridglan-mass-rescue-beagles-wisconsin-research); [Factory farming and human progress](https://www.vox.com/future-perfect/363550/factory-farming-human-progress-sustainable-food-movement); [Veterinarians and factory farming](https://www.vox.com/future-perfect/23516639/veterinarians-avma-factory-farming-ventilation-shutdown) |
| `asia-for-animals-coalition` | The coalition homepage describes the network. Its useful material is in issue-specific pages, guidelines, and external directories. | Change the primary URL to the Dog and Cat Coalition resource page and highlight its humane population-management guidelines. This preserves scarce Asian context without treating the member directory as substantive reading. | [Dog and Cat Coalition](https://www.asiaforanimals.com/dacc); [Guidelines on Humane Response to Dog Population Issues in Indonesia](https://drive.google.com/file/d/1ll2knbqYcXI13zEAsGKR4XG5_ASTVIHP/view) |
| `jeff-sebo` | The homepage is an author page. The research index is materially better: it provides substantial abstracts and direct links to many public final or penultimate drafts. | Change the primary URL to the research index and add representative public manuscripts. | [Research](https://jeffsebo.net/research/); [The Moral Problem of Other Minds](https://www.pdcnet.org/8525737F00588A37/file/EFC5EAC268901C888525831A004EE75B/$FILE/harvardreview_2018_0025_0000_0057_0076.pdf); [Moral Circle Explosion](https://jeffsebo.net/wp-content/uploads/2022/09/jeff-sebo-moral-circle-explosion.pdf) |

## Remove

These three removals were applied to the catalog on 2026-08-20.

| ID | Finding | Recommendation |
| --- | --- | --- |
| `zuri` | `zuri.media` is now an unrelated web-design and digital-marketing agency in Botswana and Namibia. No animal-welfare publication remains at the catalog URL. | Remove. |
| `insect-welfare-and-ethics-open-database` | The OSF page returns a generic sign-in shell and both the node and registration APIs return `404 Not found`. The active successor is the [Insect Welfare Research Society research library](https://www.insectwelfare.com/research-library), already represented by another catalog entry. | Remove the dead duplicate; update the existing IWRS entry if necessary. |
| `spca-international` | The root is principally rescue promotion and fundraising. The public educational archive is mostly brief, dated pet-care advice and does not support the catalog’s claim of a substantial international evidence source. AVMA already supplies stronger companion-animal welfare material. | Remove. |

## Notable passes

These initially looked similar to the Alice Crary case but survived inspection.

| ID | Finding | Follow-up |
| --- | --- | --- |
| `massey-animal-welfare-science-and-bioethics-centre` | The centre page directly explains six research questions, summarizes concrete studies, and links to numerous open papers. It is a substantive map, not merely an institutional biography. | Keep. Replace the opaque current highlight label with [The 2020 Five Domains Model](https://www.mdpi.com/2076-2615/10/10/1870). |
| `shadow-price` | Substack’s root-page extraction hides the posts, but full public articles exist and are squarely about animal-welfare economics. | Keep. Add [UK NIMBYism Is Bad for Chickens](https://shadowprice.substack.com/p/uk-nimbyism-is-bad-for-chickens) as a highlight. |
| `animal-ethics` | The site exposes a large, structured, full-HTML library on sentience, speciesism, wild-animal suffering, and future impacts. | Keep. |
| `ufaw-animal-welfare-knowledge-hub` | This is a focused scientific knowledge base rather than a promotional shell. Current automated requests receive `403`, which is an access-monitoring problem, not a linked-content mismatch. | Keep for now; let the link checker continue to flag access. |

## Pass appendix

All 99 passing entries are listed below. The four notable passes discussed above appear here as well.

### Sentience and moral consideration (18)

- Andy Masley
- Animal Consciousness
- Animal Studies Journal
- Between the Species
- Bold Reasoning with Peter Singer
- duck dive
- Good Thoughts
- Moral Circulation
- Moral Law Within
- New York Declaration on Animal Consciousness
- On the Vedge
- Relations: Beyond Anthropocentrism
- Searching for Animal Sentience
- Sentience Institute
- Sentience Research
- Shadow Price
- Slightly Tofu
- The Abolitionist Approach

### Welfare science and measurement (6)

- Animal Welfare
- Animal Welfare Foundation
- Animals
- Frontiers in Veterinary Science — Animal Behavior and Welfare
- Massey Animal Welfare Science and Bioethics Centre
- UFAW Animal Welfare Knowledge Hub

### Scale and global data (4)

- Animal Welfare at Our World in Data
- FAOSTAT and fisheries statistics
- Faunalytics research library
- International Livestock Research Institute

### Farmed animals (13)

- Animal Ask
- Animal Justice Project
- Animal Outlook
- Coefficient Giving farm animal welfare newsletter
- Good Food Institute
- Inside Animal Ag
- New Harvest
- Open Philanthropy — Farm Animal Welfare
- Pax Fauna
- RSPCA Welfare Standards
- Sentient Media
- The Vegan Strategist
- Welfare Footprint Project

### Aquatic animals (14)

- Animal Welfare Observatory
- Aquatic Life Institute
- Crustacean Compassion
- Fish Welfare Initiative
- Fishcount
- FishEthoGroup
- Insect Welfare Research Society
- MSD Veterinary Manual: Fish
- Rethink Priorities — Animal Welfare
- Rethinking insects as alternative protein
- Sea Around Us
- Shrimp Welfare Project
- The welfare of farmed Nile tilapia
- WOAH Aquatic Animal Health Standards

### Wild animals (3)

- Bentham’s Newsletter
- Wild Animal Initiative
- Wild Animal Welfare Committee

### Companion and working animals (1)

- AVMA Animal Welfare

### Animals used in research (9)

- Canadian Council on Animal Care Handbooks
- EU Animals in Science and ALURES
- EURL ECVAM
- Medical Research Modernization Committee
- NC3Rs
- PREPARE Guidelines
- Tox21
- USDA Animal Welfare Information Center
- Welfare Assessment for Laboratory Animals

### Law and public policy (11)

- Animal Law Review
- Animal Legal & Historical Center
- Animal Legal Defense Fund
- Animal Policy International
- Brooks Institute
- Global Animal Law
- Harvard Animal Law & Policy Program
- Nonhuman Rights Project
- The European Institute for Animal Law & Policy’s Newsletter
- World Animal Impact Index
- World Federation for Animals

### Advocacy and social change (14)

- Animal Advocacy Careers
- Animal Charity Evaluators
- Animal Think Tank Newsletter
- Better Life, Better World
- CAFT
- Capital x Welfare
- DawnWatch
- Effective Altruism Forum — Animal Welfare
- RP Strategic Animal Insights
- Sandcastles Blog
- Sentientism
- Special Interests
- The Simple Heart
- We Animals

### Possible futures (6)

- Animal Ethics
- Animal Welfare Alignment Newsletter
- Center for Reducing Suffering
- Fifth Industrial
- Shot on Goal
- The Hedonistic Imperative
