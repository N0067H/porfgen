import axios from "axios";

export async function generateMarkdown(instruction, apiKey, opts = {}) {
  if (!apiKey) throw new Error("OpenAI API key missing");

  const payload = {
    model: opts.model || "gpt-5.1",
    input: instruction,
    max_output_tokens: opts.max_output_tokens || 1500,
    temperature: opts.temperature ?? 1,
  };

  const resp = await axios.post(
    "https://api.openai.com/v1/responses",
    payload,
    {
      headers: { Authorization: `Bearer ${apiKey}` },
      timeout: opts.timeout || 120000,
    }
  );

  const o = resp.data.output;
  let markdown = "";
  if (
    Array.isArray(o) &&
    o[0] &&
    Array.isArray(o[0].content) &&
    o[0].content[0]?.text
  ) {
    markdown = o[0].content[0].text;
  }

  return { markdown, raw: resp.data };
}
