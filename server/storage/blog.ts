
import { db } from "../db";
import { blogPosts, type BlogPost, type InsertBlogPost } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

// Blog Posts
export const getBlogPost = async (id: string): Promise<BlogPost | undefined> => {
  const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
  return post || undefined;
};

export const getAllBlogPosts = async (): Promise<BlogPost[]> => {
  return db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
};

export const createBlogPost = async (insertPost: InsertBlogPost): Promise<BlogPost> => {
  const [post] = await db.insert(blogPosts).values(insertPost).returning();
  return post;
};
