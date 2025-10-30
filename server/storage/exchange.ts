
import { db } from "../db";
import { exchangeOrders, liquidityPools, mixingRequests, type ExchangeOrder, type InsertExchangeOrder, type LiquidityPool, type InsertLiquidityPool, type MixingRequest, type InsertMixingRequest } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

// Exchange Orders
export const getExchangeOrder = async (id: string): Promise<ExchangeOrder | undefined> => {
  const [order] = await db.select().from(exchangeOrders).where(eq(exchangeOrders.id, id));
  return order || undefined;
};

export const getExchangeOrdersByUserId = async (userId: string): Promise<ExchangeOrder[]> => {
  return db.select().from(exchangeOrders).where(eq(exchangeOrders.userId, userId)).orderBy(desc(exchangeOrders.createdAt));
};

export const createExchangeOrder = async (insertOrder: InsertExchangeOrder): Promise<ExchangeOrder> => {
  const [order] = await db.insert(exchangeOrders).values(insertOrder).returning();
  return order;
};

// Liquidity Pools
export const getLiquidityPool = async (id: string): Promise<LiquidityPool | undefined> => {
  const [pool] = await db.select().from(liquidityPools).where(eq(liquidityPools.id, id));
  return pool || undefined;
};

export const getAllLiquidityPools = async (): Promise<LiquidityPool[]> => {
  return db.select().from(liquidityPools).orderBy(desc(liquidityPools.createdAt));
};

export const createLiquidityPool = async (insertPool: InsertLiquidityPool): Promise<LiquidityPool> => {
  const [pool] = await db.insert(liquidityPools).values(insertPool).returning();
  return pool;
};

// Mixing Requests
export const getMixingRequest = async (id: string): Promise<MixingRequest | undefined> => {
  const [request] = await db.select().from(mixingRequests).where(eq(mixingRequests.id, id));
  return request || undefined;
};

export const getMixingRequestsByUserId = async (userId: string): Promise<MixingRequest[]> => {
  return db.select().from(mixingRequests).where(eq(mixingRequests.userId, userId)).orderBy(desc(mixingRequests.createdAt));
};

export const createMixingRequest = async (insertRequest: InsertMixingRequest): Promise<MixingRequest> => {
  const [request] = await db.insert(mixingRequests).values(insertRequest).returning();
  return request;
};
