
import { db } from "../db";
import { walletConnectSessions, type WalletConnectSession, type InsertWalletConnectSession } from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";

// WalletConnect
export const getWalletConnectSessions = async (userId: string): Promise<WalletConnectSession[]> => {
  return await db.query.walletConnectSessions.findMany({
    where: eq(walletConnectSessions.userId, userId),
    orderBy: [desc(walletConnectSessions.createdAt)],
  });
};

export const getActiveWalletSession = async (userId: string, walletAddress: string): Promise<WalletConnectSession | undefined> => {
  return await db.query.walletConnectSessions.findFirst({
    where: and(
      eq(walletConnectSessions.userId, userId),
      eq(walletConnectSessions.walletAddress, walletAddress),
      eq(walletConnectSessions.status, "connected")
    ),
  });
};

export const createWalletConnectSession = async (session: InsertWalletConnectSession): Promise<WalletConnectSession> => {
  const [created] = await db.insert(walletConnectSessions).values(session).returning();
  return created;
};

export const updateWalletSessionStatus = async (id: string, status: string): Promise<boolean> => {
  const result = await db.update(walletConnectSessions)
    .set({ status: status as any })
    .where(eq(walletConnectSessions.id, id))
    .returning();
  return result.length > 0;
};

export const disconnectWalletSession = async (id: string): Promise<boolean> => {
  const result = await db.update(walletConnectSessions)
    .set({ status: "disconnected", disconnectedAt: new Date() })
    .where(eq(walletConnectSessions.id, id))
    .returning();
  return result.length > 0;
};
