
import { db } from "../db";
import { metalInventory, metalTrades, metalProducts, metalOwnership, type MetalInventory, type InsertMetalInventory, type MetalTrade, type InsertMetalTrade, type MetalProduct, type InsertMetalProduct, type MetalOwnership, type InsertMetalOwnership } from "@shared/schema";
import { eq, desc, asc, sql } from "drizzle-orm";

// Metal Inventory
export const getMetalInventoryItem = async (id: string): Promise<MetalInventory | undefined> => {
  const [item] = await db.select().from(metalInventory).where(eq(metalInventory.id, id));
  return item || undefined;
};

export const getMetalInventoryByUserId = async (userId: string): Promise<MetalInventory[]> => {
  // Get inventory items from trades associated with this user
  const userTrades = await db.select({ inventoryId: metalTrades.inventoryId })
    .from(metalTrades)
    .where(eq(metalTrades.userId, userId));
  
  if (userTrades.length === 0) return [];
  
  const inventoryIds = Array.from(new Set(userTrades.map(t => t.inventoryId)));
  return db.select().from(metalInventory)
    .where(sql`${metalInventory.id} = ANY(${inventoryIds})`)
    .orderBy(desc(metalInventory.createdAt));
};

export const createMetalInventory = async (insertItem: InsertMetalInventory): Promise<MetalInventory> => {
  const [item] = await db.insert(metalInventory).values(insertItem).returning();
  return item;
};

// Metal Trades
export const getMetalTrade = async (id: string): Promise<MetalTrade | undefined> => {
  const [trade] = await db.select().from(metalTrades).where(eq(metalTrades.id, id));
  return trade || undefined;
};

export const getMetalTradesByUserId = async (userId: string): Promise<MetalTrade[]> => {
  return db.select().from(metalTrades).where(eq(metalTrades.userId, userId)).orderBy(desc(metalTrades.createdAt));
};

export const createMetalTrade = async (insertTrade: InsertMetalTrade): Promise<MetalTrade> => {
  const [trade] = await db.insert(metalTrades).values(insertTrade).returning();
  return trade;
};

// Precious Metals Exchange
export const getAllMetalProducts = async (): Promise<MetalProduct[]> => {
  return db.select().from(metalProducts).orderBy(asc(metalProducts.metal));
};

export const getMetalProduct = async (id: string): Promise<MetalProduct | undefined> => {
  const [product] = await db.select().from(metalProducts).where(eq(metalProducts.id, id));
  return product || undefined;
};

export const createMetalProduct = async (insertProduct: InsertMetalProduct): Promise<MetalProduct> => {
  const [product] = await db.insert(metalProducts).values(insertProduct).returning();
  return product;
};

export const getUserMetalOwnership = async (userId: string): Promise<MetalOwnership[]> => {
  return db.select().from(metalOwnership).where(eq(metalOwnership.userId, userId)).orderBy(desc(metalOwnership.purchasedAt));
};

export const getMetalOwnership = async (id: string): Promise<MetalOwnership | undefined> => {
  const [ownership] = await db.select().from(metalOwnership).where(eq(metalOwnership.id, id));
  return ownership || undefined;
};

export const createMetalOwnership = async (insertOwnership: InsertMetalOwnership): Promise<MetalOwnership> => {
  const [ownership] = await db.insert(metalOwnership).values(insertOwnership).returning();
  return ownership;
};

export const updateMetalOwnershipLocation = async (id: string, location: string, deliveryAddress?: string, trackingNumber?: string): Promise<void> => {
  await db.update(metalOwnership)
    .set({ 
      location: location as any,
      deliveryAddress,
      trackingNumber,
      deliveredAt: location === 'delivered' ? sql`NOW()` : undefined
    })
    .where(eq(metalOwnership.id, id));
};
