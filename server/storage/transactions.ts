
import { db } from "../db";
import { transactions, type Transaction, type InsertTransaction } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export const getTransaction = async (id: string): Promise<Transaction | undefined> => {
  const [tx] = await db.select().from(transactions).where(eq(transactions.id, id));
  return tx || undefined;
};

export const getTransactionsByWalletId = async (walletId: string): Promise<Transaction[]> => {
  return db
    .select()
    .from(transactions)
    .where(eq(transactions.walletId, walletId))
    .orderBy(desc(transactions.createdAt));
};

export const createTransaction = async (insertTransaction: InsertTransaction): Promise<Transaction> => {
  const [tx] = await db.insert(transactions).values(insertTransaction).returning();
  return tx;
};

export const updateTransactionStatus = async (id: string, status: string, txHash?: string): Promise<void> => {
  const updates: any = { status };
  if (txHash) updates.txHash = txHash;
  if (status === "confirmed") updates.confirmedAt = new Date();
  await db.update(transactions).set(updates).where(eq(transactions.id, id));
};
