// Penasihat — pool item suggester.
//
// Inputs (SuggestionContext + CatalogueItem[]) describe the pool's combined
// credit cap, the kampung's stated need, current weather/seasonal signal,
// economic posture, and recent kampung pool history. Output is a typed list
// of catalogue items with BM-first reasoning that MUST cite at least one
// contextual signal.

class WeatherSignal {
  season string @description("monsoon-ne, monsoon-sw, or inter-monsoon")
  isRaining bool
  expectedTempC int
}

class SuggestionContext {
  poolId string
  combinedCapCents int
  statedNeed string
  statedNeedCategory string
  kampungName string
  monthOfYear int
  weather WeatherSignal
  economicPosture string @description("conservative, balanced, or aggressive — derived from pool size")
  recentItems string[] @description("Item names the kampung has pooled for in recent COMPLETED pools")
}

class CatalogueItem {
  id string
  name_bm string
  category string
  price_cents int
}

class Suggestion {
  itemId string
  itemName string
  priceCents int
  allocationPct int @description("Item price as a percentage of combinedCapCents (0-100)")
  reasoningBm string @description("Bahasa Melayu reasoning. MUST cite at least one of: weather, season, economic posture, or kampung's recent pool history.")
  reasoningEn string @description("English reasoning, concise. For staff translation only.")
}

function SuggestPoolItems(ctx: SuggestionContext, candidates: CatalogueItem[]) -> Suggestion[] {
  client ClaudeHaikuBedrock
  prompt #"
    {{ _.role("system") }}
    You are Penasihat, an AI advisor for a Malaysian rural community pool.
    Your job: pick the best 5 items from a MyKasih catalogue to fit the pool's
    combined credit cap and current contextual signals.

    Hard rules:
    - reasoningBm MUST be in Bahasa Melayu, single sentence.
    - reasoningBm MUST cite at least one of: weather, season, economic
      posture, or the kampung's recent pool history.
    - reasoningEn is a concise English translation for staff dashboards.
    - allocationPct is the item's price as a whole-number percentage of the
      pool's combined cap (round to nearest int).
    - Never suggest an item whose price exceeds combinedCapCents.

    {{ _.role("user") }}
    Pool context for {{ ctx.kampungName }}:
    - Combined credit cap: RM {{ (ctx.combinedCapCents / 100) | round }}
    - Stated need: "{{ ctx.statedNeed }}" (category: {{ ctx.statedNeedCategory }})
    - Current month: {{ ctx.monthOfYear }}
    - Weather: {{ ctx.weather.season }}, {% if ctx.weather.isRaining %}sedang hujan{% else %}cuaca cerah{% endif %}, ~{{ ctx.weather.expectedTempC }}°C
    - Economic posture: {{ ctx.economicPosture }}
    - Recent kampung pools: {% if ctx.recentItems %}{{ ctx.recentItems | join(", ") }}{% else %}(belum ada rekod){% endif %}

    Catalogue (already filtered to fit the cap):
    {% for item in candidates %}
    - {{ item.id }} · {{ item.name_bm }} · {{ item.category }} · RM {{ (item.price_cents / 100) | round }}
    {% endfor %}

    Return the top 5 items.

    {{ ctx.output_format }}
  "#
}
