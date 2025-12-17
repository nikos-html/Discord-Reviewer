import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import MemoryStore from "memorystore";
import { storage } from "./storage";
import { feedbackFormSchema } from "@shared/schema";
import {
  getDiscordAuthUrl,
  exchangeCodeForToken,
  getDiscordUser,
  getGuildMember,
  hasRequiredRole,
} from "./discord";

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

function getBaseUrl(req: Request): string {
  const protocol = req.headers["x-forwarded-proto"] || req.protocol;
  const host = req.headers["x-forwarded-host"] || req.get("host");
  return `${protocol}://${host}`;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const SessionStore = MemoryStore(session);

  app.use(
    session({
      store: new SessionStore({
        checkPeriod: 86400000,
      }),
      secret: process.env.SESSION_SECRET || "discord-feedback-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: "lax",
      },
    })
  );

  app.get("/api/config/redirect-uri", (req: Request, res: Response) => {
    const baseUrl = getBaseUrl(req);
    const redirectUri = `${baseUrl}/api/auth/discord/callback`;
    res.json({ 
      redirectUri,
      message: "Dodaj ten URL jako Redirect URI w Discord Developer Portal → OAuth2 → Redirects"
    });
  });

  app.get("/api/auth/discord", (req: Request, res: Response) => {
    const baseUrl = getBaseUrl(req);
    const redirectUri = `${baseUrl}/api/auth/discord/callback`;
    console.log("Starting Discord OAuth with redirect URI:", redirectUri);
    const authUrl = getDiscordAuthUrl(redirectUri);
    res.redirect(authUrl);
  });

  app.get("/api/auth/discord/callback", async (req: Request, res: Response) => {
    const { code, error: discordError, error_description } = req.query;

    if (discordError) {
      console.error("Discord OAuth error:", discordError, error_description);
      return res.redirect(`/?error=${discordError}`);
    }

    if (!code || typeof code !== "string") {
      return res.redirect("/?error=no_code");
    }

    try {
      const baseUrl = getBaseUrl(req);
      const redirectUri = `${baseUrl}/api/auth/discord/callback`;
      console.log("Discord callback - redirect URI:", redirectUri);

      const tokenData = await exchangeCodeForToken(code, redirectUri);
      const discordUser = await getDiscordUser(tokenData.access_token);

      const guildId = process.env.DISCORD_GUILD_ID!;
      const roleId = process.env.DISCORD_ROLE_ID!;

      const member = await getGuildMember(tokenData.access_token, guildId);
      const hasRole = hasRequiredRole(member, roleId);

      let user = await storage.getUserByDiscordId(discordUser.id);

      if (user) {
        user = await storage.updateUser(user.id, {
          username: discordUser.global_name || discordUser.username,
          discriminator: discordUser.discriminator,
          avatar: discordUser.avatar,
          hasClientRole: hasRole,
        });
      } else {
        user = await storage.createUser({
          id: discordUser.id,
          discordId: discordUser.id,
          username: discordUser.global_name || discordUser.username,
          discriminator: discordUser.discriminator,
          avatar: discordUser.avatar,
          hasClientRole: hasRole,
        });
      }

      req.session.userId = user!.id;
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err.message, err.stack);
          return res.redirect("/?error=session_error");
        }
        console.log("Session saved successfully for user:", user!.id);
        res.redirect("/");
      });
    } catch (error) {
      console.error("Discord OAuth error:", error);
      res.redirect("/?error=auth_failed");
    }
  });

  app.get("/api/auth/me", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.json({ authenticated: false });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      req.session.destroy(() => {});
      return res.json({ authenticated: false });
    }

    res.json({ authenticated: true, user });
  });

  app.get("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy(() => {
      res.redirect("/");
    });
  });

  app.get("/api/feedbacks", async (req: Request, res: Response) => {
    try {
      const { sortBy, sortOrder, rating, page, limit } = req.query;
      
      const options = {
        sortBy: sortBy as "date" | "rating" | undefined,
        sortOrder: sortOrder as "asc" | "desc" | undefined,
        ratingFilter: rating ? parseInt(rating as string) : undefined,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
      };
      
      const result = await storage.getFeedbacks(options);
      res.json(result);
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
      res.status(500).json({ message: "Failed to fetch feedbacks" });
    }
  });

  app.get("/api/feedbacks/stats", async (_req: Request, res: Response) => {
    try {
      const stats = await storage.getFeedbackStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching feedback stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.post("/api/feedbacks", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user || !user.hasClientRole) {
      return res.status(403).json({ message: "Forbidden - requires Client role" });
    }

    const parseResult = feedbackFormSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ 
        message: "Invalid feedback data",
        errors: parseResult.error.errors 
      });
    }

    try {
      const feedback = await storage.createFeedback({
        userId: user.id,
        content: parseResult.data.content,
        rating: parseResult.data.rating || null,
      });
      res.status(201).json(feedback);
    } catch (error) {
      console.error("Error creating feedback:", error);
      res.status(500).json({ message: "Failed to create feedback" });
    }
  });

  app.patch("/api/feedbacks/:id", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;
    const feedback = await storage.getFeedback(id);
    
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (feedback.userId !== user.id && !user.isAdmin) {
      return res.status(403).json({ message: "Cannot edit other users' feedback" });
    }

    const parseResult = feedbackFormSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ 
        message: "Invalid feedback data",
        errors: parseResult.error.errors 
      });
    }

    try {
      const updated = await storage.updateFeedback(id, {
        content: parseResult.data.content,
        rating: parseResult.data.rating || null,
      });
      res.json(updated);
    } catch (error) {
      console.error("Error updating feedback:", error);
      res.status(500).json({ message: "Failed to update feedback" });
    }
  });

  app.delete("/api/feedbacks/:id", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;
    const feedback = await storage.getFeedback(id);
    
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (feedback.userId !== user.id && !user.isAdmin) {
      return res.status(403).json({ message: "Cannot delete other users' feedback" });
    }

    try {
      await storage.deleteFeedback(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting feedback:", error);
      res.status(500).json({ message: "Failed to delete feedback" });
    }
  });

  return httpServer;
}
