import { Suspense } from "react";

import { GitHubCommitGraphWithUsername } from "@/components/GitHubCommitGraph/GitHubCommitGraph";

export const dynamic = "force-dynamic";

export default function GitHubCommitGraphRenderPage() {
  return (
    <Suspense fallback={<div style={{ padding: 16 }}>Loading…</div>}>
      <GitHubCommitGraphWithUsername />
    </Suspense>
  );
}
