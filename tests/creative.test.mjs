import test from 'node:test';
import assert from 'node:assert/strict';
import {demoBrief,demoAnalysis,demoDraft} from '../lib/studio-examples.mjs';
import {TEASER_FORMATS,renderTeaserSvg,teaserHtml,creativeFit,normalizeCreative,wrapCopy,creativeLayout,wrapMeasured,withCreativeImage} from '../lib/teaser-creative.mjs';
import {projectSnapshot,readProject} from '../lib/studio-project.mjs';

test('every teaser renders in all three exact creative dimensions',()=>{for(const teaser of demoDraft.teasers)for(const [format,size] of Object.entries(TEASER_FORMATS)){const svg=renderTeaserSvg(teaser,demoBrief.brand,{format});assert.ok(svg.includes(`width="${size.width}" height="${size.height}"`));assert.equal((svg.match(/data-copy="kicker"/g)||[]).length,1);assert.ok(!svg.includes('ANZEIGE · KONZEPTSTUDIE'));assert.ok(!svg.includes('Georgia'));assert.ok(svg.includes('STORY BERLIN'));assert.ok(!svg.includes('Mehr erfahren'));assert.ok(svg.includes('MOTIVPLATZHALTER'));assert.ok(!svg.includes('<script'));}});
test('creative copy, brand and CTA cannot inject markup',()=>{const svg=renderTeaserSvg({...demoDraft.teasers[0],headline:'<script>alert(1)</script>',cta:'<img onerror="x">'},'<iframe>');assert.ok(!svg.includes('<script'));assert.ok(!svg.includes('<iframe>'));assert.ok(!svg.includes('<img onerror='));assert.match(svg,/&lt;/);});
test('SVG images and invalid colors cannot enter the creative',()=>{const s=normalizeCreative({image:'data:image/svg+xml;base64,PHN2Zz4=',accent:'red;url(javascript:1)'});assert.equal(s.image,'');assert.equal(s.accent,'#ff343b');});
test('HTML export requires a valid destination and makes the whole creative a link',()=>{assert.throws(()=>teaserHtml(demoDraft.teasers[0],'WEITER'),/Ziel-URL/);assert.throws(()=>teaserHtml(demoDraft.teasers[0],'WEITER',{targetUrl:'javascript:alert(1)'}),/Ziel-URL/);const html=teaserHtml(demoDraft.teasers[0],'WEITER',{targetUrl:'https://example.org/story'});assert.ok(html.includes('href="https://example.org/story"'));assert.ok(html.includes('rel="noopener noreferrer"'));assert.ok(html.includes('<svg'));});
test('long copy is wrapped, marked and never silently advertised as fitting',()=>{const text='Ein sehr langer Text '.repeat(20);const fit=creativeFit({headline:text,body:text,cta:text},'mobile');assert.equal(fit.headline.overflow,true);assert.equal(fit.body.overflow,true);assert.equal(fit.cta.overflow,false);assert.match(fit.headline.lines.at(-1),/…$/);assert.ok(wrapCopy('W'.repeat(200),19,3).lines.every(line=>line.length<=19));});
test('project roundtrip preserves edited teaser copy and creator settings',()=>{const state={brief:demoBrief,analysis:demoAnalysis,selection:demoAnalysis.routes[1],draft:structuredClone(demoDraft),meta:{mode:'example'},step:2,creatives:[{format:'mobile',accent:'#215746',targetUrl:'https://example.org/story',image:'',imageName:''}]};state.draft.teasers[0].headline='Ein bearbeiteter Teaser';const restored=readProject(JSON.stringify(projectSnapshot(state)));assert.equal(restored.draft.teasers[0].headline,'Ein bearbeiteter Teaser');assert.equal(restored.creatives[0].format,'mobile');assert.equal(restored.creatives[0].targetUrl,'https://example.org/story');assert.equal(restored.step,2);});
test('tab save leaves image bytes out of all creator settings',()=>{const raw=projectSnapshot({brief:demoBrief,creatives:[{image:'image-bytes',imageName:'image.jpg'}]},false);assert.equal(raw.creatives[0].image,'');assert.equal(raw.creatives[0].imageName,'');});
test('unfinished briefs remain recoverable but foreign project files are rejected',()=>{const p=projectSnapshot({brief:{...demoBrief,brand:'',objective:''}});assert.equal(readProject(JSON.stringify(p)).brief.brand,'');assert.throws(()=>readProject('{"schema":"foreign"}'),/unterstützte/);});

