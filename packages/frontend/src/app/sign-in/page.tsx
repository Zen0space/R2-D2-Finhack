import { SignInPage } from "@/components/duitlater/auth-page";

export default async function SignInRoute({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return <SignInPage nextPath={next ?? null} />;
}
