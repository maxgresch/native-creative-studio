# Native creative template

The Native output was checked against the owner's supplied Mercedes-Benz and
Franklin-rendered Stadler creative references, and the Native Teaser Production
Standard v1.0 (8 September 2026). Those reference images and the production
standard are not redistributed in this repository.

## Applied design

- One editable, optional kicker line. The old separate brand and study labels
  were removed from the visible creative.
- Franklin Gothic FS Demi for the headline, Franklin Gothic FS Book for copy
  and the kicker. Production fonts are configured privately.
- White background, black text and a red arrow. The STORY BERLIN sender is optional: the creator checkbox starts off, and the saved project and all exports preserve that choice.
- No additional CTA button or CTA copy. The HTML creative remains clickable.
- Billboard: image left, text right. Halfpage and mobile: image above the text.
  Each format has its own dimensions and spacing.
- Line breaks use the font's actual advance widths. Text areas reserve space
  for the sender. Overflow is shown with an ellipsis and blocks export until
  the text is shortened. The body is never silently clipped behind a button.

The T-circle is a vector reconstruction for this concept template, not a
redistributed official logo master. A production release still needs the
approved sender artwork. Image positioning currently uses a centre crop;
individual focal-point controls are not implemented in this version.

## Typography and exports

The server converts the displayed copy into SVG paths using privately supplied
font data. Image bytes and the destination URL stay in the browser. The copy
request is not persisted by the application. A missing font configuration is
shown as an error; the interface does not silently substitute another font.

SVG and HTML exports use those same text paths. PNG is rendered at four times
the target size, then downsampled in the browser to the exact placement size.
Font files are not included in exported assets, source snapshots or GitHub.

## Local setup

Use the approved Book and Demi files from your production source:

```sh
node scripts/configure-native-fonts.mjs \
  --book /path/to/franklingothic-book.otf \
  --demi /path/to/franklingothic-demi.otf
```

This writes ignored `.dev.vars` bindings. It preserves unrelated existing
bindings. It does not copy or distribute the font files. Restart local preview
after configuring them.

For hosted use, configure the same NATIVE_BOOK_PARTS, NATIVE_BOOK_00… and
NATIVE_DEMI_PARTS, NATIVE_DEMI_00… values as private runtime bindings. Each part
is at most 4,800 characters, below the Worker's per-value size limit. Keep them
out of source control, public deployment configuration and build logs.

The model connection is independent of font rendering. The creator can use the
original typefaces without an AI account being connected.
