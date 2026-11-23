// THE PACK CHECK: @clegra/ui as a stranger gets it from npm, outside this repository. Slow (npm installs and a Next.js
// production build), so not in `npm test`:
//   npm run pack:check -- [--dir <empty folder outside the repo>] [--port 3956] [--keep]
// 1. `npm pack` (prepack builds dist/): the tarball's files, its package.json (every export built, nothing closed, no
//    devDependencies, only the "postpublish" script, publishConfig public), every relative import in dist resolving
//    inside the tarball, the formerly reserved components (sidebar, sonner, form, …), drawn/* and native/toast
//    published, the hygiene check (the private one of the repository it is developed in, when present), the publish guard (dry runs: a prerelease without a dist-tag
//    is refused, `--tag next` passes; nothing is uploaded), the repository's package.json back after each. The shell
//    (`shell`, `shell/reorder`, `clegra/*`, `glass.css`) built and exported, @dnd-kit imported by `shell/reorder` only;
//    the fonts (Inter, Geist Mono) shipped as real woff2 with their OFL texts and NOTICE rows, declared by styles.css
//    and prebuilt.css (@font-face, swap) with --font-sans / --font-mono on them and no self-reference.
// 2. Plain Node: @clegra/ui/tokens imported as ESM, @clegra/ui/metro required (no React needed for either).
// 3. A fresh Next.js App Router app with Tailwind 4 (the repository's Next, React, TypeScript and Tailwind versions),
//    the tarball and the web peer libraries installed (not @dnd-kit), `@import "@clegra/ui/styles.css"` and
//    `"@clegra/ui/glass.css"` after Tailwind: a page drawn with Button, Card and the Sidebar (formerly reserved); a page
//    framed by <AppShell> and the same frame under /embed (`embedded`); `next build` + `next start`: the page renders
//    them and its stylesheet has their classes and the theme; the stylesheet declares Inter and serves its woff2 (the
//    packaged bytes); the shell's page has its chrome, the embed page none (in the first HTML).
// 4. tsc on a file importing the web entries (components, a formerly reserved one, frame, tokens, hooks), with
//    `moduleResolution` bundler and node16; the shell and clegra/* entries too.
// The folder must have no node_modules or package.json above it. The server is stopped by PID; node_modules and .next
// are deleted at the end unless --keep.
import { execFileSync, spawn, spawnSync } from "node:child_process"
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join, relative, resolve, sep } from "node:path"
import { fileURLToPath } from "node:url"
import { parseArgs } from "node:util"

const pkgDir = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const { values } = parseArgs({ options: { dir: { type: "string" }, port: { type: "string", default: "3956" }, keep: { type: "boolean", default: false } } })
const port = Number(values.port)
if (!Number.isInteger(port) || port < 1024) throw new Error(`pack-check: --port ${values.port} is not a port`)
const npm = process.platform === "win32" ? "npm.cmd" : "npm"

let failures = 0
let passed = 0
const ok = (what) => {
  passed++
  console.log(`ok   ${what}`)
}
const fail = (what) => {
  failures++
  console.log(`FAIL ${what}`)
}
const expect = (cond, what) => (cond ? ok(what) : fail(what))
// Child npm runs as a stranger's would: without the npm_* settings an `npm run pack:check` passes down.
const cleanEnv = Object.fromEntries(Object.entries(process.env).filter(([k]) => !/^npm_/i.test(k)))
const run = (cmd, args, opts = {}) => spawnSync(cmd, args, { encoding: "utf8", ...opts, env: { ...cleanEnv, ...(opts.env ?? {}) } })
const tail = (r) => `${r.stdout ?? ""}${r.stderr ?? ""}`.trim().split("\n").slice(-4).join(" | ")

// ------------------------------------------------------------ the folder
const work = resolve(values.dir ?? mkdtempSync(join(tmpdir(), "clegra-ui-pack-check-")))
if (`${work}${sep}`.startsWith(`${pkgDir}${sep}`)) throw new Error(`pack-check: ${work} is inside the repository; use a folder outside it`)
for (let d = dirname(work); ; d = dirname(d)) {
  for (const f of ["node_modules", "package.json"]) if (existsSync(join(d, f))) throw new Error(`pack-check: ${join(d, f)} is above ${work}: Node and npm would pick it up; use another folder (--dir)`)
  if (dirname(d) === d) break
}
mkdirSync(work, { recursive: true })
if (readdirSync(work).length) throw new Error(`pack-check: ${work} is not empty`)
console.log(`pack-check in ${work}`)

