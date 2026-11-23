// Puts the repository's package.json back (scripts/prepack.mjs saved it in .package.repo.json). Run as the package's
// "postpack" and "postpublish", and by hand after an interrupted pack or publish (`node scripts/postpack.mjs`).
// During a real `npm publish` the postpack step leaves the published package.json in place: npm re-reads it after
// packing and uploads it as the version's metadata; "postpublish" then restores. dist/ stays (git-ignored).
import { existsSync, renameSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const pkgDir = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const saved = join(pkgDir, ".package.repo.json")
const publishing = process.env.npm_command === "publish" && process.env.npm_config_dry_run !== "true"
if (process.env.npm_lifecycle_event === "postpack" && publishing) process.exit(0)
if (existsSync(saved)) renameSync(saved, join(pkgDir, "package.json"))
