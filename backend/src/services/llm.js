import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

let anthropic;
let openai;

function getAnthropic() {
  if (!anthropic) anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return anthropic;
}

function getOpenAI() {
  if (!openai) openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return openai;
}

export async function getLLMResponse(transcript, agent) {
  const { llm_provider, llm_model, system_prompt } = agent;

  if (llm_provider === 'anthropic') {
    const client = getAnthropic();
    const msg = await client.messages.create({
      model: llm_model || 'claude-sonnet-4-5',
      max_tokens: 1024,
      system: system_prompt,
      messages: [{ role: 'user', content: transcript }],
    });
    return msg.content[0].text;
  }

  if (llm_provider === 'openai') {
    const client = getOpenAI();
    const completion = await client.chat.completions.create({
      model: llm_model || 'gpt-4o',
      max_tokens: 1024,
      messages: [
        { role: 'system', content: system_prompt },
        { role: 'user', content: transcript },
      ],
    });
    return completion.choices[0].message.content;
  }

  throw new Error(`Unknown llm_provider: ${llm_provider}`);
}
