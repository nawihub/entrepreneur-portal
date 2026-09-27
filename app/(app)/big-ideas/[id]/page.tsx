"use client";

import { use } from "react";
import { BigIdeaDetail } from "@/components/big-ideas/big-idea-detail";
import { useBigIdea } from "@/lib/queries/big-ideas";

/** Public view - the gateway only returns approved ideas here. */
export default function BigIdeaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <BigIdeaDetail query={useBigIdea(id)} owned={false} />;
}
