import {Hono} from 'hono'
import {chatCompletion, fetchModels, fetchAllModels, getCachedModels, findProviderForModel} from './providers'
import { checkRateLimit } from './ratelimit'

const app = new Hono()

await getCachedModels();

app.post("/v1/chat/completions", async (c) =>{
  const body = await c.req.json();
  const ip = c.req.header("x-forwarded-for") ?? c.req.header("x-real-ip") ?? "unknown";
  if(!checkRateLimit(ip)) return c.json({ error: "Rate limit exceeded" }, 429);
  const { provider, ...rest } = body;
  const resolved = provider ?? findProviderForModel(body.model);

  if (!resolved) {
    return c.json({ error: `Unknown model or provider: ${body.model}` }, 400);
  }
  try {
    const result = await chatCompletion(resolved, rest)
    return c.json(result.data, result.status);
  } catch (e: any) {
    return c.json({ error: e.message }, 502);
  }

})

app.get("/v1/models", async (c) => {
  const models = await fetchAllModels();
  return c.json({object:"list", data: models});
})

export default {
  port: 3000,
  fetch: app.fetch,
}
