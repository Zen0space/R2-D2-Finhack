// LLM client config for Penasihat.
//
// Routes to Amazon Bedrock's OpenAI-compatible endpoint with a Bedrock
// API key (bearer auth). Env vars use the OPENAI_* naming because the
// Bedrock console-issued API keys are designed as drop-in OpenAI
// SDK credentials.
//
// Set OPENAI_BASE_URL + OPENAI_API_KEY in packages/backend/.env.

client<llm> ClaudeHaikuBedrock {
  provider openai-generic
  options {
    base_url env.OPENAI_BASE_URL
    api_key  env.OPENAI_API_KEY
    model    "anthropic.claude-haiku-4-5-20251001-v1:0"
  }
}
