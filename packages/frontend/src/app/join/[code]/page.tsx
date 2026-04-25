import { JoinPoolPage } from "@/components/duitlater/join-pool-page";

export default async function JoinPoolRoute({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { code } = await params;
  const resolvedSearchParams = await searchParams;
  const searchParamEntries: string[][] = [];

  for (const [key, value] of Object.entries(resolvedSearchParams)) {
    if (Array.isArray(value)) {
      for (const entry of value) {
        searchParamEntries.push([key, entry]);
      }

      continue;
    }

    if (value) {
      searchParamEntries.push([key, value]);
    }
  }

  const searchParamsString = new URLSearchParams(
    searchParamEntries,
  ).toString();

  return <JoinPoolPage inviteCode={code} searchParamsString={searchParamsString} />;
}
