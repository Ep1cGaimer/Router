import * as p from "@clack/prompts";
import config from "../providers.json";
import { chatCompletion, fetchModels } from "./providers";

p.intro("Shivam Kumar Routing Service");

const spinner = p.spinner();

const provider = await p.select({
  message: "Select a provider, Shivam Kumar will fetch it for you:",
  options: Object.keys(config).map(p => ({ label: p, value: p })),
});

if (p.isCancel(provider)) { p.outro("Cancelled"); process.exit(0); }

spinner.start("Shivam kumar is fethcing your models....");
const models = await fetchModels(provider as string)
spinner.stop("Shivam Kumar has found the models!");

const model = await p.select({
  message: "Select a model, Shivam Kumar will fetch it for you:",
  options: models.map((m: any) => ({ label: m.id, value: m.id })),
})

if (p.isCancel(model)) { p.outro("Cancelled"); process.exit(0); }

const messages: { role: string, content: string }[] = [];

while (true) {
  const input = await p.text({ message: "You: " });
  if(p.isCancel(input)) break;
  messages.push({ role: "user", content: input as string});
  const spinner = p.spinner();
  spinner.start("Shivam Kumar is thinking...");
  const response = await chatCompletion(provider, { model, messages });
  spinner.stop("Shivam Kumar has finished thinking!");
  const reply = response.choices[0].message.content;
  messages.push({ role: "assistant", content: reply });
  p.log.message(`Shivam Kumar: ${reply}`);
}

p.outro("Thank you for using Shivam Kumar Routing Service!");
