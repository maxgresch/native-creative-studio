# Native Creative Studio

A prototype for publisher studios: review native-content concepts, inspect a reading sample and build the teasers that lead to it.

**Current status:** the example, teaser creator and exports work. Automatic concept and draft generation require a server-side model connection and are not enabled in the demo.

By [Max Greschak](https://github.com/maxgresch). The interface is in German.

## Try it

- Open **Teaser-Creator** for an editable example.
- Change the single kicker, headline, body, format, arrow colour or image.
- Preview Billboard 970 × 250, Halfpage 300 × 600 and Mobile 320 × 480.
- Use the checkbox to add or remove the STORY BERLIN sender; it starts switched off.
- Download PNG, SVG or HTML. The logo selection is retained in every export and the saved project. Clickable HTML requires a destination URL. The Native template uses an arrow instead of an extra CTA button.
- Save the project JSON and reopen it later. Text is also saved in the current browser tab; images are included in downloaded project files.

The authored Kärcher concept study has two distinct routes with a separate reading sample for each, based on dated public project documentation, the Berlin heritage database and a personal archive record. It is not a commission or a live model result. The old fictional example remains only as a legacy-import test fixture. The preview image is a labelled placeholder until an image is supplied. The Native template follows supplied Mercedes-Benz and Stadler references. Its fonts are Franklin Gothic FS Demi/Book; font files and customer reference images are not distributed here.

## Concept workflow

1. Enter the brand brief, audience, media environment and source excerpts.
2. Review two or three approaches, each with a human task, narrative development, reader gain, brand role, proposed execution and source references. Inspect the reasoned recommendation.
3. Select and edit an approach before requesting the draft. Each unchanged route in the saved case opens its own authored sample. Changed inputs never silently reuse that sample.
4. Review the reading sample and edit its teaser creatives. The reading preview can also open in its own tab, using the same self-contained HTML as the export.

Steps 2 and 3 need the model connection for new inputs. The saved example can be inspected without it. The interface does not ask users to switch to a separate ChatGPT conversation.

## Run locally

Requires Node.js 22.13+ and npm. Original Native typography also needs privately configured Franklin Gothic FS Book/Demi files; see [docs/NATIVE-DESIGN.md](docs/NATIVE-DESIGN.md). The hosted prototype has this font configuration.

```sh
npm run install:ci
npm run dev
```

Checks and production build:

```sh
npm test
npm run typecheck
npm run build
```

The application uses React, Vinext and a Cloudflare Worker. Runtime instructions are in [docs/RUNTIME.md](docs/RUNTIME.md). Source upload instructions are in [docs/GITHUB.md](docs/GITHUB.md).

## Optional model connection

The server adapter reads `OPENAI_API_KEY` and `OPENAI_MODEL` from runtime bindings. Store actual credentials in hosting secrets or an ignored local `.dev.vars` file. `.env.example` documents the names only.

No real model call was made during validation. Provider tests use mocked responses. The default model is configured in `lib/studio-contract.mjs` and can be changed through the server environment.

## Source files

| File | Purpose |
| --- | --- |
| `app/page.tsx` | Brief, route selection, reading preview and project controls |
| `components/teaser-creator.tsx` | Teaser editor and downloads |
| `lib/teaser-creative.mjs` | Measured layout, SVG renderer and destination handling |
| `lib/teaser-typography.mjs` | Private font loading for outlined text |
| `app/api/teaser-render/route.ts` | Server-side text outlines; receives no image bytes |
| `lib/studio-contract.mjs` | Output schemas and evidence checks |
| `lib/reading-preview.mjs` | Responsive editorial reading page and self-contained HTML export |
| `lib/editorial-standard.mjs` | Shared concept, writing and evidence instructions |
| `lib/studio-generator.mjs` | Server-side model requests |
| `lib/studio-project.mjs` | Save, import and tab recovery |
| `lib/studio-examples.mjs` | Authored example and starting briefs |
| `tests/` | Contract, renderer, export and provider-failure tests |

## Limits

See [docs/EDITORIAL-STANDARD.md](docs/EDITORIAL-STANDARD.md). Schema 0.4 supports variable article sections, optional endings and separate references for headline, standfirst, endings and teasers. Versions 0.1–0.3 remain readable without invented human metadata. Legacy routes must meet the current contract before new generation.

Exact source fragments and reference IDs are checked. This does not establish whether a claim is true or whether a source supports it. Editorial review remains necessary.

Source URLs are recorded, not fetched. PDF/DOCX ingestion, full story production, CMS publishing and ad-server certification are outside this version. Exported creatives are concepts that need review against the intended placement's requirements.

The reading preview uses three style palettes. Proposed interactions are not automatically implemented. Project files retain images; automatic tab storage excludes image bytes.

## Source material and attribution

The Kärcher case uses sources checked on 17 November 2026. Manufacturer descriptions, heritage information and personal recollection remain distinct. Photo rights and new interviews are open. Other prepared briefs were checked on 16 November 2026:

- [Kärcher — Brandenburger Tor](https://www.kaercher.com/int/inside-kaercher/company/sponsoring/cultural-sponsorship/brandenburger-tor.html)
- [Landesdenkmalamt Berlin — Brandenburger Tor](https://denkmaldatenbank.berlin.de/daobj.php?obj_dok_nr=09065019)
- [Deutsche Kinemathek / bpb — Dagmar Lipper archive record](https://wwsf.deutsche-kinemathek.de/index.php/Detail/Object/Show/object_id/785/set_id/362)
- [Leica — Content Credentials](https://leica-camera.com/en-int/photography/content-credentials)
- [Vitra — Circularity as a concept](https://www.vitra.com/de-de/magazine/details/circularity-as-a-concept)

These are independent concept-study inputs. No assignment, partnership, endorsement or participation is claimed. Recheck sources and replace summaries with approved production material before any external use. No proprietary employer templates, customer data or production code are included.

The optional API adapter follows the [official Responses / Structured Outputs documentation](https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses). Runtime and bundled dependencies retain their respective licenses. This repository does not grant an additional license for third-party source material or brand assets.
