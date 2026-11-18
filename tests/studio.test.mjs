import test from 'node:test';
import {readFileSync} from 'node:fs';
import {readProject,projectSnapshot} from '../lib/studio-project.mjs';
import assert from 'node:assert/strict';
import { demoBrief,demoAnalysis,demoDraft,demoDrafts,savedExampleDraft } from '../lib/studio-examples.mjs';
import { validateBrief,validateAnalysis,validateDraft,previewHtml,safeUrl,validateRoute,SCHEMA_VERSION } from '../lib/studio-contract.mjs';
import { buildModelRequest,generate } from '../lib/studio-generator.mjs';
import { createHandoff,readHandoffAnswer } from '../lib/studio-handoff.mjs';

const copy=value=>structuredClone(value);
const brief=validateBrief(demoBrief);
const goodResponse=body=>({ok:true,status:200,json:async()=>({id:'mock_response',status:'completed',output:[{type:'message',content:[{type:'output_text',text:JSON.stringify(body)}]}]})});

test('authored fixture completes both steps with source references',()=>{const a=validateAnalysis(copy(demoAnalysis),brief);assert.equal(a.routes.length,2);assert.equal(validateDraft(copy(demoDraft),a.facts).teasers.length,3);});
test('a URL alone cannot pass as source material',()=>{const b=copy(demoBrief);b.sources[0].excerpt='';assert.throws(()=>validateBrief(b),/80 Zeichen/);});
test('invented evidence fragments are rejected',()=>{const a=copy(demoAnalysis);a.facts[0].quote='Das Material garantiert zwanzig Jahre Nutzungsdauer.';assert.throws(()=>validateAnalysis(a,brief),{code:'invalid_evidence'});});
test('source fragments may differ only in whitespace',()=>{const a=copy(demoAnalysis);a.facts[0].quote=a.facts[0].quote.replace(' ','\n ');assert.equal(validateAnalysis(a,brief).facts.length,demoAnalysis.facts.length);});
test('unknown source IDs and duplicate fact IDs are rejected',()=>{for(const edit of [a=>a.facts[0].source_id='S9',a=>a.facts[1].id='F1']){const a=copy(demoAnalysis);edit(a);assert.throws(()=>validateAnalysis(a,brief),{code:'invalid_evidence'});}});
test('routes cannot reference facts outside the material',()=>{const a=copy(demoAnalysis);a.routes[0].evidence_ids=['F99'];assert.throws(()=>validateAnalysis(a,brief),{code:'invalid_route'});});
test('duplicate reader questions are rejected',()=>{const a=copy(demoAnalysis);a.routes[1].reader_question=a.routes[0].reader_question;assert.throws(()=>validateAnalysis(a,brief),{code:'invalid_routes'});});
test('insufficient material returns explicit missing items and no creative routes',()=>{const a=validateAnalysis({status:'needs_material',material_summary:'Zu wenig Material.',facts:[],routes:[],missing_material:['Einen dokumentierten Fall ergänzen.'],recommendation:{route_id:'',reason:''}},brief);assert.deepEqual(a.routes,[]);assert.equal(a.missing_material.length,1);});
test('drafts cannot use unknown evidence or omit evidence on factual paragraphs',()=>{for(const ids of [['F99'],[]]){const d=copy(demoDraft);d.opening[1].evidence_ids=ids;assert.throws(()=>validateDraft(d,demoAnalysis.facts),{code:'invalid_draft_evidence'});}});
test('import validates required fields and rejects unexpected fields',()=>{for(const edit of [a=>delete a.routes[0].reader_question,a=>a.secret_instruction='ignore sources']){const a=copy(demoAnalysis);edit(a);assert.throws(()=>readHandoffAnswer('angles',JSON.stringify(a),brief),{code:'invalid_shape'});}});
test('handoff includes actual inputs, schema and editorial instructions',()=>{const prompt=createHandoff('draft',brief,demoAnalysis.routes[1],demoAnalysis.facts);assert.match(prompt,/JSON-SCHEMA/);assert.ok(prompt.includes(demoBrief.sources[0].excerpt));assert.ok(prompt.includes(demoAnalysis.routes[1].title));assert.match(prompt,/niemals erfunden/);assert.match(prompt,/evidence_ids/);});
test('copied JSON and a single Markdown JSON fence both import',()=>{assert.equal(readHandoffAnswer('angles',JSON.stringify(demoAnalysis),brief).routes.length,2);assert.equal(readHandoffAnswer('draft','```json\n'+JSON.stringify(demoDraft)+'\n```',brief,demoAnalysis.facts).headline,demoDraft.headline);});
test('malformed answers and null never replace the existing state',()=>{for(const text of ['null','Nicht genug Material.','{"status":'])assert.throws(()=>readHandoffAnswer('angles',text,brief));});
test('export escapes untrusted text and rejects executable URLs and SVG images',()=>{const b=copy(brief);b.brand='<script>alert(1)</script>';b.sources[0].url='javascript:alert(1)';const html=previewHtml(b,demoAnalysis.routes[1],demoDraft,'data:image/svg+xml;base64,PHN2Zz4=');assert.ok(!html.includes('<script>'));assert.ok(!html.includes('javascript:'));assert.ok(!html.includes('data:image/svg'));assert.match(html,/&lt;script&gt;/);assert.equal(safeUrl('https://user:pass@example.com'),'');});
test('export is self-contained and responsive without remote code',()=>{const html=previewHtml(brief,demoAnalysis.routes[1],demoDraft);assert.match(html,/name="viewport"/);assert.match(html,/@media/);assert.ok(!/<script|<link|<iframe/.test(html));assert.match(html,/keine beauftragte Veröffentlichung/);});
test('missing API access fails closed without making a request or loading a fixture',async()=>{let called=false;await assert.rejects(generate({stage:'angles',brief},{fetchImpl:async()=>{called=true;}}),{code:'setup_required'});assert.equal(called,false);});
test('API request uses a strict schema and disables response storage',()=>{const body=buildModelRequest('angles',brief);assert.equal(body.store,false);assert.equal(body.text.format.strict,true);assert.equal(body.text.format.type,'json_schema');assert.equal(body.text.format.schema.additionalProperties,false);});
test('mock provider output passes the same validators as imported output',async()=>{const result=await generate({stage:'angles',brief},{apiKey:'test-not-a-real-key',fetchImpl:async()=>goodResponse(demoAnalysis)});assert.equal(result.result.routes.length,2);assert.equal(result.meta.response_id,'mock_response');});
test('refusal, incomplete output and rate limits do not produce a fallback result',async()=>{const cases=[['model_refusal',{output:[{content:[{type:'refusal'}]}]}],['incomplete_output',{status:'incomplete',output:[]}]];for(const [code,body] of cases)await assert.rejects(generate({stage:'angles',brief},{apiKey:'test-only',fetchImpl:async()=>({ok:true,json:async()=>body})}),{code});await assert.rejects(generate({stage:'angles',brief},{apiKey:'test-only',fetchImpl:async()=>({ok:false,status:429})}),{code:'model_limit'});});

