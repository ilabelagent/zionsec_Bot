
import { db } from "../db";
import { tradingBots, botExecutions, botSkills, botLearningSession, users, type TradingBot, type InsertTradingBot, type BotExecution, type InsertBotExecution } from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";

// Trading Bots
export const getBot = async (id: string): Promise<TradingBot | undefined> => {
  const [bot] = await db.select().from(tradingBots).where(eq(tradingBots.id, id));
  return bot || undefined;
};

export const getUserBots = async (userId: string): Promise<TradingBot[]> => {
  return db.select().from(tradingBots).where(eq(tradingBots.userId, userId)).orderBy(desc(tradingBots.createdAt));
};

export const getAllBots = async (limit: number = 50, offset: number = 0): Promise<any[]> => {
  const botsWithStats = await db
    .select({
      bot: tradingBots,
      user: users,
      skillsCount: sql<number>`(SELECT COUNT(*) FROM ${botSkills} WHERE ${botSkills.botId} = ${tradingBots.id})`,
      sessionsCount: sql<number>`(SELECT COUNT(*) FROM ${botLearningSession} WHERE ${botLearningSession.botId} = ${tradingBots.id})`,
      avgSkillLevel: sql<number>`(SELECT AVG(${botSkills.skillLevel}) FROM ${botSkills} WHERE ${botSkills.botId} = ${tradingBots.id})`,
    })
    .from(tradingBots)
    .leftJoin(users, eq(tradingBots.userId, users.id))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(tradingBots.createdAt));
  
  return botsWithStats.map(row => ({
    ...row.bot,
    user: row.user,
    skillsCount: row.skillsCount || 0,
    sessionsCount: row.sessionsCount || 0,
    avgSkillLevel: row.avgSkillLevel || 0,
  }));
};

export const getTotalBotsCount = async (): Promise<number> => {
  const result = await db.select({ count: sql<number>`count(*)` }).from(tradingBots);
  return result[0]?.count || 0;
};

export const createBot = async (insertBot: InsertTradingBot): Promise<TradingBot> => {
  const [bot] = await db.insert(tradingBots).values(insertBot).returning();
  return bot;
};

export const updateBot = async (id: string, updates: Partial<TradingBot>): Promise<void> => {
  await db.update(tradingBots).set({ ...updates, updatedAt: new Date() }).where(eq(tradingBots.id, id));
};

export const deleteBot = async (id: string): Promise<void> => {
  await db.delete(tradingBots).where(eq(tradingBots.id, id));
};

// Bot Executions
export const getBotExecution = async (id: string): Promise<BotExecution | undefined> => {
  const [execution] = await db.select().from(botExecutions).where(eq(botExecutions.id, id));
  return execution || undefined;
};

export const getBotExecutions = async (botId: string): Promise<BotExecution[]> => {
  return db.select().from(botExecutions).where(eq(botExecutions.botId, botId)).orderBy(desc(botExecutions.startedAt));
};

export const createBotExecution = async (insertExecution: InsertBotExecution): Promise<BotExecution> => {
  const [execution] = await db.insert(botExecutions).values(insertExecution).returning();
  return execution;
};

export const updateBotExecutionStatus = async (id: string, status: string): Promise<void> => {
  const updates: any = { status };
  if (status === "completed" || status === "failed" || status === "cancelled") {
    updates.completedAt = new Date();
  }
  await db.update(botExecutions).set(updates).where(eq(botExecutions.id, id));
};
