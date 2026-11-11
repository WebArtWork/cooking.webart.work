# World Classic Recipes 1401–1432 — EN / UA

Final batch: **32 recipes**, **64 localized RecipeDraft records**, **145 steps**, **228 ingredient references**. Covers 13 Oceanian countries.

## ZIP contents
- `en/1401.json` through `en/1432.json` — English `RecipeDraft`
- `ua/1401.json` through `ua/1432.json` — Ukrainian `RecipeDraft`
- `recipes.en.json` and `recipes.ua.json` — bulk import arrays
- `manifest.json` — counts, sources, validation, substitutions and caveats
- `README.md` — this document

All records use the `RecipeDraft` / `RecipeStep` / `StepIngredient` interface supplied by the user. Each ingredient appears at the step in which it is introduced. Units, technique IDs, ingredient IDs and locale parity validated against provided source catalogs.

**Important limitations**: Region ID `oceania` remains provisional until matched with the application's `REGIONS`. The recipes are editorial drafts, not kitchen-tested. In particular, fish salads are *cooked-fish adaptations*; coconut-cured raw-fish originals are distinct dishes and citrus marinade is not a substitute for heat treatment. Several recipes intentionally replace missing ingredients (taro leaves -> spinach, swamp taro -> ordinary taro, fresh cassava -> cassava flour, cornflakes -> cracker crumbs). Traditional hot-stone earth ovens are replaced with covered home ovens. See manifest's `adaptations` object for details.

## Selected references
- Chelsea Sugar — Hokey Pokey Ice Cream: https://www.chelsea.co.nz/recipes/browse-recipes/hokey-pokey-ice-cream?category=Desserts
- Edmonds — Afghans classic NZ biscuits: https://edmondscooking.co.nz/recipes/biscuits/afghans
- Tonga Tourism — food and feasting: https://www.tongatourism.travel/discover/people-and-culture/food-and-feasting
- Queensland Health — Tongan food and cultural profile: https://www.metrosouth.health.qld.gov.au/__data/assets/pdf_file/0025/242395/profile_tongan_dietetic.pdf
- Vanuatu Tourism Office — local eats: https://www.vanuatu.travel/en/about-vanuatu/local-eats
- Auckland Museum — Taste of Tuvalu: https://www.aucklandmuseum.com/discover/stories/blog/2020/taste-of-tuvalu
- 196 Flavors — Kiribati pumpkin bake: https://www.196flavors.com/kiribati-te-bua-toro-ni-baukin/
- Marshall Islands ethnobotany, University of Hawaii — Jukjuk: https://hawaii.edu/cpis/MI/plants/iaraj.html
- Heart Foundation NZ — Solomon poi: https://www.heartfoundation.org.nz/wellbeing/healthy-recipes/solomon-poi
- Papua New Guinea agricultural journal — sago foods: https://journal.pngagriculture.net/index.php/harvest/article/view/1615
- Hong Kong Centre for Food Safety — taro safety: https://www.cfs.gov.hk/english/multimedia/multimedia_pub/multimedia_pub_fsf_243_03.html
- FDA — Selecting and Serving Fresh and Frozen Seafood Safely: https://www.fda.gov/food/buy-store-serve-safe-food/selecting-and-serving-fresh-and-frozen-seafood-safely
- FDA — Safe Food Handling: https://www.fda.gov/food/buy-store-serve-safe-food/safe-food-handling
