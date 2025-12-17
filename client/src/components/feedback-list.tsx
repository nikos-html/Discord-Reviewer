import { useQuery } from "@tanstack/react-query";
import { MessageSquare, Loader2 } from "lucide-react";
import { FeedbackCard } from "@/components/feedback-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import type { FeedbackWithUser } from "@shared/schema";

function FeedbackSkeleton() {
  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </Card>
  );
}

export function FeedbackList() {
  const { data: feedbacks, isLoading, error } = useQuery<FeedbackWithUser[]>({
    queryKey: ["/api/feedbacks"],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">Ładowanie opinii...</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <FeedbackSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center">
        <p className="text-destructive">
          Nie udało się załadować opinii. Spróbuj odświeżyć stronę.
        </p>
      </Card>
    );
  }

  if (!feedbacks || feedbacks.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-full bg-muted p-4">
            <MessageSquare className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Brak opinii</h3>
            <p className="text-muted-foreground text-sm">
              Bądź pierwszą osobą, która podzieli się swoją opinią!
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          Opinie użytkowników
        </h2>
        <span className="text-sm text-muted-foreground">
          {feedbacks.length} {feedbacks.length === 1 ? "opinia" : feedbacks.length < 5 ? "opinie" : "opinii"}
        </span>
      </div>
      <div className="grid gap-4 md:grid-cols-2" data-testid="container-feedback-list">
        {feedbacks.map((feedback) => (
          <FeedbackCard key={feedback.id} feedback={feedback} />
        ))}
      </div>
    </div>
  );
}
