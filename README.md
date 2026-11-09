# Cooking

Cooking education at https://cooking.webart.work, built with Angular 22, TypeScript, prerendered pages and the existing `@wawjs/ngx-default` conventions.

## Lessons

The first release had 330 theories; ten revised archives then replaced it with 288 (001–288), and the repeated 289–330 were dropped. Theories 001–030 have no related-theories section of their own, so their links are kept in `content/related-theories.json`. Em dashes in the lesson text were rewritten into plain punctuation through line-level fixes in `content/text-fixes.json`, applied by the importer so the supplied Markdown stays unchanged. Their original bytes are preserved in `content/cooking-theories/001.md` through `288.md`; `content/cooking-import.json` records archive provenance and SHA-256 hashes. Every theory includes English and Ukrainian short versions, five to nine detailed sections per language, related theories and source URLs. No theory or exercise images were generated.

The importer creates 22 numbered topic groups, a searchable bilingual catalog, lazy lesson JSON, route loaders and build-only SEO metadata. Original lesson prose, numerical examples, limitations and source links are preserved. The app renders supplied material as escaped text with bold emphasis, never as executable HTML.

## Practice

The ten `cooking_exercises_revised_*` archives give 1,570 bilingual exercises for theories 001–288 in eight types: single choice, multiple choice, true or false, sequence, matching, calculation, find the mistake and decision scenario. The originals are kept in `content/cooking-exercises/`; `content/cooking-exercises-import.json` records archive provenance and hashes. `npm run exercises:import` checks every exercise (both languages, answers that point at real options, steps and pairs) and writes lazy per-theory data; `npm run check:exercises` confirms the generated files are current.

`/practices` lists every topic and theory with its exercise count and your progress. `/practices/<theory>` runs the exercises one by one with an explanation after each answer, then shows a summary with the missed ones to retry. Each lesson page links to its practice. Results are kept on the device (`cooking_practice`). Answers ship with the app, so grading happens in the browser; the exercise data marks safety-critical questions, and the numeric food-safety limits follow US guidance, not Ukrainian law.

## Ingredients

`cooking_ingredients_en_ua_1599.zip` gives a curated catalog of 1,599 ingredients in 23 categories and 95 subcategories, each with an English and a Ukrainian name, aliases and a stable id. The originals are in `content/cooking-ingredients/`; `npm run ingredients:import` checks them (ids, both languages, categories, counts against the archive) and writes `src/data/cooking/ingredients.json`; `npm run check:ingredients` confirms it is current. The Cook page only accepts ingredients from this catalog: you search in either language or by alias, and the chosen ids are kept on the device (`cooking_ingredient_ids`). The translations were not audited by a food-terminology professional, and the catalog carries no nutrition or allergen data.

## Techniques and the recipe builder

`cooking_techniques_en_ua_508.zip` gives 508 bilingual cooking techniques in 24 categories. The originals are in `content/cooking-techniques/`; `npm run techniques:import` checks them (ids, both languages, categories, safety groups, counts) and writes `src/data/cooking/techniques.json` plus a small theory-to-technique index; `npm run check:techniques` confirms they are current. `content/technique-theories.json` links 64 techniques to the theories that explain them (matched by title, then reviewed); lesson pages list the techniques they explain.

`/cook/recipe` builds a recipe from its steps only. Each step has instructions, optional techniques, an optional time, and the ingredients it uses with amounts and units; the recipe's ingredient list is added up from the steps. A recipe also records its geographic region (18 regions) and country. The `RecipeDraft` interface is in `src/app/pages/cook/recipe-draft.ts`. The draft is saved on the device (`cooking_recipe_draft`) and can be copied as JSON. The region and country lists are my own grouping and the country names come from the browser's own data, so replace them if you have a dish dataset with its own regions.

## Features

- Search all 288 lessons by title, number or keyword in either language; filter by topic. Filters persist in the URL.
- Each lesson page shows the detailed text, with related links and previous/next lessons. Each lesson has its own prerendered URL and metadata.
- Device-local study marks under `cooking_reading`.
- Print the open lesson from the top bar, or pick any theories by topic in a modal and print their detailed text (title and content only, no links), in English or Ukrainian. Print styles use black text on white in both themes.
- Editorial Warm light and Chocolate & Cream dark, consistent Iconoir icons, self-hosted Inter/Fraunces and generic generated Cooking photography.

Recipes, chefs, restaurants and the other Explore sections are sample content for now, and the virtual kitchen remains future work. The earlier Business content was removed from the working tree; it remains in git history.

## Commands

```sh
npm ci
npm start
npm run theories:import
npm run check:content
npm run build:seo
```

Production output: `dist/app/browser`. `build:seo` imports and verifies the content, prerenders 294 pages and checks every English short/full lesson against its generated HTML. The browser bundle loads individual lessons on demand; the full catalog and all-theory print data are lazy.

## Configuration and verification

Google sign-in inherits the shared learning Firebase configuration and still requires configuration/verification; reading and local study marks work without it. Native builds/signing and Firebase rules deployment were not performed. The native workflow remains manual. The existing GitHub Pages workflow requires its configured repository deployment secret.

See `DESIGN_REVIEW.md` for validation evidence and limitations.
