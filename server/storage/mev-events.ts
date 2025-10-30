
import { db } from "../db";
import { mevEvents, type MevEvent, type InsertMevEvent } from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";

// MEV Events
export const getMevEvent = async (id: string): Promise<MevEvent | undefined> => {
  const [event] = await db.select().from(mevEvents).where(eq(mevEvents.id, id));
  return event || undefined;
};

export const getMevEventsByUserId = async (userId: string): Promise<MevEvent[]> => {
  return db.select().from(mevEvents).where(eq(mevEvents.userId, userId)).orderBy(desc(mevEvents.detectedAt));
};

export const getMevEventsByNetwork = async (network: string): Promise<MevEvent[]> => {
  return db.select().from(mevEvents).where(sql`${mevEvents.network} = ${network}`).orderBy(desc(mevEvents.detectedAt));
};

export const createMevEvent = async (insertEvent: InsertMevEvent): Promise<MevEvent> => {
  const [event] = await db.insert(mevEvents).values(insertEvent).returning();
  return event;
};
