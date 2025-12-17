import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, LogIn, AlertCircle, X } from "lucide-react";
import { SiDiscord } from "react-icons/si";
import { Header } from "@/components/header";
import { FeedbackForm } from "@/components/feedback-form";
import { FeedbackList } from "@/components/feedback-list";
import { FeedbackStatsCard } from "@/components/feedback-stats";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { User } from "@shared/schema";

interface AuthResponse {
  authenticated: boolean;
  user?: User;
}

function LoginPrompt() {
  const handleLogin = () => {
    window.location.href = "/api/auth/discord";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Chcesz dodać opinię?</CardTitle>
        <CardDescription>
          Zaloguj się przez Discord, aby podzielić się swoją opinią
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleLogin}
          className="w-full bg-discord hover:bg-discord/90 text-discord-foreground"
          data-testid="button-login-prompt"
        >
          <SiDiscord className="h-4 w-4 mr-2" />
          Zaloguj przez Discord
        </Button>
      </CardContent>
    </Card>
  );
}

function AccessDeniedPrompt({ user }: { user: User }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Brak uprawnień</CardTitle>
        <CardDescription>
          Aby dodawać opinie, potrzebujesz roli "Client" na serwerze Discord
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Zalogowano jako:</span>
          <Badge variant="secondary">{user.username}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Skontaktuj się z administracją serwera, aby uzyskać dostęp.
        </p>
      </CardContent>
    </Card>
  );
}

function getErrorMessage(error: string | null): string | null {
  if (!error) return null;
  
  const errorMessages: Record<string, string> = {
    "access_denied": "Anulowano logowanie przez Discord.",
    "no_code": "Nie otrzymano kodu autoryzacji od Discord.",
    "auth_failed": "Błąd autoryzacji Discord. Sprawdź konfigurację aplikacji.",
    "invalid_request": "Nieprawidłowe żądanie OAuth. Sprawdź Redirect URI w Discord Developer Portal.",
  };
  
  return errorMessages[error] || `Błąd: ${error}`;
}

export default function HomePage() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    if (error) {
      setErrorMessage(getErrorMessage(error));
      window.history.replaceState({}, "", "/");
    }
  }, []);

  const { data, isLoading } = useQuery<AuthResponse>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-discord" />
          <span className="text-muted-foreground">Ładowanie...</span>
        </div>
      </div>
    );
  }

  const isAuthenticated = data?.authenticated && data?.user;
  const hasClientRole = data?.user?.hasClientRole;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {isAuthenticated ? (
        <Header user={data.user} />
      ) : (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold" data-testid="text-app-title">
                Opinie Discord
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = "/api/auth/discord"}
                data-testid="button-header-login"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Zaloguj się
              </Button>
            </div>
          </div>
        </header>
      )}
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Błąd logowania</AlertTitle>
              <AlertDescription className="flex items-center justify-between">
                <span>{errorMessage}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setErrorMessage(null)}
                  className="h-6 w-6"
                >
                  <X className="h-4 w-4" />
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <h1 
              className="text-2xl font-bold tracking-tight"
              data-testid="text-page-title"
            >
              {isAuthenticated ? `Witaj, ${data.user!.username}!` : "Opinie użytkowników"}
            </h1>
            <p className="text-muted-foreground">
              {isAuthenticated 
                ? "Podziel się swoją opinią i zobacz, co myślą inni użytkownicy."
                : "Zobacz, co myślą nasi klienci. Zaloguj się przez Discord, aby dodać swoją opinię."
              }
            </p>
          </div>

          <FeedbackStatsCard />

          <div className="grid gap-8 lg:grid-cols-5">
            <div className="lg:col-span-2 lg:order-2 space-y-6">
              {!isAuthenticated && <LoginPrompt />}
              {isAuthenticated && !hasClientRole && <AccessDeniedPrompt user={data.user!} />}
              {isAuthenticated && hasClientRole && <FeedbackForm />}
            </div>
            <div className="lg:col-span-3 lg:order-1">
              <FeedbackList />
            </div>
          </div>
        </div>
      </main>

      <footer className="py-6 border-t">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          Opinie Discord v1.0
        </div>
      </footer>
    </div>
  );
}
