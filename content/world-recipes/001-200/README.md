# World classic recipes 001–200 — EN + UA

- 200 distinct recipes, 400 localized `RecipeDraft` records.
- `en/001.json`…`en/200.json`, `ua/001.json`…`ua/200.json`: one object per locale per recipe.
- `recipes.en.json` and `recipes.ua.json`: bulk arrays, identical contents to per-recipe files.
- The same stable `id` and step IDs are used for both locales, so the files are translations of one recipe, not duplicates to import into one nonlocalized collection.
- Ingredient IDs resolve against the uploaded 1,599-ingredient catalog; cooking technique IDs resolve against the uploaded 508-technique catalog. Units match `units.json`.
- Each ingredient is attached to the step where first used; no recipe-level ingredient list.
- `servings=4` by default; cakes, large pastries and batch desserts use adjusted serving counts. `durationMinutes` is the approximate active/elapsed time for that individual step.
- `updatedAt` is an epoch-milliseconds timestamp.
- **REGIONS mapping:** this upload did not contain the app's REGIONS definition; `eastern-europe` and `southern-europe` are provisional slugs derived from the supplied Markdown headers. Replace if the app uses different IDs.
- **Editorial limitations:** These are practical, structured home-kitchen versions with variations; they have not been tested in a kitchen. Some regional products can be approximated only using the available ingredient IDs. Validate specialty recipes and food safety prior to publishing.
- **References:** https://www.poland.travel/en/flavours-of-polish-cuisine/ ; https://www.visitczechia.com/en-us/things-to-do/places/gastronomic-tourism/czech-cuisine-and-regional-products/g-svickova-na-smetane ; https://georgia.travel/georgian-cuisine ; https://www.turismoroma.it/de/node/45333 ; https://www.spain.info/en/recipe/paella/ ; https://lithuania.travel/en/what-to-do/food-and-drink/lithuanian-products/cepelinai . The recipe steps are original summaries, not copies of these sources.
