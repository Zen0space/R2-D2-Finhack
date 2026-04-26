// LLM client config for Penasihat.
//
// Routes to Z.AI's OpenAI-compatible endpoint (GLM-5.1 via Coding Plan).
// Bearer auth, OpenAI chat completions schema.
//
// Set OPENAI_BASE_URL + OPENAI_API_KEY in packages/backend/.env.
// API key from https://z.ai/ console.

client<llm> Penasihat {
  provider openai-generic
  options {
    base_url env.OPENAI_BASE_URL
    api_key  env.OPENAI_API_KEY
    model    "glm-5.1"
  }
}
