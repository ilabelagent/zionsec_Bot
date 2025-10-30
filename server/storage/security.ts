
import { db } from "../db";
import { securityEvents, type SecurityEvent, type InsertSecurityEvent } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

// Security Events
export const getSecurityEvent = async (id: string): Promise<SecurityEvent | undefined> => {
  const [event] = await db.select().from(securityEvents).where(eq(securityEvents.id, id));
  return event || undefined;
};

export const getSecurityEventsByUserId = async (userId: string): Promise<SecurityEvent[]> => {
  return db
    .select()
    .from(securityEvents)
    .where(eq(securityEvents.userId, userId))
    .orderBy(desc(securityEvents.createdAt));
};

export const getUnresolvedSecurityEvents = async (): Promise<SecurityEvent[]> => {
  return db
    .select()
    .from(securityEvents)
    .where(eq(securityEvents.isResolved, false))
    .orderBy(desc(securityEvents.createdAt));
};

export const createSecurityEvent = async (insertEvent: InsertSecurityEvent): Promise<SecurityEvent> => {
  const [event] = await db.insert(securityEvents).values(insertEvent).returning();
  return event;
};

export const resolveSecurityEvent = async (id: string): Promise<void> => {
  await db
    .update(securityEvents)
    .set({
      isResolved: true,
      resolvedAt: new Date(),
    })
    .where(eq(securityEvents.id, id));
};
