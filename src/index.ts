import {Hono} from 'hono'
import {chatCompletion, fetchModels} from './providers'
import { checkRateLimit } from './ratelimit'

const app = new Hono()

app.post("/v1/chat/completions", async (c) =>{
  const body = await c.req.json();
  const ip = c.req.ip;
  if(!checkRateLimit(ip)) return c.json({ error: "Rate limit exceeded" }, 429);
  const {provider, ...rest} = body;
  const result = await chatCompletion(provider, rest)
  return c.json(result);
})

export default {
  port: 3000,
  fetch: app.fetch,
}
