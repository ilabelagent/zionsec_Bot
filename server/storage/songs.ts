
import { db } from "../db";
import { songs, type Song, type InsertSong, nfts, tokens } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export const getSong = async (id: string): Promise<Song | undefined> => {
  const [song] = await db.select().from(songs).where(eq(songs.id, id));
  return song || undefined;
};

export const getSongsByUserId = async (userId: string): Promise<Song[]> => {
  return db.select().from(songs).where(eq(songs.userId, userId));
};

export const getSongsWithDetailsByUserId = async (userId: string): Promise<any[]> => {
  const songsWithDetails = await db
    .select({
      song: songs,
      nft: nfts,
      token: tokens,
    })
    .from(songs)
    .leftJoin(nfts, eq(songs.nftId, nfts.id))
    .leftJoin(tokens, eq(songs.tokenId, tokens.id))
    .where(eq(songs.userId, userId));
  
  return songsWithDetails.map(row => ({
    ...row.song,
    nftDetails: row.nft,
    tokenDetails: row.token,
  }));
};

export const createSong = async (insertSong: InsertSong): Promise<Song> => {
  const [song] = await db.insert(songs).values(insertSong).returning();
  return song;
};

export const updateSongPublication = async (id: string, nftId?: string, tokenId?: string): Promise<void> => {
  await db
    .update(songs)
    .set({
      nftId,
      tokenId,
      isPublished: true,
      publishedAt: new Date(),
    })
    .where(eq(songs.id, id));
};
