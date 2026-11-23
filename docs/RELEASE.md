# Releasing `@clegra/ui`

The package is this repository's root. Versions before 1.0 are prereleases on the dist-tag `next` (`0.1.0-next.0`
first).

## What ships

- In the repository, `package.json` exports the source (`./src/components/*.tsx`, `./src/styles.css`, …).
- `npm pack` and `npm publish` run `prepack` (`scripts/prepack.mjs`): `scripts/build.mjs` compiles `src/` to `dist/`
  (ESM + `.d.ts`, `"use client"` kept, relative imports with their `.js`, the package's own `@clegra/ui/...` imports
  made relative), copies the stylesheets (comments out) and `metro.cjs`, and generates `prebuilt.css` (Tailwind over
  the compiled components). It refuses any bare import in `dist` that is not a declared peer dependency. Then
  package.json is swapped for the published one: every export `{ types, default }` in `dist` with its
  `react-native` / `ios` conditions mapped, `./prebuilt.css` added, no devDependencies, of the scripts only
  `postpublish`. `postpack` (or, during a real publish, `postpublish`) puts the repository's back.
- Files: `dist`, `README.md`, `LICENSE` (MIT), `NOTICE.md` (the trademark and the third-party work), `CHANGELOG.md`,
  `package.json`.
- Every repository export is published; nothing is closed or left out.

## The guard

- A prerelease is published with a dist-tag only (npm refuses it without `--tag` unless `--force`; `prepack` refuses
  it before building, `--force` or not).
- `npm publish --dry-run --tag next` runs everything and uploads nothing.
- After a failed real publish, `node scripts/postpack.mjs` puts the repository's package.json back; `prepack` refuses
  to start while `.package.repo.json` is there.

## The pack check

```sh
npm run pack:check -- --dir "$(mktemp -d /tmp/clegra-ui-pack.XXXX)" --port 3956
```

Packs the tarball and checks its files and package.json, the formerly reserved components, the shell's entries
(`shell`, `clegra/*`, `glass.css`), the fonts (real
woff2, their OFL texts, the NOTICE rows, the `@font-face` blocks of `styles.css` and `prebuilt.css`, no
self-referencing `--font-sans`), the hygiene of every file, the guard (dry runs), then plain Node (`tokens`, `metro`),
a fresh Next.js App Router app with Tailwind 4 rendering Button, Card, the Sidebar and the Toaster, a
page framed by `<SiteShell>` with a `ShellPage`, serving the Inter woff2, after
`next build` + `next start`, and `tsc` with `moduleResolution` `bundler` and `node16`.

## Publishing

This repository is a snapshot of the package at each version. Its `.github/workflows/publish.yml` runs on a push to
`main` that changes `package.json`: when that version is not on npm yet it runs `npm ci`, `npm pack` (printing the
tarball's integrity) and publishes that tarball with `npm publish <tarball> --tag next|latest --access public
--provenance`, through npm's Trusted Publishing (OIDC: no token anywhere). The provenance statement on npm links the
version to the commit and the run that built it. The pack is reproducible: the same commit packs to the same bytes
anywhere (same Node major and npm).

Before a snapshot is pushed, where the package is developed:

```sh
npm ci
npm run typecheck && npm test
npm run pack:check -- --dir "$(mktemp -d /tmp/clegra-ui-pack.XXXX)"
npm publish --dry-run --tag next  # read the file list once more; uploads nothing
```

A new version: bump `version`, move the changelog's «Unreleased» to the version, then the snapshot (tagged
`v<version>` here). Publish `@clegra/ui` before an `@clegra/sdk` version whose `init --ui` names it.
