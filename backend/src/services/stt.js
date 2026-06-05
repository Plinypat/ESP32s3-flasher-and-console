import OpenAI from 'openai';
import { Readable } from 'stream';
import { toFile } from 'openai/uploads';

let openai;
function getClient() {
  if (!openai) openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return openai;
}

export async function transcribeAudio(pcmBuffer) {
  const client = getClient();
  const file = await toFile(Readable.from(pcmBuffer), 'audio.wav', { type: 'audio/wav' });
  const response = await client.audio.transcriptions.create({
    model: 'whisper-1',
    file,
    language: 'en',
  });
  return response.text;
}