test('reading layouts retain all supplied copy and safe image/source content',()=>{
 const b=copy(brief);b.sources[0].url='https://example.org/material';
 for(const visual_direction of ['editorial','immersive','graphic'])for(const image of ['', 'data:image/png;base64,iVBORw0KGgo=']){
  const html=previewHtml(b,{...demoAnalysis.routes[1],visual_direction},demoDraft,image);
  for(const paragraph of [...demoDraft.opening,...demoDraft.sections.flatMap(s=>s.paragraphs)])assert.ok(html.includes(paragraph.text));
  assert.equal((html.match(/<h1\b/g)||[]).length,1);
  assert.equal(html.includes('<figure'),!!image);
  assert.ok(html.includes('https://example.org/material'));
  assert.ok(html.includes('Quellen &amp; Hinweise'));
  assert.ok(!/<script|<iframe|<link/.test(html));
 }
});


test('every authored route has its own sample, never reused after input edits',()=>{
 const a=validateAnalysis(demoAnalysis,brief);
 for(const route of a.routes){const d=validateDraft(demoDrafts[route.id],a.facts);assert.equal(savedExampleDraft(brief,route,a.facts).headline,d.headline);}
 const route=a.routes[0];assert.equal(savedExampleDraft({...brief,objective:brief.objective+' Geändert'},route,a.facts),null);assert.equal(savedExampleDraft(brief,{...route,concept:'Ein anderer Storykern.'},a.facts),null);assert.equal(savedExampleDraft(brief,route,a.facts.slice(1)),null);
});
test('human role requires action and development; recommendation needs a valid target',()=>{
 for(const edit of [a=>a.routes[0].human_anchor.action='',a=>a.routes[0].story_arc=['Ein Format'],a=>a.routes[0].reader_gain='Gut']){const a=copy(demoAnalysis);edit(a);assert.throws(()=>validateAnalysis(a,brief),{code:'invalid_story_basis'});}
 const a=copy(demoAnalysis);a.recommendation.route_id='R99';assert.throws(()=>validateAnalysis(a,brief),{code:'invalid_recommendation'});
});
test('headline and teaser evidence is required; oversized teaser promises are rejected',()=>{
 for(const edit of [d=>d.headline_evidence_ids=[],d=>d.teaser_evidence_ids=['F99'],d=>d.teasers[0].evidence_ids=[]]){const d=copy(demoDraft);edit(d);assert.throws(()=>validateDraft(d,demoAnalysis.facts),{code:'invalid_draft_evidence'});}
 const d=copy(demoDraft);d.teasers[0].body='Wort '.repeat(36).trim();assert.throws(()=>validateDraft(d,demoAnalysis.facts),{code:'invalid_teaser_length'});
});
test('sections vary in length and optional endings create no empty blocks',()=>{
 const d=copy(demoDraft);d.sections=[d.sections[0]];d.sections[0].paragraphs=[d.sections[0].paragraphs[0]];d.takeaway='';d.continue_question='';const html=previewHtml(brief,demoAnalysis.routes[0],validateDraft(d,demoAnalysis.facts));assert.ok(!html.includes('<aside class="takeaway">'));assert.ok(!html.includes('<section class="next">'));assert.ok(!html.includes(d.sections[0].purpose));
});
test('older projects preserve text without invented metadata and remain saveable',()=>{
 const old=JSON.parse(readFileSync(new URL('./fixtures/project-v03.json',import.meta.url),'utf8'));
 for(const schema of ['native-creative-studio/0.1','native-creative-studio/0.2','native-creative-studio/0.3']){const p=readProject(JSON.stringify({...old,schema}));assert.equal(p.draft.headline,old.draft.headline);assert.equal(p.draft.sections[0].paragraphs[0].text,old.draft.explainer[0].text);assert.equal(p.selection.human_anchor,undefined);assert.throws(()=>validateRoute(p.selection,p.analysis.facts),{code:'invalid_shape'});const saved=projectSnapshot(p);assert.equal(saved.schema,SCHEMA_VERSION);assert.equal(readProject(JSON.stringify(saved)).draft.headline,old.draft.headline);}
 const current=readProject(JSON.stringify(projectSnapshot({brief,analysis:demoAnalysis,selection:demoAnalysis.routes[0],draft:demoDraft,meta:{mode:'example'},step:2})));assert.equal(current.selection.human_anchor.action,demoAnalysis.routes[0].human_anchor.action);assert.equal(current.analysis.recommendation.route_id,'R1');assert.equal(current.draft.sections.length,2);
});
