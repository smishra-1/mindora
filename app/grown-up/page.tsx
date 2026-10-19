import { Suspense } from "react";
import { TalkToGrownUp } from "@/components/talk-to-grown-up";
import { LoadingDots } from "@/components/ui";

export const metadata = { title: "Talk to a Grown-Up · Mindora" };

export default function Page() {
  return (
    <Suspense fallback={<LoadingDots />}>
      <TalkToGrownUp />
    </Suspense>
  );
}
