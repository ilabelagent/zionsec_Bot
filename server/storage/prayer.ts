
import { db } from "../db";
import { prayers, scriptures, prayerTradeCorrelations, userPrayerSettings, type Prayer, type InsertPrayer, type Scripture, type InsertScripture, type PrayerTradeCorrelation, type InsertPrayerTradeCorrelation, type UserPrayerSettings, type InsertUserPrayerSettings } from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";

// Prayer Integration System
export const createPrayer = async (prayer: InsertPrayer): Promise<Prayer> => {
  const [created] = await db.insert(prayers).values(prayer).returning();
  return created;
};

export const getUserPrayers = async (userId: string, limit?: number): Promise<Prayer[]> => {
  return await db.query.prayers.findMany({
    where: eq(prayers.userId, userId),
    orderBy: [desc(prayers.createdAt)],
    limit,
  });
};

export const getPrayer = async (id: string): Promise<Prayer | undefined> => {
  return await db.query.prayers.findFirst({
    where: eq(prayers.id, id),
  });
};

export const createScripture = async (scripture: InsertScripture): Promise<Scripture> => {
  const [created] = await db.insert(scriptures).values(scripture).returning();
  return created;
};

export const getAllScriptures = async (): Promise<Scripture[]> => {
  return await db.query.scriptures.findMany();
};

export const getScripturesByCategory = async (category?: string): Promise<Scripture[]> => {
  if (category) {
    return await db.query.scriptures.findMany({
      where: eq(scriptures.category, category as any),
    });
  }
  return await db.query.scriptures.findMany();
};

export const getScripturesCount = async (): Promise<number> => {
  const result = await db.select({ count: sql<number>`count(*)` }).from(scriptures);
  return result[0]?.count || 0;
};

export const createPrayerTradeCorrelation = async (correlation: InsertPrayerTradeCorrelation): Promise<PrayerTradeCorrelation> => {
  const [created] = await db.insert(prayerTradeCorrelations).values(correlation).returning();
  return created;
};

export const getUserPrayerCorrelations = async (userId: string): Promise<PrayerTradeCorrelation[]> => {
  return await db.query.prayerTradeCorrelations.findMany({
    where: eq(prayerTradeCorrelations.userId, userId),
  });
};

export const getPrayerCorrelation = async (id: string): Promise<PrayerTradeCorrelation | undefined> => {
  return await db.query.prayerTradeCorrelations.findFirst({
    where: eq(prayerTradeCorrelations.id, id),
  });
};

export const getUserPrayerSettings = async (userId: string): Promise<UserPrayerSettings | undefined> => {
  return await db.query.userPrayerSettings.findFirst({
    where: eq(userPrayerSettings.userId, userId),
  });
};

export const upsertUserPrayerSettings = async (settings: InsertUserPrayerSettings): Promise<UserPrayerSettings> => {
  const [result] = await db.insert(userPrayerSettings)
    .values(settings)
    .onConflictDoUpdate({
      target: userPrayerSettings.userId,
      set: settings,
    })
    .returning();
  return result;
};

export const updateUserPrayerSettings = async (userId: string, updates: Partial<InsertUserPrayerSettings>): Promise<void> => {
  await db.update(userPrayerSettings).set(updates).where(eq(userPrayerSettings.userId, userId));
};
