import config from '../providers.json';

type Provider = keyof typeof config;
//Provider cache
let modelCache: any[] = [];

export async function getCachedModels(): Promise<any[]> {
  if (modelCache.length === 0) {
    modelCache = await fetchAllModels();
  }
  return modelCache;
}

export function findProviderForModel(model: string): string | null {
  const entry = modelCache.find((m) => m.id === model);
  return entry ? entry.provider : null;
}

function getProvider(name: string){
  const provider = config[name as Provider];
  if(!provider) throw new Error(`Unknown provider: ${name}`);
  const key = process.env[`${name.toUpperCase()}_API_KEY`];
  if(!key) throw new Error(`Missing API key for ${name}`);
  return{ baseUrl: provider.baseUrl, apiKey: key };
}


export async function fetchModels(name: string) {
  const {baseUrl,apiKey} = getProvider(name);
  const res = await fetch(`${baseUrl}/models`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    signal: AbortSignal.timeout(10_000),
  });
  const data = await res.json();
  return data.data;
}


export async function fetchAllModels() {
  const names = Object.keys(config);
  const results = await Promise.allSettled(
    names.map(async (name) => {
      const models = await fetchModels(name);
      return models.map((m: any) => ({ ...m, provider: name }));
    })
  );
  return results
    .filter((r: any) => r.status === "fulfilled")
    .flatMap((r: any) => r.value);
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
    signal: AbortSignal.timeout(30_000),
  });
  const data = await res.json();
  return {status: res.status, data};
}
