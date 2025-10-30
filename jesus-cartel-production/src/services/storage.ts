/**
 * Storage Service - In-memory data storage
 * This is a simplified version for standalone deployment
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

export interface StreamData {
  releaseId: string;
  userId?: string;
  duration?: number;
  completionRate?: string;
}

class StorageService {
  private songs: Map<string, Song> = new Map();
  private wallets: Map<string, Wallet> = new Map();
  private nfts: Map<string, NFT> = new Map();
  private tokens: Map<string, Token> = new Map();
  private releases: Map<string, Release> = new Map();
  private events: Map<string, Event> = new Map();

  // Song operations
  async getSong(id: string): Promise<Song | null> {
    return this.songs.get(id) || null;
  }

  async createSong(song: Omit<Song, 'id'>): Promise<Song> {
    const id = this.generateId();
    const newSong = { id, ...song };
    this.songs.set(id, newSong);
    return newSong;
  }

  async updateSongPublication(songId: string, nftId?: string, tokenId?: string): Promise<void> {
    const song = this.songs.get(songId);
    if (song) {
      if (nftId) song.nftId = nftId;
      if (tokenId) song.tokenId = tokenId;
      this.songs.set(songId, song);
    }
  }

  async getAllSongs(): Promise<Song[]> {
    return Array.from(this.songs.values());
  }

  // Wallet operations
  async getWallet(id: string): Promise<Wallet | null> {
    return this.wallets.get(id) || null;
  }

  async createWallet(wallet: Omit<Wallet, 'id'>): Promise<Wallet> {
    const id = this.generateId();
    const newWallet = { id, ...wallet };
    this.wallets.set(id, newWallet);
    return newWallet;
  }

  // NFT operations
  async createNft(nft: Omit<NFT, 'id'>): Promise<NFT> {
    const id = this.generateId();
    const newNft = { id, ...nft };
    this.nfts.set(id, newNft);
    return newNft;
  }

  async getNft(id: string): Promise<NFT | null> {
    return this.nfts.get(id) || null;
  }

  // Token operations
  async createToken(token: Omit<Token, 'id'>): Promise<Token> {
    const id = this.generateId();
    const newToken = { id, ...token };
    this.tokens.set(id, newToken);
    return newToken;
  }

  async getToken(id: string): Promise<Token | null> {
    return this.tokens.get(id) || null;
  }

  // Release operations
  async getLatestReleases(limit: number = 10): Promise<Release[]> {
    return Array.from(this.releases.values())
      .sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime())
      .slice(0, limit);
  }

  async getFeaturedReleases(): Promise<Release[]> {
    return Array.from(this.releases.values()).filter(r => r.featured);
  }

  async getRelease(id: string): Promise<Release | null> {
    return this.releases.get(id) || null;
  }

  async incrementLikeCount(releaseId: string): Promise<void> {
    const release = this.releases.get(releaseId);
    if (release) {
      release.likes += 1;
      this.releases.set(releaseId, release);
    }
  }

  // Event operations
  async getUpcomingEvents(limit: number = 10): Promise<Event[]> {
    const now = new Date();
    return Array.from(this.events.values())
      .filter(e => new Date(e.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, limit);
  }

  async getFeaturedEvents(): Promise<Event[]> {
    return Array.from(this.events.values()).filter(e => e.featured);
  }

  async getEvent(id: string): Promise<Event | null> {
    return this.events.get(id) || null;
  }

  // Stream tracking
  async trackStream(data: StreamData): Promise<void> {
    const release = this.releases.get(data.releaseId);
    if (release) {
      release.streams += 1;
      this.releases.set(data.releaseId, release);
    }
  }

  // Helper
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
}

export const storage = new StorageService();
