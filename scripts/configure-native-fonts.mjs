// Configure licensed font files locally without copying them into the project.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import * as OpenType from 'opentype.js';
const args = process.argv.slice(2), get = key => args[args.indexOf(key) + 1];
if (!args.includes('--book') || !args.includes('--demi')) throw new Error('Use --book /path/to/Book.otf --demi /path/to/Demi.otf [--output .dev.vars].');
const output = path.resolve(args.includes('--output') ? get('--output') : '.dev.vars');
if (!/^\.dev\.vars(?:\.[a-z0-9-]+)?$/i.test(path.basename(output))) throw new Error('Use an ignored .dev.vars filename for the private configuration.');
const parse = OpenType.parse || OpenType.default?.parse;
const entries = [];
for (const [prefix, filename] of [['NATIVE_BOOK', get('--book')], ['NATIVE_DEMI', get('--demi')]]) {
  const bytes = readFileSync(filename);
  parse(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
  const encoded = bytes.toString('base64'), parts = encoded.match(/.{1,4800}/g);
  if (!parts || parts.length > 25) throw new Error('The supplied font is too large for this private binding format.');
  entries.push([`${prefix}_PARTS`, String(parts.length)], ...parts.map((part, index) => [`${prefix}_${String(index).padStart(2, '0')}`, part]));
}
const previous = existsSync(output) ? readFileSync(output, 'utf8').split('\n').filter(line => !/^NATIVE_(?:BOOK|DEMI)_(?:PARTS|\d{2})=/.test(line)).join('\n').trim() : '';
writeFileSync(output, (previous ? previous + '\n' : '') + entries.map(([key, value]) => `${key}=${JSON.stringify(value)}`).join('\n') + '\n', { mode: 0o600 });
console.log(`Private native typography configured in ${path.basename(output)}. Font files were not copied.`);
