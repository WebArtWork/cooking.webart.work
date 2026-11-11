# World Classic Recipes 801–1000 · EN / UA

200 classic dish titles, 400 localized JSON records across Southern Africa, South Asia, East Asia, and Thailand.

## File structure
- `en/801.json` … `en/1000.json` — one English `RecipeDraft` per recipe
- `ua/801.json` … `ua/1000.json` — matching Ukrainian `RecipeDraft` records
- `recipes.en.json` and `recipes.ua.json` — arrays for bulk import
- `manifest.json` — exact counts, country codes, provisional region IDs, missing-ingredient adaptations

Each record follows the user-provided `RecipeDraft` / `RecipeStep` / `StepIngredient` structure exactly. Ingredients are assigned **only to the cooking step where used**, with valid ingredient IDs from the 1,599-ingredient catalog; cooking technique IDs resolve to the 508-technique catalog; unit IDs resolve to `units.json`.

## Import notes

`regionId` **must be mapped** to actual application `REGIONS` values when supplied; current values are provisional slugs. ISO 3166-1 alpha-2 `countryCode` values are used (Taiwan = TW; North Korea = KP; South Korea = KR).

## Authenticity and safe preparation

Editorial, not kitchen-tested. Adaptations are documented in `manifest.json` and appended to descriptions in both languages. Especially review 810 (chikanda), 850 (bhel puri), 875 (hilsa replaced), 879 (cultured milk), 913 (soup dumpling aspic), 930 (zongzi), 934–936 (cooked/smoked sushi), 982 (herbal samgyetang), 992 (gua bao buns). Follow appropriate food hygiene for hot pot and cold rice dishes.

## Selected culinary references

- Japan MAFF Japanese cuisine recipes: https://www.maff.go.jp/e/policies/market/japan-cuisine/japan/index.html
- Japan MAFF regional food database: https://www.maff.go.jp/j/keikaku/syokubunka/k_ryouri/search_menu/index.html
- Korea Tourism Organization, japchae: https://english.visitkorea.or.kr/svc/thingsToDo/foodTrip/special_view.do?vcontsId=179814
- Korea Tourism Organization, tteokbokki: https://english.visitkorea.or.kr/svc/sp/food/ext/special_view.do?vcontsId=178955
- Korea Tourism Organization, Korean cuisine overview: https://english.visitkorea.or.kr/

All recipe text is newly authored, not copied from source material.
