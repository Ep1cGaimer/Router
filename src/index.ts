import {Hono} from 'hono'
import {chatCompletion, fetchModels} from './providers'
const app = new Hono()

app.post("/v1/chat/completions", async (c) =>{
  const body = await c.req.json();
  const {provider, ...rest} = body;
  const result = await chatCompletion(provider, rest)
  return c.json(result);
})

export default {
  port: 3000,
  fetch: app.fetch,
}
