# Cooking ingredient catalog — EN + UA

This is an **editorially curated starter catalog** for a recipe builder, shopping list, and ingredient search.

- **1,599 named ingredients**
- **23 categories** and **95 subcategories**
- Two languages: English (EN) and Ukrainian (UA)
- Stable **slug IDs** independent of display language
- Aliases for common names and variants

## Included files

- `ingredients.json` — **main app dataset** with an `ingredients` array: id, EN/UA name, EN/UA aliases, categoryId, subcategoryId
- `taxonomy.json` — nested categories and subcategories with bilingual labels
- `ingredients.csv` — UTF-8 BOM flat list for editing and import
- `ingredients.md` — browsable full ingredient list grouped by category
- `units.json` — bilingual recipe-unit labels (reference only; no conversions)
- `ingredient.schema.json` — JSON Schema for one ingredient object
- `allergen_reference.json` — EU's 14 major regulated allergen groups **as a reference, not ingredient-level assignments**
- `sources.json` — references for taxonomy and later integrations
- `manifest.json` — counts and file inventory

## Modeling guidance

Use the canonical ingredient `id` in recipe records; store `amount`, `unit`, `preparation`, and `ingredientForm` separately. For example, chopped/peeled/boiled are **steps or states**, not necessarily different ingredient identities. Distinguish meaningful commercial variants when recipes depend on them (e.g., whole-wheat vs all-purpose flour, soft vs firm tofu, dry vs canned chickpeas).

For a search field, index `name.en`, `name.ua`, `aliases.en`, and `aliases.ua`, normalize punctuation, case and apostrophes, and support user-created ingredients with moderation/deduplication. Search aliases are editorial hints, not strict interchangeability.

**Coverage:** wide everyday Ukrainian, European, Asian, African, Mediterranean, and American cooking. **Not literally all recipes:** regional and newly marketed foods will require an extensible catalog. Do not treat an absent ingredient as impossible to add.

**No nutritional values or item-level allergen declarations** are claimed by this dataset. Nutrition must be linked to a specific food/form using a validated composition source (e.g., USDA FoodData Central), and allergens must be evaluated from actual ingredient composition, labels, and cross-contact conditions under relevant regulation. Never use an empty allergen list to indicate guaranteed safety.

## Source basis

FoodOn, FoodData Central, Open Food Facts, and EFSA FoodEx2 informed the **classification model**. Ingredient labels and EN/UA translations were curated independently; they have **not** undergone professional bilingual food-terminology audit. The linked sources do not individually certify each translation. See `sources.json`.
