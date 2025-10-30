/**
 * Shared Schema Types
 * Type definitions used across the application
 */

export interface Song {
  id: string;
  title: string;
  artist: string;
  audioFile: string;
  albumArt?: string;
  nftId?: string;
  tokenId?: string;
}

export interface Wallet {
  id: string;
  userId: string;
  address: string;
  encryptedPrivateKey?: string;
  network?: string;
  createdAt?: string;
}

export interface NFT {
  id: string;
  walletId: string;
  contractAddress: string;
  tokenId: string;
  name: string;
  description: string;
  imageUrl: string;
  metadata: any;
  network: string;
}

export interface Token {
  id: string;
  walletId: string;
  contractAddress: string;
  name: string;
  symbol: string;
  balance: string;
  network: string;
  tokenType: string;
}

export interface Release {
  id: string;
  title: string;
  artist: string;
  coverArt?: string;
  releaseDate: string;
  streams: number;
  likes: number;
  featured: boolean;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  imageUrl?: string;
  featured: boolean;
}

// Insert types (without id)
export type InsertSong = Omit<Song, 'id'>;
export type InsertWallet = Omit<Wallet, 'id'>;
export type InsertNFT = Omit<NFT, 'id'>;
export type InsertToken = Omit<Token, 'id'>;
export type InsertRelease = Omit<Release, 'id'>;
export type InsertEvent = Omit<Event, 'id'>;
