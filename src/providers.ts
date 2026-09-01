import config from '../providers.json';

type Provider = keyof typeof config;

function getProvider(name: string){
  const provider = config[name as Provider];
  if(!provider) throw new Error(`Unknown provider: ${name}`);
  const key = process.env[`${name.toUpperCase()}_API_KEY`];
  if(!key) throw new Error(`Missing API key for ${name}`);
  return{ baseUrl: provider.baseUrl, apiKey: key };
}
export async function fetchModels(name: string){
  const {baseUrl,apiKey} = getProvider(name);
  const res = await fetch(`${baseUrl}/models`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    }
  });
  const data = await res.json();
  return data;
}

export async function chatCompletion(name: string, body: any){
  const {baseUrl, apiKey} = getProvider(name);
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return data;
}
