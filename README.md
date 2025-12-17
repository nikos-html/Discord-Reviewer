# Opinie Discord - System Feedback

Aplikacja webowa do zbierania opinii od użytkowników Discord z autoryzacją OAuth2 i weryfikacją roli "Client".

## Funkcje

- Autoryzacja użytkowników przez Discord OAuth2
- Weryfikacja roli "Client" na określonym serwerze Discord
- Formularz do dodawania opinii (tekst + opcjonalna ocena 1-5 gwiazdek)
- Publiczna lista opinii (dostępna dla wszystkich)
- Tryb jasny/ciemny
- Responsywny design

## Konfiguracja Discord OAuth2

### 1. Utwórz aplikację Discord

1. Przejdź do [Discord Developer Portal](https://discord.com/developers/applications)
2. Kliknij "New Application" i nadaj nazwę
3. Przejdź do zakładki **OAuth2**

### 2. Skonfiguruj Redirect URI

**WAŻNE:** Musisz dodać Redirect URI dla każdego środowiska:

#### Dla Replit:
```
https://TWOJA-NAZWA-PROJEKTU.repl.co/api/auth/discord/callback
```

#### Dla Railway:
```
https://TWOJA-DOMENA.up.railway.app/api/auth/discord/callback
```

#### Dla localhost (development):
```
http://localhost:5000/api/auth/discord/callback
```

W Discord Developer Portal → OAuth2 → Redirects:
- Kliknij "Add Redirect"
- Wklej odpowiedni URL
- Zapisz zmiany

### 3. Pobierz dane konfiguracyjne

#### Discord Client ID & Secret
- W Discord Developer Portal → OAuth2
- **Client ID**: Skopiuj widoczny ID
- **Client Secret**: Kliknij "Reset Secret" i skopiuj

#### Discord Guild ID (ID serwera)
1. Włącz tryb deweloperski w Discord:
   - Ustawienia użytkownika → Zaawansowane → Tryb deweloperski
2. Kliknij prawym przyciskiem na serwer → "Kopiuj ID serwera"

#### Discord Role ID (ID roli "Client")
1. Ustawienia serwera → Role
2. Kliknij prawym przyciskiem na rolę "Client" → "Kopiuj ID roli"

### 4. Ustaw zmienne środowiskowe

```env
DISCORD_CLIENT_ID=twoj_client_id
DISCORD_CLIENT_SECRET=twoj_client_secret
DISCORD_GUILD_ID=id_twojego_serwera
DISCORD_ROLE_ID=id_roli_client
SESSION_SECRET=losowy_sekret_sesji
DATABASE_URL=postgresql://...
```

## Wdrożenie na Railway

### 1. Utwórz projekt na Railway

1. Przejdź do [Railway](https://railway.app)
2. Utwórz nowy projekt
3. Podłącz repozytorium GitHub lub wgraj kod

### 2. Dodaj bazę danych PostgreSQL

1. W projekcie Railway kliknij "New" → "Database" → "PostgreSQL"
2. Railway automatycznie doda zmienną `DATABASE_URL`

### 3. Skonfiguruj zmienne środowiskowe

W ustawieniach projektu Railway → Variables, dodaj:

```
DISCORD_CLIENT_ID=...
DISCORD_CLIENT_SECRET=...
DISCORD_GUILD_ID=...
DISCORD_ROLE_ID=...
SESSION_SECRET=...
NODE_ENV=production
```

### 4. Ustaw domenę

1. W ustawieniach projektu → Settings → Domains
2. Wygeneruj domenę Railway lub podłącz własną
3. **Pamiętaj:** Dodaj tę domenę jako Redirect URI w Discord Developer Portal!

### 5. Deploy

Railway automatycznie zbuduje i wdroży aplikację.

## Uruchomienie lokalne

```bash
# Zainstaluj zależności
npm install

# Ustaw zmienne środowiskowe (utwórz plik .env)

# Uruchom migracje bazy danych
npm run db:push

# Uruchom w trybie development
npm run dev

# Lub zbuduj i uruchom w trybie production
npm run build
npm run start
```

## Technologie

- **Frontend:** React, Tailwind CSS, Shadcn UI
- **Backend:** Node.js, Express
- **Baza danych:** PostgreSQL + Drizzle ORM
- **Autoryzacja:** Discord OAuth2
- **Sesje:** express-session + connect-pg-simple

## Rozwiązywanie problemów

### "Invalid OAuth2 redirect_uri"
- Upewnij się, że Redirect URI w Discord Developer Portal dokładnie odpowiada URL twojej aplikacji
- Sprawdź, czy nie ma literówek i czy protokół (http/https) się zgadza

### "Brak dostępu" po zalogowaniu
- Sprawdź, czy masz rolę "Client" na serwerze Discord
- Upewnij się, że DISCORD_ROLE_ID jest poprawne

### Błędy bazy danych
- Upewnij się, że DATABASE_URL jest poprawne
- Uruchom `npm run db:push` aby zsynchronizować schemat
