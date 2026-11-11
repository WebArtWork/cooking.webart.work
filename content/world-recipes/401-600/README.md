# World classic recipes 401–600 · EN / UA

200 dishes, 400 localized `RecipeDraft` objects, IDs `world-0401` … `world-0600`.

- `en/401.json` to `en/600.json`, `ua/401.json` to `ua/600.json`: one JSON recipe per dish and language
- `recipes.en.json` and `recipes.ua.json`: import-friendly arrays
- `manifest.json`: IDs, counts, source catalogs and adaptation audit
- `step.ingredients[]`: required measured ingredients on the step where used (there is no duplicate recipe ingredient list)
- `step.techniqueIds[]`: verified against the 508-technique catalog
- `regionId`: **provisional** strings; use app's actual REGIONS constants when available

## Culinary and safety notes

Recipes are practical home drafts, not kitchen-tested. A number of source dishes depend on unavailable ingredients (smoked haddock, kataifi pastry, jameed, kashk, barberries, devzira rice, prepared lutefisk, etc.), so explicit EN/UA adaptations are supplied in record descriptions and `manifest.json`. Avoid publishing as fully traditional without review and ingredient catalog extensions.

- `world-0426` (gravlax): raw fish must be supplied as suitable for raw consumption and kept cold; salting does not make unsafe fish safe.
- `world-0436` (lutefisk): **not** an authentic lutefisk method because commercially treated lutefisk is absent. Never improvise lye treatment.
- `world-0478` (kibbeh nayyeh): cooked adaptation, not the traditional raw serving.
- `world-0510` (jachnun): slow overnight covered oven baking.
- `world-0597` (khorkhog): oven adaptation in place of hot stones in a sealed vessel.

## Culinary and food-safety references (selected)

- https://www.bbcgoodfood.com/recipes/good-steak-kidney-pie
- https://visitsweden.com/what-to-do/food-drink/recipes/
- https://www.visitnorway.com/things-to-do/food-and-drink/the-norwegian-cookbook/recipe-lutefisk/
- https://gastronomy.goturkiye.com/turkish-cuisine
- https://cuisineatlas.com/country/lebanon/
- https://www.chefnaz.com/en/recipes/
- https://lets-visit-afghanistan.com/en/food-and-drinks
- https://tourtouzbekistan.com/travel-guide/food-of-central-asia/
- https://www.foodstandards.gov.au/consumer/prevention-of-foodborne-illness/raw-fish-dishes

Instructions are independently phrased, not copied from third-party recipes.
