/**
 * Mock weather signal — calendar-derived from Malaysia's monsoon pattern.
 * Pure function, deterministic for a given date. No network, no API key.
 *
 * NE monsoon:    Nov–Feb (heavy rain, cooler east coast)
 * SW monsoon:    May–Sep (drier inland, hot)
 * Inter-monsoon: Mar–Apr, Oct (transitional, scattered showers)
 */

export type WeatherSignal = {
  season: "monsoon-ne" | "monsoon-sw" | "inter-monsoon";
  isRaining: boolean;
  expectedTempC: number;
};

export function getWeatherForDate(date: Date = new Date()): WeatherSignal {
  const month = date.getUTCMonth() + 1; // 1-12

  if (month >= 11 || month <= 2) {
    return { season: "monsoon-ne", isRaining: true, expectedTempC: 26 };
  }

  if (month >= 5 && month <= 9) {
    // Shoulder months (May, Sep) get the wetter side of SW monsoon
    return {
      season: "monsoon-sw",
      isRaining: month === 5 || month === 9,
      expectedTempC: 32,
    };
  }

  return { season: "inter-monsoon", isRaining: false, expectedTempC: 30 };
}
