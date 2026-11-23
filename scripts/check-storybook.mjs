// CHECKS THE PUBLIC CATALOGUE'S BUILD (storybook-public/): only «Apps»
// stories are in its index, and no file names anything internal or
// carries the Brand pages or the site's Sections. What counts as internal
// (customers, people, repository paths, secrets) is a private list kept
// outside this package: its file is given with --forbidden, a module that
// exports FORBIDDEN (RegExp[]) and may export ALLOWED.ui and
// STORYBOOK_THIRD_PARTY (exact strings taken out before the check).
//   node scripts/check-storybook.mjs --forbidden <list.mjs> [dir]
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { dirname, join, relative, resolve } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const args = process.argv.slice(2)
const at = args.indexOf("--forbidden")
const listFile = at >= 0 ? args[at + 1] : undefined
if (!listFile) {
  console.error("check-storybook: no forbidden list (node scripts/check-storybook.mjs --forbidden <list.mjs> [dir])")
  process.exit(2)
}
const list = await import(pathToFileURL(resolve(listFile)).href)
const FORBIDDEN = list.FORBIDDEN
if (!Array.isArray(FORBIDDEN) || !FORBIDDEN.length || !FORBIDDEN.every((p) => p instanceof RegExp)) {
  console.error(`check-storybook: ${listFile} exports no FORBIDDEN list of patterns`)
  process.exit(2)
}
const ALLOWED = list.ALLOWED?.ui ?? []
const rest = args.filter((_, i) => i !== at && i !== at + 1)

const pkgDir = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const dir = resolve(rest[0] ?? join(pkgDir, "storybook-public"))
if (!existsSync(join(dir, "index.json"))) {
  console.error(`${dir}: no build (npm run build-storybook:public)`)
  process.exit(1)
}
const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]))
const findings = []
const entries = Object.values(JSON.parse(readFileSync(join(dir, "index.json"), "utf8")).entries)
for (const entry of entries) if (!entry.title.startsWith("Apps/")) findings.push(`index.json: ${entry.title} is not an «Apps» story`)
// The bundler writes absolute module paths of the machine it ran on into source comments and ids: those are reported once, as one finding.
/** Third-party text in the bundle that a pattern matches (the list's STORYBOOK_THIRD_PARTY), and ALLOWED.ui: taken out before the check. */
const THIRD_PARTY = [...(list.STORYBOOK_THIRD_PARTY ?? []), ...ALLOWED]
const INTERNAL_MARKS = [/Brand\/(Logo|Colours|Applications)/, /Web\/Sections\//, /clegra-site/, /BricolageGrotesque/]
let machinePaths = 0
for (const file of walk(dir)) {
  if (!/\.(js|mjs|html|json|css|map|txt|svg)$/.test(file)) continue
  const name = relative(dir, file)
  const text = THIRD_PARTY.reduce((t, known) => t.split(known).join(""), readFileSync(file, "utf8"))
  for (const mark of INTERNAL_MARKS) if (mark.test(text)) findings.push(`${name}: carries internal content (${mark})`)
  for (const pattern of FORBIDDEN) {
    const m = pattern.exec(text)
    if (!m) continue
    if (pattern.source === "\\/Users\\/") machinePaths++
    else findings.push(`${name}: ${pattern} «${text.slice(Math.max(0, m.index - 40), m.index + m[0].length + 40).replace(/\s+/g, " ")}»`)
  }
}
if (machinePaths) findings.push(`${machinePaths} files carry an absolute path of the machine that built them (a home folder): build on CI before any public deploy`)
console.log(`${entries.length} entries, all under «Apps»: ${findings.length ? `FAIL, ${findings.length} findings` : "ok, nothing internal"}`)
for (const f of findings.slice(0, 60)) console.log(`  ${f}`)
process.exit(findings.length ? 1 : 0)
