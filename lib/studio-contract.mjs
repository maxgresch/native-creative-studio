export const MODEL_DEFAULT = 'gpt-6-astra';
export const SCHEMA_VERSION = 'native-creative-studio/0.3';
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
export const routeSchema=object({id:text,kind:{type:'string',enum:['strategisch','menschlich','pragmatisch']},title:text,reader_question:text,insight:text,concept:text,brand_role:text,publisher_fit:text,creative_mechanic:text,opening_hook:text,evidence_ids:texts,research_gaps:texts,visual_direction:{type:'string',enum:PALETTES}});
export const analysisSchema=object({status:{type:'string',enum:['ready','needs_material']},material_summary:text,facts:{type:'array',items:factSchema},routes:{type:'array',items:routeSchema},missing_material:texts});
const paragraph=object({text,kind:{type:'string',enum:['framing','sourced']},evidence_ids:texts});
export const draftSchema=object({headline:text,kicker:text,teaser:text,opening:{type:'array',items:paragraph},explainer_heading:text,explainer:{type:'array',items:paragraph},takeaway:text,continue_question:text,teasers:{type:'array',items:object({angle:text,headline:text,body:text,cta:text})},production_notes:texts});
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
  const ids=new Set();return list(facts).slice(0,12).map(f=>{const fact={id:str(f.id,30),claim:str(f.claim,600),source_id:str(f.source_id,30),quote:str(f.quote,450)};const source=brief.sources.find(s=>s.id===fact.source_id);
    if(!fact.id||ids.has(fact.id)||!fact.claim||!source||fact.quote.length<12||!normalized(source.excerpt).includes(normalized(fact.quote)))throw new StudioError('Eine Quellenzuordnung lässt sich im gelieferten Material nicht nachvollziehen. Bitte Material präzisieren oder erneut generieren.',502,'invalid_evidence');ids.add(fact.id);return fact;});
}
export function validateRoute(raw,facts){
  if(!raw||typeof raw!=='object')throw new StudioError('Wähle zuerst einen Ansatz.');
  assertShape(raw,routeSchema,'Ansatz');
  const route=Object.fromEntries(['id','kind','title','reader_question','insight','concept','brand_role','publisher_fit','creative_mechanic','opening_hook','visual_direction'].map(k=>[k,str(raw[k],k==='title'?200:1800)]));
  route.evidence_ids=list(raw.evidence_ids).map(x=>str(x,30));route.research_gaps=list(raw.research_gaps).map(x=>str(x,800)).slice(0,8);
  if(!route.id||!route.title||route.title.split(/\s+/).length>10||!['strategisch','menschlich','pragmatisch'].includes(route.kind)||!PALETTES.includes(route.visual_direction)||!route.concept||!route.brand_role||!route.evidence_ids.length||route.evidence_ids.some(id=>!facts.some(f=>f.id===id)))throw new StudioError('Der Ansatz erfüllt die vereinbarte Struktur oder Quellenzuordnung nicht.',502,'invalid_route');
  return route;
}
export function validateAnalysis(raw,brief){
  assertShape(raw,analysisSchema);
  if(!raw||typeof raw!=='object'||!['ready','needs_material'].includes(raw.status))throw new StudioError('Das Modell hat kein auswertbares Ergebnis geliefert.',502,'invalid_output');
  const facts=validateFacts(raw.facts,brief),missing_material=list(raw.missing_material).map(x=>str(x,800)).slice(0,8);
  if(raw.status==='needs_material')return{status:'needs_material',material_summary:str(raw.material_summary,2000),facts,routes:[],missing_material:missing_material.length?missing_material:['Das Material trägt noch keine drei unterschiedlichen Native-Ansätze.']};
  if(facts.length<3||list(raw.routes).length!==3)throw new StudioError('Drei eigenständige Ansätze brauchen mindestens drei zuordenbare Fakten.',502,'insufficient_material');
  const routes=raw.routes.map(r=>validateRoute(r,facts));if(new Set(routes.map(r=>r.id)).size!==3||new Set(routes.map(r=>r.kind)).size!==3)throw new StudioError('Die Ansätze müssen strategisch, menschlich und pragmatisch unterscheidbar sein.',502,'invalid_routes');
  return{status:'ready',material_summary:str(raw.material_summary,2000),facts,routes,missing_material};
}
export function validateDraft(raw,facts){
  assertShape(raw,draftSchema);
  if(!raw||typeof raw!=='object')throw new StudioError('Kein Textentwurf vorhanden.',502,'invalid_draft');
  const checkParagraphs=(items)=>{if(!Array.isArray(items)||!items.length||items.length>5)throw new StudioError('Die Leseprobe ist unvollständig.',502,'invalid_draft');return items.map(p=>{const text=str(p.text,2300),kind=p.kind,evidence_ids=list(p.evidence_ids).map(x=>str(x,30));if(!text||!['framing','sourced'].includes(kind)||(kind==='sourced'&&!evidence_ids.length)||evidence_ids.some(id=>!facts.some(f=>f.id===id)))throw new StudioError('Ein Textabschnitt besitzt keine nachvollziehbare Quellenzuordnung.',502,'invalid_draft_evidence');return{text,kind,evidence_ids};});};
  const d={headline:str(raw.headline,180),kicker:str(raw.kicker,100),teaser:str(raw.teaser,900),opening:checkParagraphs(raw.opening),explainer_heading:str(raw.explainer_heading,180),explainer:checkParagraphs(raw.explainer),takeaway:str(raw.takeaway,600),continue_question:str(raw.continue_question,240),teasers:list(raw.teasers).map(t=>({angle:str(t.angle,100),headline:str(t.headline,180),body:str(t.body,500),cta:str(t.cta,60)})),production_notes:list(raw.production_notes).map(x=>str(x,800)).slice(0,8)};
  if(!d.headline||!d.teaser||!d.explainer_heading||!d.continue_question||d.teasers.length!==3||d.teasers.some(t=>!t.headline||!t.body||!t.cta))throw new StudioError('Der Text- und Teaserentwurf ist unvollständig.',502,'invalid_draft');
  return d;
}
export const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function previewHtml(brief,route,draft,image=''){
  const e=escapeHtml,palette=PALETTES.includes(route.visual_direction)?route.visual_direction:'editorial';const colors={editorial:['#793e2b','#f1e8d8'],immersive:['#30335d','#e7e5ed'],graphic:['#215746','#e5eadd']}[palette];
  const imageSafe=/^data:image\/(png|jpeg|webp);base64,[a-zA-Z0-9+/=]+$/.test(image)&&image.length<7000000?image:'';
  const paragraphs=items=>items.map(p=>`<p>${e(p.text)}</p>`).join('');
  const sourceList=brief.sources.map(s=>`<li>${s.url?`<a href="${e(safeUrl(s?.url))}" target="_blank" rel="noopener noreferrer">${e(s.title)}</a>`:e(s.title)} (${e(s.id)})</li>`).join('');
  return `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${e(draft.headline)}</title><style>*{box-sizing:border-box}body{margin:0;color:#252820;background:#faf8f2;font-family:Arial,sans-serif}header{padding:16px 6%;border-bottom:1px solid #cccac1;font-size:10px;display:flex;justify-content:space-between;gap:20px;line-height:1.5}.cover{background:${colors[1]};padding:65px 8% 55px}.cover-image{display:block;width:100%;max-height:650px;object-fit:cover}.label{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:${colors[0]}}h1{font-family:Georgia,serif;font-weight:400;font-size:clamp(38px,6.8vw,86px);line-height:1.05;letter-spacing:-1.8px;max-width:1050px;margin:25px 0}.teaser{font-size:19px;line-height:1.6;max-width:780px}article{max-width:750px;margin:55px auto;padding:0 25px}article p{font-size:17px;line-height:1.85}h2{font:400 35px/1.2 Georgia,serif;margin-top:45px}.takeaway{border-left:3px solid ${colors[0]};padding-left:23px;margin:35px 0;font:400 24px/1.5 Georgia,serif}.continue{padding:40px 8%;background:${colors[1]}}.continue h2{max-width:800px;margin:15px 0}footer{padding:28px 8%;font-size:11px;line-height:1.8;color:#5a6057}footer ul{padding-left:18px}a{color:inherit}@media(max-width:600px){.cover{padding:40px 7%}h1{font-size:43px}.teaser{font-size:16px}article{margin:35px auto}article p{font-size:16px}h2{font-size:30px}.takeaway{font-size:22px}}</style></head><body><header><span>Konzeptstudie · ${e(brief.brand)}</span><span>Native-Leseprobe · keine beauftragte Veröffentlichung</span></header><section class="cover"><p class="label">${e(draft.kicker)}</p><h1>${e(draft.headline)}</h1><p class="teaser">${e(draft.teaser)}</p></section>${imageSafe?`<img class="cover-image" src="${imageSafe}" alt="Bereitgestelltes Motiv zur Konzeptvisualisierung">`:''}<article>${paragraphs(draft.opening)}<h2>${e(draft.explainer_heading)}</h2>${paragraphs(draft.explainer)}<div class="takeaway">${e(draft.takeaway)}</div></article><section class="continue"><p class="label">Die Geschichte geht weiter</p><h2>${e(draft.continue_question)}</h2></section><footer>Arbeitsentwurf aus Native Creative Studio. Bildrechte, Tatsachen, Markenrolle und Freigaben sind vor jeder Veröffentlichung redaktionell zu prüfen. Die Leseprobe ist keine vor Ort recherchierte Reportage.<ul>${sourceList}</ul></footer></body></html>`;
}
