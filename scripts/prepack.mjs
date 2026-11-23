// `npm pack` / `npm publish`, step 1 (the package's "prepack"). In the repository the package exports its TypeScript
// and CSS source (tsx, the tests and a local checkout read it with no build step); the tarball gets the built one:
//   1. build dist/ (scripts/build.mjs);
//   2. package.json becomes the published one until scripts/postpack.mjs puts the repository's back: every export to
//      { types, default } in dist (with its react-native / ios conditions, each mapped), prebuilt.css in, no
//      devDependencies, and of the scripts only "postpublish" (below). Every export of the repository is published.
//
// Publishing packs first and uploads that tarball (.github/workflows/publish.yml, docs/RELEASE.md). A plain
// `npm publish` from the folder works too: npm re-reads package.json after packing and uploads THAT as the version's
// metadata, so during a real publish postpack leaves the published manifest in place and "postpublish" (the one
// script the published manifest keeps; it never runs on install) puts the repository's back. A dry run, a plain `npm pack` and a failed check restore it at postpack.
//
// THE GUARD: a prerelease version (0.1.0-next.0) is never published without a dist-tag, so it can't become "latest".
// npm itself refuses that unless --force; this guard refuses it before anything is built, --force or not.
import { copyFileSync, existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"

import { build, GENERATED_EXPORTS, NAME, pkgDir } from "./build.mjs"

const file = join(pkgDir, "package.json")
const saved = join(pkgDir, ".package.repo.json")

const publishing = process.env.npm_command === "publish"
// npm also runs "prepack" when it installs this folder as a git or `file:` dependency: nothing is built or swapped
// then, the folder is used as it is.
if (!["pack", "publish"].includes(process.env.npm_command ?? "")) {
  console.error(`${NAME}: prepack skipped (npm ${process.env.npm_command ?? "?"}: only npm pack and npm publish build and swap package.json)`)
  process.exit(0)
}
const repo = JSON.parse(readFileSync(file, "utf8"))
if (publishing && /-/.test(repo.version) && !process.env.npm_config_tag) {
  console.error(`${NAME}: ${repo.version} is a prerelease: publish it with a dist-tag, e.g. \`npm publish --tag next\` (never as "latest").`)
  process.exit(1)
}
if (existsSync(saved)) throw new Error(`prepack: ${saved} exists (a previous pack or publish was interrupted): run \`node scripts/postpack.mjs\` to put the repository's package.json back first`)

await build()

/** A source path of the repository's exports → where the build put it (`types`: the declarations). */
function target(path, key) {
  const ts = /^\.\/src\/(.+)\.tsx?$/.exec(path)
  if (ts) return key === "types" ? `./dist/${ts[1]}.d.ts` : `./dist/${ts[1]}.js`
  if (path === "./package.json") return path
  if (/^\.\/src\/.+\.(css|cjs)$/.test(path)) return `./dist/${path.slice("./src/".length)}`
  throw new Error(`prepack: don't know where the build puts the export ${path}`)
}
/** An export's value with every condition mapped; a plain TypeScript path becomes { types, default }. */
function built(value) {
  if (typeof value !== "string") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, typeof v === "string" ? target(v, k) : built(v)]))
  return /\.tsx?$/.test(value) ? { types: target(value, "types"), default: target(value, "default") } : target(value, "default")
}
const exports = {}
for (const [key, value] of Object.entries(repo.exports)) {
  if (key === "./package.json") Object.assign(exports, GENERATED_EXPORTS)
  exports[key] = built(value)
}
const targets = (value) => (typeof value === "string" ? [value] : Object.values(value).flatMap(targets))
for (const path of Object.values(exports).flatMap(targets)) {
  if (path.includes("*")) {
    const [before, after] = path.split("*")
    const folder = join(pkgDir, dirname(`${before}x`))
    if (!existsSync(folder) || !readdirSync(folder).some((f) => join(folder, f).startsWith(join(pkgDir, before)) && f.endsWith(after))) throw new Error(`prepack: nothing in dist matches ${path}`)
  } else if (!existsSync(join(pkgDir, path))) throw new Error(`prepack: ${path} was not built`)
}
const published = { ...repo, exports, scripts: { postpublish: repo.scripts.postpublish } }
delete published.devDependencies
delete published.clegra

copyFileSync(file, saved)
writeFileSync(file, `${JSON.stringify(published, null, 2)}\n`)
