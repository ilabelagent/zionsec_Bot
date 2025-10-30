
import { db } from "../db";
import { agents, agentLogs, type Agent, type InsertAgent, type AgentLog, type InsertAgentLog } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

// Agents
export const getAgent = async (id: string): Promise<Agent | undefined> => {
  const [agent] = await db.select().from(agents).where(eq(agents.id, id));
  return agent || undefined;
};

export const getAllAgents = async (): Promise<Agent[]> => {
  return db.select().from(agents);
};

export const getAgentsByType = async (type: string): Promise<Agent[]> => {
  return db.select().from(agents).where(eq(agents.type, type as any));
};

export const createAgent = async (insertAgent: InsertAgent): Promise<Agent> => {
  const [agent] = await db.insert(agents).values(insertAgent).returning();
  return agent;
};

export const updateAgentStatus = async (id: string, status: string, currentTask?: string): Promise<void> => {
  await db
    .update(agents)
    .set({
      status: status as any,
      currentTask,
      lastActiveAt: new Date(),
    })
    .where(eq(agents.id, id));
};

export const updateAgentMetrics = async (id: string, successRate: string, totalOps: number): Promise<void> => {
  await db
    .update(agents)
    .set({
      successRate,
      totalOperations: totalOps,
    })
    .where(eq(agents.id, id));
};

// Agent Logs
export const createAgentLog = async (insertLog: InsertAgentLog): Promise<AgentLog> => {
  const [log] = await db.insert(agentLogs).values(insertLog).returning();
  return log;
};

export const getAgentLogs = async (agentId: string, limit: number = 100): Promise<AgentLog[]> => {
  return db
    .select()
    .from(agentLogs)
    .where(eq(agentLogs.agentId, agentId))
    .orderBy(desc(agentLogs.createdAt))
    .limit(limit);
};
