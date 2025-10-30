
import { db } from "../db";
import { jesusCartelReleases, jesusCartelEvents, jesusCartelStreams, type JesusCartelRelease, type InsertJesusCartelRelease, type JesusCartelEvent, type InsertJesusCartelEvent, type JesusCartelStream, type InsertJesusCartelStream } from "@shared/schema";
import { eq, desc, asc, sql } from "drizzle-orm";

// Jesus Cartel Releases
export const getLatestReleases = async (limit: number = 10): Promise<JesusCartelRelease[]> => {
  return db
    .select()
    .from(jesusCartelReleases)
    .orderBy(desc(jesusCartelReleases.releaseDate))
    .limit(limit);
};

export const getFeaturedReleases = async (): Promise<JesusCartelRelease[]> => {
  return db
    .select()
    .from(jesusCartelReleases)
    .where(eq(jesusCartelReleases.isFeatured, true))
    .orderBy(desc(jesusCartelReleases.releaseDate));
};

export const getRelease = async (id: string): Promise<JesusCartelRelease | undefined> => {
  const [release] = await db
    .select()
    .from(jesusCartelReleases)
    .where(eq(jesusCartelReleases.id, id));
  return release || undefined;
};

export const createRelease = async (release: InsertJesusCartelRelease): Promise<JesusCartelRelease> => {
  const [newRelease] = await db
    .insert(jesusCartelReleases)
    .values(release)
    .returning();
  return newRelease;
};

export const updateRelease = async (id: string, updates: Partial<InsertJesusCartelRelease>): Promise<void> => {
  await db
    .update(jesusCartelReleases)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(jesusCartelReleases.id, id));
};

export const deleteRelease = async (id: string): Promise<void> => {
  await db.delete(jesusCartelReleases).where(eq(jesusCartelReleases.id, id));
};

export const incrementStreamCount = async (releaseId: string): Promise<void> => {
  await db
    .update(jesusCartelReleases)
    .set({ streamCount: sql`${jesusCartelReleases.streamCount} + 1` })
    .where(eq(jesusCartelReleases.id, releaseId));
};

export const incrementLikeCount = async (releaseId: string): Promise<void> => {
  await db
    .update(jesusCartelReleases)
    .set({ likeCount: sql`${jesusCartelReleases.likeCount} + 1` })
    .where(eq(jesusCartelReleases.id, releaseId));
};

// Jesus Cartel Events
export const getUpcomingEvents = async (limit: number = 10): Promise<JesusCartelEvent[]> => {
  return db
    .select()
    .from(jesusCartelEvents)
    .where(eq(jesusCartelEvents.status, "upcoming"))
    .orderBy(asc(jesusCartelEvents.date))
    .limit(limit);
};

export const getFeaturedEvents = async (): Promise<JesusCartelEvent[]> => {
  return db
    .select()
    .from(jesusCartelEvents)
    .where(eq(jesusCartelEvents.isFeatured, true))
    .orderBy(asc(jesusCartelEvents.date));
};

export const getEvent = async (id: string): Promise<JesusCartelEvent | undefined> => {
  const [event] = await db
    .select()
    .from(jesusCartelEvents)
    .where(eq(jesusCartelEvents.id, id));
  return event || undefined;
};

export const createEvent = async (event: InsertJesusCartelEvent): Promise<JesusCartelEvent> => {
  const [newEvent] = await db
    .insert(jesusCartelEvents)
    .values(event)
    .returning();
  return newEvent;
};

export const updateEvent = async (id: string, updates: Partial<InsertJesusCartelEvent>): Promise<void> => {
  await db
    .update(jesusCartelEvents)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(jesusCartelEvents.id, id));
};

export const deleteEvent = async (id: string): Promise<void> => {
  await db.delete(jesusCartelEvents).where(eq(jesusCartelEvents.id, id));
};

// Jesus Cartel Stream Tracking
export const trackStream = async (stream: InsertJesusCartelStream): Promise<JesusCartelStream> => {
  const [newStream] = await db
    .insert(jesusCartelStreams)
    .values(stream)
    .returning();
  
  await incrementStreamCount(stream.releaseId);
  
  return newStream;
};

export const getReleaseStreams = async (releaseId: string): Promise<JesusCartelStream[]> => {
  return db
    .select()
    .from(jesusCartelStreams)
    .where(eq(jesusCartelStreams.releaseId, releaseId))
    .orderBy(desc(jesusCartelStreams.createdAt));
};

export const getUserStreams = async (userId: string): Promise<JesusCartelStream[]> => {
  return db
    .select()
    .from(jesusCartelStreams)
    .where(eq(jesusCartelStreams.userId, userId))
    .orderBy(desc(jesusCartelStreams.createdAt));
};
