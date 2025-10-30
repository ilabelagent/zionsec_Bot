
import { db } from "../db";
import { tradingSystemMemory, type TradingSystemMemory, type InsertTradingSystemMemory } from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";

// Trading System Memory
export const getTradingSystemMemory = async (botId: string): Promise<TradingSystemMemory[]> => {
  return await db.query.tradingSystemMemory.findMany({
    where: eq(tradingSystemMemory.botId, botId),
    orderBy: [desc(tradingSystemMemory.lastAccessed)],
  });
};

export const getTradingSystemMemoryByKey = async (botId: string, memoryType: string, memoryKey: string): Promise<TradingSystemMemory | undefined> => {
  const result = await db.query.tradingSystemMemory.findFirst({
    where: and(
      eq(tradingSystemMemory.botId, botId),
      eq(tradingSystemMemory.memoryType, memoryType),
      eq(tradingSystemMemory.memoryKey, memoryKey)
    ),
  });
  return result || undefined;
};

export const createTradingSystemMemory = async (memory: InsertTradingSystemMemory): Promise<TradingSystemMemory> => {
  const [created] = await db.insert(tradingSystemMemory).values(memory).returning();
  return created;
};

export const updateTradingSystemMemory = async (id: string, updates: Partial<InsertTradingSystemMemory>): Promise<boolean> => {
  const result = await db.update(tradingSystemMemory)
    .set({ ...updates, lastAccessed: new Date() })
    .where(eq(tradingSystemMemory.id, id))
    .returning();
  return result.length > 0;
};
