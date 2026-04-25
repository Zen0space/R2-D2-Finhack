import { log } from "../middleware/logger.js";

const ALIBABA_TIMEOUT_MS = 6000;

export type NadiSummaryProvider = "alibaba-qwen" | "heuristic";

export type NadiSummaryContext = {
  activePools: number;
  kampungId: string;
  kampungName: string;
  latePaymentEvents: number;
  pendingDeliveryCount: number;
  poolsFormedCount: number;
  repaymentsThisWeek: number;
  topItemNameBm: string | null;
  trustDelta: number;
  trustScore: number;
  weekEnd: string;
  weekStart: string;
};

export type NadiWeeklySummary = {
  anomalies_bm: string[];
  headline_bm: string;
  observations_bm: string[];
  suggestion_bm: string;
};

type EnvShape = {
  ALIBABA_FUNCTION_COMPUTE_KEY?: string;
  ALIBABA_FUNCTION_COMPUTE_URL_NADI?: string;
};

export async function generateNadiWeeklySummary(
  context: NadiSummaryContext,
): Promise<{ provider: NadiSummaryProvider; summary: NadiWeeklySummary }> {
  const env = process.env as EnvShape;

  if (env.ALIBABA_FUNCTION_COMPUTE_URL_NADI) {
    try {
      const summary = await callAlibabaFunctionCompute(context, env);
      return { provider: "alibaba-qwen", summary };
    } catch (error) {
      log(
        "WARN",
        `[nadi-summary] Alibaba FC failed -> falling back to heuristic: ${
          error instanceof Error ? error.message : error
        }`,
      );
    }
  }

  return { provider: "heuristic", summary: buildHeuristicSummary(context) };
}

async function callAlibabaFunctionCompute(
  context: NadiSummaryContext,
  env: EnvShape,
): Promise<NadiWeeklySummary> {
  const url = env.ALIBABA_FUNCTION_COMPUTE_URL_NADI;

  if (!url) {
    throw new Error("ALIBABA_FUNCTION_COMPUTE_URL_NADI not set");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ALIBABA_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(env.ALIBABA_FUNCTION_COMPUTE_KEY
          ? { "X-Fc-Auth-Key": env.ALIBABA_FUNCTION_COMPUTE_KEY }
          : {}),
      },
      body: JSON.stringify({ context }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Alibaba FC returned ${response.status}`);
    }

    const body = (await response.json()) as { summary?: NadiWeeklySummary };

    if (!body.summary) {
      throw new Error("Alibaba FC returned empty summary");
    }

    return body.summary;
  } finally {
    clearTimeout(timeout);
  }
}

function buildHeuristicSummary(context: NadiSummaryContext): NadiWeeklySummary {
  const roundedTrust = Math.round(context.trustScore);
  const trustDeltaAbs = Math.abs(context.trustDelta).toFixed(1);
  const trustDeltaText =
    context.trustDelta > 0
      ? `naik ${trustDeltaAbs} mata`
      : context.trustDelta < 0
        ? `turun ${trustDeltaAbs} mata`
        : "kekal stabil";

  const headline_bm =
    context.poolsFormedCount > 0
      ? `${context.kampungName} catat ${context.poolsFormedCount} pool baharu minggu ini dengan skor kepercayaan ${roundedTrust}.`
      : `Minggu ini lebih tenang di ${context.kampungName}, dengan skor kepercayaan semasa pada ${roundedTrust}.`;

  const observations_bm = [
    `${context.poolsFormedCount} pool dibentuk minggu ini, sementara ${context.activePools} pool sedang aktif dan ${context.pendingDeliveryCount} masih menunggu pengesahan NADI.`,
    context.topItemNameBm
      ? `Permintaan paling menonjol minggu ini ialah ${context.topItemNameBm}, menunjukkan keperluan kampung masih tertumpu pada item yang benar-benar digunakan.`
      : "Belum ada item menonjol minggu ini, jadi corak permintaan masih bertaburan merentasi beberapa keperluan kecil.",
    `Skor kepercayaan kampung kini ${roundedTrust} dan ${trustDeltaText} berbanding awal minggu.`,
    context.repaymentsThisWeek > 0
      ? `${context.repaymentsThisWeek} bayaran balik direkodkan minggu ini, memberi signal bahawa ahli masih menghormati cycle bersama.`
      : "Belum ada bayaran balik direkodkan minggu ini, jadi rekod kampung bergantung pada kitaran yang telah selesai sebelum ini.",
  ];

  const anomalies_bm =
    context.latePaymentEvents >= 3
      ? [
          `Terdapat ${context.latePaymentEvents} isyarat bayaran lewat yang berkumpul dalam minggu ini. Ini petanda beberapa pool perlukan semakan rapat sebelum tekanan komuniti bertambah.`,
        ]
      : [];

  const suggestion_bm =
    context.latePaymentEvents >= 3
      ? "Hubungi pool yang paling lambat dahulu, semak sama ada isu mereka pada penghantaran, jadual, atau kemampuan semasa, kemudian susun tindakan susulan BM-first yang ringkas."
      : context.pendingDeliveryCount > 0
        ? "Utamakan pengesahan penghantaran untuk pool yang sudah lulus undian supaya cycle bayaran balik bermula dengan jelas dan tidak mencipta kekeliruan di pihak ahli."
        : context.poolsFormedCount === 0
          ? "Gunakan minggu yang lebih tenang ini untuk semak semula pool aktif dan kekalkan komunikasi kampung supaya kepercayaan terus terasa sebagai usaha bersama."
          : "Teruskan ritma semasa: pastikan pool baharu disusuli dengan penjelasan ringkas tentang share, tarikh kitaran, dan visible record supaya semua ahli bergerak dengan yakin.";

  return {
    anomalies_bm,
    headline_bm,
    observations_bm,
    suggestion_bm,
  };
}
