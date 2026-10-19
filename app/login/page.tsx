import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";

export const metadata = { title: "Log in · Mindora" };

export default function Page({ searchParams }: PageProps<"/login">) {
  return (
    <Suspense fallback={<AuthForm mode="login" />}>
      <Login searchParams={searchParams} />
    </Suspense>
  );
}

async function Login({ searchParams }: Pick<PageProps<"/login">, "searchParams">) {
  const { error } = await searchParams;
  return <AuthForm mode="login" confirmFailed={error === "confirm"} />;
}
