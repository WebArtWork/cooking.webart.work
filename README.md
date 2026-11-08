# Cooking

Cooking education at https://cooking.webart.work, built with Angular 22, TypeScript, prerendered pages and the existing `@wawjs/ngx-default` conventions.

## Lessons

The 17 supplied archives contain 330 theories. Their original bytes are preserved in `content/cooking-theories/001.md` through `330.md`; `content/cooking-import.json` records archive provenance and SHA-256 hashes. Every theory includes English and Ukrainian short versions, six detailed sections per language, related theories and source URLs. No theory or exercise images were generated.

The importer creates 21 numbered topic groups, a searchable bilingual catalog, lazy lesson JSON, route loaders and build-only SEO metadata. Original lesson prose, numerical examples, limitations and source links are preserved. The app renders supplied material as escaped text with bold emphasis, never as executable HTML.

## Features

- Search all 330 lessons by title, number or keyword in either language; filter by topic. Filters persist in the URL.
- Short/full reading, related links and previous/next lessons. Each lesson has its own prerendered URL and metadata.
- Device-local study marks under `cooking_reading`.
- Print an individual short/full theory, or all 330 short/full theories in English or Ukrainian. Print styles use black text on white in both themes.
- Editorial Warm light and Chocolate & Cream dark, consistent Iconoir icons, self-hosted Inter/Fraunces and generic generated Cooking photography.

Practice exercises, recipes and the virtual kitchen remain future work. Copied Business content and any pre-existing local edits remain on disk as an archive; their lesson and exercise routes are not published as Cooking content. Archived import commands are named explicitly in package.json.

## Commands

```sh
npm ci
npm start
npm run theories:import
npm run check:content
npm run build:seo
```

Production output: `dist/app/browser`. `build:seo` imports and verifies the content, prerenders 336 pages and checks every English short/full lesson against its generated HTML. The browser bundle loads individual lessons on demand; the full catalog and all-theory print data are lazy.

## Configuration and verification

Google sign-in inherits the shared learning Firebase configuration and still requires configuration/verification; reading and local study marks work without it. Native builds/signing and Firebase rules deployment were not performed. The native workflow remains manual. The existing GitHub Pages workflow requires its configured repository deployment secret.

See `DESIGN_REVIEW.md` for validation evidence and limitations.
