import { env } from 'cloudflare:workers';
import { creativeLayout, renderTeaserSvg } from '@/lib/teaser-creative.mjs';
import { typographyFromBindings } from '@/lib/teaser-typography.mjs';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  const headers = { 'Cache-Control': 'private, no-store' };
  const origin = request.headers.get('origin');
  if (!origin || origin !== new URL(request.url).origin) return Response.json({ error: 'Bitte die Vorschau im Studio öffnen.' }, { status: 403, headers });
  const input = await request.text();
  if (input.length > 6000) return Response.json({ error: 'Die Teaser-Texte sind zu lang.' }, { status: 413, headers });
  let payload;
  try { payload = JSON.parse(input); } catch { return Response.json({ error: 'Die Eingaben konnten nicht gelesen werden.' }, { status: 400, headers }); }
  const t = payload?.teaser;
  if (!t || typeof t.headline !== 'string' || typeof t.body !== 'string' || t.headline.length > 160 || t.body.length > 500 || typeof payload.brand !== 'string' || payload.brand.length > 100) return Response.json({ error: 'Bitte Headline und Teaser-Text prüfen.' }, { status: 400, headers });
  // Image bytes and destination URLs stay in the browser. This endpoint only
  // outlines the displayed text using the privately configured production fonts.
  const settings = { format: payload.settings?.format, kicker: payload.settings?.kicker, accent: payload.settings?.accent };
  try {
    const fonts = typographyFromBindings(env as unknown as Record<string, string>);
    const layout = creativeLayout(t, settings, fonts);
    return Response.json({ svg: renderTeaserSvg(t, payload.brand, settings, fonts), fit: layout.fit, typography: 'Franklin Gothic FS · Book / Demi' }, { headers });
  } catch (error) {
    console.error('Native typography:', error instanceof Error ? error.message : 'render failed');
    return Response.json({ error: 'Die Originalschriften sind derzeit nicht verfügbar. Bitte die Vorschau erneut laden.' }, { status: 503, headers });
  }
}
