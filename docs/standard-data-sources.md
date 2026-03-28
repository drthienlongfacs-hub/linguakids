# Standard Data Sources

This repo now includes a generated standard lexicon layer under `public/data/`.

## Primary sources

1. Open English WordNet
   URL: https://github.com/globalwordnet/english-wordnet
   Why: official open lexical network derived from Princeton WordNet with structured synsets, definitions, examples, and lexical domains.
   License: WordNet License + CC BY 4.0.

2. CMU Pronouncing Dictionary
   URL: https://github.com/cmusphinx/cmudict
   Why: official CMU pronunciation lexicon used to enrich English entries with pronunciation data.
   License: BSD-style.

3. CC-CEDICT
   URL: https://www.mdbg.net/chinese/dictionary?page=cc-cedict
   Why: community-maintained Chinese-English dictionary with simplified forms, pinyin, and glosses.
   License: CC BY-SA 4.0.

4. Chinese Open Wordnet
   URL: https://bond-lab.github.io/cow/
   Why: open Chinese WordNet aligned to WordNet synsets, used to anchor Chinese entries to lexical domains where available.
   License: distributed via Open Multilingual Wordnet / WordNet license family.

## Generator

Run:

```bash
npm run build:standard-data
```

Script:

```text
scripts/build-standard-lexicon.mjs
```

Outputs:

```text
public/data/standard-lexicon-en.json
public/data/standard-lexicon-en-practice.json
public/data/standard-lexicon-en-lookup.json
public/data/standard-lexicon-zh.json
public/data/standard-lexicon-zh-practice.json
public/data/standard-lexicon-zh-lookup.json
public/data/standard-lexicon-meta.json
```

## Current generated scale

Generated on March 28, 2026:

- English full lexicon: 32,000 entries
- English practice bank: 12,000 entries
- Chinese full lexicon: 12,000 entries
- Chinese practice bank: 8,000 entries
- Combined upgrade vs current core curriculum vocabulary: about 29.5x

## Speaking curriculum alignment

The kids speaking shadowing bank now follows an official curriculum alignment instead of a tiny hardcoded sample set.

Primary references:

1. CEFR Companion Volume
   URL: https://rm.coe.int/cefr-companion-volume-with-new-descriptors-2018/1680787989
   Why: anchors A1-A2 speaking outcomes such as simple interaction, introducing self, giving basic information, and describing familiar routines.

2. Cambridge English Young Learners Handbook for Teachers
   URL: https://www.cambridgeenglish.org/exams-and-tests/qualifications/young-learners/
   Why: provides topic families used for Starters and Movers such as school, family and friends, food and drink, transport, places and directions, health, weather, and the world around us.

Implementation note:

- Sentences are newly authored and reviewed for app use; they are aligned to official descriptors and topic domains, not copied from copyrighted coursebooks.
- The current kids speaking bank contains 12 curriculum-aligned shadowing lessons and 360 sentences, which is about 21.2x the previous 17-sentence sample bank.

## Quality rules

- English keeps lowercase lexical entries, filters out obvious proper nouns, and chooses the best available synset definition per lemma.
- Chinese filters out digit-heavy terms, classifier-only entries, variants, surnames, and place-name style dictionary noise.
- Practice banks are stricter subsets intended for runtime activities.

## Known limitations

- The standard Chinese bank currently shows source glosses in English instead of full Vietnamese translations, to preserve fidelity to official/open dictionary sources.
- Chinese lexical domain coverage from Chinese Open Wordnet is partial; entries without reliable synset alignment are kept with conservative metadata instead of fabricated tags.
