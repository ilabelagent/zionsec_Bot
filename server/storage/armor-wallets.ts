
import { db } from "../db";
import { armorWallets, type ArmorWallet, type InsertArmorWallet } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

// Armor Wallets
export const getArmorWallet = async (id: string): Promise<ArmorWallet | undefined> => {
  const [wallet] = await db.select().from(armorWallets).where(eq(armorWallets.id, id));
  return wallet || undefined;
};

export const getArmorWalletsByUserId = async (userId: string): Promise<ArmorWallet[]> => {
  return db.select().from(armorWallets).where(eq(armorWallets.userId, userId)).orderBy(desc(armorWallets.createdAt));
};

export const getArmorWalletByAddress = async (address: string): Promise<ArmorWallet | undefined> => {
  const [wallet] = await db.select().from(armorWallets).where(eq(armorWallets.address, address));
  return wallet || undefined;
};

export const createArmorWallet = async (insertWallet: InsertArmorWallet): Promise<ArmorWallet> => {
  const [wallet] = await db.insert(armorWallets).values(insertWallet).returning();
  return wallet;
};

export const updateArmorWallet = async (id: string, updates: Partial<ArmorWallet>): Promise<void> => {
  await db.update(armorWallets).set({ ...updates, updatedAt: new Date() }).where(eq(armorWallets.id, id));
};
