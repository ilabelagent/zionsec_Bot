
import { db } from "../db";
import { chatSessions, chatMessages, type ChatSession, type InsertChatSession, type ChatMessage, type InsertChatMessage } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

// Chat Sessions
export const getChatSession = async (id: string): Promise<ChatSession | undefined> => {
  const [session] = await db.select().from(chatSessions).where(eq(chatSessions.id, id));
  return session || undefined;
};

export const getChatSessionsByUserId = async (userId: string): Promise<ChatSession[]> => {
  return db.select().from(chatSessions).where(eq(chatSessions.userId, userId)).orderBy(desc(chatSessions.createdAt));
};

export const createChatSession = async (insertSession: InsertChatSession): Promise<ChatSession> => {
  const [session] = await db.insert(chatSessions).values(insertSession).returning();
  return session;
};

// Chat Messages
export const getChatMessage = async (id: string): Promise<ChatMessage | undefined> => {
  const [message] = await db.select().from(chatMessages).where(eq(chatMessages.id, id));
  return message || undefined;
};

export const getChatMessagesBySessionId = async (sessionId: string): Promise<ChatMessage[]> => {
  return db.select().from(chatMessages).where(eq(chatMessages.sessionId, sessionId)).orderBy(chatMessages.createdAt);
};

export const createChatMessage = async (insertMessage: InsertChatMessage): Promise<ChatMessage> => {
  const [message] = await db.insert(chatMessages).values(insertMessage).returning();
  return message;
};
