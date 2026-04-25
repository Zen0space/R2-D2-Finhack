import { PoolDetailPage } from "@/components/duitlater/pool-detail-page";

export const dynamic = "force-dynamic";

export default async function PoolDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <PoolDetailPage poolId={id} />;
}
