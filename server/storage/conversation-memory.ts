
import { db } from "../db";
import { conversationSessions, conversationMemories, conversationMessages, conversationContext, conversationTasks, type ConversationSession, type InsertConversationSession, type ConversationMemory, type InsertConversationMemory, type ConversationMessage, type InsertConversationMessage, type ConversationContext, type InsertConversationContext, type ConversationTask, type InsertConversationTask } from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";

// Conversation Memory System
export const getConversationSession = async (id: string): Promise<ConversationSession | undefined> => {
  return await db.query.conversationSessions.findFirst({
    where: eq(conversationSessions.id, id),
  });
};

export const getConversationSessionByIdentifier = async (identifier: string): Promise<ConversationSession | undefined> => {
  return await db.query.conversationSessions.findFirst({
    where: eq(conversationSessions.identifier, identifier),
  });
};

export const createConversationSession = async (session: InsertConversationSession): Promise<ConversationSession> => {
  const [created] = await db.insert(conversationSessions).values(session).returning();
  return created;
};

export const updateConversationSession = async (id: string, updates: Partial<InsertConversationSession>): Promise<void> => {
  await db.update(conversationSessions).set(updates).where(eq(conversationSessions.id, id));
};

export const getConversationMemories = async (sessionId: string): Promise<ConversationMemory[]> => {
  return await db.query.conversationMemories.findMany({
    where: eq(conversationMemories.sessionId, sessionId),
  });
};

export const getConversationMemoryByKey = async (sessionId: string, memoryType: string, memoryKey: string): Promise<ConversationMemory | undefined> => {
  return await db.query.conversationMemories.findFirst({
    where: and(
      eq(conversationMemories.sessionId, sessionId),
      eq(conversationMemories.memoryType, memoryType),
      eq(conversationMemories.memoryKey, memoryKey)
    ),
  });
};

export const getConversationMemoriesByType = async (sessionId: string, memoryType: string): Promise<ConversationMemory[]> => {
  return await db.query.conversationMemories.findMany({
    where: and(
      eq(conversationMemories.sessionId, sessionId),
      eq(conversationMemories.memoryType, memoryType)
    ),
  });
};

export const createConversationMemory = async (memory: InsertConversationMemory): Promise<ConversationMemory> => {
  const [created] = await db.insert(conversationMemories).values(memory).returning();
  return created;
};

export const updateConversationMemory = async (id: string, updates: Partial<InsertConversationMemory>): Promise<ConversationMemory> => {
  const [updated] = await db.update(conversationMemories).set(updates).where(eq(conversationMemories.id, id)).returning();
  return updated;
};

export const deleteConversationMemory = async (id: string): Promise<void> => {
  await db.delete(conversationMemories).where(eq(conversationMemories.id, id));
};

export const getConversationMessages = async (sessionId: string): Promise<ConversationMessage[]> => {
  return await db.query.conversationMessages.findMany({
    where: eq(conversationMessages.sessionId, sessionId),
  });
};

export const createConversationMessage = async (message: InsertConversationMessage): Promise<ConversationMessage> => {
  const [created] = await db.insert(conversationMessages).values(message).returning();
  return created;
};

export const getConversationContexts = async (sessionId: string): Promise<ConversationContext[]> => {
  return await db.query.conversationContext.findMany({
    where: eq(conversationContext.sessionId, sessionId),
  });
};

export const getConversationContextByKey = async (sessionId: string, contextType: string, contextKey: string): Promise<ConversationContext | undefined> => {
  return await db.query.conversationContext.findFirst({
    where: and(
      eq(conversationContext.sessionId, sessionId),
      eq(conversationContext.contextType, contextType),
      eq(conversationContext.contextKey, contextKey)
    ),
  });
};

export const getConversationContextsByType = async (sessionId: string, contextType: string): Promise<ConversationContext[]> => {
  return await db.query.conversationContext.findMany({
    where: and(
      eq(conversationContext.sessionId, sessionId),
      eq(conversationContext.contextType, contextType)
    ),
  });
};

export const createConversationContext = async (context: InsertConversationContext): Promise<ConversationContext> => {
  const [created] = await db.insert(conversationContext).values(context).returning();
  return created;
};

export const updateConversationContext = async (id: string, updates: Partial<InsertConversationContext>): Promise<ConversationContext> => {
  const [updated] = await db.update(conversationContext).set(updates).where(eq(conversationContext.id, id)).returning();
  return updated;
};

export const deleteConversationContext = async (id: string): Promise<void> => {
  await db.delete(conversationContext).where(eq(conversationContext.id, id));
};

export const getConversationTasks = async (sessionId: string): Promise<ConversationTask[]> => {
  return await db.query.conversationTasks.findMany({
    where: eq(conversationTasks.sessionId, sessionId),
  });
};

export const getConversationTask = async (id: string): Promise<ConversationTask | undefined> => {
  return await db.query.conversationTasks.findFirst({
    where: eq(conversationTasks.id, id),
  });
};

export const createConversationTask = async (task: InsertConversationTask): Promise<ConversationTask> => {
  const [created] = await db.insert(conversationTasks).values(task).returning();
  return created;
};

export const updateConversationTask = async (id: string, updates: Partial<InsertConversationTask>): Promise<ConversationTask> => {
  const [updated] = await db.update(conversationTasks).set(updates).where(eq(conversationTasks.id, id)).returning();
  return updated;
};
