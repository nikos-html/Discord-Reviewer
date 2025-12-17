import { Link } from "wouter";
import { LogOut, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { DiscordAvatar } from "@/components/discord-avatar";
import { Badge } from "@/components/ui/badge";
import type { User } from "@shared/schema";

interface HeaderProps {
  user?: User | null;
}

export function Header({ user }: HeaderProps) {
  const handleLogout = () => {
    window.location.href = "/api/auth/logout";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-discord" />
          <span className="text-lg font-semibold" data-testid="text-app-title">
            Opinie Discord
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          {user && (
            <>
              <div className="hidden sm:flex items-center gap-2 px-3">
                <DiscordAvatar
                  discordId={user.discordId}
                  avatar={user.avatar}
                  username={user.username}
                  size="sm"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium" data-testid="text-username">
                    {user.username}
                  </span>
                  {user.hasClientRole && (
                    <Badge variant="secondary" className="text-xs">
                      Client
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Wyloguj</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
