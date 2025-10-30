
import { db } from "../db";
import { forumCategories, forumThreads, forumReplies, type ForumCategory, type InsertForumCategory, type ForumThread, type InsertForumThread, type ForumReply, type InsertForumReply } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

// Forum Categories
export const getForumCategory = async (id: string): Promise<ForumCategory | undefined> => {
  const [category] = await db.select().from(forumCategories).where(eq(forumCategories.id, id));
  return category || undefined;
};

export const getAllForumCategories = async (): Promise<ForumCategory[]> => {
  return db.select().from(forumCategories).orderBy(desc(forumCategories.createdAt));
};

export const createForumCategory = async (insertCategory: InsertForumCategory): Promise<ForumCategory> => {
  const [category] = await db.insert(forumCategories).values(insertCategory).returning();
  return category;
};

// Forum Threads
export const getForumThread = async (id: string): Promise<ForumThread | undefined> => {
  const [thread] = await db.select().from(forumThreads).where(eq(forumThreads.id, id));
  return thread || undefined;
};

export const getAllForumThreads = async (): Promise<ForumThread[]> => {
  return db.select().from(forumThreads).orderBy(desc(forumThreads.createdAt));
};

export const createForumThread = async (insertThread: InsertForumThread): Promise<ForumThread> => {
  const [thread] = await db.insert(forumThreads).values(insertThread).returning();
  return thread;
};

// Forum Replies
export const getForumReply = async (id: string): Promise<ForumReply | undefined> => {
  const [reply] = await db.select().from(forumReplies).where(eq(forumReplies.id, id));
  return reply || undefined;
};

export const getAllForumReplies = async (): Promise<ForumReply[]> => {
  return db.select().from(forumReplies).orderBy(desc(forumReplies.createdAt));
};

export const createForumReply = async (insertReply: InsertForumReply): Promise<ForumReply> => {
  const [reply] = await db.insert(forumReplies).values(insertReply).returning();
  return reply;
};
