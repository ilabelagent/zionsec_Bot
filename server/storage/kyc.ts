
import { db } from "../db";
import { kycRecords, type KycRecord, type InsertKycRecord } from "@shared/schema";
import { eq } from "drizzle-orm";

// KYC Records
export const getKycRecord = async (id: string): Promise<KycRecord | undefined> => {
  const [record] = await db.select().from(kycRecords).where(eq(kycRecords.id, id));
  return record || undefined;
};

export const getKycRecordByUserId = async (userId: string): Promise<KycRecord | undefined> => {
  const [record] = await db.select().from(kycRecords).where(eq(kycRecords.userId, userId));
  return record || undefined;
};

export const createKycRecord = async (insertRecord: InsertKycRecord): Promise<KycRecord> => {
  const [record] = await db.insert(kycRecords).values(insertRecord).returning();
  return record;
};

export const updateKycVerification = async (id: string, status: string, result?: any): Promise<void> => {
  const updates: any = { verificationStatus: status };
  if (result) updates.reviewResult = result;
  if (status !== "pending") updates.reviewedAt = new Date();
  await db.update(kycRecords).set(updates).where(eq(kycRecords.id, id));
};
