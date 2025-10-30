
import { db } from "../db";
import { brokerAccounts, brokerOrders, brokerPositions, type BrokerAccount, type InsertBrokerAccount, type BrokerOrder, type InsertBrokerOrder, type BrokerPosition, type InsertBrokerPosition } from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";

// Broker Integration
export const getBrokerAccount = async (id: string): Promise<BrokerAccount | undefined> => {
  return await db.query.brokerAccounts.findFirst({
    where: eq(brokerAccounts.id, id),
  });
};

export const getUserBrokerAccounts = async (userId: string): Promise<BrokerAccount[]> => {
  return await db.query.brokerAccounts.findMany({
    where: eq(brokerAccounts.userId, userId),
    orderBy: [desc(brokerAccounts.createdAt)],
  });
};

export const createBrokerAccount = async (account: InsertBrokerAccount): Promise<BrokerAccount> => {
  const [created] = await db.insert(brokerAccounts).values(account).returning();
  return created;
};

export const updateBrokerAccount = async (id: string, updates: Partial<InsertBrokerAccount>): Promise<BrokerAccount | undefined> => {
  const [updated] = await db.update(brokerAccounts)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(brokerAccounts.id, id))
    .returning();
  return updated;
};

export const getBrokerOrder = async (id: string): Promise<BrokerOrder | undefined> => {
  return await db.query.brokerOrders.findFirst({
    where: eq(brokerOrders.id, id),
  });
};

export const getBrokerOrderByExternalId = async (externalOrderId: string): Promise<BrokerOrder | undefined> => {
  return await db.query.brokerOrders.findFirst({
    where: eq(brokerOrders.externalOrderId, externalOrderId),
  });
};

export const getBrokerOrdersByAccountId = async (brokerAccountId: string): Promise<BrokerOrder[]> => {
  return await db.query.brokerOrders.findMany({
    where: eq(brokerOrders.brokerAccountId, brokerAccountId),
    orderBy: [desc(brokerOrders.submittedAt)],
  });
};

export const createBrokerOrder = async (order: InsertBrokerOrder): Promise<BrokerOrder> => {
  const [created] = await db.insert(brokerOrders).values(order).returning();
  return created;
};

export const updateBrokerOrder = async (id: string, updates: Partial<InsertBrokerOrder>): Promise<BrokerOrder | undefined> => {
  const [updated] = await db.update(brokerOrders)
    .set(updates)
    .where(eq(brokerOrders.id, id))
    .returning();
  return updated;
};

export const getBrokerPosition = async (id: string): Promise<BrokerPosition | undefined> => {
  return await db.query.brokerPositions.findFirst({
    where: eq(brokerPositions.id, id),
  });
};

export const getBrokerPositionBySymbol = async (brokerAccountId: string, symbol: string): Promise<BrokerPosition | undefined> => {
  return await db.query.brokerPositions.findFirst({
    where: and(
      eq(brokerPositions.brokerAccountId, brokerAccountId),
      eq(brokerPositions.symbol, symbol)
    ),
  });
};

export const getBrokerPositionsByAccountId = async (brokerAccountId: string): Promise<BrokerPosition[]> => {
  return await db.query.brokerPositions.findMany({
    where: eq(brokerPositions.brokerAccountId, brokerAccountId),
    orderBy: [desc(brokerPositions.lastUpdatedAt)],
  });
};

export const createBrokerPosition = async (position: InsertBrokerPosition): Promise<BrokerPosition> => {
  const [created] = await db.insert(brokerPositions).values(position).returning();
  return created;
};

export const updateBrokerPosition = async (id: string, updates: Partial<InsertBrokerPosition>): Promise<BrokerPosition | undefined> => {
  const [updated] = await db.update(brokerPositions)
    .set({ ...updates, lastUpdatedAt: new Date() })
    .where(eq(brokerPositions.id, id))
    .returning();
  return updated;
};
