import { renderReadingPreview } from './reading-preview.mjs';

export const MODEL_DEFAULT = 'gpt-6-astra';
export const SCHEMA_VERSION = 'native-creative-studio/0.4';
export const PALETTES = ['editorial', 'immersive', 'graphic'];
export class StudioError extends Error { constructor(message, status=400, code='invalid_input'){ super(message); this.status=status; this.code=code; } }
const str=(value,max=3000)=>typeof value==='string'?value.trim().slice(0,max):'';
const list=value=>Array.isArray(value)?value:[];
const normalized=value=>str(value,20000).replace(/\s+/g,' ');
export function safeUrl(value){ const text=str(value,2048);if(!text)return '';try{const u=new URL(text);return ['https:','http:'].includes(u.protocol)&&!u.username&&!u.password?u.href:'';}catch{return '';} }
export function validateBrief(raw){
  if(!raw||typeof raw!=='object')throw new StudioError('Das Briefing fehlt.');
  const brief={brand:str(raw.brand,100),objective:str(raw.objective,1800),audience:str(raw.audience,800),occasion:str(raw.occasion,600),publisher:str(raw.publisher,1000),constraints:str(raw.constraints,1200),sources:list(raw.sources).slice(0,5).map((s,i)=>({id:`S${i+1}`,title:str(s?.title,180)||`Quelle ${i+1}`,url:safeUrl(s?.url),excerpt:str(s?.excerpt,6000)}))};
  if(!brief.brand||brief.objective.length<20||brief.audience.length<10||brief.publisher.length<10)throw new StudioError('Ergänze Marke, Kommunikationsziel, Zielgruppe und Publisher-Profil.');
  if(!brief.sources.length||brief.sources.some(s=>s.excerpt.length<80))throw new StudioError('Jede Quelle braucht mindestens 80 Zeichen auswertbaren Text. Ein Link allein genügt nicht.');
  return brief;
}
const object=properties=>({type:'object',properties,required:Object.keys(properties),additionalProperties:false});
const text={type:'string'};const texts={type:'array',items:text};
export const factSchema=object({id:text,claim:text,source_id:text,quote:text});
const legacyRouteSchema=object({id:text,kind:{type:'string',enum:['strategisch','menschlich','pragmatisch']},title:text,reader_question:text,insight:text,concept:text,brand_role:text,publisher_fit:text,creative_mechanic:text,opening_hook:text,evidence_ids:texts,research_gaps:texts,visual_direction:{type:'string',enum:PALETTES}});
const legacyAnalysisSchema=object({status:{type:'string',enum:['ready','needs_material']},material_summary:text,facts:{type:'array',items:factSchema},routes:{type:'array',items:legacyRouteSchema},missing_material:texts});
const paragraph=object({text,kind:{type:'string',enum:['framing','sourced']},evidence_ids:texts});
const legacyDraftSchema=object({headline:text,kicker:text,teaser:text,opening:{type:'array',items:paragraph},explainer_heading:text,explainer:{type:'array',items:paragraph},takeaway:text,continue_question:text,teasers:{type:'array',items:object({angle:text,headline:text,body:text,cta:text})},production_notes:texts});
const anchorSchema=object({person:text,role:text,action:text,access_status:{type:'string',enum:['open','confirmed']},evidence_ids:texts});
export const routeSchema=object({...legacyRouteSchema.properties,territory:text,reader_gain:text,human_anchor:anchorSchema,story_arc:texts,visual_evidence:text,production_scope:text});
export const analysisSchema=object({...legacyAnalysisSchema.properties,routes:{type:'array',items:routeSchema},recommendation:object({route_id:text,reason:text})});
export const draftSchema=object({headline:text,kicker:text,teaser:text,headline_evidence_ids:texts,teaser_evidence_ids:texts,opening:{type:'array',items:paragraph},sections:{type:'array',items:object({heading:text,purpose:text,paragraphs:{type:'array',items:paragraph}})},takeaway:text,takeaway_evidence_ids:texts,continue_question:text,question_evidence_ids:texts,teasers:{type:'array',items:object({angle:text,headline:text,body:text,cta:text,evidence_ids:texts})},production_notes:texts});
export function assertShape(value,schema,path='Antwort'){
  const fail=()=>{throw new StudioError(`${path}: Ein Feld fehlt oder hat nicht das vereinbarte Format.`,502,'invalid_shape');};
  if(schema.type==='object'){
    if(!value||typeof value!=='object'||Array.isArray(value))fail();
    if(schema.required.some(key=>!Object.hasOwn(value,key))||Object.keys(value).some(key=>!Object.hasOwn(schema.properties,key)))fail();
    for(const [key,child] of Object.entries(schema.properties))assertShape(value[key],child,`${path}.${key}`);
  }else if(schema.type==='array'){
    if(!Array.isArray(value)||value.length>50)fail();
    value.forEach((item,i)=>assertShape(item,schema.items,`${path}[${i}]`));
  }else if(typeof value!=='string'||value.length>12000||(schema.enum&&!schema.enum.includes(value)))fail();
  return value;
}
export function validateFacts(facts,brief){
  const ids=new Set();return list(facts).slice(0,16).map(f=>{const fact={id:str(f.id,30),claim:str(f.claim,600),source_id:str(f.source_id,30),quote:str(f.quote,450)};const source=brief.sources.find(s=>s.id===fact.source_id);
    if(!fact.id||ids.has(fact.id)||!fact.claim||!source||fact.quote.length<12||!normalized(source.excerpt).includes(normalized(fact.quote)))throw new StudioError('Eine Quellenzuordnung lässt sich im gelieferten Material nicht nachvollziehen. Bitte Material präzisieren oder erneut generieren.',502,'invalid_evidence');ids.add(fact.id);return fact;});
}
const factRefs=(items,facts,{required=false,code='invalid_route'}={})=>{
 const ids=list(items).map(x=>str(x,30));
 if((required&&!ids.length)||ids.some(id=>!facts.some(f=>f.id===id)))throw new StudioError('Eine Aussage verweist auf keine bekannte Materialgrundlage.',502,code);
 return [...new Set(ids)];
};
export function validateRoute(raw,facts,{allowLegacy=false}={}){
 if(!raw||typeof raw!=='object')throw new StudioError('Wähle zuerst einen Ansatz.');
 const legacy=allowLegacy&&!Object.hasOwn(raw,'human_anchor');assertShape(raw,legacy?legacyRouteSchema:routeSchema,'Ansatz');
 const route=Object.fromEntries(['id','kind','title','reader_question','insight','concept','brand_role','publisher_fit','creative_mechanic','opening_hook','visual_direction'].map(k=>[k,str(raw[k],k==='title'?200:1800)]));
 route.evidence_ids=factRefs(raw.evidence_ids,facts,{required:true});route.research_gaps=raw.research_gaps.map(x=>str(x,800)).slice(0,8);
 if(!route.id||!route.title||route.title.split(/\s+/).length>10||!route.concept||!route.brand_role)throw new StudioError('Der Ansatz erfüllt die vereinbarte Struktur nicht.',502,'invalid_route');
 if(!legacy){
  for(const key of ['territory','reader_gain','visual_evidence','production_scope'])route[key]=str(raw[key],1800);
  const a=raw.human_anchor;route.human_anchor={person:str(a.person,180),role:str(a.role,300),action:str(a.action,1200),access_status:a.access_status,evidence_ids:factRefs(a.evidence_ids,facts,{required:!!a.person.trim()})};
  route.story_arc=raw.story_arc.map(s=>str(s,1200));
  if(route.human_anchor.role.length<8||route.human_anchor.action.length<20||route.reader_gain.length<20||route.territory.length<10||route.visual_evidence.length<20||route.production_scope.length<20||route.story_arc.length<3||route.story_arc.length>5||route.story_arc.some(s=>s.length<20))throw new StudioError('Der Ansatz braucht eine konkrete menschliche Aufgabe, Entwicklung, Erkenntnis und visuelle Grundlage.',502,'invalid_story_basis');
 }
 return route;
}
export function validateAnalysis(raw,brief,{allowLegacy=false}={}){
 const legacy=allowLegacy&&raw&&typeof raw==='object'&&!Object.hasOwn(raw,'recommendation');assertShape(raw,legacy?legacyAnalysisSchema:analysisSchema);
 const facts=validateFacts(raw.facts,brief),missing_material=raw.missing_material.map(x=>str(x,800)).slice(0,8);
 if(raw.status==='needs_material'){
  if(raw.routes.length||(!legacy&&raw.recommendation.route_id))throw new StudioError('Fehlende Substanz darf nicht mit fertigen Ansätzen übergangen werden.',502,'insufficient_material');
  return{status:'needs_material',material_summary:str(raw.material_summary,2000),facts,routes:[],missing_material:missing_material.length?missing_material:['Das Material trägt noch keine zwei eigenständigen STORY-Kerne.'],recommendation:{route_id:'',reason:''}};
 }
 if(facts.length<3||raw.routes.length<2||raw.routes.length>3)throw new StudioError('Zwei bis drei eigenständige Ansätze brauchen mindestens drei zuordenbare Fakten.',502,'insufficient_material');
 const routes=raw.routes.map(r=>validateRoute(r,facts,{allowLegacy:legacy}));
 if(new Set(routes.map(r=>r.id)).size!==routes.length||new Set(routes.map(r=>normalized(r.reader_question).toLowerCase())).size!==routes.length||new Set(routes.map(r=>normalized(r.concept).toLowerCase())).size!==routes.length)throw new StudioError('Die Ansätze müssen unterschiedliche Fragen und Konzepte entwickeln.',502,'invalid_routes');
 const recommendation=legacy?{route_id:'',reason:''}:{route_id:str(raw.recommendation.route_id,30),reason:str(raw.recommendation.reason,1800)};
 if(!legacy&&(!routes.some(r=>r.id===recommendation.route_id)||recommendation.reason.length<20))throw new StudioError('Die Empfehlung muss einen vorhandenen Ansatz konkret begründen.',502,'invalid_recommendation');
 return{status:'ready',material_summary:str(raw.material_summary,2000),facts,routes,missing_material,...(legacy?{}:{recommendation})};
}
export function validateDraft(raw,facts,{allowLegacy=false}={}){
 const legacy=allowLegacy&&raw&&typeof raw==='object'&&!Object.hasOwn(raw,'sections');assertShape(raw,legacy?legacyDraftSchema:draftSchema);
 const checkParagraphs=(items,max=4)=>{
  if(!Array.isArray(items)||!items.length||items.length>max)throw new StudioError('Die Leseprobe ist unvollständig.',502,'invalid_draft');
  return items.map(p=>{const text=str(p.text,2300),kind=p.kind,evidence_ids=factRefs(p.evidence_ids,facts,{required:kind==='sourced',code:'invalid_draft_evidence'});if(!text||!['framing','sourced'].includes(kind))throw new StudioError('Ein Textabschnitt ist unvollständig.',502,'invalid_draft_evidence');return{text,kind,evidence_ids};});
 };
 const refs=(ids,required=false)=>factRefs(ids,facts,{required:required&&!allowLegacy,code:'invalid_draft_evidence'});
 const sections=legacy?[{heading:str(raw.explainer_heading,180),purpose:'Erläuterung aus älterem Entwurf',paragraphs:checkParagraphs(raw.explainer,5)}]:raw.sections.map(s=>({heading:str(s.heading,180),purpose:str(s.purpose,500),paragraphs:checkParagraphs(s.paragraphs)}));
 const d={headline:str(raw.headline,180),kicker:str(raw.kicker,100),teaser:str(raw.teaser,900),headline_evidence_ids:refs(raw.headline_evidence_ids,true),teaser_evidence_ids:refs(raw.teaser_evidence_ids,true),opening:checkParagraphs(raw.opening,legacy?5:3),sections,takeaway:str(raw.takeaway,600),takeaway_evidence_ids:refs(raw.takeaway_evidence_ids),continue_question:str(raw.continue_question,240),question_evidence_ids:refs(raw.question_evidence_ids),teasers:raw.teasers.map(t=>({angle:str(t.angle,100),headline:str(t.headline,180),body:str(t.body,500),cta:str(t.cta,60),evidence_ids:refs(t.evidence_ids,true)})),production_notes:raw.production_notes.map(x=>str(x,800)).slice(0,8)};
 if(!d.headline||!d.teaser||sections.length<1||sections.length>4||sections.some(s=>!s.heading||!s.purpose)||d.teasers.length!==3||d.teasers.some(t=>!t.headline||!t.body||!t.cta))throw new StudioError('Der Text- und Teaserentwurf ist unvollständig.',502,'invalid_draft');
 if(!allowLegacy&&d.teasers.some(t=>t.headline.split(/\s+/).length>10||t.body.split(/\s+/).length>35))throw new StudioError('Ein Teaser überschreitet zehn Headline- oder 35 Textwörter.',502,'invalid_teaser_length');
 return d;
}
export const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function previewHtml(brief,route,draft,image=''){
  return renderReadingPreview(brief,route,draft,image,{escape:escapeHtml,safeUrl});
}
