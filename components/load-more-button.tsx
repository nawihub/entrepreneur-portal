import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LoadMoreButtonProps {
  hasNextPage?: boolean;
  isFetching: boolean;
  onClick: () => void;
}

export function LoadMoreButton({ hasNextPage, isFetching, onClick }: LoadMoreButtonProps) {
  if (!hasNextPage) return null;
  return (
    <div className="flex justify-center py-4">
      <Button variant="outline" onClick={onClick} disabled={isFetching}>
        {isFetching ? <Loader2 className="size-4 animate-spin" /> : null}
        {isFetching ? "Loading…" : "Load more"}
      </Button>
    </div>
  );
}
