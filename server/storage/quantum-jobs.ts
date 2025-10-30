
import { db } from "../db";
import { quantumJobs, type QuantumJob, type InsertQuantumJob } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

// Quantum Jobs
export const getQuantumJob = async (id: string): Promise<QuantumJob | undefined> => {
  const [job] = await db.select().from(quantumJobs).where(eq(quantumJobs.id, id));
  return job || undefined;
};

export const getQuantumJobsByUserId = async (userId: string): Promise<QuantumJob[]> => {
  return db
    .select()
    .from(quantumJobs)
    .where(eq(quantumJobs.userId, userId))
    .orderBy(desc(quantumJobs.createdAt));
};

export const createQuantumJob = async (insertJob: InsertQuantumJob): Promise<QuantumJob> => {
  const [job] = await db.insert(quantumJobs).values(insertJob).returning();
  return job;
};

export const updateQuantumJobStatus = async (id: string, status: string, result?: any): Promise<void> => {
  const updates: any = { status };
  if (result) updates.result = result;
  if (status === "completed" || status === "failed") updates.completedAt = new Date();
  await db.update(quantumJobs).set(updates).where(eq(quantumJobs.id, id));
};
