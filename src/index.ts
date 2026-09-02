import {Hono} from 'hono'
import {chatCompletion, fetchModels,fetchAllModels} from './providers'
import { checkRateLimit } from './ratelimit'

const app = new Hono()

app.post("/v1/chat/completions", async (c) =>{
  const body = await c.req.json();
  const ip = c.req.header("x-forwarded-for") ?? c.req.header("x-real-ip") ?? "unknown";
  if(!checkRateLimit(ip)) return c.json({ error: "Rate limit exceeded" }, 429);
  const {provider, ...rest} = body;
  const result = await chatCompletion(provider, rest)
  return c.json(result);
})

app.get("/v1/models", async (c) => {
  const models = await fetchAllModels();
  return c.json({object:"list", data: models});
})

export default {
  port: 3000,
  fetch: app.fetch,
}
