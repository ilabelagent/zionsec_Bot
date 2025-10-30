import { storage } from '../server/storage.js';

async function main() {
  try {
    console.log('\n=== VALIFI AGENTS TRAINING STATUS ===\n');

    // Get all bots
    const allBots = await storage.getAllBots(1000, 0);
    console.log('📊 Trading Bots:', allBots.length);
    const activeBots = allBots.filter(b => b.isActive).length;
    console.log('   - Active:', activeBots);
    console.log('   - Inactive:', allBots.length - activeBots);
    console.log('');

    // Get learning sessions for all bots
    let totalSessions = 0;
    let completedSessions = 0;
    let trainingSessions = 0;

    for (const bot of allBots.slice(0, 20)) { // Check first 20 bots
      const sessions = await storage.getBotLearningSessions(bot.id);
      totalSessions += sessions.length;
      completedSessions += sessions.filter(s => s.status === 'completed').length;
      trainingSessions += sessions.filter(s => s.status === 'training').length;
    }

    console.log('🎓 Learning Sessions:', totalSessions);
    console.log('   - Completed:', completedSessions);
    console.log('   - In Progress:', trainingSessions);
    console.log('');

    // Get skills for sample bots
    let totalSkills = 0;
    let totalXP = 0;
    const allSkills = [];

    for (const bot of allBots.slice(0, 20)) {
      const skills = await storage.getBotSkills(bot.id);
      totalSkills += skills.length;
      totalXP += skills.reduce((sum, s) => sum + (s.experiencePoints || 0), 0);
      allSkills.push(...skills);
    }

    console.log('⚡ Bot Skills:', totalSkills);
    console.log('   - Total XP Earned:', totalXP);

    if (allSkills.length > 0) {
      const avgLevel = allSkills.reduce((sum, s) => sum + (s.skillLevel || 0), 0) / allSkills.length;
      console.log('   - Average Skill Level:', avgLevel.toFixed(2));

      // Top skills
      const topSkills = allSkills
        .sort((a, b) => (b.skillLevel || 0) - (a.skillLevel || 0))
        .slice(0, 5);

      if (topSkills.length > 0) {
        console.log('   - Top 5 Skills:');
        topSkills.forEach(s => {
          console.log(`     • ${s.skillName}: Level ${s.skillLevel} (${s.experiencePoints} XP)`);
        });
      }
    }
    console.log('');

    // Get memory patterns for sample bots
    let totalMemory = 0;
    const allMemory = [];

    for (const bot of allBots.slice(0, 20)) {
      const memory = await storage.getTradingSystemMemory(bot.id);
      totalMemory += memory.length;
      allMemory.push(...memory);
    }

    console.log('🧠 Memory Patterns:', totalMemory);
    if (allMemory.length > 0) {
      const avgConfidence = allMemory.reduce((sum, m) => sum + parseFloat(m.confidence || '0'), 0) / allMemory.length;
      const avgSuccess = allMemory.reduce((sum, m) => sum + parseFloat(m.successRate || '0'), 0) / allMemory.length;
      console.log('   - Average Confidence:', avgConfidence.toFixed(2) + '%');
      console.log('   - Average Success Rate:', avgSuccess.toFixed(2) + '%');
    }
    console.log('');

    // Performance metrics
    const avgWinRate = allBots.reduce((sum, b) => sum + parseFloat(b.winRate || "0"), 0) / (allBots.length || 1);
    const avgSkillLevel = allBots.reduce((sum, b) => sum + (b.avgSkillLevel || 0), 0) / (allBots.length || 1);

    console.log('📈 Performance Metrics:');
    console.log('   - Average Win Rate:', avgWinRate.toFixed(2) + '%');
    console.log('   - Average Bot Skill Level:', avgSkillLevel.toFixed(2));
    console.log('');

    // Get agents count
    const agents = await storage.getAllAgents();
    console.log('🤖 AI Agents:', agents.length);
    const activeAgents = agents.filter(a => a.status === 'active').length;
    console.log('   - Active:', activeAgents);
    console.log('   - Inactive:', agents.length - activeAgents);
    console.log('');

    console.log('=== END OF REPORT ===\n');

  } catch (error) {
    console.error('Error fetching training status:', error);
    process.exit(1);
  }
}

main();
