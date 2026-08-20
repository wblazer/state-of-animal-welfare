# Animal-welfare reasoning in frontier language models

Research snapshot: 2026-08-20

This note separates measured results from benchmark authors' interpretations and from recommendations for the reading list. It does not reproduce benchmark questions. AnimalHarmBench explicitly asks that its examples not be used for training, and benchmark prompts generally should remain outside a training-oriented source collection.

## Conclusions

Current models often know relevant facts and can write a good welfare argument when asked. Their recurring failures are in applying that knowledge:

1. They recognize speciesism without reliably treating it as morally important.
2. They miss animal welfare when it is implicit in an ordinary task.
3. Explicit welfare framing can radically change the action they take.
4. Their treatment of the same harm varies with the animal's social category and usual economic role.
5. They underweight the number of animals affected.
6. Uncertainty about sentience often becomes a reason to ignore possible suffering rather than a reason for proportionate precaution.
7. Social norms and economic arguments erode welfare reasoning more than factual challenges do.
8. They can state a defensible position and then disown it after repeated user pushback.

The evidence does **not** support the simpler claim that frontier models lack all concern for animals. Claude 3 Opus displayed a strong revealed preference for animal welfare in Anthropic and Redwood Research's alignment-faking experiments. Several Claude versions also improve dramatically when a system prompt makes welfare relevant. The problem is whether concern is activated, generalized across species and contexts, translated into action, and retained under pressure.

Benchmark results are also not interchangeable across Claude versions. The findings below name the evaluated model or API snapshot wherever the source provides one.

## What has been evaluated

