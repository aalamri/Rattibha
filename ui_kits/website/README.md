# Rattibha — Marketing Website UI kit

A high-fidelity recreation of the **Rattibha marketing homepage** (desktop, ~1280px). Open `index.html`.

## Sections (top → bottom)
1. **NavBar** — logo, links, bilingual language toggle (EN ⇄ العربية), Sign in, “Get started”. Sticky + translucent blur.
2. **Hero** — display headline with an italic rose accent word, lead copy, a segmented **search bar** (Event / City / Date + submit), trust row (stacked avatars + rating), and a photo collage with a floating planner card. Faint khatam-star motif behind.
3. **Categories** — five category cards (Weddings, Birthdays, Engagements, Corporate, Galas).
4. **FeaturedGrid** — four `PlannerCard`s on a white band.
5. **HowItWorks** — three numbered steps on plum icon tiles.
6. **Testimonials** — three quote cards on warm-50.
7. **CTABand** — aubergine “For event planners” panel with confetti motif and gold CTA.
8. **Footer** — link columns, social icons, bilingual legal row.

## Files
- `index.html` — loads tokens, fonts, Phosphor (regular/bold/fill), React/Babel; mounts `Site`.
- `site.jsx` — shared tokens + primitives + data: `C`, `SANS`/`DISPLAY`, `Photo`, `Logo`, `Badge`, `Btn`, `Avatar`, and `PLANNERS` / `CATS` / `STEPS` / `QUOTES`.
- `sections.jsx` — all section components + `SectionHead`, `PlannerCard`, `SearchSeg`.

## Conventions
- `WRAP` = centered 1180px column with 40px gutters.
- Clean **white** page background; section separation via hairline borders, shadows and subtle card tints (testimonial cards use the off-white `cream` token).
- Playfair Display headlines (often with one italic royal-purple word), Poppins body, gold tracked-out overlines, Phosphor icons.
- Components export to `window` at the end of each babel file.

## To extend
Add a section component, export it on `window`, and drop it into `Site` in `index.html`. Reuse `SectionHead`, `PlannerCard`, `Btn`, `Badge`. Swap `Photo` placeholders for real photography.
