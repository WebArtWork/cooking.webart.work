# World Classic Recipes 1201–1400 — EN / UA

200 recipes, 400 localized `RecipeDraft` records, from Central America, Caribbean, South America, and Oceania.

## Contents
- `en/1201.json`…`en/1400.json` — individual English records
- `ua/1201.json`…`ua/1400.json` — individual Ukrainian records
- `recipes.en.json`, `recipes.ua.json` — bulk import arrays
- `manifest.json` — counts, region/country mapping, adaptations, source references and validation notes

Follows your `RecipeDraft`, `RecipeStep`, `StepIngredient` interfaces. Every ingredient is linked to a specific step. All foreign keys (ingredient IDs, technique IDs, units) were checked against your source catalogs, and localized records share the same ingredient quantities/units/step IDs.

**Important:** Region ID slugs remain provisional until mapped to your actual application REGIONS constants. Country code `CW` is used for the shared Aruba/Curaçao cuisine heading; verify this when mapping territory provenance.

Some recipes have meaningful substitutions due to missing products; see `adaptations` in `manifest.json` and the localized recipe description. Examples: callaloo leaves → spinach; conch → clam; cassareep → molasses and tamarind (not equivalent); pomtajer → taro; dried Peruvian chuño → fresh potato. Fish ceviche is prepared as a **heat-cooked alternative** for food safety.

Recipes are **editorial drafts**, not kitchen-tested. Cross-check local ingredient identity, safe cooking temperatures, culturally important details, quantities and timing before publication.

## Background references
- Trinidad Tourism: https://visittrinidad.tt/things-to-do/cuisine/
- Tobago Tourism, callaloo: https://visittobago.gov.tt/callaloo
- PROMPERÚ ceviche: https://www.gob.pe/institucion/promperu/noticias/201547-promperu-cebiche-peruano-fue-elegido-como-el-platillo-mas-popular-de-sudamerica
- Australian War Memorial ANZAC recipes: https://www.awm.gov.au/articles/encyclopedia/anzac/biscuit/recipe
- Te Ara, New Zealand: https://teara.govt.nz/en/artwork/33143/anzac-biscuits-and-pavlova
- FDA Safe Food Handling: https://www.fda.gov/food/buy-store-serve-safe-food/safe-food-handling
