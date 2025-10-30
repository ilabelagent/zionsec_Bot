
import { db } from "../db";
import { payments, cryptoPayments, type Payment, type InsertPayment, type CryptoPayment, type InsertCryptoPayment } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

// Payments
export const getPayment = async (id: string): Promise<Payment | undefined> => {
  const [payment] = await db.select().from(payments).where(eq(payments.id, id));
  return payment || undefined;
};

export const getPaymentsByUserId = async (userId: string): Promise<Payment[]> => {
  return db
    .select()
    .from(payments)
    .where(eq(payments.userId, userId))
    .orderBy(desc(payments.createdAt));
};

export const getPaymentByStripeId = async (stripeId: string): Promise<Payment | undefined> => {
  const [payment] = await db
    .select()
    .from(payments)
    .where(eq(payments.stripePaymentId, stripeId));
  return payment || undefined;
};

export const createPayment = async (insertPayment: InsertPayment): Promise<Payment> => {
  const [payment] = await db.insert(payments).values(insertPayment).returning();
  return payment;
};

export const updatePaymentStatus = async (id: string, status: string): Promise<void> => {
  await db.update(payments).set({ status }).where(eq(payments.id, id));
};

// Crypto Payments
export const getCryptoPayment = async (id: string): Promise<CryptoPayment | undefined> => {
  const [payment] = await db.select().from(cryptoPayments).where(eq(cryptoPayments.id, id));
  return payment || undefined;
};

export const getCryptoPaymentsByUserId = async (userId: string): Promise<CryptoPayment[]> => {
  return db.select().from(cryptoPayments).where(eq(cryptoPayments.userId, userId)).orderBy(desc(cryptoPayments.createdAt));
};

export const getCryptoPaymentByInvoiceId = async (invoiceId: string): Promise<CryptoPayment | undefined> => {
  const [payment] = await db.select().from(cryptoPayments).where(eq(cryptoPayments.processorInvoiceId, invoiceId));
  return payment || undefined;
};

export const createCryptoPayment = async (insertPayment: InsertCryptoPayment): Promise<CryptoPayment> => {
  const [payment] = await db.insert(cryptoPayments).values(insertPayment).returning();
  return payment;
};

export const updateCryptoPaymentStatus = async (id: string, status: string, txHash?: string): Promise<void> => {
  const updates: any = { status };
  if (txHash) updates.txHash = txHash;
  if (status === "confirmed" || status === "completed") updates.confirmedAt = new Date();
  await db.update(cryptoPayments).set(updates).where(eq(cryptoPayments.id, id));
};
