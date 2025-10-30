
import { db } from "../db";
import { spectrumPlans, userSpectrumSubscriptions, spectrumEarnings, type SpectrumPlan, type InsertSpectrumPlan, type UserSpectrumSubscription, type InsertUserSpectrumSubscription, type SpectrumEarning, type InsertSpectrumEarning } from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";

// Spectrum Investment Plans
export const getAllSpectrumPlans = async (): Promise<SpectrumPlan[]> => {
  return await db.query.spectrumPlans.findMany();
};

export const getSpectrumPlan = async (id: string): Promise<SpectrumPlan | undefined> => {
  return await db.query.spectrumPlans.findFirst({
    where: eq(spectrumPlans.id, id),
  });
};

export const getSpectrumPlanByTier = async (tier: string): Promise<SpectrumPlan | undefined> => {
  return await db.query.spectrumPlans.findFirst({
    where: eq(spectrumPlans.tier, tier as any),
  });
};

export const createSpectrumPlan = async (plan: InsertSpectrumPlan): Promise<SpectrumPlan> => {
  const [created] = await db.insert(spectrumPlans).values(plan).returning();
  return created;
};

export const updateSpectrumPlan = async (id: string, updates: Partial<InsertSpectrumPlan>): Promise<void> => {
  await db.update(spectrumPlans).set(updates).where(eq(spectrumPlans.id, id));
};

export const getUserSpectrumSubscription = async (userId: string): Promise<UserSpectrumSubscription | undefined> => {
  return await db.query.userSpectrumSubscriptions.findFirst({
    where: eq(userSpectrumSubscriptions.userId, userId),
  });
};

export const getUserSpectrumSubscriptionById = async (id: string): Promise<UserSpectrumSubscription | undefined> => {
  return await db.query.userSpectrumSubscriptions.findFirst({
    where: eq(userSpectrumSubscriptions.id, id),
  });
};

export const createSpectrumSubscription = async (subscription: InsertUserSpectrumSubscription): Promise<UserSpectrumSubscription> => {
  const [created] = await db.insert(userSpectrumSubscriptions).values(subscription).returning();
  return created;
};

export const updateSpectrumSubscription = async (id: string, updates: Partial<InsertUserSpectrumSubscription>): Promise<void> => {
  await db.update(userSpectrumSubscriptions).set(updates).where(eq(userSpectrumSubscriptions.id, id));
};

export const cancelSpectrumSubscription = async (id: string): Promise<void> => {
  await db.update(userSpectrumSubscriptions).set({ status: "cancelled" }).where(eq(userSpectrumSubscriptions.id, id));
};

export const getSpectrumEarnings = async (userId: string): Promise<SpectrumEarning[]> => {
  return await db.query.spectrumEarnings.findMany({
    where: eq(spectrumEarnings.userId, userId),
    orderBy: [desc(spectrumEarnings.createdAt)],
  });
};

export const getSpectrumEarningsBySubscription = async (subscriptionId: string): Promise<SpectrumEarning[]> => {
  return await db.query.spectrumEarnings.findMany({
    where: eq(spectrumEarnings.subscriptionId, subscriptionId),
    orderBy: [desc(spectrumEarnings.createdAt)],
  });
};

export const createSpectrumEarning = async (earning: InsertSpectrumEarning): Promise<SpectrumEarning> => {
  const [created] = await db.insert(spectrumEarnings).values(earning).returning();
  return created;
};

export const getAllActiveSpectrumSubscriptions = async (): Promise<UserSpectrumSubscription[]> => {
  return await db.query.userSpectrumSubscriptions.findMany({
    where: eq(userSpectrumSubscriptions.status, "active"),
  });
};
