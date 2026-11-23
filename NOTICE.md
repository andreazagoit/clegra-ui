# Notices

## Owner and trademark

`@clegra/ui` is licensed under the MIT licence (see `LICENSE`). «Clegra» is a
trademark, not a company: the legal owner of the software and of the
trademark is Andrea Zago, ditta individuale (sole proprietorship, Italy).

The Clegra name, the logo and the face are not licensed with this package:
the MIT licence covers the code and the theme's values, not the brand.

## Third-party work

`@clegra/ui` builds on the work of others. Their licences apply to their
parts.

| Work | Licence | Where |
| --- | --- | --- |
| shadcn/ui (component sources) | MIT | `@clegra/ui/components/*` (web) |
| Base UI (`@base-ui/react`) | MIT | optional peer dependency |
| Lucide (`lucide-react`, `lucide-react-native`) | ISC | optional peer dependencies |
| Recharts | MIT | optional peer dependency (`@clegra/ui/components/chart`) |
| cmdk | MIT | optional peer dependency (`@clegra/ui/components/command`) |
| Embla Carousel | MIT | optional peer dependency (`@clegra/ui/components/carousel`) |
| React Day Picker | MIT | optional peer dependency (`@clegra/ui/components/calendar`) |
| date-fns | MIT | optional peer dependency |
| input-otp | MIT | optional peer dependency |
| Sonner | MIT | optional peer dependency |
| next-themes | MIT | optional peer dependency |
| react-resizable-panels | MIT | optional peer dependency |
| class-variance-authority | Apache-2.0 | optional peer dependency |
| tw-animate-css | MIT | optional peer dependency |
| dnd-kit (`@dnd-kit/core`, `/sortable`, `/utilities`) | MIT | optional peer dependencies (`@clegra/ui/shell/reorder`) |
| Inter (The Inter Project Authors) | SIL Open Font License 1.1 | shipped: `dist/fonts/inter-latin-wght-normal.woff2`, licence `dist/fonts/Inter-OFL.txt` |
| Geist Mono (The Geist Project Authors) | SIL Open Font License 1.1 | shipped: `dist/fonts/geist-mono-latin-wght-normal.woff2`, licence `dist/fonts/GeistMono-OFL.txt` |

The two fonts are the variable (weight 100 to 900), latin-subset woff2 files of
Fontsource (`@fontsource-variable/inter`, `@fontsource-variable/geist-mono`),
unchanged; the OFL lets them be bundled and redistributed with software, never
sold on their own. Their full licence texts ship beside them.

Check each dependency's own licence file for the exact text: this table is a
summary, verified by hand before each release.