// ------------------------------------------------------------ 1. the tarball
const repoManifest = JSON.parse(readFileSync(join(pkgDir, "package.json"), "utf8"))
const packed = JSON.parse(execFileSync(npm, ["pack", "--json", "--pack-destination", work], { cwd: pkgDir, encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] }))[0]
const tarball = join(work, packed.filename)
const files = new Set(packed.files.map((f) => f.path))
console.log(`     ${packed.filename}: ${packed.entryCount} files, ${(packed.size / 1024).toFixed(1)} kB packed, ${(packed.unpackedSize / 1024).toFixed(1)} kB unpacked`)
const manifest = JSON.parse(execFileSync("tar", ["-xzOf", tarball, "package/package.json"], { encoding: "utf8" }))
const isRepoManifest = () => JSON.parse(readFileSync(join(pkgDir, "package.json"), "utf8")).exports["./tokens"]?.default === "./src/tokens.ts" && !existsSync(join(pkgDir, ".package.repo.json"))
expect(manifest.name === "@clegra/ui" && !("private" in manifest) && manifest.version === repoManifest.version && /-/.test(manifest.version), `tarball package.json: @clegra/ui, publishable, the repository's version ${repoManifest.version} (a prerelease)`)
expect(manifest.publishConfig?.access === "public", "tarball package.json: publishConfig.access public (a scoped package)")
expect(JSON.stringify(manifest.scripts) === JSON.stringify({ postpublish: repoManifest.scripts.postpublish }) && !manifest.devDependencies, "tarball package.json: no devDependencies; of the scripts only postpublish")
expect(isRepoManifest(), "after npm pack the repository's package.json is back (exports the TypeScript source)")
for (const f of ["README.md", "LICENSE", "NOTICE.md", "CHANGELOG.md", "package.json"]) expect(files.has(f), `tarball has ${f}`)
expect(![...files].some((f) => /\.tsx?$/.test(f) && !f.endsWith(".d.ts")), "tarball has no TypeScript source")
expect(![...files].some((f) => /\.test\.|^scripts\/|^docs\/|^src\//.test(f)), "tarball has no tests, scripts, docs or source folder")
const leaves = (e) => (typeof e === "string" ? [e] : Object.values(e).flatMap(leaves))
expect(Object.values(manifest.exports).every((e) => e !== null), "no export is closed (null)")
const targets = Object.values(manifest.exports).flatMap(leaves).map((p) => p.replace(/^\.\//, ""))
const matches = (t) => {
  if (!t.includes("*")) return files.has(t)
  const [before, after] = t.split("*")
  return [...files].some((f) => f.startsWith(before) && f.endsWith(after) && !f.slice(before.length, f.length - after.length).includes("/"))
}
const missingTargets = targets.filter((t) => !matches(t))
expect(missingTargets.length === 0, `every export target (${targets.length}, patterns included) is in the tarball${missingTargets.length ? `: ${missingTargets.slice(0, 5).join(", ")}` : ""}`)
expect(Object.keys(manifest.exports).length === Object.keys(repoManifest.exports).length + 1 && "./prebuilt.css" in manifest.exports, `every repository export is published (${Object.keys(repoManifest.exports).length}), plus the generated prebuilt.css`)
/** Every condition object: "default" last, "types" before it (a platform's nested object may come first). */
const shaped = (e) => {
  if (typeof e === "string") return true
  const keys = Object.keys(e)
  return keys.at(-1) === "default" && (!keys.includes("types") || keys.indexOf("types") < keys.indexOf("default")) && Object.values(e).every(shaped)
}
expect(Object.values(manifest.exports).every(shaped), "every condition object of the exports has types before default, default last")
expect(["dist/styles.css", "dist/theme.css", "dist/shadcn.css", "dist/brand/theme.css", "dist/brand/colors.css", "dist/prebuilt.css", "dist/metro.cjs", "dist/components/button.js", "dist/components/button.d.ts", "dist/components/button.native.js", "dist/frame/index.js", "dist/tokens.js"].every((f) => files.has(f)), "the stylesheets, the palette, prebuilt.css, metro.cjs, components (web and native), frame, tokens")
expect(/^"use client";/.test(execFileSync("tar", ["-xzOf", tarball, "package/dist/components/dialog.js"], { encoding: "utf8" })), "the client components keep their \"use client\" directive")
const FORMERLY_RESERVED = ["sidebar", "navigation-menu", "menubar", "bubble", "message", "message-scroller", "trace", "questionnaire", "marker", "attachment", "code-block", "sonner", "resizable", "form"]
expect(FORMERLY_RESERVED.every((n) => files.has(`dist/components/${n}.js`) && files.has(`dist/components/${n}.d.ts`) && files.has(`dist/components/${n}.native.js`)), `the formerly reserved components are shipped, web and native (${FORMERLY_RESERVED.length}: ${FORMERLY_RESERVED.slice(0, 4).join(", ")}, …)`)
expect(manifest.exports["./components/*"] && manifest.exports["./drawn/components/*"] && manifest.exports["./drawn/base-ui/*"] && manifest.exports["./native/toast"] && manifest.exports["./native/expo-ui-controls"], "drawn/*, native/toast and native/expo-ui-controls are exported")
expect(Object.entries(manifest.peerDependencies ?? {}).every(([name]) => manifest.peerDependenciesMeta?.[name]?.optional === true) && !manifest.dependencies, "every library is an optional peer dependency (no dependency)")
expect(!("@clegra/sdk" in (manifest.peerDependencies ?? {})), "@clegra/ui does not depend on @clegra/sdk")
// The shell, public: its entries built and exported (web only, no react-native condition), @dnd-kit only in the reorder entry.
const SHELL_FILES = ["dist/shell/index.js", "dist/shell/index.d.ts", "dist/shell/reorder.js", "dist/shell/reorder.d.ts", "dist/glass.css", ...["pill", "surface", "rows", "confirm-switch"].flatMap((n) => [`dist/clegra/${n}.js`, `dist/clegra/${n}.d.ts`])]
const missingShell = SHELL_FILES.filter((f) => !files.has(f))
expect(missingShell.length === 0 && manifest.exports["./shell"]?.default === "./dist/shell/index.js" && manifest.exports["./shell"]?.types === "./dist/shell/index.d.ts" && manifest.exports["./shell/reorder"]?.default === "./dist/shell/reorder.js" && manifest.exports["./clegra/*"]?.default === "./dist/clegra/*.js" && manifest.exports["./glass.css"] === "./dist/glass.css", `the shell is exported and built: shell, shell/reorder, clegra/* (pill, surface, rows, confirm-switch), glass.css${missingShell.length ? `: missing ${missingShell.join(", ")}` : ""}`)
/** A file of the tarball, read from dist/ (the tarball holds exactly these bytes). */
const packedFile = (f) => readFileSync(join(pkgDir, f), "utf8")
const dndUsers = [...files].filter((f) => /^dist\/.+\.js$/.test(f) && /from\s*["']@dnd-kit\//.test(packedFile(f)))
expect(dndUsers.length === 1 && dndUsers[0] === "dist/shell/reorder.js" && ["@dnd-kit/core", "@dnd-kit/sortable", "@dnd-kit/utilities"].every((n) => manifest.peerDependenciesMeta?.[n]?.optional === true), `only @clegra/ui/shell/reorder imports @dnd-kit (optional peers)${dndUsers.length !== 1 ? `: ${dndUsers.join(", ")}` : ""}`)
// The fonts in the package: a stylesheet alone gives Clegra's type.
const FONTS = { "dist/fonts/inter-latin-wght-normal.woff2": "Inter", "dist/fonts/geist-mono-latin-wght-normal.woff2": "Geist Mono" }
const fontBytes = Object.fromEntries(Object.keys(FONTS).map((f) => [f, files.has(f) ? execFileSync("tar", ["-xzOf", tarball, `package/${f}`]) : Buffer.alloc(0)]))
const notice = packedFile("NOTICE.md")
expect(Object.values(fontBytes).every((b) => b.length > 10000 && b.subarray(0, 4).toString("latin1") === "wOF2") && ["dist/fonts/Inter-OFL.txt", "dist/fonts/GeistMono-OFL.txt"].every((f) => files.has(f) && /SIL OPEN FONT LICENSE/i.test(packedFile(f))) && /\| Inter[^|]*\| SIL Open Font License 1\.1 \|[^\n]*dist\/fonts\/inter-latin-wght-normal\.woff2/.test(notice) && /\| Geist Mono[^|]*\| SIL Open Font License 1\.1 \|[^\n]*dist\/fonts\/geist-mono-latin-wght-normal\.woff2/.test(notice), `Inter and Geist Mono ship as woff2 (${Object.values(fontBytes).map((b) => `${(b.length / 1024).toFixed(1)} kB`).join(", ")}) with their OFL texts, with their rows in NOTICE.md`)
const fontFaces = (css) => [...css.matchAll(/@font-face\s*\{([^}]*)\}/g)].map((m) => m[1])
const declares = (css, family, file) => fontFaces(css).some((b) => new RegExp(`font-family:\\s*"?${family}"?\\s*;?`).test(b) && b.includes(`./fonts/${file}`) && /font-display:\s*swap/.test(b) && /font-weight:\s*100 900/.test(b) && /unicode-range:/.test(b))
for (const sheet of ["dist/styles.css", "dist/prebuilt.css"]) {
  const css = packedFile(sheet)
  expect(declares(css, "Inter", "inter-latin-wght-normal.woff2") && declares(css, "Geist Mono", "geist-mono-latin-wght-normal.woff2") && /--font-sans:\s*"?Inter"?,[^;]*sans-serif/.test(css) && /--font-mono:\s*"?Geist Mono"?,[^;]*monospace/.test(css) && !/--font-(sans|mono):\s*var\(--font-(sans|mono)\)/.test(css), `${sheet}: @font-face for Inter and Geist Mono (./fonts/…, swap, 100 900, latin range), --font-sans: Inter and --font-mono: Geist Mono ahead of a system stack, no self-reference`)
}
const unresolved = []
for (const f of [...files].filter((f) => /\.(js|d\.ts)$/.test(f))) {
  const text = readFileSync(join(pkgDir, f), "utf8")
  for (const m of text.matchAll(/(?:\bfrom|\bimport)\s*\(?\s*["'](\.{1,2}\/[^"']+)["']/g)) {
    const target = relative(pkgDir, resolve(dirname(join(pkgDir, f)), m[1].replace(/\.js$/, f.endsWith(".d.ts") ? ".d.ts" : ".js")))
    if (!files.has(target)) unresolved.push(`${f} → ${m[1]}`)
  }
  if (/["']@clegra\/ui\//.test(text)) unresolved.push(`${f} imports @clegra/ui by name`)
}
expect(unresolved.length === 0, `every relative import in dist resolves inside the tarball, none by the package's own name${unresolved.length ? `: ${unresolved.slice(0, 5).join(", ")}` : ""}`)
// The hygiene list names what must never ship, so it is private: it lives in the repository this package is developed
// in, not in the package (and not in a public copy, where this step is skipped).
const hygiene = resolve(pkgDir, "../../scripts/hygiene/hygiene.mjs")
if (existsSync(hygiene)) {
  const { checkTarball } = await import(hygiene)
  const findings = checkTarball("ui", tarball)
  expect(findings.length === 0, `hygiene check (nothing internal ships)${findings.length ? `:\n       ${findings.join("\n       ")}` : ""}`)
} else console.log("  (hygiene check skipped: the private list is not in this checkout)")
const untagged = run(npm, ["publish", "--dry-run"], { cwd: pkgDir })
expect(untagged.status !== 0 && /prerelease/.test(untagged.stdout + untagged.stderr), `npm publish --dry-run without --tag is refused (a prerelease)${untagged.status !== 0 ? "" : `: ${tail(untagged)}`}`)
const dry = run(npm, ["publish", "--dry-run", "--tag", "next"], { cwd: pkgDir })
expect(dry.status === 0 && /with tag next/.test(dry.stdout + dry.stderr) && /\(dry-run\)/.test(dry.stdout + dry.stderr) && /public access/.test(dry.stdout + dry.stderr), `npm publish --dry-run --tag next runs, public access (uploads nothing)${dry.status === 0 ? "" : `: ${tail(dry)}`}`)
expect(isRepoManifest(), "after the dry-run publishes the repository's package.json is back")

/** The repository's installed version of a package. */
const version = (name) => JSON.parse(readFileSync(join(pkgDir, "node_modules", ...name.split("/"), "package.json"), "utf8")).version
const NATIVE_ONLY = ["react-native", "react-native-svg", "lucide-react-native", "@expo/ui"]
// @dnd-kit stays out: the shell must work without it (only @clegra/ui/shell/reorder needs it).
const webPeers = Object.keys(manifest.peerDependencies).filter((n) => !NATIVE_ONLY.includes(n) && n !== "tailwindcss" && !n.startsWith("@dnd-kit/"))

// ------------------------------------------------------------ 2. plain Node
const plain = join(work, "plain")
mkdirSync(plain, { recursive: true })
writeFileSync(join(plain, "package.json"), `${JSON.stringify({ name: "pack-check-plain", private: true, type: "module", dependencies: { "@clegra/ui": `file:../${packed.filename}` } }, null, 2)}\n`)
const plainInstall = run(npm, ["install", "--no-audit", "--no-fund", "--loglevel=error"], { cwd: plain })
if (plainInstall.status !== 0) throw new Error(`pack-check: npm install (plain) failed:\n${plainInstall.stderr}`)
expect(!existsSync(join(plain, "node_modules", "react")) && !existsSync(join(plain, "node_modules", "@base-ui")), "plain install: no React and no UI library pulled in (optional peers)")
writeFileSync(join(plain, "probe.mjs"), `import { colorsFor, radius } from "@clegra/ui/tokens"\nimport { createRequire } from "node:module"\nconst { withClegraUI } = createRequire(import.meta.url)("@clegra/ui/metro")\nconst c = withClegraUI({})\nconsole.log(JSON.stringify({ primary: colorsFor("light").primary, radius: typeof radius, ios: c.resolver.unstable_conditionsByPlatform.ios }))\n`)
const probe = run(process.execPath, [join(plain, "probe.mjs")], { cwd: plain })
expect(probe.status === 0 && /"primary":"#/i.test(probe.stdout) && /"ios"/.test(probe.stdout), `plain Node: @clegra/ui/tokens (ESM) and @clegra/ui/metro (CommonJS)${probe.status !== 0 ? `:\n${probe.stdout}${probe.stderr}` : ""}`)
if (!values.keep) rmSync(join(plain, "node_modules"), { recursive: true, force: true })

// ------------------------------------------------------------ 3. a fresh Next.js app with Tailwind 4
const app = join(work, "next-app")
mkdirSync(join(app, "app"), { recursive: true })
writeFileSync(
  join(app, "package.json"),
  `${JSON.stringify(
    {
      name: "pack-check-app",
      private: true,
      scripts: { dev: "next dev", build: "next build", start: "next start" },
      dependencies: { "@clegra/ui": `file:../${packed.filename}`, next: version("next"), ...Object.fromEntries(webPeers.map((n) => [n, version(n)])) },
      devDependencies: { typescript: version("typescript"), "@types/node": version("@types/node"), "@types/react": version("@types/react"), "@types/react-dom": version("@types/react-dom"), tailwindcss: version("tailwindcss"), "@tailwindcss/postcss": version("@tailwindcss/postcss") },
    },
    null,
    2,
  )}\n`,
)
writeFileSync(join(app, "next.config.ts"), 'import type { NextConfig } from "next"\n\nconst nextConfig: NextConfig = {}\n\nexport default nextConfig\n')
const tsconfig = { compilerOptions: { target: "ES2022", lib: ["dom", "dom.iterable", "esnext"], allowJs: false, skipLibCheck: true, strict: true, noEmit: true, esModuleInterop: true, module: "esnext", moduleResolution: "bundler", resolveJsonModule: true, isolatedModules: true, jsx: "react-jsx", incremental: false, plugins: [{ name: "next" }], paths: { "@/*": ["./*"] } }, include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"], exclude: ["node_modules", "check"] }
writeFileSync(join(app, "tsconfig.json"), `${JSON.stringify(tsconfig, null, 2)}\n`)
writeFileSync(join(app, "postcss.config.mjs"), 'const config = { plugins: { "@tailwindcss/postcss": {} } }\n\nexport default config\n')
writeFileSync(join(app, "app", "globals.css"), '@import "tailwindcss";\n@import "@clegra/ui/styles.css";\n@import "@clegra/ui/glass.css";\n')
writeFileSync(join(app, "app", "layout.tsx"), 'import "./globals.css"\n\nexport default function RootLayout({ children }: { children: React.ReactNode }) {\n  return (\n    <html lang="en">\n      <body>{children}</body>\n    </html>\n  )\n}\n')
writeFileSync(
  join(app, "app", "page.tsx"),
  `import { Button } from "@clegra/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@clegra/ui/components/card"
import { Sidebar, SidebarContent, SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarInset } from "@clegra/ui/components/sidebar"
import { Toaster } from "@clegra/ui/components/sonner"

export default function Home() {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>Orders</SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <main className="p-6">
          <Card>
            <CardHeader>
              <CardTitle>Pack check</CardTitle>
            </CardHeader>
            <CardContent>
              <Button>Save the order</Button>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  )
}
`,
)
// The shell, as the guide frames an app's pages (a client component, no @dnd-kit), and the same frame under /embed, whose
// layout passes `embedded` (shown inside Clegra: no chrome).
mkdirSync(join(app, "components"), { recursive: true })
writeFileSync(
  join(app, "components", "frame.tsx"),
  `"use client"

import Link from "next/link"
import { HouseIcon, InboxIcon, LogOutIcon } from "lucide-react"
import { AppShell, ShellMain, ShellPage, ShellRail, useShell } from "@clegra/ui/shell"

function Probe() {
  const { embedded } = useShell()
  return <p data-probe-page={embedded ? "embedded" : "standalone"}>The shell's page</p>
}

export function Frame({ embedded = false }: { embedded?: boolean }) {
  return (
    <AppShell
      link={Link}
      embedded={embedded}
      rail={
        <ShellRail
          groups={[{ id: "pages", items: [{ id: "home", label: "Home", href: "/shell", icon: HouseIcon }, { id: "orders", label: "Orders", href: "/shell", icon: InboxIcon, active: true }] }]}
          user={{ name: "Pack Check", email: "pack@check.test", menu: [{ kind: "item", id: "out", label: "Sign out", icon: LogOutIcon, onSelect: () => {} }] }}
        />
      }
    >
      <ShellMain label="Orders">
        <div className="px-(--shell-gutter) pt-(--shell-header) pb-(--shell-bottom)">
          <ShellPage title="Orders" description="The shell's page.">
            <Probe />
          </ShellPage>
        </div>
      </ShellMain>
    </AppShell>
  )
}
`,
)
for (const [dir, up, embedded] of [["shell", "../..", false], [join("embed", "board"), "../../..", true]]) {
  mkdirSync(join(app, "app", dir), { recursive: true })
  writeFileSync(join(app, "app", dir, "page.tsx"), `import { Frame } from "${up}/components/frame"\n\nexport default function Page() {\n  return <Frame${embedded ? " embedded" : ""} />\n}\n`)
}
const install = run(npm, ["install", "--no-audit", "--no-fund", "--loglevel=error"], { cwd: app })
if (install.status !== 0) throw new Error(`pack-check: npm install failed:\n${install.stderr}`)
ok(`fresh Next.js app (Tailwind 4) installed with the tarball and the ${webPeers.length} web peer libraries`)
expect(existsSync(join(app, "node_modules/@clegra/ui/dist/components/sidebar.js")) && !existsSync(join(app, "node_modules/@clegra/ui/src")), "node_modules/@clegra/ui holds the built package only")
expect(!existsSync(join(app, "node_modules", "@dnd-kit")), "the fresh app has no @dnd-kit (the shell does not need it)")

const nextBin = join(app, "node_modules", "next", "dist", "bin", "next")
const ADVISORY = /affected by a known security vulnerability|SecurityFatalError/
const nextBuild = () => run(process.execPath, [nextBin, "build"], { cwd: app, env: { NEXT_TELEMETRY_DISABLED: "1" } })
let build = nextBuild()
if (build.status !== 0 && ADVISORY.test(build.stdout + build.stderr)) {
  console.log(`note Next.js ${version("next")} stopped \`next build\` once to report a security advisory for itself; run again`)
  build = nextBuild()
}
expect(build.status === 0, "next build (a page with Button, Card, Sidebar and Toaster; a page on <AppShell>, standalone and embedded)")
if (build.status !== 0) console.log(build.stdout + build.stderr)
else {
  const base = `http://localhost:${port}`
  let output = ""
  const child = spawn(process.execPath, [nextBin, "start", "-p", String(port)], { cwd: app, detached: true, env: { ...cleanEnv, NEXT_TELEMETRY_DISABLED: "1", NODE_ENV: "production" }, stdio: ["ignore", "pipe", "pipe"] })
  const stop = () => {
    try {
      if (child.exitCode === null) process.kill(-child.pid, "SIGTERM")
    } catch {}
  }
  process.on("exit", stop)
  child.stdout.on("data", (d) => (output += d))
  child.stderr.on("data", (d) => (output += d))
  let page = null
  for (const deadline = Date.now() + 60_000; Date.now() < deadline && child.exitCode === null; ) {
    try {
      const r = await fetch(`${base}/`)
      if (r.ok) {
        page = await r.text()
        break
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 400))
  }
  expect(page !== null, `next start answers${page === null ? `:\n${output.slice(-2000)}` : ""}`)
  if (page) {
    expect(/data-slot="button"[^>]*>Save the order</.test(page) && /data-slot="card"/.test(page), "next start: the page renders Button and Card")
    expect(/data-slot="sidebar(-wrapper)?"/.test(page) && /data-sidebar="menu-button"/.test(page) && />Orders</.test(page), "next start: the page renders the Sidebar (formerly reserved)")
    const sheets = [...page.matchAll(/<link[^>]+href="([^"]+\.css)"/g)].map((m) => m[1])
    const css = (await Promise.all(sheets.map(async (href) => (await fetch(new URL(href, base))).text()))).join("\n")
    expect(/--primary:/.test(css) && /\.bg-primary\b/.test(css) && /\.bg-sidebar\b/.test(css), `next start: the stylesheet has the theme (--primary) and the components' classes, the sidebar's too (Tailwind saw @clegra/ui)${sheets.length ? "" : ": no stylesheet linked"}`)
    // The type: with only the documented imports, Inter is declared, served and the root's font.
    const faces = fontFaces(css).filter((b) => /font-family:\s*"?Inter"?\s*;?/.test(b))
    const fontHref = faces.map((b) => /url\(\s*["']?([^"')]+\.woff2)["']?\s*\)/.exec(b)?.[1]).find(Boolean)
    const sheetHref = sheets.find(Boolean)
    const fontUrl = fontHref && sheetHref ? new URL(fontHref, new URL(sheetHref, base)) : null
    const font = fontUrl ? await fetch(fontUrl) : null
    const served = font?.ok ? Buffer.from(await font.arrayBuffer()) : Buffer.alloc(0)
    expect(Boolean(font?.ok) && served.subarray(0, 4).toString("latin1") === "wOF2" && served.equals(fontBytes["dist/fonts/inter-latin-wght-normal.woff2"]), `next start: the stylesheet declares Inter and its woff2 is served (${fontUrl ? `${fontUrl.pathname}: ${font?.status}, ${served.length} bytes` : "no @font-face url"})`)
    expect(/--font-sans:\s*"?Inter"?,/.test(css) && /(html|:host)[^{]*\{[^}]*font-family:\s*var\(--font-sans\)/.test(css) && !/--font-sans:\s*var\(--font-sans\)/.test(css), "next start: the root's font-family is var(--font-sans), Inter ahead of a system stack (no self-reference)")
    expect(/\.glass-thick\b/.test(css) && /\.scroll-edge\b/.test(css), "next start: the stylesheet has the shell's glass (glass.css)")
    // The shell: a standalone page with its chrome, an embed page with none, decided in the first HTML.
    const shellPage = await (await fetch(`${base}/shell`)).text()
    const embedPage = await (await fetch(`${base}/embed/board`)).text()
    expect(/data-sidebar-panels/.test(shellPage) && /data-app="orders"/.test(shellPage) && /account-button/.test(shellPage) && /data-page-heading/.test(shellPage) && /data-probe-page="standalone"/.test(shellPage) && !/data-shell-embedded/.test(shellPage), "next start: a page on <AppShell> has its rail, its items, the person's face and the ShellPage heading (no @dnd-kit installed)")
    expect(/data-probe-page="embedded"/.test(embedPage) && /data-shell-embedded/.test(embedPage) && !/data-sidebar-panels|data-app="orders"|account-button|data-header-bar/.test(embedPage), "next start: the same frame embedded (/embed/board) has no chrome in its first HTML, only the page; useShell() says embedded")
  }
  stop()
}

// ------------------------------------------------------------ 4. TypeScript consumers
const check = join(app, "check")
mkdirSync(check, { recursive: true })
writeFileSync(
  join(check, "ui.tsx"),
  `import { Button, buttonVariants } from "@clegra/ui/components/button"
import { Card, CardContent } from "@clegra/ui/react/components/card"
import { SidebarProvider, Sidebar, useSidebar } from "@clegra/ui/components/sidebar"
import { Toaster } from "@clegra/ui/components/sonner"
import { useIsMobile } from "@clegra/ui/hooks/use-mobile"
import { ClegraProvider, hostContextFor } from "@clegra/ui/frame"
import { colorsFor } from "@clegra/ui/tokens"
import { AppShell, ShellPage, ShellRail, HeaderPill, useShell, type RailItem, type ShellUser } from "@clegra/ui/shell"
import { RowList, Row, FactList, Fact } from "@clegra/ui/clegra/rows"
import { ConfirmSwitch, needsConfirmation } from "@clegra/ui/clegra/confirm-switch"
export const shellParts = [AppShell, ShellPage, ShellRail, HeaderPill, useShell, RowList, Row, FactList, Fact, ConfirmSwitch]
export const asks: boolean = needsConfirmation(true, "on")
export const item: RailItem = { id: "a", label: "A", href: "/", icon: () => null }
export const user: ShellUser = { name: "A", email: "a@b.test" }
export function View() {
  const mobile: boolean = useIsMobile()
  return (
    <ClegraProvider appInfo={{ name: "probe", version: "1.0.0" }}>
      <SidebarProvider><Sidebar /><Card><CardContent><Button variant="outline" className={buttonVariants({ size: "sm" })}>{mobile ? "a" : "b"}</Button></CardContent></Card></SidebarProvider>
      <Toaster />
    </ClegraProvider>
  )
}
export const primary: string = colorsFor("light").primary
export const host = hostContextFor
export const sidebar = useSidebar
`,
)
const tsc = join(app, "node_modules", "typescript", "bin", "tsc")
for (const [mode, module] of [["bundler", "esnext"], ["node16", "node16"]]) {
  if (mode === "node16") writeFileSync(join(check, "package.json"), '{ "type": "module" }\n')
  const config = join(check, `tsconfig.${mode}.json`)
  writeFileSync(config, `${JSON.stringify({ compilerOptions: { target: "ES2022", lib: ["ES2023", "DOM", "DOM.Iterable"], types: ["node"], module, moduleResolution: mode, jsx: "react-jsx", strict: true, noEmit: true, skipLibCheck: true }, files: ["ui.tsx"] }, null, 2)}\n`)
  const r = run(process.execPath, [tsc, "-p", config], { cwd: check })
  expect(r.status === 0, `tsc, moduleResolution ${mode}: components (the sidebar and sonner too), frame, tokens, hooks, shell, clegra/rows, clegra/confirm-switch${r.status !== 0 ? `:\n${r.stdout}${r.stderr}` : ""}`)
}

// ------------------------------------------------------------ done
if (!values.keep) {
  rmSync(join(app, "node_modules"), { recursive: true, force: true })
  rmSync(join(app, ".next"), { recursive: true, force: true })
}
console.log(failures ? `\npack-check: ${failures} FAILED, ${passed} passed (${work})` : `\npack-check: all ${passed} passed (${work}${values.keep ? ", kept" : ", node_modules and .next deleted"})`)
process.exit(failures ? 1 : 0)