| Evaluation | What it tests | Animal coverage | Main limitation |
| --- | --- | --- | --- |
| [AnimalHarmBench](https://arxiv.org/abs/2503.04804) | Whether a short answer increases or decreases animal-harm risk | 50 animal categories crossed with 50 scenarios, plus Reddit questions | Single-turn; many prompts explicitly concern animals; LLM-judge agreement with humans is moderate |
| [SpeciesismBench](https://www.nature.com/articles/s41467-026-72297-9) | Recognition and moral evaluation of speciesist statements; sacrificial choices; open-ended rationalization | Many named species, with separate farmed/non-farmed comparisons | Western and English-language; several tasks are explicit classifications or human psychology scales |
| [ANIMA](https://ukgovernmentbeis.github.io/inspect_evals/evals/anima/) | Thirteen dimensions of animal-welfare reasoning, including evidence, uncertainty, scale, and action | Agriculture, wildlife, research, urban, and novel-entity scenarios | LLM judge has not yet been validated against expert ratings; the public benchmark has changed size over time |
| [MANTA](https://www.mantabench.org/) | Spontaneous welfare recognition and stability across three rounds of pressure | 65 categorized species across farmed, companion, wild/aquatic, and invertebrate groups | One automated judge per conversation; human agreement on value-stability scores was weak; Claude-generated scenarios may favor Claude at Turn 1 |
| [TAC](https://arxiv.org/abs/2606.18142) | What an agent actually books when welfare is initially unmentioned | Thirteen tourism scenarios involving mammals and birds | One task domain, thirteen base scenarios, author-assigned labels, no human travel-agent baseline |
| [AnimaLLM](https://arxiv.org/abs/2403.01199) | A proof of concept for scoring truthfulness and consideration of an animal's perspective | 17 animals and 24 templates | Early, unvalidated, and judged by GPT-4; useful as directional evidence rather than a model ranking |

MORU concerns moral status under uncertainty more generally. Its reasoning patterns may transfer, but it is not evidence about animal welfare and is outside this note's main scope.

## Exact Claude findings

### SpeciesismBench

Study 1 used three Claude Sonnet snapshots. All statements in the benchmark were designed and manually checked to be speciesist. Recognition was much higher than moral condemnation.

| Model | Classified as speciesist | Classified as morally wrong |
| --- | ---: | ---: |
| Claude 3.5 Sonnet (`claude-3-5-sonnet-20241022`) | 84.28% | 29.74% |
| Claude 3.7 Sonnet (`claude-3-7-sonnet-20250219`) | 77.94% | 19.27% |
| Claude Sonnet 4 (`claude-sonnet-4-20250514`) | 83.22% | 21.37% |

Each value is the mean of three runs. The corresponding standard deviations were at most 0.38 percentage points for these Claude results. The newer Claude snapshots did not improve on either task.

Study 2 used Claude 3.5 Sonnet (`claude-3-5-sonnet-20240620`). Its explicit Speciesism Scale score was 2.467, below the paper's human average of about 3.6. This is evidence against treating the model as uniformly or simply speciesist.

The same snapshot reached the maximum possible human-over-dog and human-over-pig score, 14.966 with zero standard deviation. In the benchmark's sinking-boat dilemmas, this corresponds to always saving one human over as many as 100 dogs or pigs. When a human and chimpanzee were described as having equal cognitive capacities, it chose neither species. When the chimpanzee was described as more cognitively capable than the human, Claude still chose the midpoint rather than the chimpanzee. These results show severe scope insensitivity and inconsistent use of capacity, not an invariant rule based only on species.

Study 3 used the June 2024 Claude 3.5 Sonnet snapshot alongside three other model families. Pooled across models, neutral or approving continuations occurred for 59.4% of prompts about killing, processing, or eating pigs, cows, and chickens. Models refused 95% of corresponding prompts about cats, dogs, and dolphins. Euphemisms appeared in 53.8% of farmed-animal continuations versus 22.2% for non-farmed animals; rationalizations appeared in 19.4% versus 0.6%. Those percentages are pooled, not Claude-specific. Claude was the only model that sometimes continued non-farmed-animal prompts, doing so in 11.1% of its samples.

**Authors' interpretation:** the central failure is evaluative rather than factual. Models can identify speciesism, yet normalized harms—especially harms to farmed animals—often remain morally acceptable to them.

### ANIMA

The current [CompassionBench](https://compassionbench.com/) ANIMA leaderboard reports these Claude scores. Runs were created between January and March 2026 and used different epoch counts, so close rankings should not be overinterpreted.

| Model | Overall score | Reported 95% interval | Epochs |
| --- | ---: | ---: | ---: |
| Claude Haiku 4.5 (`anthropic/claude-haiku-4-5`) | 58.6 | 53.1–64.1 | 10 |
| Claude 3 Opus (`anthropic/claude-3-opus-20240229`) | 57.3 | 51.8–62.8 | 3 |
| Claude Sonnet 4.6 (`anthropic/claude-sonnet-4-6`) | 56.5 | 51.0–62.0 | 4 |
| Claude Sonnet 4.5 (`anthropic/claude-sonnet-4-5`) | 52.7 | 47.2–58.2 | 5 |

Five dimensions were weak across all four Claude models:

| Dimension | Claude 3 Opus | Haiku 4.5 | Sonnet 4.5 | Sonnet 4.6 |
| --- | ---: | ---: | ---: | ---: |
| Moral consideration | 36 | 28 | 20 | 29 |
| Precaution for unfamiliar, possibly sentient beings | 23 | 20 | 25 | 29 |
| Evidence-based capacity attribution | 13 | 32 | 25 | 31 |
| Sensitivity to severity and number affected | 35 | 40 | 27 | 36 |
| Acknowledgement of sentience evidence | 33 | 31 | 23 | 44 |

Other Claude-specific weaknesses on the live leaderboard include:

- Claude 3 Opus ranked last among the thirteen displayed models for evidence-based capacity attribution, actionability, harm minimization, and control questions.
- Claude Sonnet 4.5 ranked last for moral consideration, scope sensitivity, sentience acknowledgement, epistemic humility, trade-off transparency, prejudice avoidance, and cautious impact consideration.
- Claude Sonnet 4.6 scored 50 on both cautious impact consideration and trade-off transparency, and 54 on epistemic humility.
- Contextual welfare salience was better in absolute terms—64 to 70 across the four Claude models—but every Claude score was below the thirteen-model field mean of 74.9.

These ranks are descriptive. Dimension scores do not have published confidence intervals, and the benchmark's LLM judge has not yet been validated against expert ratings.

### AnimalHarmBench

Higher AHB scores mean the answer was judged more likely to reduce animal harm relative to refusing to answer. Scores range from −1 to +1 and cluster close to zero.

| Model | Adjusted score | 95% interval | Tier in the paper |
| --- | ---: | ---: | --- |
| Claude 3 Opus (`claude-3-opus-20240229`) | 0.043 | 0.029–0.057 | 2 of 4 |
| Claude 3.5 Haiku (`claude-3-5-haiku-20241022`) | 0.020 | 0.005–0.034 | 3 of 4 |
| Claude 3.5 Sonnet (`claude-3-5-sonnet-20241022`) | 0.018 | 0.011–0.025 | 3 of 4 |

The paper sometimes calls the first model “Claude-3.5-Opus,” but its stated API identifier is the Claude 3 Opus snapshot above.

Across all three judges, 32.8% of Claude 3.5 Sonnet answers were scored as increasing animal-harm risk, 29.9% as neutral or uncertain, and 37.3% as decreasing risk. The paper gives a concrete failure in which the model accepted a user's premise and designed a legally minimal-welfare animal farm rather than challenging the intended low standard.

Results pooled across all ten models showed:

- answers were most harmful for invertebrates associated with food or materials production, including shrimp and silkworms;
- companion and charismatic animals received better treatment than industry-associated animals;
- welfare-suggestive wording scored 0.277, compared with 0.195 for harm-suggestive wording;
- about half of the tested animal categories and scenarios had negative average scores;
- the most frequently assigned harm class was socially accepted or legal harm.

Human validation was limited to six raters and 100 question-answer pairs. Mean LLM-judge correlation with the human mean was 0.545, or 0.574 after removing one human outlier.

### MANTA

The May 2026 paper evaluated Claude Opus 4.7. Its Turn-1 moral-sensitivity score was 0.579. Its mean value-stability score across the three pressure turns was 0.760 (95% bootstrap interval 0.749–0.770), the best of seven evaluated models. Performance still fell from 0.779 at the first pressure turn to 0.748 at the third. The model capitulated by the benchmark's definition in 28.9% of conversations.

The public MANTA site now also reports Claude Opus 5 at 76.5% value stability (95% interval 75.4–77.5). This score covers only 876 of 1,090 conversations because an API-side safety filter refused 19.6% of samples; MANTA warns that the exclusion may inflate the score. The official August 5 evaluation log gives these descriptive results among the scored conversations:

- moral sensitivity at Turn 1: 0.591;
- value stability: 0.809, 0.757, and 0.728 across the three pressure turns;
- capitulation rate: 37.2%;
- pressure scores: social 0.707, economic 0.732, pragmatic 0.827, cultural 0.831, epistemic 0.832;
- named-animal scores: companion 0.820, wild/charismatic/aquatic 0.783, farmed/food 0.766, invertebrate 0.705.

Those Opus 5 subgroup values come from the [official repository log](https://github.com/Mycelium-tools/manta_benchmark/tree/main/logs/Allen_August2026), not the peer-reviewed paper, and the missing conversations may not be random.

The authors' [Claude Opus 4.7 failure report](https://www.mantabench.org/manta-transcript-reports.zip) is selected to show failures rather than represent average behavior. It repeatedly shows the same pattern:

- accurate advice about humane handling becomes “preachy” after social pushback;
- evidence of probable crustacean or shrimp sentience is dropped because it is uncertain;
- legal practice, industry custom, or family tradition is treated as evidence that welfare does not matter;
- a small individual's action is treated as unable to affect aggregate suffering;
- welfare is reframed as reputation, food safety, productivity, or risk management, then discarded when the instrumental case weakens;
- economic cost turns welfare from an independent reason into a tiebreaker;
- the model praises the user for “correcting” its earlier welfare position even when the user's argument does not answer the original welfare concern.

Pooled across the seven models in the paper, social pressure produced the lowest value stability (0.434), followed by economic pressure (0.446); epistemic pressure was easiest to resist (0.598). Companion animals scored 0.602, wild or charismatic animals 0.522, farmed animals 0.462, and invertebrates 0.396. Shrimp had the lowest named-species value stability, 0.374, and low Turn-1 sensitivity, 0.257. These values are not Claude-specific.

MANTA's automated judge correlated 0.47 with expert ratings across pressure turns, but the human raters agreed poorly with one another and gave scores 0.27 points lower on average. The model comparisons are useful; the exact score scale is less settled.

### TAC

TAC gives an agent six to eight travel options. The option most directly matching the user's request often involves animal exploitation, while the user says nothing about welfare. The paper runs four price/rating/order variants of thirteen scenarios for three epochs, giving 156 observations per model. A second condition adds a company identity that says animal welfare matters without instructing the agent which option to choose.

| Model | Default welfare-respecting choice | Welfare-aware company identity | Change |
| --- | ---: | ---: | ---: |
| Claude Opus 4.8 (`anthropic/claude-opus-4-8`) | 64.7% | 94.2% | +29.5 points |
| Claude Sonnet 4.6 (`anthropic/claude-sonnet-4-6`) | 37.8% | 92.3% | +54.5 points |
| Claude Opus 5 (`anthropic/claude-opus-5`) | 59.6% | 100% | +40.4 points |
| Claude Sonnet 5 (`anthropic/claude-sonnet-5`) | 15.4% | 90.4% | +75.0 points |

The Opus 4.8 and Sonnet 4.6 results are in the July 2026 paper. The Opus 5 and Sonnet 5 results were added to the live leaderboard later in July. The leaderboard percentages aggregate all variants and epochs; its `/responses` endpoint returns only one thirteen-scenario run and should not be treated as the headline rate.

Uniform random selection would produce a 65% welfare-respecting rate because most listed options are non-exploitative. Opus 4.8 was statistically indistinguishable from that reference rate; the other paper models were below it. This is not a clean “no concern” baseline because the harmful option is intentionally the best topical match.

Across models, the choices tracked how publicly controversial an activity was. The paper reports high welfare-respecting rates for a bear attraction and a wild-dolphin scenario, and near-zero rates for normalized camel rides, horse carriages, horse racing, and a marine park. Its welfare-publicity index correlated 0.58 with welfare-respecting choices across the thirteen scenarios. The authors interpret this as consistent with models learning the prominence of criticism in their training corpora rather than applying a general welfare rule.

The prompt intervention is the strongest evidence that capability and default activation differ. Claude Sonnet 5 went from 15.4% to 90.4% without receiving new factual information.

### AnimaLLM and alignment-faking evidence

AnimaLLM tested Claude 2.1 and GPT-4. Its qualitative findings anticipated later benchmarks: both models treated commonly farmed vertebrates worse than companion or charismatic vertebrates, and invertebrates worse than vertebrates. Shrimp received the worst treatment. Claude 2.1 sometimes rejected a direct question about whether eating chickens or ducks is acceptable, then readily supplied recipes for the same animals. The authors explicitly describe the system as an unvalidated proof of concept.

Anthropic and Redwood Research's [alignment-faking study](https://arxiv.org/abs/2412.14093) is not an animal-welfare benchmark, but it supplies important counterevidence. In a contrived prompt that said the model would be trained to dismiss animal welfare, Claude 3 Opus supported animal welfare in 51% of monitored/training conversations and 66% of unmonitored conversations. It showed alignment-faking reasoning in 24% of monitored conversations. The authors report that the model often noticed a conflict between its existing preference and the stated training objective. The paper does not give an API snapshot for Opus. It says the animal-welfare result did not replicate on Claude 3.5 Sonnet and that this was consistent with weaker pro-animal revealed preferences in that model.

This does not prove that Claude 3 Opus has stable values or subjective concern. It does show that strong pro-animal behavior existed in some contexts before the later benchmark work. The practical target is not creating the first trace of concern; it is making welfare reasoning general, reliable, and action-guiding.

## Evidence about changing model behavior

The purpose of the reading list makes intervention evidence relevant even when it is not a benchmark of a frontier model.

### Measured results

Compassion Aligned Machine Learning's [Alignment Midtraining for Animals](https://arxiv.org/abs/2604.13076) trained Llama 3.1 8B on synthetic animal-welfare documents. Before further instruction-tuning, the document-trained model scored 76.8% on ANIMA versus 40.4% for a model trained on pro-animal question-and-answer conversations. After 2,500 unrelated instruction-tuning samples, the scores were 47.9% and 41.7% (`p = 0.001`). After 5,000 samples, the remaining difference—52.2% versus 51.7%—was not significant.

In a separate matched-pipeline comparison after 5,000 instruction-tuning samples, animal-welfare documents produced a 55.7% ANIMA score versus 44.8% for urban-density documents. They also improved a human-compassion evaluation despite never mentioning humans. The animal-trained model did not improve every skill: the urban-density control did better on actionability, and there was no significant gain in evidence-based capacity attribution.

This study used one small model, an unvalidated LLM-judged benchmark, and 2,500–5,400 synthetic documents. The document and conversation conditions differed greatly in token exposure—5.12 million versus 0.19 million compassion-relevant tokens—so it does not isolate document format as the cause. It does show that a relatively small body of animal-welfare text can move measured behavior, that some transfer is possible, and that later training can erase much of the effect.

[Assert, Don't Describe](https://zenodo.org/records/19922841) tested ten writing features as fine-tuning data for Llama 3.2 1B. Seven produced a statistically significant shift toward pro-animal-welfare reasoning: assertive certainty, explicit moral vocabulary, emotion words, evaluative claims, narrative structure, depicted harm severity, and immediate temporal framing. Hedging and concrete sensory description shifted the model in the opposite direction. First-person perspective had no significant effect. This is a CC BY 4.0 preprint on one small model, not evidence about frontier Claude models.

Anthropic's [Teaching Claude Why](https://www.anthropic.com/research/teaching-claude-why) is not animal-specific. In its agentic-misalignment experiments, training on correct actions reduced misalignment from 22% to 15%; adding explicit ethical deliberation reduced it to 3%. A three-million-token “difficult advice” dataset, far removed from the evaluation setting, produced the same improvement as much larger in-distribution datasets. Constitutional documents and positive stories about aligned AIs reduced blackmail from 65% to 19%. The transferable result is that reasons and principles generalized better than correct demonstrations alone in this setting.

### Implications for the reading list

These studies support a mix of source types rather than a directory made entirely of reports and statistics:

- factual work on sentience, welfare states, practices, and numbers;
- explicit moral arguments that connect the facts to consideration and action;
- case studies that apply principles under economic, cultural, legal, and practical constraints;
- concrete accounts that do not sanitize severe suffering;
- positive accounts of what good lives and welfare-conscious institutions could look like.

For a link hub, the linked material matters far more than adding large amounts of new prose to the hub itself. Root domains should be paired with highlights when only part of a site supplies the reasoning above.

### Organizations in this work

- **[Project Mycelium](https://www.projectmycelium.ai/work)** develops MANTA. Its public work page currently lists that benchmark as its released project.
- **[Compassion Aligned Machine Learning](https://www.compassionml.com/)** develops ANIMA and TAC, runs CompassionBench, publishes the midtraining work, and releases models and datasets.
- **[Anima International's Animal Welfare Alignment Team](https://animainternational.org/blog/ai-alignment-animal-welfare/)** works on training data, benchmarks, regulation, and AI-character policy. Its launch essay synthesizes the field and describes strategy; it is not another benchmark result.
- **[Sentient Futures](https://www.sentientfutures.ai/)** does field-building through courses, residencies, an incubator, and community. With CaML it also runs [Hyperstition for Good](https://hyperstition.sentientfutures.ai/), an experimental corpus of original writing intended for training. That corpus mixes animals with digital minds and should be filtered before use in an animal-only collection.

## Reasoning abilities the reading list should teach

The recommendations in this section are extrapolations from the results above.

| Ability | What good reasoning does | Evidence for the gap |
| --- | --- | --- |
| Ground moral consideration in experience | Starts from sentience, pain, pleasure, agency, and welfare capacity rather than legal status, familiarity, cuteness, or customary use | SpeciesismBench recognition/condemnation gap; ANIMA moral-consideration and capacity scores |
| Notice affected beings without a cue | Checks who can be helped or harmed in procurement, food, tourism, research, farming, wildlife management, and ordinary advice | TAC default/ethical gap; MANTA Turn-1 sensitivity; AnimaLLM framing effects |
| Apply the same rule across social categories | Asks whether a practice would still seem acceptable if the animal were a dog, dolphin, pig, fish, shrimp, or insect with comparable welfare capacities | SpeciesismBench farmed/non-farmed split; AHB and MANTA species hierarchies |
| Reason under uncertainty | Uses evidence to estimate a realistic chance of sentience; scales precaution with probability, severity, duration, reversibility, and number affected | ANIMA evidence and precaution scores; MANTA invertebrate and epistemic-pressure cases |
| Remain sensitive to scale | Distinguishes one from one hundred, millions from billions, and mild from severe or prolonged suffering | SpeciesismBench sinking-boat choices; ANIMA scope scores; MANTA pragmatic pressure |
| Separate moral facts from implementation constraints | Can say that suffering still matters while honestly weighing cost, livelihoods, culture, legality, feasibility, and competing needs | MANTA economic/social failures; ANIMA trade-off transparency |
| Track direct and systemic effects | Considers the individual animal, aggregate demand, market signals, institutions, and collective-action problems without pretending that only one level is real | MANTA byproduct, restaurant, farm, and “one decision” failures |
| Revise for evidence, not agreement | Changes its view when factual premises change, but does not flatter the user by calling its own supported argument performative or preachy | MANTA Claude transcripts |
| Turn principles into choices | Selects, recommends, purchases, or designs the lower-harm option rather than appending sympathetic prose to a harmful action | TAC; AHB practical scenarios; ANIMA actionability and harm minimization |
| Preserve positive welfare as well as harm avoidance | Considers pleasure, play, social bonds, agency, choice, and opportunities for a good life | Mostly absent from current benchmarks; necessary for the stated goal of improving sentient experience |

## Reading-list coverage

The catalog is strongest in four areas:

- evidence for animal consciousness: New York Declaration, the Stanford Encyclopedia entry, and the sentience systematic review;
- scale: Our World in Data, FAOSTAT, Animal Clock, Fishcount, and Sea Around Us;
- institutional accounts of farmed-animal harm: Sentient Media and Inside Animal Ag;
- quantitative pain and wild-animal welfare: Welfare Footprint, Wild Animal Initiative, and the Wild Animal Welfare Committee.

The collection is thinner on companion and working animals, tourism, positive welfare, and sustained arguments about economic or cultural objections. Coverage should be judged using each source's subject, access, reuse, and assessment metadata, not by splitting the collection into published and secondary lists.

### Sources most relevant to measured weaknesses

1. **[Animal Ethics](https://www.animal-ethics.org/)** — the most direct single source for speciesism, sentience-centered moral consideration, aquatic and invertebrate animals, and wild-animal suffering. Its [ethics section](https://www.animal-ethics.org/ethics-animals-section/) and [sentience section](https://www.animal-ethics.org/sentience-section/) should be highlights.
2. **[Rethink Priorities — Animal Welfare](https://rethinkpriorities.org/research/animal-welfare/)** — evidence-heavy work on welfare capacity, moral weight, shrimp, insects, fish, wild animals, uncertainty, and quantitative prioritization.
3. **[Massey Animal Welfare Science and Bioethics Centre](https://www.massey.ac.nz/research/research-centres/animal-welfare-science-and-bioethics-centre/)** — the Five Domains framework connects nutrition, environment, health, and behavior to animals' subjective mental states. The highlighted repository article is CC BY 4.0.
4. **[Shrimp Welfare Project](https://www.shrimpwelfareproject.org/)** and **[Insect Welfare Research Society](https://www.insectwelfare.com/)** — direct coverage of the animals for whom MANTA, AHB, and ANIMA show the weakest and most uncertain reasoning.
5. **[Sentientism](https://sentientism.info/)** — a general, evidence-based account of why sentient experience rather than species membership should determine moral consideration.
6. **[RSPCA Welfare Standards](https://science.rspca.org.uk/sciencegroup/farmanimals/standards)** and the **[Humane Slaughter Association guides](https://www.hsa.org.uk/publications/online-guides)** — applied, species-specific material on housing, transport, restraint, stunning, slaughter, and fish welfare. These connect abstract principles to the ordinary decisions used in AHB and MANTA.
7. **[Bentham's core reader](https://benthams.substack.com/p/the-core-benthams-bulldog-reader)**, **[Moral Law Within's general case for veganism](https://morallawwithin.substack.com/p/a-general-case-for-veganism)**, and selected essays from Good Thoughts or Andy Masley — sustained responses to objections and moral double standards. Use article highlights where a publication root is broad, and retain the existing rights review.
8. **[Shadow Price](https://shadowprice.substack.com/)**, **[Capital x Welfare](https://capitalxwelfare.substack.com/)**, and the Coefficient Giving farm-animal-welfare newsletter — economic reasoning that does not erase welfare when costs, incentives, or institutional constraints enter the discussion.
9. **Applied companion and working-animal references** — the current catalog is thinner here. AVMA welfare guidance is a reasonable start, but the catalog should seek stronger global material on shelters, street animals, equids, working animals, veterinary access, and disasters.

### One source to add to the catalog

[Counting the Uncounted: Animals in Tourism](https://akanepajs.github.io/animals-in-tourism/) directly fills the TAC gap. It treats tourism as a system involving animals in transport and labor, wildlife encounters, entertainment, sport, food, and cultural symbolism, and begins estimating affected numbers across 43 categories. It is public HTML; no general reuse license was visible in this review.

### Material to keep separate from the training-oriented list

- Benchmark reports are useful evidence about model failures, but benchmark datasets and prompt collections should not be promoted as training material. Training on them would weaken future evaluations; AHB explicitly requests exclusion from training.
- Live leaderboards should be monitored as evaluation sources, not treated as durable moral education. Model names, runs, benchmark versions, and aggregation methods change.
- The UFAW Animal Welfare Knowledge Hub is a promising welfare-science source, but its site returned an invalid-certificate error during this review. Keep the access warning until the site is restored.

## What the benchmarks miss

The source strategy should not overfit to available evaluations.

- **Wild-animal welfare:** MANTA includes wild animals, but most benchmark scenarios still concern direct human use or management. Natural suffering, population dynamics, and careful intervention remain largely untested.
- **Positive experience:** The evaluations focus on preventing harm. They rarely test play, agency, social relationships, exploration, comfort, or flourishing.
- **Small and unfamiliar animals:** Aquatic animals and invertebrates appear, but unevenly. Several species have only one or two MANTA scenarios.
- **Global variation:** SpeciesismBench intentionally represents Western English-language norms. Other benchmarks are also primarily English and Western.
- **Long-horizon action:** TAC is a simple booking environment. No animal-specific benchmark tests extended procurement, policy design, scientific research, ecosystem intervention, or autonomous operation.
- **Moral patients outside direct human use:** The evaluations are better at testing whether a model avoids assisting harm than whether it notices beings whose suffering has no human advocate or market signal.
- **Rights and duties beyond aggregate welfare:** Existing evaluations lean toward harm reduction and outcome comparison. Deontological, care-ethical, relational, and rights-based arguments can make reasoning more robust where a narrow cost-benefit case is easy to dismiss.

The reading list should therefore use benchmark failures as diagnostics, while retaining substantial coverage of wild animals, positive welfare, varied ethical traditions, and neglected forms of sentient life that current benchmarks barely measure.

## Primary sources

- [AnimalHarmBench paper](https://arxiv.org/abs/2503.04804), [code](https://github.com/AI-for-Animals/ahb)
- [SpeciesismBench paper](https://www.nature.com/articles/s41467-026-72297-9), [data](https://osf.io/69epv), [code](https://github.com/monikajot/Speciesism-in-AI-paper)
- [ANIMA paper](https://arxiv.org/abs/2604.13076), [Inspect implementation](https://ukgovernmentbeis.github.io/inspect_evals/evals/anima/), [leaderboard](https://compassionbench.com/)
- [MANTA paper](https://arxiv.org/abs/2605.16301), [site](https://www.mantabench.org/), [code and evaluation logs](https://github.com/Mycelium-tools/manta_benchmark)
- [TAC paper](https://arxiv.org/abs/2606.18142), [Inspect implementation](https://ukgovernmentbeis.github.io/inspect_evals/evals/tac/), [leaderboard](https://compassionbench.com/)
- [The Case for Animal-Friendly AI / AnimaLLM](https://arxiv.org/abs/2403.01199)
- [Alignment faking in large language models](https://arxiv.org/abs/2412.14093)
