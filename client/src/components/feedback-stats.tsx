import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Star, MessageSquare, TrendingUp } from "lucide-react";
import type { FeedbackStats } from "@shared/schema";

export function FeedbackStatsCard() {
  const { data: stats, isLoading } = useQuery<FeedbackStats>({
    queryKey: ["/api/feedbacks/stats"],
  });

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/2"></div>
            <div className="h-6 bg-muted rounded w-1/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const averageRating = stats?.averageRating ?? 0;
  const totalCount = stats?.totalCount ?? 0;

  return (
    <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <CardContent className="p-6 relative">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Statystyki opinii</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Liczba opinii</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{totalCount}</p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
              <span className="text-sm text-muted-foreground">Średnia ocena</span>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold text-foreground">
                {averageRating > 0 ? averageRating.toFixed(1) : "-"}
              </p>
              {averageRating > 0 && (
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-3 w-3 ${
                        star <= Math.round(averageRating)
                          ? "fill-amber-400 text-amber-400"
                          : "fill-transparent text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}