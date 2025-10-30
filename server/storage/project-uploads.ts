
import { db } from "../db";
import { projectUploads, type ProjectUpload, type InsertProjectUpload } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

// Project Uploads (IPFS with guaranteed 2+ year storage)
export const getProjectUploadsByUserId = async (userId: string): Promise<ProjectUpload[]> => {
  return await db.query.projectUploads.findMany({
    where: eq(projectUploads.userId, userId),
    orderBy: [desc(projectUploads.createdAt)],
  });
};

export const getProjectUploadById = async (id: string): Promise<ProjectUpload | undefined> => {
  return await db.query.projectUploads.findFirst({
    where: eq(projectUploads.id, id),
  });
};

export const createProjectUpload = async (upload: InsertProjectUpload): Promise<ProjectUpload> => {
  const [created] = await db.insert(projectUploads).values(upload).returning();
  return created;
};

export const updateProjectPublishStatus = async (id: string, status: string, publishedAt: Date | null): Promise<ProjectUpload> => {
  const [updated] = await db.update(projectUploads)
    .set({ publishStatus: status as any, publishedAt })
    .where(eq(projectUploads.id, id))
    .returning();
  return updated;
};

export const incrementProjectViews = async (id: string): Promise<void> => {
  await db.update(projectUploads).set({ views: sql`${projectUploads.views} + 1` }).where(eq(projectUploads.id, id));
};

export const deleteProjectUpload = async (id: string): Promise<void> => {
  await db.delete(projectUploads).where(eq(projectUploads.id, id));
};
