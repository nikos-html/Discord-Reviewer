import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageSquare, Loader2, ChevronLeft, ChevronRight, ArrowUpDown, Filter, Star } from "lucide-react";
import { FeedbackCard } from "@/components/feedback-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { FeedbackWithUser } from "@shared/schema";

interface PaginatedFeedbacks {
  feedbacks: FeedbackWithUser[];
  total: number;
  page: number;
  totalPages: number;
}

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
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<"date" | "rating">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [ratingFilter, setRatingFilter] = useState<string>("all");

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: "10",
    sortBy,
    sortOrder,
  });
  
  if (ratingFilter !== "all") {
    queryParams.set("rating", ratingFilter);
  }

  const { data, isLoading, error } = useQuery<PaginatedFeedbacks>({
    queryKey: ["/api/feedbacks", { page, sortBy, sortOrder, ratingFilter }],
    queryFn: async () => {
      const response = await fetch(`/api/feedbacks?${queryParams.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch feedbacks");
      return response.json();
    },
  });

  const handleSortChange = (value: string) => {
    const [newSortBy, newSortOrder] = value.split("-") as ["date" | "rating", "asc" | "desc"];
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setPage(1);
  };

  const handleRatingFilterChange = (value: string) => {
    setRatingFilter(value);
    setPage(1);
  };

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

  const { feedbacks, total, totalPages } = data || { feedbacks: [], total: 0, totalPages: 0 };

  if (total === 0 && ratingFilter === "all") {
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

  const getPolishCount = (count: number) => {
    if (count === 1) return "opinia";
    if (count >= 2 && count <= 4) return "opinie";
    return "opinii";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold" data-testid="text-feedback-title">
          Opinie użytkowników
        </h2>
        <span className="text-sm text-muted-foreground">
          {total} {getPolishCount(total)}
        </span>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={`${sortBy}-${sortOrder}`} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[180px]" data-testid="select-sort">
            <ArrowUpDown className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Sortuj" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">Najnowsze</SelectItem>
            <SelectItem value="date-asc">Najstarsze</SelectItem>
            <SelectItem value="rating-desc">Najwyższa ocena</SelectItem>
            <SelectItem value="rating-asc">Najniższa ocena</SelectItem>
          </SelectContent>
        </Select>

        <Select value={ratingFilter} onValueChange={handleRatingFilterChange}>
          <SelectTrigger className="w-[180px]" data-testid="select-filter-rating">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filtruj ocenę" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie oceny</SelectItem>
            <SelectItem value="5">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>5 gwiazdek</span>
              </div>
            </SelectItem>
            <SelectItem value="4">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>4 gwiazdki</span>
              </div>
            </SelectItem>
            <SelectItem value="3">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>3 gwiazdki</span>
              </div>
            </SelectItem>
            <SelectItem value="2">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>2 gwiazdki</span>
              </div>
            </SelectItem>
            <SelectItem value="1">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>1 gwiazdka</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {feedbacks.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            Brak opinii z wybraną oceną. Spróbuj zmienić filtr.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2" data-testid="container-feedback-list">
          {feedbacks.map((feedback) => (
            <FeedbackCard key={feedback.id} feedback={feedback} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            data-testid="button-prev-page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground min-w-[100px] text-center">
            Strona {page} z {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            data-testid="button-next-page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
