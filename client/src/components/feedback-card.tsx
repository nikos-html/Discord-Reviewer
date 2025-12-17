import { formatDistanceToNow } from "date-fns";
import { pl } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { DiscordAvatar } from "@/components/discord-avatar";
import { Star } from "lucide-react";
import type { FeedbackWithUser } from "@shared/schema";

interface FeedbackCardProps {
  feedback: FeedbackWithUser;
}

export function FeedbackCard({ feedback }: FeedbackCardProps) {
  const timeAgo = formatDistanceToNow(new Date(feedback.createdAt), {
    addSuffix: false,
    locale: pl,
  });

  return (
    <Card 
      className="h-full bg-card/50 backdrop-blur-sm border-border/50 hover:border-border/80 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5" 
      data-testid={`card-feedback-${feedback.id}`}
    >
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <DiscordAvatar
            discordId={feedback.user.discordId}
            avatar={feedback.user.avatar}
            username={feedback.user.username}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span 
                className="font-semibold text-foreground truncate"
                data-testid={`text-feedback-username-${feedback.id}`}
              >
                {feedback.user.username}
              </span>
              {feedback.rating && (
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= feedback.rating!
                          ? "fill-amber-400 text-amber-400"
                          : "fill-transparent text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
            <span 
              className="text-xs text-muted-foreground"
              data-testid={`text-feedback-time-${feedback.id}`}
            >
              {timeAgo} temu
            </span>
            <p 
              className="mt-3 text-sm leading-relaxed text-foreground/80"
              data-testid={`text-feedback-content-${feedback.id}`}
            >
              {feedback.content}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
