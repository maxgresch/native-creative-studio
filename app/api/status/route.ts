import { env } from 'cloudflare:workers';
import { MODEL_DEFAULT } from '@/lib/studio-contract.mjs';
export const dynamic='force-dynamic';
export async function GET(){const config=env as unknown as Record<string,string|undefined>;return Response.json({configured:!!config.OPENAI_API_KEY,model:config.OPENAI_MODEL||MODEL_DEFAULT},{headers:{'Cache-Control':'private, no-store'}});}
