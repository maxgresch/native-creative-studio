import {SCHEMA_VERSION,StudioError,validateBrief,validateAnalysis,validateDraft,assertShape,routeSchema} from './studio-contract.mjs';
import {normalizeCreative,safeCreativeImage} from './teaser-creative.mjs';
export const SESSION_KEY='native-creative-studio:project:v3';
export const MAX_PROJECT_BYTES=30000000;
export function projectSnapshot(state,images=true){return{schema:SCHEMA_VERSION,brief:state.brief,analysis:state.analysis??null,selected_route:state.selection??null,draft:state.draft??null,meta:state.meta??null,step:state.step??0,image:images?state.image||'':'',imageName:images?state.imageName||'':'',creatives:(state.creatives||[]).map(s=>({...s,image:images?s.image||'':'',imageName:images?s.imageName||'':''}))};}
export function readProject(text){
  if(typeof text!=='string'||text.length>MAX_PROJECT_BYTES)throw new StudioError('Bitte eine Studio-Projektdatei bis 30 MB verwenden.');
  let p;try{p=JSON.parse(text);}catch{throw new StudioError('Die Projektdatei enthält kein gültiges JSON.');}
  if(!p||!['native-creative-studio/0.1','native-creative-studio/0.2',SCHEMA_VERSION].includes(p.schema))throw new StudioError('Das ist keine unterstützte Studio-Projektdatei.');
  const raw=p.brief,brief={};for(const [key,max] of Object.entries({brand:100,objective:1800,audience:800,occasion:600,publisher:1000,constraints:1200})){if(typeof raw?.[key]!=='string'||raw[key].length>max)throw new StudioError('Das gespeicherte Briefing ist ungültig.');brief[key]=raw[key];}
  if(!Array.isArray(raw.sources)||raw.sources.length<1||raw.sources.length>5)throw new StudioError('Die gespeicherten Quellen sind ungültig.');
  brief.sources=raw.sources.map((s,i)=>{if(!s||typeof s.title!=='string'||typeof s.url!=='string'||typeof s.excerpt!=='string'||s.title.length>180||s.url.length>2048||s.excerpt.length>6000)throw new StudioError('Eine gespeicherte Quelle ist ungültig.');return{...s,id:`S${i+1}`};});
  let analysis=null,selection=null,draft=null;
  if(p.analysis){Object.assign(brief,validateBrief(brief));analysis=validateAnalysis(p.analysis,brief);}
  if(p.selected_route){assertShape(p.selected_route,routeSchema,'Gespeicherter Ansatz');if(!analysis?.routes.some(r=>r.id===p.selected_route.id)||p.selected_route.evidence_ids.some(id=>!analysis.facts.some(f=>f.id===id)))throw new StudioError('Der gespeicherte Ansatz passt nicht zu den Materialfakten.');selection=p.selected_route;}
  if(p.draft){if(!selection)throw new StudioError('Der Text hat keinen ausgewählten Ansatz.');draft=validateDraft(p.draft,analysis.facts);}
  const mode=['example','import','live'].includes(p.meta?.mode)?p.meta.mode:'import';
  if(p.image&&!safeCreativeImage(p.image))throw new StudioError('Das gespeicherte Motiv hat kein unterstütztes Format.');
  const creatives=Array.isArray(p.creatives)?p.creatives.slice(0,3).map(normalizeCreative):[];
  const last=draft?2:analysis?1:0,step=Number.isInteger(p.step)&&p.step>=0&&p.step<=last?p.step:last;
  return{brief,analysis,selection,draft,meta:analysis?{mode}:null,step,image:p.image||'',imageName:typeof p.imageName==='string'?p.imageName.slice(0,180):'',creatives};
}
