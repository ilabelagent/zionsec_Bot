
import { db } from "../db";
import { nfts, type Nft, type InsertNft } from "@shared/schema";
import { eq } from "drizzle-orm";

export const getNft = async (id: string): Promise<Nft | undefined> => {
  const [nft] = await db.select().from(nfts).where(eq(nfts.id, id));
  return nft || undefined;
};

export const getNftsByWalletId = async (walletId: string): Promise<Nft[]> => {
  return db.select().from(nfts).where(eq(nfts.walletId, walletId));
};

export const createNft = async (insertNft: InsertNft): Promise<Nft> => {
  const [nft] = await db.insert(nfts).values(insertNft).returning();
  return nft;
};
