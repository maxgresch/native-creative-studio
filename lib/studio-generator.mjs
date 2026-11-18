import { analysisSchema,draftSchema,validateBrief,validateFacts,validateRoute,validateAnalysis,validateDraft,StudioError,MODEL_DEFAULT } from './studio-contract.mjs';
import { EDITORIAL_STANDARD, ANALYSIS_TASK, DRAFT_TASK } from './editorial-standard.mjs';
export const EDITORIAL_SYSTEM=EDITORIAL_STANDARD;
export function buildModelRequest(stage,brief,selection,facts,model=MODEL_DEFAULT){return{model,store:false,instructions:EDITORIAL_SYSTEM+'\n'+(stage==='angles'?ANALYSIS_TASK:DRAFT_TASK),input:JSON.stringify(stage==='angles'?{brief}:{brief,selected_route:selection,facts}),reasoning:{effort:'medium'},max_output_tokens:11000,text:{format:{type:'json_schema',name:stage==='angles'?'native_analysis':'native_draft',strict:true,schema:stage==='angles'?analysisSchema:draftSchema}}};}
export async function generate(payload,options={}){
  const {apiKey,model=MODEL_DEFAULT,fetchImpl=fetch}=options;
  if(!apiKey)throw new StudioError('Die Live-Generierung ist noch nicht eingerichtet. Der serverseitige API-Schlüssel fehlt.',503,'setup_required');
  if(!['angles','draft'].includes(payload?.stage))throw new StudioError('Unbekannter Arbeitsschritt.');
  const brief=validateBrief(payload.brief);let facts=[],selection;
  if(payload.stage==='draft'){facts=validateFacts(payload.facts,brief);if(facts.length<3)throw new StudioError('Es fehlen zugeordnete Materialfakten.');selection=validateRoute(payload.selection,facts);}
  let response;try{response=await fetchImpl('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify(buildModelRequest(payload.stage,brief,selection,facts,model)),signal:AbortSignal.timeout(110000)});}catch(error){if(error?.name==='TimeoutError'||error?.name==='AbortError')throw new StudioError('Die Modellanfrage hat das Zeitlimit erreicht. Es wurde kein Ergebnis übernommen.',504,'model_timeout');throw new StudioError('Die Modellverbindung ist gerade nicht erreichbar.',502,'model_connection');}
  if(!response.ok){if(response.status===429)throw new StudioError('Das Modelllimit oder API-Budget ist erreicht. Bitte die API-Konfiguration prüfen und später erneut versuchen.',429,'model_limit');if(response.status===401||response.status===403)throw new StudioError('Der API-Zugang ist für diese Modellanfrage nicht freigeschaltet.',503,'model_access');throw new StudioError('Das Modell konnte die Anfrage nicht abschließen. Es wurde kein Ergebnis übernommen.',502,'model_error');}
  let data;try{data=await response.json();}catch{throw new StudioError('Die Modellantwort war nicht lesbar.',502,'invalid_output');}
  const parts=(data.output??[]).flatMap(item=>item.content??[]);
  if(parts.some(part=>part.type==='refusal'))throw new StudioError('Das Modell hat diese Anfrage abgelehnt. Bitte Briefing und Quellen prüfen.',422,'model_refusal');
  if(data.status==='incomplete')throw new StudioError('Die Modellantwort war unvollständig. Es wurde kein Teilergebnis übernommen.',502,'incomplete_output');
  const rawText=parts.filter(p=>p.type==='output_text').map(p=>p.text).join('');let raw;try{raw=JSON.parse(rawText);}catch{throw new StudioError('Die Modellantwort entspricht nicht der vereinbarten Struktur.',502,'invalid_output');}
  const result=payload.stage==='angles'?validateAnalysis(raw,brief):validateDraft(raw,facts);
  return{stage:payload.stage,result,meta:{mode:'live',model,response_id:data.id??null,usage:data.usage?{input_tokens:data.usage.input_tokens,output_tokens:data.usage.output_tokens}:null,checked:'Struktur, bekannte Referenz-IDs und wortwörtliche Belegstellen geprüft; keine unabhängige inhaltliche Freigabe.'}};
}
