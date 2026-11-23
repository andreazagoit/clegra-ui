// THE BUILD: src/ → dist/ (git-ignored), what the tarball ships. Run: npm run build (also the first step of `npm pack`
// and `npm publish`, scripts/prepack.mjs). In the repository the package exports its TypeScript and CSS source; the
// tarball gets:
//   - dist/: ESM JavaScript + .d.ts per file (tsc, "use client" kept), the same layout as src/ (dist/components/…),
//     relative imports with their ".js", the package's own `@clegra/ui/...` imports made relative (a published file
//     never resolves itself by name);
//   - the stylesheets (styles.css, shadcn.css, theme.css and the palette and the apps' accents in brand/, glass.css: the shell's glass),
//     comments out; metro.cjs;
//   - the fonts (fonts/: Inter and Geist Mono, variable woff2, latin, with their OFL texts) next to styles.css and
//     prebuilt.css, which declare them with @font-face (url("./fonts/…"));
//   - prebuilt.css: Tailwind over the compiled components, with the theme and the glass (a view needs no Tailwind).
// Every component and entry of the repository is published: there is no reserved or repository-only part.
// The UI libraries are optional peer dependencies (package.json), never bundled; every bare import of dist must be one.
import { execFileSync } from "node:child_process"
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs"
import { createRequire } from "node:module"
import { dirname, join, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"

export const pkgDir = resolve(dirname(fileURLToPath(import.meta.url)), "..")
export const NAME = "@clegra/ui"

/** The fonts the stylesheets declare (src/fonts), shipped beside them with their licences. */
export const FONT_FILES = ["inter-latin-wght-normal.woff2", "geist-mono-latin-wght-normal.woff2", "Inter-OFL.txt", "GeistMono-OFL.txt"]

/** Exports that exist only in the published package: files the build generates. */
export const GENERATED_EXPORTS = { "./prebuilt.css": "./dist/prebuilt.css" }

const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]))

