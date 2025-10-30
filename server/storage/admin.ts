
import { db } from "../db";
import { adminUsers, adminAuditLogs, adminBroadcasts, type AdminUser, type InsertAdminUser, type AdminAuditLog, type InsertAdminAuditLog, type AdminBroadcast, type InsertAdminBroadcast } from "@shared/schema";
import { eq, desc, asc } from "drizzle-orm";

// Admin Panel
export const getAdminUser = async (userId: string): Promise<AdminUser | undefined> => {
  return await db.query.adminUsers.findFirst({
    where: eq(adminUsers.userId, userId),
    with: { user: true },
  });
};

export const getAllAdminUsers = async (): Promise<AdminUser[]> => {
  return await db.query.adminUsers.findMany({
    with: { user: true },
    orderBy: [asc(adminUsers.createdAt)],
  });
};

export const adminUserExists = async (userId: string): Promise<boolean> => {
  const admin = await db.query.adminUsers.findFirst({
    where: eq(adminUsers.userId, userId),
  });
  return !!admin;
};

export const createAdminUser = async (admin: InsertAdminUser): Promise<AdminUser> => {
  const [created] = await db.insert(adminUsers).values(admin).returning();
  return created;
};

export const updateAdminRole = async (userId: string, role: string): Promise<boolean> => {
  const result = await db.update(adminUsers)
    .set({ role: role as any })
    .where(eq(adminUsers.userId, userId))
    .returning();
  return result.length > 0;
};

export const getAdminAuditLogs = async (limit: number = 100): Promise<AdminAuditLog[]> => {
  return await db.query.adminAuditLogs.findMany({
    orderBy: [desc(adminAuditLogs.createdAt)],
    limit,
    with: { admin: { with: { user: true } } },
  });
};

export const createAdminAuditLog = async (log: InsertAdminAuditLog): Promise<AdminAuditLog> => {
  const [created] = await db.insert(adminAuditLogs).values(log).returning();
  return created;
};

export const getAdminBroadcasts = async (limit: number = 50): Promise<AdminBroadcast[]> => {
  return await db.query.adminBroadcasts.findMany({
    orderBy: [desc(adminBroadcasts.sentAt)],
    limit,
    with: { admin: { with: { user: true } } },
  });
};

export const createAdminBroadcast = async (broadcast: InsertAdminBroadcast): Promise<AdminBroadcast> => {
  const [created] = await db.insert(adminBroadcasts).values(broadcast).returning();
  return created;
};

export const markBroadcastAsSent = async (id: string): Promise<void> => {
  await db.update(adminBroadcasts)
    .set({ sentAt: new Date() })
    .where(eq(adminBroadcasts.id, id));
};
