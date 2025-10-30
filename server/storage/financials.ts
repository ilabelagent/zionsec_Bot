
import { db } from "../db";
import { financialOrders, financialHoldings, type FinancialOrder, type InsertFinancialOrder, type FinancialHolding, type InsertFinancialHolding } from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";

// Financial Services
export const createFinancialOrder = async (order: InsertFinancialOrder): Promise<FinancialOrder> => {
  const [created] = await db.insert(financialOrders).values(order).returning();
  return created;
};

export const getFinancialOrdersByUserId = async (userId: string): Promise<FinancialOrder[]> => {
  return await db.query.financialOrders.findMany({
    where: eq(financialOrders.userId, userId),
    orderBy: [desc(financialOrders.createdAt)],
  });
};

export const getFinancialOrder = async (id: string): Promise<FinancialOrder | undefined> => {
  return await db.query.financialOrders.findFirst({
    where: eq(financialOrders.id, id),
  });
};

export const updateFinancialOrderStatus = async (id: string, status: string): Promise<void> => {
  await db.update(financialOrders).set({ status: status as any }).where(eq(financialOrders.id, id));
};

export const createFinancialHolding = async (holding: InsertFinancialHolding): Promise<FinancialHolding> => {
  const [created] = await db.insert(financialHoldings).values(holding).returning();
  return created;
};

export const getFinancialHoldingsByUserId = async (userId: string): Promise<FinancialHolding[]> => {
  return await db.query.financialHoldings.findMany({
    where: eq(financialHoldings.userId, userId),
  });
};

export const getFinancialHoldingsByAssetType = async (userId: string, assetType: string): Promise<FinancialHolding[]> => {
  return await db.query.financialHoldings.findMany({
    where: and(
      eq(financialHoldings.userId, userId),
      eq(financialHoldings.assetType, assetType as any)
    ),
  });
};

export const updateFinancialHolding = async (userId: string, assetType: string, symbol: string, updates: Partial<FinancialHolding>): Promise<void> => {
  await db.update(financialHoldings)
    .set(updates)
    .where(and(
      eq(financialHoldings.userId, userId),
      eq(financialHoldings.assetType, assetType as any),
      eq(financialHoldings.symbol, symbol)
    ));
};
