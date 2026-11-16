import { env } from 'cloudflare:workers';
import { getChatGPTUser,chatGPTSignInPath } from '@/app/chatgpt-auth';
import { generate } from '@/lib/studio-generator.mjs';
import { StudioError } from '@/lib/studio-contract.mjs';
export const dynamic='force-dynamic';
const inFlight=new Set<string>();
export async function POST(request:Request){
  const headers={'Cache-Control':'private, no-store'};
  try{
    const origin=request.headers.get('origin');if(!origin||origin!==new URL(request.url).origin)return Response.json({error:'Diese Anfrage muss aus dem Studio selbst kommen.',code:'invalid_origin'},{status:403,headers});
    const config=env as unknown as Record<string,string|undefined>;
    if(!config.OPENAI_API_KEY)return Response.json({error:'Die Live-Generierung ist noch nicht eingerichtet. Der serverseitige API-Zugang fehlt.',code:'setup_required'},{status:503,headers});
    const user=await getChatGPTUser();if(!user)return Response.json({error:'Für die Live-Generierung bitte mit ChatGPT anmelden.',code:'sign_in_required',sign_in_url:chatGPTSignInPath('/')},{status:401,headers});
    if(inFlight.has(user.userId))return Response.json({error:'Es läuft bereits eine Anfrage. Bitte das Ergebnis abwarten.',code:'in_progress'},{status:409,headers});
    const body=await request.text();if(body.length>45000)return Response.json({error:'Das Material ist zu umfangreich. Bitte die Auszüge kürzen.',code:'input_too_large'},{status:413,headers});
    let payload;try{payload=JSON.parse(body);}catch{return Response.json({error:'Die Eingaben konnten nicht gelesen werden.',code:'invalid_json'},{status:400,headers});}
    inFlight.add(user.userId);try{return Response.json(await generate(payload,{apiKey:config.OPENAI_API_KEY,model:config.OPENAI_MODEL}),{headers});}finally{inFlight.delete(user.userId);}
  }catch(error){if(error instanceof StudioError)return Response.json({error:error.message,code:error.code},{status:error.status,headers});return Response.json({error:'Der Arbeitsschritt konnte nicht abgeschlossen werden. Dein bisheriger Stand bleibt erhalten.',code:'unexpected_error'},{status:500,headers});}
}
