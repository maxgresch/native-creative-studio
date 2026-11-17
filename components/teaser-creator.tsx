'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Download, ImagePlus, X } from 'lucide-react';
import { CREATIVE_DEFAULT, TEASER_FORMATS, teaserHtml, withCreativeImage } from '@/lib/teaser-creative.mjs';
type Teaser = { angle: string; headline: string; body: string; cta: string };
export type Creative = { format: string; kicker: string; showStoryLogo: boolean; accent: string; image: string; imageName: string; targetUrl: string };
type Fit = Record<'kicker' | 'headline' | 'body' | 'cta', { lines: string[]; overflow: boolean }>;
const save = (name: string, blob: Blob) => { const url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); };
export default function TeaserCreator({ value, brand, index, settings, onChange, onSettings, onStoryOpen, onClose }: { value: Teaser; brand: string; index: number; settings?: Creative; onChange: (v: Teaser) => void; onSettings: (v: Creative) => void; onStoryOpen: () => void; onClose: () => void }) {
  const [copy, setCopy] = useState(value), [error, setError] = useState(''), [exporting, setExporting] = useState(false), [width, setWidth] = useState(700);
  const [rendered, setRendered] = useState<{ svg: string; fit: Fit } | null>(null), [loading, setLoading] = useState(true), [renderError, setRenderError] = useState(''), [retry, setRetry] = useState(0);
  const container = useRef<HTMLDivElement>(null), heading = useRef<HTMLHeadingElement>(null);
  const s = { ...CREATIVE_DEFAULT, ...settings } as Creative;
  const f = TEASER_FORMATS[s.format as keyof typeof TEASER_FORMATS] || TEASER_FORMATS.billboard;
  const svg = rendered ? withCreativeImage(rendered.svg, s) : '', scale = Math.min(1, Math.max(180, width - 32) / f.width);
  const valid = !!(copy.headline.trim() && copy.body.trim()), overflow = !!rendered && Object.values(rendered.fit).some(v => v.overflow), ready = valid && !loading && !!svg && !renderError && !overflow;
  useEffect(() => { setCopy(value); }, [value]);
  useEffect(() => { setError(''); heading.current?.focus({ preventScroll: true }); heading.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, [index]);
  useEffect(() => { if (!container.current) return; const observer = new ResizeObserver(entries => setWidth(entries[0].contentRect.width)); observer.observe(container.current); return () => observer.disconnect(); }, []);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setRenderError('');
    const timer = setTimeout(async () => {
      try {
        const response = await fetch('/api/teaser-render', { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal, body: JSON.stringify({ teaser: { headline: copy.headline, body: copy.body, cta: copy.cta }, brand, settings: { format: s.format, kicker: s.kicker, accent: s.accent, showStoryLogo: s.showStoryLogo } }) });
        const result = await response.json() as { svg: string; fit: Fit; error?: string };
        if (!response.ok || typeof result.svg !== 'string' || !result.fit) throw new Error(result.error || 'Die Vorschau konnte nicht geladen werden.');
        if (!controller.signal.aborted) setRendered(result);
      } catch (e) { if (!controller.signal.aborted) { setRendered(null); setRenderError(e instanceof Error ? e.message : 'Die Vorschau konnte nicht geladen werden.'); } }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }, 180);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [copy.headline, copy.body, copy.cta, brand, s.format, s.kicker, s.accent, s.showStoryLogo, retry]);
  function edit(key: keyof Teaser, text: string) { const next = { ...copy, [key]: text }; setCopy(next); if (next.headline.trim() && next.body.trim()) onChange(next); }
  async function upload(file: File | undefined) {
    if (!file) return; setError('');
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 5000000) { setError('Bitte JPG, PNG oder WebP bis 5 MB wählen.'); return; }
    const reader = new FileReader(); reader.onerror = () => setError('Das Bild konnte nicht gelesen werden.');
    reader.onload = () => { const image = String(reader.result), probe = new Image(); probe.onerror = () => setError('Die Datei enthält kein lesbares Bild.'); probe.onload = () => onSettings({ ...s, image, imageName: file.name }); probe.src = image; };
    reader.readAsDataURL(file);
  }
  async function png() {
    if (!ready) return; setError(''); setExporting(true);
    try {
      const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }), url = URL.createObjectURL(blob), img = new Image();
      try {
        await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = () => reject(new Error('Die Vorschau konnte nicht gerendert werden.')); img.src = url; });
        const large = document.createElement('canvas'); large.width = f.width * 4; large.height = f.height * 4;
        const high = large.getContext('2d'); if (!high) throw new Error('PNG-Export ist in diesem Browser nicht verfügbar.'); high.drawImage(img, 0, 0, large.width, large.height);
        const canvas = document.createElement('canvas'); canvas.width = f.width; canvas.height = f.height;
        const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('PNG-Export ist in diesem Browser nicht verfügbar.'); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(large, 0, 0, f.width, f.height);
        const output = await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('PNG konnte nicht erstellt werden.')), 'image/png'));
        save(`native-teaser-${index + 1}-${f.width}x${f.height}.png`, output);
      } finally { URL.revokeObjectURL(url); }
    } catch (e) { setError(e instanceof Error ? e.message : 'Der PNG-Export ist fehlgeschlagen.'); }
    finally { setExporting(false); }
  }
  function html() { try { const body = teaserHtml(copy, brand, s, svg); save(`native-teaser-${index + 1}.html`, new Blob([body], { type: 'text/html;charset=utf-8' })); setError(''); } catch (e) { setError(e instanceof Error ? e.message : 'Bitte die Ziel-URL prüfen.'); } }
  return <section className="creative-editor" aria-labelledby="creative-title">
    <div className="creator-heading"><div><p className="eyebrow">NATIVE TEASER CREATOR · VARIANTE 0{index + 1}</p><h3 ref={heading} tabIndex={-1} id="creative-title">Teaser bearbeiten</h3></div><button className="icon-button" aria-label="Creator schließen" onClick={onClose}><X size={20}/></button></div>
    <div className="creator-layout"><div className="creator-fields">
      <label className="field">Dachzeile <span>Eine Zeile · optional</span><input aria-label="Teaser-Dachzeile" aria-invalid={!loading && rendered?.fit.kicker.overflow || undefined} value={s.kicker} maxLength={80} onChange={e => onSettings({ ...s, kicker: e.target.value })}/></label>
      <label className="field">Headline<input aria-label="Teaser-Headline" aria-invalid={!loading && rendered?.fit.headline.overflow || undefined} value={copy.headline} maxLength={160} onChange={e => edit('headline', e.target.value)}/></label>
      <label className="field">Teaser-Text<textarea aria-label="Teaser-Text" aria-invalid={!loading && rendered?.fit.body.overflow || undefined} value={copy.body} rows={4} maxLength={500} onChange={e => edit('body', e.target.value)}/></label>
      <div className="creator-small-fields"><label className="field">Format<select aria-label="Teaser-Format" value={s.format} onChange={e => onSettings({ ...s, format: e.target.value })}>{Object.entries(TEASER_FORMATS).map(([key, format]) => <option value={key} key={key}>{format.label}</option>)}</select></label><label className="field">Pfeilfarbe<input aria-label="Teaser-Akzentfarbe" type="color" value={s.accent} onChange={e => onSettings({ ...s, accent: e.target.value })}/></label></div>
      <label className="creator-brand-option"><input type="checkbox" aria-label="STORY-BERLIN-Logo einblenden" checked={s.showStoryLogo} onChange={e => onSettings({ ...s, showStoryLogo: e.target.checked })}/><span>STORY-BERLIN-Logo einblenden<small>Optionaler Absender für das Tagesspiegel-Umfeld.</small></span></label>
      <label className="file-label secondary"><ImagePlus size={16}/> Eigenes Teaser-Motiv<input aria-label="Eigenes Teaser-Motiv" type="file" accept="image/png,image/jpeg,image/webp" onChange={e => { void upload(e.target.files?.[0]); e.target.value = ''; }}/></label>
      {s.imageName && <div className="image-name"><span>{s.imageName}</span><button aria-label="Teaser-Motiv entfernen" onClick={() => onSettings({ ...s, image: '', imageName: '' })}><X size={16}/></button></div>}
      <label className="field">Ziel-URL <span>Für klickbaren HTML-Export</span><input aria-label="Teaser-Ziel-URL" type="url" placeholder="https://…" value={s.targetUrl} maxLength={2048} onChange={e => onSettings({ ...s, targetUrl: e.target.value })}/></label>
      <small>Text und Gestaltung werden im Projekt gespeichert. Ein eigenes Motiv wird in die Exportdateien eingebettet.</small>
    </div><div className="creator-preview">
      <div className="creator-format-label"><span>{f.width} × {f.height} px</span><span>Konzeptvorschau · Native-Layout</span></div>
      <div className="creative-stage" ref={container} aria-busy={loading}>
        {svg ? <button className="creative-open" aria-label="Leseprobe über Teaser öffnen" onClick={onStoryOpen} style={{ width: f.width * scale, height: f.height * scale, opacity: loading ? .6 : 1 }}><div style={{ width: f.width, height: f.height, transform: `scale(${scale})`, transformOrigin: 'top left' }} dangerouslySetInnerHTML={{ __html: svg }}/></button> : <p className="creator-loading">{loading ? 'Vorschau wird geladen …' : renderError}</p>}
      </div>
      <p className="creator-type-status">{loading ? 'Vorschau wird aktualisiert …' : renderError ? 'Originalschrift nicht verfügbar' : 'Franklin Gothic FS · Demi / Book'}</p>
      {renderError && <div className="error" role="alert">{renderError}<button className="text-button" onClick={() => setRetry(n => n + 1)}>Erneut laden</button></div>}
      <button className="text-button" onClick={onStoryOpen}>Leseprobe im Studio öffnen <ArrowRight size={16}/></button>
      {(!valid || overflow) && <p className="creator-warning">{!valid ? 'Bitte Headline und Teaser-Text ausfüllen. Unvollständige Eingaben werden nicht übernommen.' : 'Der Text passt noch nicht vollständig in dieses Format. Bitte Dachzeile, Headline oder Teaser-Text kürzen. Der Export ist verfügbar, sobald alles vollständig hineinpasst.'}</p>}
      <div className="creative-downloads"><button className="primary" disabled={!ready || exporting} onClick={png}><Download size={15}/>{exporting ? 'PNG wird erstellt …' : 'PNG exportieren'}</button><button className="secondary" disabled={!ready} onClick={() => save(`native-teaser-${index + 1}.svg`, new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }))}>SVG exportieren</button><button className="secondary" disabled={!ready} onClick={html}>HTML exportieren</button></div>
      <p className="preview-caption">Die Vorschau führt zur Leseprobe im Studio. Die exportierte HTML-Datei verwendet deine Ziel-URL. Der rote Pfeil übernimmt die CTA-Funktion. Schriftdateien werden nicht mit exportiert.</p>
      {error && <div className="error" role="alert">{error}</div>}
    </div></div>
  </section>;
}
