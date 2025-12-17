import { formatDistanceToNow } from "date-fns";
import { pl } from "date-fns/locale";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DiscordAvatar } from "@/components/discord-avatar";
import { StarRating } from "@/components/star-rating";
import type { FeedbackWithUser } from "@shared/schema";

interface FeedbackCardProps {
  feedback: FeedbackWithUser;
}

export function FeedbackCard({ feedback }: FeedbackCardProps) {
  const timeAgo = formatDistanceToNow(new Date(feedback.createdAt), {
    addSuffix: true,
    locale: pl,
  });

  return (
    <Card 
      className="h-full" 
      data-testid={`card-feedback-${feedback.id}`}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-3">
        <div className="flex items-center gap-3">
          <DiscordAvatar
            discordId={feedback.user.discordId}
            avatar={feedback.user.avatar}
            username={feedback.user.username}
            size="md"
          />
          <div className="flex flex-col">
            <span 
              className="font-medium text-sm"
              data-testid={`text-feedback-username-${feedback.id}`}
            >
              {feedback.user.username}
            </span>
            <span 
              className="text-xs text-muted-foreground"
              data-testid={`text-feedback-time-${feedback.id}`}
            >
              {timeAgo}
            </span>
          </div>
        </div>
        {feedback.rating && (
          <div className="flex-shrink-0">
            <StarRating rating={feedback.rating} readonly size="sm" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <p 
          className="text-sm leading-relaxed text-foreground/90"
          data-testid={`text-feedback-content-${feedback.id}`}
        >
          {feedback.content}
        </p>
      </CardContent>
    </Card>
  );
}
