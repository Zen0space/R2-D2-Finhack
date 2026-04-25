import { SignUpPage } from "@/components/duitlater/auth-page";

export default async function SignUpRoute({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return <SignUpPage nextPath={next ?? null} />;
}
