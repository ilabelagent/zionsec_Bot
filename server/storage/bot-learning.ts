
import { db } from "../db";
import { botLearningSession, botTrainingData, botSkills, type BotLearningSession, type InsertBotLearningSession, type BotTrainingData, type InsertBotTrainingData, type BotSkill, type InsertBotSkill } from "@shared/schema";
import { eq, desc, asc } from "drizzle-orm";

// Bot Learning
export const getBotLearningSessions = async (botId: string): Promise<BotLearningSession[]> => {
  return await db.query.botLearningSession.findMany({
    where: eq(botLearningSession.botId, botId),
    orderBy: [desc(botLearningSession.startedAt)],
  });
};

export const createBotLearningSession = async (session: InsertBotLearningSession): Promise<BotLearningSession> => {
  const [created] = await db.insert(botLearningSession).values(session).returning();
  return created;
};

export const updateBotLearningSession = async (id: string, updates: Partial<InsertBotLearningSession>): Promise<boolean> => {
  const result = await db.update(botLearningSession)
    .set(updates)
    .where(eq(botLearningSession.id, id))
    .returning();
  return result.length > 0;
};

export const createBotTrainingData = async (data: InsertBotTrainingData): Promise<BotTrainingData> => {
  const [created] = await db.insert(botTrainingData).values(data).returning();
  return created;
};

export const getBotTrainingData = async (botId: string): Promise<BotTrainingData[]> => {
  return await db.query.botTrainingData.findMany({
    where: eq(botTrainingData.botId, botId),
    orderBy: [asc(botTrainingData.createdAt)],
  });
};

// Bot Skills
export const getBotSkills = async (botId: string): Promise<BotSkill[]> => {
  return await db.query.botSkills.findMany({
    where: eq(botSkills.botId, botId),
    orderBy: [asc(botSkills.unlockedAt)],
  });
};

export const createBotSkill = async (skill: InsertBotSkill): Promise<BotSkill> => {
  const [created] = await db.insert(botSkills).values(skill).returning();
  return created;
};

export const updateBotSkill = async (id: string, updates: Partial<InsertBotSkill>): Promise<boolean> => {
  const result = await db.update(botSkills)
    .set(updates)
    .where(eq(botSkills.id, id))
    .returning();
  return result.length > 0;
};
