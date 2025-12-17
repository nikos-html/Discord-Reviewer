import { users, feedbacks, type User, type InsertUser, type Feedback, type InsertFeedback, type FeedbackWithUser, type FeedbackStats } from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, sql, count } from "drizzle-orm";

export type SortBy = "date" | "rating";
export type SortOrder = "asc" | "desc";

export interface GetFeedbacksOptions {
  sortBy?: SortBy;
  sortOrder?: SortOrder;
  ratingFilter?: number;
  page?: number;
  limit?: number;
}

export interface PaginatedFeedbacks {
  feedbacks: FeedbackWithUser[];
  total: number;
  page: number;
  totalPages: number;
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByDiscordId(discordId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined>;
  
  getFeedbacks(options?: GetFeedbacksOptions): Promise<PaginatedFeedbacks>;
  getFeedback(id: string): Promise<FeedbackWithUser | undefined>;
  getFeedbacksByUserId(userId: string): Promise<Feedback[]>;
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  updateFeedback(id: string, data: { content: string; rating?: number | null }): Promise<Feedback | undefined>;
  deleteFeedback(id: string): Promise<boolean>;
  getFeedbackStats(): Promise<FeedbackStats>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByDiscordId(discordId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.discordId, discordId));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getFeedbacks(options: GetFeedbacksOptions = {}): Promise<PaginatedFeedbacks> {
    const { sortBy = "date", sortOrder = "desc", ratingFilter, page = 1, limit = 10 } = options;
    
    let orderByClause;
    if (sortBy === "rating") {
      orderByClause = sortOrder === "asc" ? asc(feedbacks.rating) : desc(feedbacks.rating);
    } else {
      orderByClause = sortOrder === "asc" ? asc(feedbacks.createdAt) : desc(feedbacks.createdAt);
    }

    const baseQuery = db
      .select()
      .from(feedbacks)
      .leftJoin(users, eq(feedbacks.userId, users.id));

    let countQuery;
    if (ratingFilter !== undefined) {
      countQuery = db.select({ count: count() }).from(feedbacks).where(eq(feedbacks.rating, ratingFilter));
    } else {
      countQuery = db.select({ count: count() }).from(feedbacks);
    }
    
    const [countResult] = await countQuery;
    const total = Number(countResult.count);
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    let dataQuery;
    if (ratingFilter !== undefined) {
      dataQuery = baseQuery
        .where(eq(feedbacks.rating, ratingFilter))
        .orderBy(orderByClause)
        .limit(limit)
        .offset(offset);
    } else {
      dataQuery = baseQuery
        .orderBy(orderByClause)
        .limit(limit)
        .offset(offset);
    }

    const result = await dataQuery;
    
    const feedbacksWithUser = result
      .filter((row) => row.users !== null)
      .map((row) => ({
        ...row.feedbacks,
        user: row.users!,
      }));

    return {
      feedbacks: feedbacksWithUser,
      total,
      page,
      totalPages,
    };
  }

  async getFeedback(id: string): Promise<FeedbackWithUser | undefined> {
    const result = await db
      .select()
      .from(feedbacks)
      .leftJoin(users, eq(feedbacks.userId, users.id))
      .where(eq(feedbacks.id, id));
    
    if (result.length === 0 || !result[0].users) return undefined;
    
    return {
      ...result[0].feedbacks,
      user: result[0].users,
    };
  }

  async getFeedbacksByUserId(userId: string): Promise<Feedback[]> {
    return db
      .select()
      .from(feedbacks)
      .where(eq(feedbacks.userId, userId))
      .orderBy(desc(feedbacks.createdAt));
  }

  async createFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    const [feedback] = await db
      .insert(feedbacks)
      .values(insertFeedback)
      .returning();
    return feedback;
  }

  async updateFeedback(id: string, data: { content: string; rating?: number | null }): Promise<Feedback | undefined> {
    const [feedback] = await db
      .update(feedbacks)
      .set({ 
        content: data.content, 
        rating: data.rating,
        updatedAt: new Date() 
      })
      .where(eq(feedbacks.id, id))
      .returning();
    return feedback || undefined;
  }

  async deleteFeedback(id: string): Promise<boolean> {
    const result = await db
      .delete(feedbacks)
      .where(eq(feedbacks.id, id))
      .returning();
    return result.length > 0;
  }

  async getFeedbackStats(): Promise<FeedbackStats> {
    const [totalResult] = await db.select({ count: count() }).from(feedbacks);
    const totalCount = Number(totalResult.count);

    const avgResult = await db
      .select({ avg: sql<number>`AVG(${feedbacks.rating})::float` })
      .from(feedbacks)
      .where(sql`${feedbacks.rating} IS NOT NULL`);
    const averageRating = avgResult[0]?.avg || null;

    const distributionResult = await db
      .select({ 
        rating: feedbacks.rating,
        count: count()
      })
      .from(feedbacks)
      .where(sql`${feedbacks.rating} IS NOT NULL`)
      .groupBy(feedbacks.rating)
      .orderBy(feedbacks.rating);

    const ratingDistribution = distributionResult.map(row => ({
      rating: row.rating!,
      count: Number(row.count)
    }));

    return {
      totalCount,
      averageRating: averageRating ? Math.round(averageRating * 10) / 10 : null,
      ratingDistribution
    };
  }
}

export const storage = new DatabaseStorage();
