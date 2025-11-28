// Bot Learning Service - Handles skill progression and memory management

interface SkillProgress {
  botId: string;
  skillName: string;
  level: number;
  experience: number;
  category: string;
}

interface ExecutionRecord {
  botId: string;
  action: string;
  input: any;
  output: any;
  success: boolean;
  reward: number;
  timestamp: Date;
}

interface BotMemory {
  botId: string;
  memoryType: string;
  memoryKey: string;
  memoryValue: any;
  importance: number;
  timestamp: Date;
}

class BotLearningService {
  private skills: Map<string, SkillProgress> = new Map();
  private executions: ExecutionRecord[] = [];
  private memories: BotMemory[] = [];

  async learnFromExecution(
    botId: string,
    action: string,
    input: any,
    output: any,
    success: boolean,
    reward: number
  ): Promise<void> {
    const execution: ExecutionRecord = {
      botId,
      action,
      input,
      output,
      success,
      reward,
      timestamp: new Date(),
    };

    this.executions.push(execution);
    console.log(`[BotLearning] ${botId} learned from ${action}: success=${success}, reward=${reward}`);
  }

  async progressBotSkill(
    botId: string,
    skillName: string,
    experienceGain: number,
    category: string
  ): Promise<void> {
    const skillKey = `${botId}:${skillName}`;
    let skill = this.skills.get(skillKey);

    if (!skill) {
      skill = {
        botId,
        skillName,
        level: 1,
        experience: 0,
        category,
      };
    }

    skill.experience += experienceGain;

    // Level up every 100 experience points
    const maxSkillLevel = parseInt(process.env.MAX_SKILL_LEVEL || "10");
    while (skill.experience >= 100 && skill.level < maxSkillLevel) {
      skill.experience -= 100;
      skill.level++;
      console.log(`[BotLearning] ${botId} leveled up ${skillName} to level ${skill.level}!`);
    }

    this.skills.set(skillKey, skill);
  }

  async updateBotMemory(
    botId: string,
    memoryType: string,
    memoryKey: string,
    memoryValue: any,
    importance: number
  ): Promise<void> {
    const existingIndex = this.memories.findIndex(
      m => m.botId === botId && m.memoryType === memoryType && m.memoryKey === memoryKey
    );

    const memory: BotMemory = {
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

    console.log(`[BotLearning] ${botId} updated memory: ${memoryType}/${memoryKey}`);
  }

  getSkills(botId?: string): SkillProgress[] {
    const allSkills = Array.from(this.skills.values());
    return botId ? allSkills.filter(s => s.botId === botId) : allSkills;
  }

  getExecutions(botId?: string): ExecutionRecord[] {
    return botId ? this.executions.filter(e => e.botId === botId) : this.executions;
  }

  getMemories(botId?: string): BotMemory[] {
    return botId ? this.memories.filter(m => m.botId === botId) : this.memories;
  }
}

export const botLearningService = new BotLearningService();
