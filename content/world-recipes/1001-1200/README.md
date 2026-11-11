# World Classic Recipes 1001–1200 — EN / UA

200 recipes (400 localized records) from Southeast Asia, North America and Central America.

## Contents

- `en/1001.json` through `en/1200.json`: one English `RecipeDraft` per dish
- `ua/1001.json` through `ua/1200.json`: one Ukrainian `RecipeDraft` per dish
- `recipes.en.json` and `recipes.ua.json`: bulk import arrays
- `manifest.json`: counts, ISO country codes, provisional region IDs, adaptations, QA notes and source links

This archive follows the provided `RecipeDraft`, `RecipeStep` and `StepIngredient` interfaces exactly. Ingredients are listed on the step where used, and all ingredient IDs, technique IDs and units resolve to the supplied catalogs.

## Import / safety / authenticity notes

- `regionId` values are **provisional** (southeast-asia, north-america, central-america). Map them to your real app `REGIONS` constants.
- The `en` and `ua` versions share recipe IDs, step IDs, quantities, durations and technique IDs. Only titles, descriptions and instructions are localized.
- Adaptations where exact regional staples are missing are documented in `manifest.json` and appended to EN/UA descriptions.
- Some dishes cannot be faithfully reconstructed using this ingredient catalog. Examples: rawon (keluwak nuts), laing (taro leaves), ambuyat (sago starch), nasi kerabu (butterfly pea flowers), poutine (cheese curds), Montreal smoked meat (cured/smoked beef). These are explicitly labeled as adaptations rather than claims of authenticity.
- Ceviche, kinilaw and aguachile here use **heat-cooked** seafood, not traditional raw versions. Citrus juice is not a substitute for cooking safety.
- Poultry should reach 74°C / 165°F; finfish 63°C / 145°F or opaque and flaking; ground meats 71°C / 160°F. Refrigerate perishables promptly and cool cooked rice safely.
- The recipes have passed **structural and catalog-ID validation**, but are editorial drafts, **not kitchen-tested** or individually certified for culinary authenticity.

## Background culinary sources (selective, not a citation for every recipe)

- Thailand Dept. of Agricultural Extension: https://www.doae.go.th/en/food/
- Vietnam Tourism: https://vietnam.travel/things-to-do/21-must-try-vietnamese-dishes/
- Wonderful Indonesia: https://www.indonesia.travel/uk/en/travel-ideas/gastronomy/hobi-wisata-kuliner-10-makanan-khas-indonesia-ini-wajib-kamu-coba
- Visit Singapore: https://www.visitsingapore.com/content/visitsingapore/de_de/things-to-do/dining/local-food-and-drinks/
- Mexican government, mole: https://www.gob.mx/agricultura/articulos/el-mole-un-platillo-para-chuparse-los-dedos
- Mexico Secretariat of Culture, pozole: https://sic.gob.mx/ficha.php?table=gastronomia&table_id=81
- US FDA food safety: https://www.fda.gov/food/buy-store-serve-safe-food/safe-food-handling

All instruction and description text in the JSON files is newly authored.
