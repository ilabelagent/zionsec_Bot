// Storage Service - Provides memory persistence for bots

interface TradingSystemMemory {
  botId: string;
  memoryType: string;
  memoryKey: string;
  memoryValue: any;
  importance: number;
  timestamp: Date;
}

class StorageService {
  private memories: TradingSystemMemory[] = [];

  async getTradingSystemMemory(botId: string): Promise<TradingSystemMemory[]> {
    return this.memories.filter(m => m.botId === botId);
  }

  async setTradingSystemMemory(
    botId: string,
    memoryType: string,
    memoryKey: string,
    memoryValue: any,
    importance: number
  ): Promise<void> {
    const existingIndex = this.memories.findIndex(
      m => m.botId === botId && m.memoryType === memoryType && m.memoryKey === memoryKey
    );

    const memory: TradingSystemMemory = {
      botId,
      memoryType,
      memoryKey,
      memoryValue,
      importance,
      timestamp: new Date(),
    };

    if (existingIndex >= 0) {
      this.memories[existingIndex] = memory;
    } else {
      this.memories.push(memory);
    }
  }

  async clearMemories(botId?: string): Promise<void> {
    if (botId) {
      this.memories = this.memories.filter(m => m.botId !== botId);
    } else {
      this.memories = [];
    }
  }

  getAllMemories(): TradingSystemMemory[] {
    return this.memories;
  }
}

export const storage = new StorageService();
