// Sends an image to local LM Studio and prints a detailed description.
// Usage: node _vision.mjs <imagePath> [modelId]
import { readFileSync } from "fs";

const imgPath = process.argv[2];
const model = process.argv[3] || "unsloth/qwen3.8-27b";
if (!imgPath) { console.error("usage: node _vision.mjs <imagePath> [modelId]"); process.exit(2); }

const b64 = readFileSync(imgPath).toString("base64");
const body = {
  model,
  max_tokens: 6000,
  temperature: 0.2,
  messages: [{ role: "user", content: [
    { type: "image_url", image_url: { url: `data:image/png;base64,${b64}` } },
    { type: "text", text: "You are receiving an attached image. Describe it in full detail for someone who cannot see it: every labeled element and its position (top/bottom/left/right), colors, arrows, boxes, and ALL visible text verbatim. If this is a biology or genetics diagram, name every gene, protein, structure and process shown." }
  ]}]
};

const r = await fetch("http://localhost:1234/v1/chat/completions", {
  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
});
const j = await r.json();
if (j.error) { console.log("API ERROR:", JSON.stringify(j.error)); process.exit(1); }
const msg = j.choices?.[0]?.message;
console.log(msg?.content ?? "(no content)");
if (msg?.reasoning_content) console.log("\n--- reasoning (truncated) ---\n" + String(msg.reasoning_content).slice(-800));
