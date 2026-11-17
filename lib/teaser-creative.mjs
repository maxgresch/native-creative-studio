import { escapeHtml, safeUrl } from './studio-contract.mjs';

export const TEASER_FORMATS = {
  billboard: { label: 'Billboard · 970 × 250', width: 970, height: 250 },
  halfpage: { label: 'Halfpage · 300 × 600', width: 300, height: 600 },
  mobile: { label: 'Mobile · 320 × 480', width: 320, height: 480 },
};
export const CREATIVE_DEFAULT = { format: 'billboard', kicker: 'Anzeige', accent: '#ff343b', image: '', imageName: '', targetUrl: '' };
export const NATIVE_TYPOGRAPHY = { headline: 'Franklin Gothic FS Demi', body: 'Franklin Gothic FS Book' };
export function safeCreativeImage(value) { return typeof value === 'string' && value.length <= 7000000 && /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(value) ? value : ''; }
export function normalizeCreative(raw = {}) {
  raw = raw && typeof raw === 'object' ? raw : {};
  return {
    format: Object.hasOwn(TEASER_FORMATS, raw.format) ? raw.format : 'billboard',
    kicker: typeof raw.kicker === 'string' ? raw.kicker.replace(/\s+/g, ' ').trim().slice(0, 80) : CREATIVE_DEFAULT.kicker,
    accent: /^#[0-9a-f]{6}$/i.test(raw.accent) ? raw.accent : CREATIVE_DEFAULT.accent,
    image: safeCreativeImage(raw.image), imageName: typeof raw.imageName === 'string' ? raw.imageName.slice(0, 180) : '', targetUrl: safeUrl(raw.targetUrl),
  };
}
export function wrapCopy(value, maxChars, maxLines) {
  return wrapMeasured(value, maxChars, maxLines, text => Array.from(text).length);
}
// Both layout and outlines use the same font metrics. Character counts cannot
// predict widths of e.g. WWW versus iii and caused the previous collisions.
export function wrapMeasured(value, width, maxLines, measure) {
  const words = String(value || '').trim().split(/\s+/).filter(Boolean), lines = [];
  let line = '';
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (measure(candidate) <= width) { line = candidate; continue; }
    if (line) { lines.push(line); line = ''; }
    for (const letter of Array.from(word)) {
      if (line && measure(line + letter) > width) { lines.push(line); line = ''; }
      line += letter;
    }
  }
  if (line) lines.push(line);
  const overflow = lines.length > maxLines;
  const shown = lines.slice(0, Math.max(0, maxLines));
  if (overflow && shown.length) {
    let last = shown.at(-1);
    while (last && measure(last + '…') > width) last = Array.from(last).slice(0, -1).join('');
    shown[shown.length - 1] = last.trimEnd() + '…';
  }
  return { lines: shown, overflow };
}
export function creativeLayout(teaser, raw = {}, fonts) {
  const settings = normalizeCreative(raw), size = TEASER_FORMATS[settings.format], wide = settings.format === 'billboard', small = settings.format === 'mobile';
  const imageWidth = wide ? 620 : size.width, imageHeight = wide ? size.height : small ? 206 : 300;
  const x = wide ? 646 : 20, contentWidth = size.width - x - 20;
  const headlineSize = wide ? 24 : small ? 24 : 25, headlineLine = wide ? 28 : small ? 29 : 30, bodySize = 16, bodyLine = 21;
  const measure = (text, font, pixels) => fonts ? fonts[font].getAdvanceWidth(text, pixels, { kerning: true }) : Array.from(text).reduce((sum, c) => sum + (/\s/.test(c) ? .25 : /[MWmw]/.test(c) ? .85 : /[ilI.,:!'|]/.test(c) ? .25 : .52), 0) * pixels;
  const kicker = wrapMeasured(settings.kicker, contentWidth, 1, text => measure(text, 'book', 11));
  const kickerY = wide ? 18 : imageHeight + 27;
  const headlineY = (wide ? 22 : imageHeight + 28) + (settings.kicker ? 31 : 9);
  const headline = wrapMeasured(teaser.headline, contentWidth, wide || small ? 3 : 4, text => measure(text, 'demi', headlineSize));
  const bodyY = headlineY + (Math.max(1, headline.lines.length) - 1) * headlineLine + 31;
  const footerY = size.height - 33;
  const bodyMaxLines = Math.max(0, Math.floor((footerY - 33 - bodyY) / bodyLine) + 1);
  const body = wrapMeasured(teaser.body, contentWidth, bodyMaxLines, text => measure(text, 'book', bodySize));
  const cta = { lines: [], overflow: false }; // The Native template uses an arrow, without CTA copy.
  return { settings, size, imageWidth, imageHeight, x, contentWidth, kickerY, headlineY, bodyY, footerY, headlineSize, headlineLine, bodySize, bodyLine, fit: { kicker, headline, body, cta } };
}
export function creativeFit(teaser, format, fonts, raw = {}) { return creativeLayout(teaser, { ...raw, format }, fonts).fit; }
const motif = (s, w, h) => s.image
  ? `<image href="${escapeHtml(s.image)}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice" clip-path="url(#motif)"/>`
  : `<rect width="${w}" height="${h}" fill="#e9e9e9"/><path d="M${w * .12} ${h * .8}L${w * .74} ${h * .18}M${w * .4} ${h * .91}L${w * .92} ${h * .39}" stroke="#b3b3b3" stroke-width="1.5"/><text x="18" y="${h - 19}" font-family="sans-serif" font-size="10" fill="#606060">MOTIVPLATZHALTER</text>`;
export function withCreativeImage(svg, raw) {
  const s = normalizeCreative(raw), l = creativeLayout({ headline: '', body: '' }, s);
  return svg.replace(/<g id="creative-motif">[\s\S]*?<\/g>/, `<g id="creative-motif">${motif(s, l.imageWidth, l.imageHeight)}</g>`);
}
export function renderTeaserSvg(teaser, brand, raw = {}, fonts) {
  const l = creativeLayout(teaser, raw, fonts), { settings: s, size: f, fit } = l, e = escapeHtml;
  const text = (copy, x, y, size, weight, color = '#0a0a0a') => {
    if (fonts) {
      const outline = fonts[weight].getPath(copy, x, y, size, { kerning: true }).toPathData(2);
      if (/NaN|Infinity|undefined/.test(outline)) throw new Error('Die Schriftkontur konnte nicht vollständig erzeugt werden.');
      return `<path d="${outline}" fill="${color}"/>`;
    }
    return `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" font-family="${NATIVE_TYPOGRAPHY[weight === 'demi' ? 'headline' : 'body']}, sans-serif">${e(copy)}</text>`;
  };
  const lines = (values, y, size, line, weight) => values.map((copy, i) => text(copy, l.x, y + i * line, size, weight)).join('');
  const logoX = l.x, logoY = l.footerY;
  // Vector reconstruction of the sender mark, aligned to the supplied Native
  // references. No customer photograph or production artwork is distributed.
  const sender = `<g aria-label="STORY BERLIN"><circle cx="${logoX + 14}" cy="${logoY}" r="14" fill="#0a0a0a"/><path transform="translate(${logoX},${logoY - 14})" d="M7 5H21L22 10H20L19 7H15.5V22H18V23H10V22H12.5V7H9L8 10H6Z" fill="#fff"/>${text('STORY BERLIN', logoX + 35, logoY + 7, 20, 'demi')}</g>`;
  const arrowX = f.width - 30;
  const arrow = `<path d="M${arrowX - 21} ${logoY}h21m-7-7 7 7-7 7" fill="none" stroke="${s.accent}" stroke-width="1.2" stroke-linecap="square"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${f.width}" height="${f.height}" viewBox="0 0 ${f.width} ${f.height}" role="img" aria-labelledby="creative-label"><title id="creative-label">${e(teaser.headline)} · Native-Teaser-Konzept</title><desc>Konzeptvorschau · ${e(brand)} · ${NATIVE_TYPOGRAPHY.headline} / ${NATIVE_TYPOGRAPHY.body}</desc><defs><clipPath id="motif"><rect width="${l.imageWidth}" height="${l.imageHeight}"/></clipPath></defs><rect width="100%" height="100%" fill="#fff"/><g id="creative-motif">${motif(s, l.imageWidth, l.imageHeight)}</g><g data-copy="kicker">${lines(fit.kicker.lines, l.kickerY, 11, 0, 'book')}</g><g data-copy="headline">${lines(fit.headline.lines, l.headlineY, l.headlineSize, l.headlineLine, 'demi')}</g><g data-copy="body">${lines(fit.body.lines, l.bodyY, l.bodySize, l.bodyLine, 'book')}</g>${sender}${arrow}</svg>`;
}
export function teaserHtml(teaser, brand, raw = {}, renderedSvg) {
  const s = normalizeCreative(raw);
  if (!s.targetUrl) throw new Error('Für den klickbaren HTML-Export bitte eine vollständige Ziel-URL ergänzen.');
  const svg = renderedSvg || renderTeaserSvg(teaser, brand, s);
  return `<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(teaser.headline)}</title><style>body{margin:0;background:#fff}a{display:block;width:fit-content;max-width:100%;margin:auto}svg{display:block;max-width:100%;height:auto}</style><a href="${escapeHtml(s.targetUrl)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(teaser.cta || 'Leseprobe öffnen')}">${svg}</a></html>`;
}
