"use client";

import { use } from "react";
import { BigIdeaDetail } from "@/components/big-ideas/big-idea-detail";
import { useMyBigIdea } from "@/lib/queries/big-ideas";

/** The owner's view of their own idea, in any status. */
export default function MyBigIdeaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <BigIdeaDetail query={useMyBigIdea(id)} owned />;
}