// Different glyph widths must affect line breaks; identical character counts
// are not a reliable predictor of visible text width.
test('measured wrapping respects glyph widths and preserves Unicode',()=>{
 const measure=text=>Array.from(text).reduce((n,c)=>n+(c==='W'?12:c==='i'?3:6),0);
 assert.deepEqual(wrapMeasured('WWWW',24,4,measure).lines,['WW','WW']);
 assert.deepEqual(wrapMeasured('iiii',24,4,measure).lines,['iiii']);
 assert.equal(wrapMeasured('für Leser:innen',60,3,measure).overflow,false);
});
test('the single editable kicker survives project files and may be empty',()=>{
 assert.equal(normalizeCreative({kicker:'Eine Dachzeile'}).kicker,'Eine Dachzeile');
 assert.equal(normalizeCreative({kicker:''}).kicker,'');
 const data=projectSnapshot({brief:demoBrief,creatives:[{kicker:'WEITER · Anzeige'}]});
 assert.equal(readProject(JSON.stringify(data)).creatives[0].kicker,'WEITER · Anzeige');
});
test('copy areas stay separated from the sender in every format',()=>{
 for(const format of Object.keys(TEASER_FORMATS))for(const teaser of demoDraft.teasers){
  const l=creativeLayout(teaser,{format,kicker:'Anzeige'});
  assert.ok(l.headlineY-l.headlineSize>l.kickerY);
  assert.ok(l.bodyY-l.bodySize>l.headlineY+(l.fit.headline.lines.length-1)*l.headlineLine);
  assert.ok(!l.fit.body.lines.length||l.bodyY+(l.fit.body.lines.length-1)*l.bodyLine<l.footerY-25);
 }
});
test('font outlines are used consistently without embedding production fonts',()=>{
 const font={getAdvanceWidth:(text,size)=>text.length*size*.4,getPath:()=>({toPathData:()=> 'M0 0L1 1Z'})};
 const svg=renderTeaserSvg(demoDraft.teasers[0],'WEITER',{kicker:'Anzeige'},{book:font,demi:font});
 assert.match(svg,/<g data-copy="headline"><path/);
 assert.match(svg,/<g data-copy="kicker"><path/);
 assert.ok(!svg.includes('@font-face'));assert.ok(!svg.includes('data:font'));
 assert.ok(teaserHtml(demoDraft.teasers[0],'WEITER',{targetUrl:'https://example.org'},svg).includes(svg));
});
test('image bytes are added locally without changing the text outlines',()=>{
 const base=renderTeaserSvg(demoDraft.teasers[0],'WEITER',{format:'halfpage'});
 const image='data:image/png;base64,iVBORw0KGgo=';
 const decorated=withCreativeImage(base,{format:'halfpage',image});
 assert.ok(decorated.includes(image));assert.ok(!decorated.includes('MOTIVPLATZHALTER'));
 assert.equal(decorated.match(/<g data-copy="headline">[\s\S]*?<\/g>/)[0],base.match(/<g data-copy="headline">[\s\S]*?<\/g>/)[0]);
});

test('invalid font contours fail instead of producing incomplete exports',()=>{
 const bad={getAdvanceWidth:(text,size)=>text.length*size*.4,getPath:()=>({toPathData:()=> 'MNaN 0L1 1Z'})};
 assert.throws(()=>renderTeaserSvg(demoDraft.teasers[0],'WEITER',{}, {book:bad,demi:bad}),/Schriftkontur/);
});
