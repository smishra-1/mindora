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
  return (await currentUserId()) ? <Home /> : <Landing />;
}
