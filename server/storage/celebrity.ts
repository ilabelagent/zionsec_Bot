
import { db } from "../db";
import { celebrityProfiles, fanFollows, fanStakes, fanBets, predictionMarkets, celebrityContent, type CelebrityProfile, type InsertCelebrityProfile, type FanFollow, type InsertFanFollow, type FanStake, type InsertFanStake, type FanBet, type InsertFanBet, type PredictionMarket, type InsertPredictionMarket, type CelebrityContent, type InsertCelebrityContent } from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";

// Celebrity Fan Platform (TWinn System)
export const getCelebrityProfile = async (id: string): Promise<CelebrityProfile | undefined> => {
  return await db.query.celebrityProfiles.findFirst({
    where: eq(celebrityProfiles.id, id),
  });
};

export const getCelebrityProfileByUserId = async (userId: string): Promise<CelebrityProfile | undefined> => {
  return await db.query.celebrityProfiles.findFirst({
    where: eq(celebrityProfiles.userId, userId),
  });
};

export const getAllCelebrityProfiles = async (status?: string): Promise<CelebrityProfile[]> => {
  if (status) {
    return await db.query.celebrityProfiles.findMany({
      where: eq(celebrityProfiles.status, status as any),
      orderBy: [desc(celebrityProfiles.createdAt)],
    });
  }
  return await db.query.celebrityProfiles.findMany({
    orderBy: [desc(celebrityProfiles.createdAt)],
  });
};

export const createCelebrityProfile = async (profile: InsertCelebrityProfile): Promise<CelebrityProfile> => {
  const [created] = await db.insert(celebrityProfiles).values(profile).returning();
  return created;
};

export const updateCelebrityProfile = async (id: string, updates: Partial<InsertCelebrityProfile>): Promise<boolean> => {
  const result = await db.update(celebrityProfiles)
    .set(updates)
    .where(eq(celebrityProfiles.id, id))
    .returning();
  return result.length > 0;
};

export const updateCelebrityFollowerCount = async (id: string, count: number): Promise<void> => {
  await db.update(celebrityProfiles).set({ followerCount: count }).where(eq(celebrityProfiles.id, id));
};

export const updateCelebrityTotalStaked = async (id: string, amount: string): Promise<void> => {
  await db.update(celebrityProfiles).set({ totalStaked: amount }).where(eq(celebrityProfiles.id, id));
};

export const getCelebrityFollows = async (celebrityId: string): Promise<FanFollow[]> => {
  return await db.query.fanFollows.findMany({
    where: eq(fanFollows.celebrityId, celebrityId),
  });
};

export const getUserFollows = async (fanId: string): Promise<FanFollow[]> => {
  return await db.query.fanFollows.findMany({
    where: eq(fanFollows.fanId, fanId),
  });
};

export const isFollowing = async (fanId: string, celebrityId: string): Promise<boolean> => {
  const follow = await db.query.fanFollows.findFirst({
    where: and(
      eq(fanFollows.fanId, fanId),
      eq(fanFollows.celebrityId, celebrityId)
    ),
  });
  return !!follow;
};

export const createFollow = async (follow: InsertFanFollow): Promise<FanFollow> => {
  const [created] = await db.insert(fanFollows).values(follow).returning();
  return created;
};

export const deleteFollow = async (fanId: string, celebrityId: string): Promise<boolean> => {
  const result = await db.delete(fanFollows).where(and(
    eq(fanFollows.fanId, fanId),
    eq(fanFollows.celebrityId, celebrityId)
  )).returning();
  return result.length > 0;
};

export const getCelebrityStakes = async (celebrityId: string): Promise<FanStake[]> => {
  return await db.query.fanStakes.findMany({
    where: eq(fanStakes.celebrityId, celebrityId),
  });
};

export const getUserStakes = async (fanId: string): Promise<FanStake[]> => {
  return await db.query.fanStakes.findMany({
    where: eq(fanStakes.fanId, fanId),
  });
};

export const createStake = async (stake: InsertFanStake): Promise<FanStake> => {
  const [created] = await db.insert(fanStakes).values(stake).returning();
  return created;
};

export const updateStakeStatus = async (id: string, status: string): Promise<void> => {
  await db.update(fanStakes).set({ status: status as any }).where(eq(fanStakes.id, id));
};

export const getCelebrityBets = async (celebrityId: string): Promise<FanBet[]> => {
  return await db.query.fanBets.findMany({
    where: eq(fanBets.celebrityId, celebrityId),
  });
};

export const getUserBets = async (fanId: string): Promise<FanBet[]> => {
  return await db.query.fanBets.findMany({
    where: eq(fanBets.fanId, fanId),
  });
};

export const createBet = async (bet: InsertFanBet): Promise<FanBet> => {
  const [created] = await db.insert(fanBets).values(bet).returning();
  return created;
};

export const updateBetStatus = async (id: string, status: string, payout?: string): Promise<void> => {
  await db.update(fanBets).set({ status: status as any, payout }).where(eq(fanBets.id, id));
};

export const getPredictionMarkets = async (celebrityId?: string): Promise<PredictionMarket[]> => {
  if (celebrityId) {
    return await db.query.predictionMarkets.findMany({
      where: eq(predictionMarkets.celebrityId, celebrityId),
      orderBy: [desc(predictionMarkets.createdAt)],
    });
  }
  return await db.query.predictionMarkets.findMany({
    orderBy: [desc(predictionMarkets.createdAt)],
  });
};

export const getPredictionMarket = async (id: string): Promise<PredictionMarket | undefined> => {
  return await db.query.predictionMarkets.findFirst({
    where: eq(predictionMarkets.id, id),
  });
};

export const createPredictionMarket = async (market: InsertPredictionMarket): Promise<PredictionMarket> => {
  const [created] = await db.insert(predictionMarkets).values(market).returning();
  return created;
};

export const updatePredictionMarket = async (id: string, updates: Partial<InsertPredictionMarket>): Promise<boolean> => {
  const result = await db.update(predictionMarkets)
    .set(updates)
    .where(eq(predictionMarkets.id, id))
    .returning();
  return result.length > 0;
};

export const getCelebrityContent = async (celebrityId: string): Promise<CelebrityContent[]> => {
  return await db.query.celebrityContent.findMany({
    where: eq(celebrityContent.celebrityId, celebrityId),
    orderBy: [desc(celebrityContent.createdAt)],
  });
};

export const getCelebrityContentItem = async (id: string): Promise<CelebrityContent | undefined> => {
  return await db.query.celebrityContent.findFirst({
    where: eq(celebrityContent.id, id),
  });
};

export const createCelebrityContent = async (content: InsertCelebrityContent): Promise<CelebrityContent> => {
  const [created] = await db.insert(celebrityContent).values(content).returning();
  return created;
};

export const updateContentViews = async (id: string): Promise<void> => {
  await db.update(celebrityContent).set({ views: sql`${celebrityContent.views} + 1` }).where(eq(celebrityContent.id, id));
};

export const updateContentLikes = async (id: string): Promise<void> => {
  await db.update(celebrityContent).set({ likes: sql`${celebrityContent.likes} + 1` }).where(eq(celebrityContent.id, id));
};
