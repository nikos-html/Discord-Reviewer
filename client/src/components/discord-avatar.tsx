import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface DiscordAvatarProps {
  discordId: string;
  avatar: string | null;
  username: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function DiscordAvatar({
  discordId,
  avatar,
  username,
  size = "md",
  className,
}: DiscordAvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  const avatarUrl = avatar
    ? `https://cdn.discordapp.com/avatars/${discordId}/${avatar}.png?size=128`
    : null;

  const initials = username.slice(0, 2).toUpperCase();

  return (
    <Avatar className={cn(sizeClasses[size], "border border-border", className)}>
      {avatarUrl && <AvatarImage src={avatarUrl} alt={username} />}
      <AvatarFallback className="bg-discord text-discord-foreground text-sm font-medium">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
