import { buildModelRequest } from './studio-generator.mjs';
import { validateBrief,validateRoute,validateAnalysis,validateDraft,StudioError } from './studio-contract.mjs';

/** @param {string} stage @param {object} rawBrief @param {object|null} selection @param {Array<any>} facts */
export function createHandoff(stage,rawBrief,selection=null,facts=[]){
  if(!['angles','draft'].includes(stage))throw new StudioError('Unbekannter Arbeitsschritt.');
  const brief=validateBrief(rawBrief);
  if(stage==='draft')validateRoute(selection,facts);
  const request=buildModelRequest(stage,brief,selection,facts);
  return `${request.instructions}\n\nAUFGABE: Bearbeite das Material und gib ausschließlich ein vollständiges JSON-Objekt nach dem folgenden Schema aus. Kein Markdown, keine Vorrede. Keine Webrecherche; verwende nur die gelieferten Auszüge.\n\nJSON-SCHEMA:\n${JSON.stringify(request.text.format.schema,null,2)}\n\nMATERIAL:\n${request.input}`;
}
export function readHandoffAnswer(stage,answer,brief,facts=[]){
  if(!['angles','draft'].includes(stage))throw new StudioError('Unbekannter Arbeitsschritt.');
  if(typeof answer!=='string'||answer.length>80000)throw new StudioError('Bitte nur das vollständige JSON-Ergebnis bis 80.000 Zeichen einfügen.');
  let parsed;try{parsed=JSON.parse(answer.trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,''));}catch{throw new StudioError('Die Antwort ist kein gültiges JSON. Bitte den vollständigen JSON-Block aus ChatGPT übernehmen.');}
  if(!parsed||typeof parsed!=='object')throw new StudioError('Die Antwort ist kein JSON-Objekt.');
  const raw=parsed.result??parsed;
  return stage==='angles'?validateAnalysis(raw,validateBrief(brief)):validateDraft(raw,facts);
}
