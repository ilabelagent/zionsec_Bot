
import { db } from "../db";
import { users, type User, type UpsertUser } from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";

export const getUser = async (id: string): Promise<User | undefined> => {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user || undefined;
};

export const getUserByEmail = async (email: string): Promise<User | undefined> => {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user || undefined;
};

export const upsertUser = async (userData: UpsertUser): Promise<User> => {
  const [user] = await db
    .insert(users)
    .values(userData)
    .onConflictDoUpdate({
      target: users.id,
      set: {
        ...userData,
        updatedAt: new Date(),
      },
    })
    .returning();
  return user;
};

export const updateUserKycStatus = async (userId: string, status: string, kycUserId?: string): Promise<void> => {
  await db
    .update(users)
    .set({ kycStatus: status as any, kycUserId })
    .where(eq(users.id, userId));
};

export const getAllUsers = async (limit: number = 50, offset: number = 0): Promise<User[]> => {
  return db.select().from(users).limit(limit).offset(offset).orderBy(desc(users.createdAt));
};

export const getTotalUsersCount = async (): Promise<number> => {
  const result = await db.select({ count: sql<number>`count(*)` }).from(users);
  return result[0]?.count || 0;
};

export const updateUserStatus = async (userId: string, isAdmin: boolean): Promise<void> => {
  await db.update(users).set({ isAdmin }).where(eq(users.id, userId));
};
