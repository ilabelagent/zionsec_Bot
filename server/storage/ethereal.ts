
import { db } from "../db";
import { individualAssets, etherealElements, etherealOwnership, type IndividualAsset, type InsertIndividualAsset, type EtherealElement, type InsertEtherealElement, type EtherealOwnership, type InsertEtherealOwnership } from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";

// Individual Assets & Ethereal Elements
export const getAllEtherealElements = async (): Promise<EtherealElement[]> => {
  return await db.query.etherealElements.findMany();
};

export const getEtherealElement = async (id: string): Promise<EtherealElement | undefined> => {
  return await db.query.etherealElements.findFirst({
    where: eq(etherealElements.id, id),
  });
};

export const createEtherealElement = async (element: InsertEtherealElement): Promise<EtherealElement> => {
  const [created] = await db.insert(etherealElements).values(element).returning();
  return created;
};

export const updateEtherealElementMintCount = async (id: string, mintedCount: number): Promise<void> => {
  await db.update(etherealElements).set({ mintedCount }).where(eq(etherealElements.id, id));
};

export const getEtherealOwnership = async (userId: string, elementId: string): Promise<EtherealOwnership | undefined> => {
  return await db.query.etherealOwnership.findFirst({
    where: and(
      eq(etherealOwnership.userId, userId),
      eq(etherealOwnership.elementId, elementId)
    ),
  });
};

export const getUserEtherealOwnerships = async (userId: string): Promise<any[]> => {
  return await db.query.etherealOwnership.findMany({
    where: eq(etherealOwnership.userId, userId),
    with: { element: true },
  });
};

export const createEtherealOwnership = async (ownership: InsertEtherealOwnership): Promise<EtherealOwnership> => {
  const [created] = await db.insert(etherealOwnership).values(ownership).returning();
  return created;
};

export const updateEtherealOwnershipQuantity = async (userId: string, elementId: string, quantity: number): Promise<void> => {
  await db.update(etherealOwnership)
    .set({ quantity })
    .where(and(
      eq(etherealOwnership.userId, userId),
      eq(etherealOwnership.elementId, elementId)
    ));
};

export const getIndividualAsset = async (id: string): Promise<IndividualAsset | undefined> => {
  return await db.query.individualAssets.findFirst({
    where: eq(individualAssets.id, id),
  });
};

export const getUserIndividualAssets = async (userId: string): Promise<IndividualAsset[]> => {
  return await db.query.individualAssets.findMany({
    where: eq(individualAssets.userId, userId),
  });
};

export const getUserAssetsByType = async (userId: string, assetType: string): Promise<IndividualAsset[]> => {
  return await db.query.individualAssets.findMany({
    where: and(
      eq(individualAssets.userId, userId),
      eq(individualAssets.assetType, assetType as any)
    ),
  });
};

export const createIndividualAsset = async (asset: InsertIndividualAsset): Promise<IndividualAsset> => {
  const [created] = await db.insert(individualAssets).values(asset).returning();
  return created;
};

export const updateIndividualAssetValue = async (id: string, marketValue: string): Promise<void> => {
  await db.update(individualAssets).set({ marketValue }).where(eq(individualAssets.id, id));
};
