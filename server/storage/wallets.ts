
import { db } from "../db";
import { wallets, type Wallet, type InsertWallet } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export const getWallet = async (id: string): Promise<Wallet | undefined> => {
  const [wallet] = await db.select().from(wallets).where(eq(wallets.id, id));
  return wallet || undefined;
};

export const getWalletsByUserId = async (userId: string): Promise<Wallet[]> => {
  return db.select().from(wallets).where(eq(wallets.userId, userId));
};

export const getWalletByAddress = async (address: string): Promise<Wallet | undefined> => {
  const [wallet] = await db.select().from(wallets).where(eq(wallets.address, address));
  return wallet || undefined;
};

export const createWallet = async (insertWallet: InsertWallet): Promise<Wallet> => {
  const [wallet] = await db.insert(wallets).values(insertWallet).returning();
  return wallet;
};

export const updateWalletBalance = async (id: string, balance: string): Promise<void> => {
  await db.update(wallets).set({ balance }).where(eq(wallets.id, id));
};
