import { connection } from "next/server";
import { Suspense } from "react";
import { Home } from "@/components/home";
import { Landing } from "@/components/landing";
import { currentUserId } from "@/lib/supabase/server";

export default function Page() {
  // The landing page is the static shell; signed-in users swap it for their home screen.
  return (
    <Suspense fallback={<Landing />}>
      <Gate />
    </Suspense>
  );
}

async function Gate() {
  // Session checks compare token expiry to the current time, so always run at request time.
  await connection();
  return (await currentUserId()) ? <Home /> : <Landing />;
}
