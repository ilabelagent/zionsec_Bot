
import { db } from "../db";
import { tokens, type Token, type InsertToken } from "@shared/schema";
import { eq } from "drizzle-orm";

export const getToken = async (id: string): Promise<Token | undefined> => {
  const [token] = await db.select().from(tokens).where(eq(tokens.id, id));
  return token || undefined;
};

export const getTokensByWalletId = async (walletId: string): Promise<Token[]> => {
  return db.select().from(tokens).where(eq(tokens.walletId, walletId));
};

export const getTokenByContractAddress = async (address: string): Promise<Token | undefined> => {
  const [token] = await db.select().from(tokens).where(eq(tokens.contractAddress, address));
  return token || undefined;
};

export const createToken = async (insertToken: InsertToken): Promise<Token> => {
  const [token] = await db.insert(tokens).values(insertToken).returning();
  return token;
};
