
import { db } from "../db";
import { charities, tithingConfigs, tithingHistory, type Charity, type InsertCharity, type TithingConfig, type InsertTithingConfig, type TithingHistory, type InsertTithingHistory } from "@shared/schema";
import { eq, desc, and, sql } from "drizzle-orm";

// Auto-Tithing System
export const getAllCharities = async (): Promise<Charity[]> => {
  return await db.query.charities.findMany();
};

export const getActiveCharities = async (): Promise<Charity[]> => {
  return await db.query.charities.findMany({
    where: eq(charities.isActive, true),
  });
};

export const getCharity = async (id: string): Promise<Charity | undefined> => {
  return await db.query.charities.findFirst({
    where: eq(charities.id, id),
  });
};

export const createCharity = async (charity: InsertCharity): Promise<Charity> => {
  const [created] = await db.insert(charities).values(charity).returning();
  return created;
};

export const updateCharity = async (id: string, updates: Partial<InsertCharity>): Promise<void> => {
  await db.update(charities).set(updates).where(eq(charities.id, id));
};

export const updateCharityTotals = async (id: string, amount: string): Promise<void> => {
  await db.update(charities).set({ totalReceived: sql`${charities.totalReceived} + ${amount}` }).where(eq(charities.id, id));
};

export const getTithingConfigByUserId = async (userId: string): Promise<TithingConfig | undefined> => {
  return await db.query.tithingConfigs.findFirst({
    where: eq(tithingConfigs.userId, userId),
  });
};

export const createTithingConfig = async (config: InsertTithingConfig): Promise<TithingConfig> => {
  const [created] = await db.insert(tithingConfigs).values(config).returning();
  return created;
};

export const updateTithingConfig = async (id: string, updates: Partial<InsertTithingConfig>): Promise<void> => {
  await db.update(tithingConfigs).set(updates).where(eq(tithingConfigs.id, id));
};

export const getTithingHistory = async (userId: string, filters?: { startDate?: Date; endDate?: Date; status?: string }): Promise<TithingHistory[]> => {
  const whereClauses = [eq(tithingHistory.userId, userId)];
  if (filters?.startDate) {
    whereClauses.push(sql`${tithingHistory.createdAt} >= ${filters.startDate}`);
  }
  if (filters?.endDate) {
    whereClauses.push(sql`${tithingHistory.createdAt} <= ${filters.endDate}`);
  }
  if (filters?.status) {
    whereClauses.push(eq(tithingHistory.status, filters.status as any));
  }

  return await db.query.tithingHistory.findMany({
    where: and(...whereClauses),
    orderBy: [desc(tithingHistory.createdAt)],
  });
};

export const getTithingHistoryItem = async (id: string): Promise<TithingHistory | undefined> => {
  return await db.query.tithingHistory.findFirst({
    where: eq(tithingHistory.id, id),
  });
};

export const createTithingHistory = async (history: InsertTithingHistory): Promise<TithingHistory> => {
  const [created] = await db.insert(tithingHistory).values(history).returning();
  return created;
};

export const updateTithingHistory = async (id: string, updates: Partial<InsertTithingHistory>): Promise<TithingHistory> => {
  const [updated] = await db.update(tithingHistory).set(updates).where(eq(tithingHistory.id, id)).returning();
  return updated;
};
