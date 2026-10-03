# chi27-adr-feedback-support

A small SvelteKit app for composing assisted desk reject (ADR) feedback letters from a fixed
template. You fill the five review criteria; the app assembles the letter and lets you copy it
or save it as a text file.

No backend, no database. Drafts are kept in the browser's `localStorage` only.

## Develop

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
npm run preview
```

The static site is written to `build/`.

## Deploy to GitHub Pages

The workflow in `.github/workflows/deploy.yml` builds and publishes on every push to `main`.

One-time setup: in the repository, go to **Settings → Pages** and set **Source** to
**GitHub Actions**. The site then appears at
`https://<your-username>.github.io/chi27-adr-feedback-support/`.

If you rename the repository, update `paths.base` inside `sveltekit({ ... })` in `vite.config.ts`
to match. For a user or organisation site (`<user>.github.io`), set `base` to an empty string.

SvelteKit 3 no longer uses `svelte.config.js` — all configuration lives in `vite.config.ts`.

## Notes

- `src/lib/letter.ts` holds the template and the five criteria — edit the text there. It is imported as `#lib/letter.js`, the SvelteKit 3 replacement for `$lib`.
- The paper ID names the downloaded file (`adr-feedback-1234.txt`) and never appears in the letter.
- Unfilled criteria show as `#needs to fill#` in the preview; copy and save are blocked until all five are filled.

The project is TypeScript; run `npm run check` to typecheck.
