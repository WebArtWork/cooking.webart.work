# Cooking techniques catalog — EN + UA

Editorially curated, broad starter reference for technique selection, recipe steps, search and training.

- **508 named techniques**, organized into **24 categories** and **57 subcategories**.
- EN and UA names; stable slug IDs; EN/UA search aliases on selected entries.
- Same core record structure as `cooking_ingredients_en_ua_1599`: `id`, `name`, `aliases`, `categoryId`, `subcategoryId`.
- Includes prep and knife skills, thermal methods, baking, beverages, regional named techniques, fermentation, preservation, precision cookery and plating.

## Files

- `techniques.json` — main importable dataset (`techniques` array)
- `taxonomy.json` — bilingual categories and subcategories
- `techniques.csv` — flat UTF-8-BOM export
- `techniques.md` — browseable reference grouped by category
- `technique.schema.json` — JSON Schema for one record
- `safety_reference.json` — **non-exhaustive** safety-attention flags, not validated instructions
- `sources.json` — curriculum and culinary references
- `manifest.json` — machine-readable counts
- `README.md` — this file

## Suggested recipe integration

- Store a recipe step as `{ "instruction": { "en":"...", "ua":"..." }, "techniqueIds": ["sauteing", "simmering"], "ingredientIds": ["onion", "tomato"] }`.
- Ingredients stay separate from **actions** (e.g. `chopping`) and **ingredient states** (e.g. `chopped`).
- A step can contain multiple techniques. Primary cooking method and secondary steps may be modeled separately for search.
- Keep `temperature`, `duration`, `equipment`, `doneness cues` and `food safety requirements` on a recipe step or validated process profile; none can be inferred from a technique ID.
- Regionally named techniques and generic techniques can coexist; use the specific one if the preparation distinctly requires it.
- Search by canonical ID, bilingual label or alias; use IDs in all relationships.

## Editorial scope and safety

This is a broad usable catalog, **not a claim of literally every local or historical technique**. Some entries are ingredients handling operations or presentation methods, not heat-based cooking methods; this is intentional for a complete recipe workflow.

The catalog names high-risk activities but **does not teach or certify** food preservation. Techniques such as low-acid home canning, vacuum low-temperature cooking, curing and fermentation require tested product-specific procedures. Safety flags are non-exhaustive. Avoid treating labels as assurances that food is cooked or preserved safely.

EN/UA terminology was editorially curated and has not received professional bilingual culinary terminology review. Sources substantiate broad methods and selected cultural terms, not every individual translation.
