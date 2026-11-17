import * as OpenType from 'opentype.js';
const parse = OpenType.parse || OpenType.default?.parse;
let cached;
export function typographyFromBindings(config) {
  if (cached) return cached;
  const read = name => {
    const count = Number(config[`${name}_PARTS`]);
    if (!Number.isInteger(count) || count < 1 || count > 25) throw new Error('Die Originalschriften sind noch nicht eingerichtet.');
    const parts = Array.from({ length: count }, (_, i) => config[`${name}_${String(i).padStart(2, '0')}`]);
    if (parts.some(part => typeof part !== 'string' || !part)) throw new Error('Die Originalschriften sind unvollständig eingerichtet.');
    const bytes = Uint8Array.from(atob(parts.join('')), c => c.charCodeAt(0));
    return parse(bytes.buffer);
  };
  const fonts = { book: read('NATIVE_BOOK'), demi: read('NATIVE_DEMI') };
  cached = fonts;
  return fonts;
}
