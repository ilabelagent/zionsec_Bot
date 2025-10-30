import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from '../shared/schema.js';

async function checkTrainingStatus() {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/valifi"
  });

  try {
    await client.connect();
    const db = drizzle(client, { schema });

    console.log('=== AGENTS TRAINING STATUS ===\n');

    // Get all bots
    const bots = await db.select().from(schema.tradingBots);
    console.log('📊 Total Trading Bots:', bots.length);
    console.log('');

    // Get learning sessions
    const learningSessions = await db.select().from(schema.botLearningSession);
    console.log('🎓 Learning Sessions:', learningSessions.length);
    if (learningSessions.length > 0) {
      const completed = learningSessions.filter(s => s.status === 'completed').length;
      const training = learningSessions.filter(s => s.status === 'training').length;
      console.log('  - Completed:', completed);
      console.log('  - In Progress:', training);

      // Show recent sessions
      const recentSessions = learningSessions.slice(-3);
      console.log('  - Recent Sessions:');
      recentSessions.forEach(s => {
        console.log(`    • ${s.sessionType} - ${s.status} (${s.improvementRate ? s.improvementRate + '% improvement' : 'in progress'})`);
      });
    }
    console.log('');

    // Get training data
    const trainingData = await db.select().from(schema.botTrainingData);
    console.log('📝 Training Data Records:', trainingData.length);
    console.log('');

    // Get bot skills
    const skills = await db.select().from(schema.botSkills);
    console.log('⚡ Bot Skills Developed:', skills.length);
    if (skills.length > 0) {
      const avgLevel = skills.reduce((sum, s) => sum + (s.skillLevel || 0), 0) / skills.length;
      const totalXP = skills.reduce((sum, s) => sum + (s.experiencePoints || 0), 0);
      console.log('  - Average Skill Level:', avgLevel.toFixed(2));
      console.log('  - Total XP Earned:', totalXP);

      // Top skills
      const topSkills = skills.sort((a, b) => (b.skillLevel || 0) - (a.skillLevel || 0)).slice(0, 5);
      if (topSkills.length > 0) {
        console.log('  - Top Skills:');
        topSkills.forEach(s => {
          console.log(`    • ${s.skillName}: Level ${s.skillLevel} (${s.experiencePoints} XP)`);
        });
      }
    }
    console.log('');

    // Get memory patterns
    const memory = await db.select().from(schema.tradingSystemMemory);
    console.log('🧠 Memory Patterns Stored:', memory.length);
    if (memory.length > 0) {
      const avgConfidence = memory.reduce((sum, m) => sum + parseFloat(m.confidence || '0'), 0) / memory.length;
      const avgSuccess = memory.reduce((sum, m) => sum + parseFloat(m.successRate || '0'), 0) / memory.length;
      console.log('  - Average Confidence:', avgConfidence.toFixed(2) + '%');
      console.log('  - Average Success Rate:', avgSuccess.toFixed(2) + '%');
    }
    console.log('');

    // Get agent stats
    const agents = await db.select().from(schema.agents);
    console.log('🤖 Total AI Agents:', agents.length);
    if (agents.length > 0) {
      const active = agents.filter(a => a.status === 'active').length;
      console.log('  - Active:', active);
      console.log('  - Inactive:', agents.length - active);
    }

  } catch (error) {
    console.error('Error querying training status:', error);
  } finally {
    await client.end();
  }
}

checkTrainingStatus();
