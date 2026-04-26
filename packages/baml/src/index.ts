/**
 * Public surface of the baml workspace package.
 *
 * Re-exports the generated BAML client (after `pnpm --filter baml generate`)
 * plus runtime helpers like the mock weather signal. Backend code should
 * only import from here, never reach into baml_client/ directly.
 */

export { b } from "../baml_client";
export type {
  CatalogueItem as BamlCatalogueItem,
  Suggestion as BamlSuggestion,
  SuggestionContext as BamlSuggestionContext,
  WeatherSignal as BamlWeatherSignal,
} from "../baml_client/types";

export { getWeatherForDate, type WeatherSignal } from "./weather";
