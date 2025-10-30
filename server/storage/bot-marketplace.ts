
import { db } from "../db";
import { botMarketplaceListings, botRentals, botSubscriptions, botReviews, type BotMarketplaceListing, type InsertBotMarketplaceListing, type BotRental, type InsertBotRental, type BotSubscription, type InsertBotSubscription, type BotReview, type InsertBotReview } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

// Bot Marketplace
export const getBotMarketplaceListings = async (): Promise<BotMarketplaceListing[]> => {
  return await db.query.botMarketplaceListings.findMany({
    with: { seller: true },
    orderBy: [desc(botMarketplaceListings.createdAt)],
  });
};

export const getBotMarketplaceListing = async (id: string): Promise<BotMarketplaceListing | undefined> => {
  return await db.query.botMarketplaceListings.findFirst({
    where: eq(botMarketplaceListings.id, id),
    with: { seller: true },
  });
};

export const createBotMarketplaceListing = async (listing: InsertBotMarketplaceListing): Promise<BotMarketplaceListing> => {
  const [created] = await db.insert(botMarketplaceListings).values(listing).returning();
  return created;
};

export const updateBotMarketplaceListing = async (id: string, updates: Partial<InsertBotMarketplaceListing>): Promise<boolean> => {
  const result = await db.update(botMarketplaceListings)
    .set(updates)
    .where(eq(botMarketplaceListings.id, id))
    .returning();
  return result.length > 0;
};

// Bot Rentals
export const getBotRental = async (id: string): Promise<BotRental | undefined> => {
  return await db.query.botRentals.findFirst({
    where: eq(botRentals.id, id),
    with: { 
      listing: { with: { seller: true } },
      renter: true 
    },
  });
};

export const getUserBotRentals = async (userId: string): Promise<BotRental[]> => {
  return await db.query.botRentals.findMany({
    where: eq(botRentals.renterId, userId),
    with: { 
      listing: { with: { seller: true } },
      renter: true 
    },
    orderBy: [desc(botRentals.startTime)],
  });
};

export const createBotRental = async (rental: InsertBotRental): Promise<BotRental> => {
  const [created] = await db.insert(botRentals).values(rental).returning();
  return created;
};

export const updateBotRental = async (id: string, updates: Partial<InsertBotRental>): Promise<boolean> => {
  const result = await db.update(botRentals)
    .set(updates)
    .where(eq(botRentals.id, id))
    .returning();
  return result.length > 0;
};

// Bot Subscriptions
export const getBotSubscription = async (id: string): Promise<BotSubscription | undefined> => {
  return await db.query.botSubscriptions.findFirst({
    where: eq(botSubscriptions.id, id),
    with: { 
      listing: { with: { seller: true } },
      subscriber: true 
    },
  });
};

export const getUserBotSubscriptions = async (userId: string): Promise<BotSubscription[]> => {
  return await db.query.botSubscriptions.findMany({
    where: eq(botSubscriptions.subscriberId, userId),
    with: { 
      listing: { with: { seller: true } },
      subscriber: true 
    },
    orderBy: [desc(botSubscriptions.currentPeriodStart)],
  });
};

export const createBotSubscription = async (subscription: InsertBotSubscription): Promise<BotSubscription> => {
  const [created] = await db.insert(botSubscriptions).values(subscription).returning();
  return created;
};

export const updateBotSubscription = async (id: string, updates: Partial<InsertBotSubscription>): Promise<boolean> => {
  const result = await db.update(botSubscriptions)
    .set(updates)
    .where(eq(botSubscriptions.id, id))
    .returning();
  return result.length > 0;
};

// Bot Reviews
export const getBotReviews = async (listingId: string): Promise<BotReview[]> => {
  return await db.query.botReviews.findMany({
    where: eq(botReviews.listingId, listingId),
    with: { reviewer: true },
    orderBy: [desc(botReviews.createdAt)],
  });
};

export const createBotReview = async (review: InsertBotReview): Promise<BotReview> => {
  const [created] = await db.insert(botReviews).values(review).returning();
  return created;
};
