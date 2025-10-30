
import { db } from "../db";
import { p2pOffers, p2pOrders, p2pPaymentMethods, p2pChatMessages, p2pDisputes, p2pReviews, type P2POffer, type InsertP2POffer, type P2POrder, type InsertP2POrder, type P2PPaymentMethod, type InsertP2PPaymentMethod, type P2PChatMessage, type InsertP2PChatMessage, type P2PDispute, type InsertP2PDispute, type P2PReview, type InsertP2PReview } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

// P2P Trading
export const getP2POffers = async (type?: string): Promise<P2POffer[]> => {
  if (type) {
    return await db.query.p2pOffers.findMany({
      where: eq(p2pOffers.type, type as any),
      with: { user: true },
      orderBy: [desc(p2pOffers.createdAt)],
    });
  }
  return await db.query.p2pOffers.findMany({
    with: { user: true },
    orderBy: [desc(p2pOffers.createdAt)],
  });
};

export const getP2POffer = async (id: string): Promise<P2POffer | undefined> => {
  return await db.query.p2pOffers.findFirst({
    where: eq(p2pOffers.id, id),
  });
};

export const createP2POffer = async (offer: InsertP2POffer): Promise<P2POffer> => {
  const [created] = await db.insert(p2pOffers).values(offer).returning();
  return created;
};

export const updateP2POffer = async (id: string, updates: Partial<InsertP2POffer>): Promise<boolean> => {
  const result = await db.update(p2pOffers)
    .set(updates)
    .where(eq(p2pOffers.id, id))
    .returning();
  return result.length > 0;
};

export const getP2POrders = async (userId: string): Promise<P2POrder[]> => {
  return await db.query.p2pOrders.findMany({
    where: eq(p2pOrders.buyerId, userId),
    orderBy: [desc(p2pOrders.createdAt)],
  });
};

export const getP2POrder = async (id: string): Promise<P2POrder | undefined> => {
  return await db.query.p2pOrders.findFirst({
    where: eq(p2pOrders.id, id),
  });
};

export const createP2POrder = async (order: InsertP2POrder): Promise<P2POrder> => {
  const [created] = await db.insert(p2pOrders).values(order).returning();
  return created;
};

export const updateP2POrder = async (id: string, updates: Partial<InsertP2POrder>): Promise<boolean> => {
  const result = await db.update(p2pOrders)
    .set(updates)
    .where(eq(p2pOrders.id, id))
    .returning();
  return result.length > 0;
};

export const getUserP2PPaymentMethods = async (userId: string): Promise<P2PPaymentMethod[]> => {
  return await db.query.p2pPaymentMethods.findMany({
    where: eq(p2pPaymentMethods.userId, userId),
  });
};

export const createP2PPaymentMethod = async (method: InsertP2PPaymentMethod): Promise<P2PPaymentMethod> => {
  const [created] = await db.insert(p2pPaymentMethods).values(method).returning();
  return created;
};

export const getOrderChatMessages = async (orderId: string): Promise<P2PChatMessage[]> => {
  return await db.query.p2pChatMessages.findMany({
    where: eq(p2pChatMessages.orderId, orderId),
    orderBy: [desc(p2pChatMessages.createdAt)],
  });
};

export const createP2PChatMessage = async (message: InsertP2PChatMessage): Promise<P2PChatMessage> => {
  const [created] = await db.insert(p2pChatMessages).values(message).returning();
  return created;
};

export const getP2PDisputes = async (status?: string): Promise<P2PDispute[]> => {
  if (status) {
    return await db.query.p2pDisputes.findMany({
      where: eq(p2pDisputes.status, status as any),
      orderBy: [desc(p2pDisputes.createdAt)],
    });
  }
  return await db.query.p2pDisputes.findMany({
    orderBy: [desc(p2pDisputes.createdAt)],
  });
};

export const getP2PDispute = async (id: string): Promise<P2PDispute | undefined> => {
  return await db.query.p2pDisputes.findFirst({
    where: eq(p2pDisputes.id, id),
  });
};

export const createP2PDispute = async (dispute: InsertP2PDispute): Promise<P2PDispute> => {
  const [created] = await db.insert(p2pDisputes).values(dispute).returning();
  return created;
};

export const updateP2PDispute = async (id: string, updates: Partial<InsertP2PDispute>): Promise<boolean> => {
  const result = await db.update(p2pDisputes)
    .set(updates)
    .where(eq(p2pDisputes.id, id))
    .returning();
  return result.length > 0;
};

export const getUserP2PReviews = async (userId: string): Promise<P2PReview[]> => {
  return await db.query.p2pReviews.findMany({
    where: eq(p2pReviews.revieweeId, userId),
    orderBy: [desc(p2pReviews.createdAt)],
  });
};

export const createP2PReview = async (review: InsertP2PReview): Promise<P2PReview> => {
  const [created] = await db.insert(p2pReviews).values(review).returning();
  return created;
};
