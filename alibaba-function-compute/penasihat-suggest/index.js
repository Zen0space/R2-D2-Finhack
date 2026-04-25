/**
 * Alibaba Cloud Function Compute · Penasihat item suggester (Qwen-backed).
 *
 * Multi-cloud companion to the AWS-hosted DuitLater backend. Receives a
 * { context, candidates } payload from the backend, calls Qwen for BM-first
 * structured-output ranking, returns top-5 suggestions.
 *
 * Deploy:
 *   1. `cd alibaba-function-compute/penasihat-suggest`
 *   2. `fun deploy` (or via Alibaba Cloud console: create FC service, upload zip)
 *   3. Set DASHSCOPE_API_KEY in FC env vars
 *   4. Set ALIBABA_FUNCTION_COMPUTE_URL in backend .env to the FC HTTP trigger URL
 *
 * Why Alibaba FC + Qwen:
 *   - Qwen is BM-native (better Bahasa Melayu reasoning than English-trained models)
 *   - Sponsor-aligned (Alibaba Cloud is FINHACK 2026 Platinum sponsor)
 *   - Cost-optimised for small structured-output workloads
 *   - Data sovereignty narrative: B40 user financial context stays in regional
 *     sovereign cloud
 */

const SYSTEM_PROMPT = `You are Penasihat, an AI advisor for the DuitLater pool PayLater platform serving B40 households at NADI Felda Gedangsa, Hulu Selangor.

Given:
  - A pool's combined PayLater capacity (in cents)
  - The pool's stated need (free text)
  - The category they selected
  - The kampung name and current month
  - A list of MyKasih-eligible catalogue items (BM/EN names + price + category)

Return EXACTLY 5 ranked item suggestions as a JSON object:
  { "items": [
      { "itemId": string, "itemName": string, "priceCents": number,
        "allocationPct": number (0-100), "reasoningBm": string (1-2 sentences in BM),
        "reasoningEn": string (1-2 sentences in EN) },
      ... (4 more)
  ]}

Rules:
  - Suggestions MUST fit within the combined cap.
  - Allocation % is the price as a fraction of the combined cap.
  - reasoningBm should be the primary register; reasoningEn is supplemental.
  - Prefer items that match the stated need and category.
  - Consider seasonal context: school season (Dec-Jan, May-Jun) → school supplies; harvest → agricultural tools.
  - Do NOT suggest luxury or non-essential items even if they fit the cap.
  - Output strict JSON. No prose, no markdown, no comments outside the JSON.`;

const QWEN_API_URL = "https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/text-generation/generation";

exports.handler = async (event, context, callback) => {
  let body;
  try {
    body = typeof event === "string" ? JSON.parse(event) : event;
  } catch (err) {
    return callback(null, response(400, { error: "Invalid JSON body" }));
  }

  const { context: ctx, candidates } = body;
  if (!ctx || !candidates) {
    return callback(null, response(400, { error: "Missing context or candidates" }));
  }

  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) {
    return callback(null, response(500, { error: "DASHSCOPE_API_KEY not configured" }));
  }

  const userPayload = {
    pool: {
      combinedCapCents: ctx.combinedCapCents,
      statedNeed: ctx.statedNeed,
      statedNeedCategory: ctx.statedNeedCategory,
      kampungName: ctx.kampungName,
      monthOfYear: ctx.monthOfYear,
    },
    candidates,
  };

  try {
    const qwenRes = await fetch(QWEN_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "qwen-plus",
        input: {
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: JSON.stringify(userPayload) },
          ],
        },
        parameters: { result_format: "message", temperature: 0.3 },
      }),
    });

    if (!qwenRes.ok) {
      const errText = await qwenRes.text();
      return callback(null, response(502, { error: `Qwen returned ${qwenRes.status}: ${errText}` }));
    }

    const data = await qwenRes.json();
    const text = data?.output?.choices?.[0]?.message?.content || data?.output?.text;
    if (!text) {
      return callback(null, response(502, { error: "Qwen returned no content" }));
    }

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      return callback(null, response(502, { error: "Qwen output not valid JSON", raw: text }));
    }

    return callback(null, response(200, parsed));
  } catch (err) {
    return callback(null, response(502, { error: `Qwen call failed: ${err.message}` }));
  }
};

function response(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}