/** Builds src/ into dist/. */
export async function build() {
  const out = join(pkgDir, "dist")
  const src = join(pkgDir, "src")
  rmSync(out, { recursive: true, force: true })
  const tsconfig = join(pkgDir, "tsconfig.build.json")
  writeFileSync(
    tsconfig,
    JSON.stringify({
      extends: "./tsconfig.json",
      compilerOptions: { noEmit: false, declaration: true, outDir: "dist", rootDir: "src", types: [] },
      include: ["src/**/*.ts", "src/**/*.tsx"],
      exclude: ["src/**/*.test.ts", "src/**/fixtures.ts"],
    }),
  )
  try {
    const tsc = createRequire(join(pkgDir, "package.json")).resolve("typescript/bin/tsc")
    execFileSync(process.execPath, [tsc, "-p", tsconfig], { stdio: ["ignore", 2, 2] })
  } finally {
    rmSync(tsconfig, { force: true })
  }

  // 1. The package's own `@clegra/ui/<platform>/<area>/<name>` imports → relative files (the web or the native file,
  //    as the specifier says; a conditional one from a file of one platform takes that platform's).
  const self = new RegExp(`((?:\\bfrom|\\bimport)\\s*\\(?\\s*["'])${NAME.replace("/", "\\/")}\\/([^"']+)(["'])`, "g")
  for (const file of walk(out)) {
    if (!/\.(js|d\.ts)$/.test(file)) continue
    const text = readFileSync(file, "utf8")
    const native = /\.(native|ios)\.(js|d\.ts)$/.test(file)
    const fixed = text.replace(self, (all, a, spec, b) => {
      const m = /^(react\/|react-native\/|drawn\/)?(components|base-ui|hooks)\/([\w-]+)$/.exec(spec)
      let target
      if (m) target = `${m[2]}/${m[3]}${m[1] === "react-native/" || m[1] === "drawn/" || (!m[1] && native) ? ".native" : ""}`
      else if (spec === "frame") target = "frame/index"
      else if (spec === "accents") target = "brand/accents"
      else if (/^(tokens|native\/[\w-]+)$/.test(spec)) target = spec
      else if (/^(react\/|react-native\/)?primitives$/.test(spec)) target = spec.startsWith("react-native/") || (!spec.startsWith("react/") && native) ? "primitives.native" : "primitives"
      else throw new Error(`build: ${relative(out, file)} imports ${NAME}/${spec}: no file for it`)
      if (!existsSync(join(out, `${target}.js`))) throw new Error(`build: ${relative(out, file)} imports ${NAME}/${spec}, which is not in dist`)
      let rel = relative(dirname(file), join(out, target))
      if (!rel.startsWith(".")) rel = `./${rel}`
      return `${a}${rel}${b}`
    })
    if (fixed !== text) writeFileSync(file, fixed)
  }

  // 2. Relative imports get their ".js": the sources import "./x" for the bundlers and tsx; Node's ESM loader and
  //    `moduleResolution: node16` need the extension (in the .js and in the .d.ts).
  const specifier = /((?:\bfrom|\bimport)\s*\(?\s*["'])(\.{1,2}\/[^"']+?)(["'])/g
  for (const file of walk(out)) {
    if (!/\.(js|d\.ts)$/.test(file)) continue
    const text = readFileSync(file, "utf8")
    const fixed = text.replace(specifier, (all, a, path, b) => {
      if (/\.(js|json|mjs|cjs|css)$/.test(path)) return all
      const base = resolve(dirname(file), path)
      const target = existsSync(`${base}.js`) || existsSync(`${base}.d.ts`) ? `${path}.js` : existsSync(join(base, "index.js")) ? `${path}/index.js` : null
      if (!target) throw new Error(`build: ${relative(pkgDir, file)} imports ${path}, which is not in dist`)
      return `${a}${target}${b}`
    })
    if (fixed !== text) writeFileSync(file, fixed)
  }

  // 3. Stylesheets: comments out (they describe the repository), the palette in.
  const css = (name) => {
    mkdirSync(dirname(join(out, name)), { recursive: true })
    writeFileSync(join(out, name), readFileSync(join(src, name), "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\n{3,}/g, "\n\n").trimStart())
  }
  for (const name of ["styles.css", "shadcn.css", "theme.css", "glass.css", "brand/theme.css", "brand/colors.css", "brand/accents.css"]) css(name)
  mkdirSync(join(out, "fonts"), { recursive: true })
  for (const f of FONT_FILES) copyFileSync(join(src, "fonts", f), join(out, "fonts", f))
  for (const f of ["styles.css", "glass.css"]) if (/@import\s+["'](?!\.\/|tw-animate-css)/.test(readFileSync(join(out, f), "utf8"))) throw new Error(`build: ${f} imports something outside the package`)
  if (!/@font-face[^}]*"Inter"[^}]*url\("\.\/fonts\/inter-latin-wght-normal\.woff2"\)/.test(readFileSync(join(out, "styles.css"), "utf8"))) throw new Error("build: styles.css lost Inter's @font-face")
  if (!readFileSync(join(out, "theme.css"), "utf8").includes('"./brand/theme.css"')) throw new Error("build: theme.css does not bring in ./brand/theme.css")
  if (!readFileSync(join(out, "styles.css"), "utf8").includes('@source "./"')) throw new Error("build: styles.css lost its @source of the components")
  writeFileSync(join(out, "metro.cjs"), readFileSync(join(src, "metro.cjs"), "utf8"))

  // 4. prebuilt.css: Tailwind over the compiled components, with the theme, the fonts and the glass.
  const require = createRequire(join(pkgDir, "package.json"))
  const postcss = require("postcss")
  const tailwind = require("@tailwindcss/postcss")
  const entry = join(out, ".prebuilt.entry.css")
  writeFileSync(entry, `@import "tailwindcss";\n@import "./styles.css";\n@import "./glass.css";\n`)
  try {
    const result = await postcss([tailwind({ base: out, optimize: { minify: true } })]).process(readFileSync(entry, "utf8"), { from: entry, to: join(out, "prebuilt.css") })
    writeFileSync(join(out, "prebuilt.css"), result.css)
  } finally {
    rmSync(entry, { force: true })
  }
  if (statSync(join(out, "prebuilt.css")).size < 20000) throw new Error("build: prebuilt.css is empty")
  const prebuilt = readFileSync(join(out, "prebuilt.css"), "utf8")
  if (!prebuilt.includes("./fonts/inter-latin-wght-normal.woff2") || !/--font-sans:\s*"?Inter/.test(prebuilt) || !prebuilt.includes(".glass-thick")) throw new Error("build: prebuilt.css lost the fonts (@font-face with ./fonts/…, --font-sans: Inter) or the glass")

  // 5. Nothing undeclared.
  const undeclared = undeclaredImports(out, JSON.parse(readFileSync(join(pkgDir, "package.json"), "utf8")))
  if (undeclared.length) throw new Error(`build: dist imports what package.json does not declare:\n  ${undeclared.join("\n  ")}`)
  return out
}

/** Every bare import of dist must be a dependency or peer dependency of the package (nothing undeclared). */
export function undeclaredImports(dist, pkg) {
  const declared = new Set([...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.peerDependencies ?? {})])
  const bad = []
  for (const file of walk(dist)) {
    if (!/\.(js|d\.ts)$/.test(file)) continue
    for (const m of readFileSync(file, "utf8").matchAll(/(?:^|[;}\s])(?:from|import)\s*\(?\s*["']([^"'.\n][^"'\n]*)["']/gm)) {
      const name = m[1].startsWith("@") ? m[1].split("/").slice(0, 2).join("/") : m[1].split("/")[0]
      if (name.startsWith("node:") || declared.has(name)) continue
      bad.push(`${relative(dist, file)} imports ${m[1]}`)
    }
  }
  return bad
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const out = await build()
  console.error(`built ${relative(process.cwd(), out) || "."}`)
}
