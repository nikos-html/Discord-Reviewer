import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

export function StarRating({
  rating,
  onRatingChange,
  readonly = false,
  size = "md",
}: StarRatingProps) {
  const sizeClasses = {
    sm: "h-5 w-5",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  const handleClick = (value: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(value === rating ? 0 : value);
    }
  };

  return (
    <div className="flex items-center gap-1" role="group" aria-label="Ocena">
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => handleClick(value)}
          disabled={readonly}
          className={cn(
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm transition-transform",
            !readonly && "cursor-pointer hover:scale-110 active:scale-95",
            readonly && "cursor-default"
          )}
          aria-label={`${value} gwiazdek`}
          data-testid={`star-${value}`}
        >
          <Star
            className={cn(
              sizeClasses[size],
              "transition-colors",
              value <= rating
                ? "fill-star-filled text-star-filled"
                : "fill-transparent text-star-empty dark:text-muted-foreground"
            )}
          />
        </button>
      ))}
    </div>
  );
}
