// LLM client config for Penasihat.
//
// Routes to Amazon Bedrock's OpenAI-compatible endpoint with a Bedrock
// API key (bearer auth, no SigV4). Set BEDROCK_OPENAI_BASE_URL and
// BEDROCK_API_KEY in packages/backend/.env at runtime.

client<llm> ClaudeHaikuBedrock {
  provider openai-generic
  options {
    base_url env.BEDROCK_OPENAI_BASE_URL
    api_key  env.BEDROCK_API_KEY
    model    "anthropic.claude-haiku-4-5-20251001-v1:0"
  }
}
