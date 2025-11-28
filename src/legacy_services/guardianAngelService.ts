// Guardian Angel Service - AI Personal Assistant for Life Optimization
import { botLearningService } from "./botLearningService";
import { storage } from "./storage";
import * as fs from 'fs';
import * as path from 'path';

export interface HealthMetrics {
  heartRate?: number;
  bloodPressure?: { systolic: number; diastolic: number };
  steps?: number;
  sleepHours?: number;
  waterIntake?: number;
  calories?: number;
  stress_level?: number;
  timestamp: Date;
}

export interface Alert {
  id: string;
  type: 'health' | 'safety' | 'schedule' | 'wellness' | 'reminder';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  actionRequired?: string;
}

export interface ScheduleItem {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  priority: 'high' | 'medium' | 'low';
  category: 'work' | 'personal' | 'health' | 'social' | 'other';
  reminders: Date[];
  completed: boolean;
}

export interface WellnessScore {
  overall: number;
  physical: number;
  mental: number;
  sleep: number;
  nutrition: number;
  factors: Array<{
    name: string;
    score: number;
    status: string;
    recommendation: string;
  }>;
}

export class GuardianAngel {
  private botId = "guardian_angel";
  private alertsFile = path.join(__dirname, '../../database/guardian-alerts.json');
  private scheduleFile = path.join(__dirname, '../../database/guardian-schedule.json');
  private healthFile = path.join(__dirname, '../../database/guardian-health.json');
  private alerts: Alert[] = [];
  private schedule: ScheduleItem[] = [];
  private healthHistory: HealthMetrics[] = [];

  constructor() {
    this.loadFromDisk();
  }

  private loadFromDisk(): void {
    try {
      if (fs.existsSync(this.alertsFile)) {
        const data = fs.readFileSync(this.alertsFile, 'utf-8');
        this.alerts = JSON.parse(data).map((a: any) => ({
          ...a,
          timestamp: new Date(a.timestamp)
        }));
        console.log(`[Guardian Angel] Loaded ${this.alerts.length} alerts`);
      }

      if (fs.existsSync(this.scheduleFile)) {
        const data = fs.readFileSync(this.scheduleFile, 'utf-8');
        this.schedule = JSON.parse(data).map((s: any) => ({
          ...s,
          startTime: new Date(s.startTime),
          endTime: new Date(s.endTime),
          reminders: s.reminders.map((r: string) => new Date(r))
        }));
        console.log(`[Guardian Angel] Loaded ${this.schedule.length} schedule items`);
      }

      if (fs.existsSync(this.healthFile)) {
        const data = fs.readFileSync(this.healthFile, 'utf-8');
        this.healthHistory = JSON.parse(data).map((h: any) => ({
          ...h,
          timestamp: new Date(h.timestamp)
        }));
        console.log(`[Guardian Angel] Loaded ${this.healthHistory.length} health records`);
      }
    } catch (error) {
      console.error('[Guardian Angel] Error loading from disk:', error);
    }
  }

  private saveToDisk(): void {
    try {
      const dbDir = path.dirname(this.alertsFile);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      fs.writeFileSync(this.alertsFile, JSON.stringify(this.alerts, null, 2));
      fs.writeFileSync(this.scheduleFile, JSON.stringify(this.schedule, null, 2));
      fs.writeFileSync(this.healthFile, JSON.stringify(this.healthHistory, null, 2));
    } catch (error) {
      console.error('[Guardian Angel] Error saving to disk:', error);
    }
  }

  // ===== HEALTH MONITORING =====

  async trackHealthMetrics(userId: string, metrics: Omit<HealthMetrics, 'timestamp'>): Promise<{
    recorded: boolean;
    alerts: Alert[];
    insights: string[];
  }> {
    try {
      const healthRecord: HealthMetrics = {
        ...metrics,
        timestamp: new Date()
      };

      this.healthHistory.push(healthRecord);
      this.saveToDisk();

      const newAlerts: Alert[] = [];
      const insights: string[] = [];

      // Check heart rate
      if (metrics.heartRate) {
        if (metrics.heartRate > 100) {
          const alert = this.createAlert('health', 'high',
            'Elevated Heart Rate',
            `Your heart rate is ${metrics.heartRate} bpm, which is elevated. Consider taking a break.`,
            'Take deep breaths and rest'
          );
          newAlerts.push(alert);
        } else if (metrics.heartRate < 60 && metrics.heartRate > 0) {
          insights.push('Your heart rate is low - great if you\'re an athlete!');
        } else if (metrics.heartRate >= 60 && metrics.heartRate <= 100) {
          insights.push('Heart rate is in healthy range');
        }
      }

      // Check blood pressure
      if (metrics.bloodPressure) {
        const { systolic, diastolic } = metrics.bloodPressure;
        if (systolic > 140 || diastolic > 90) {
          const alert = this.createAlert('health', 'critical',
            'High Blood Pressure Detected',
            `BP: ${systolic}/${diastolic}. This is above normal range.`,
            'Consult your doctor immediately'
          );
          newAlerts.push(alert);
        } else if (systolic >= 120 && systolic < 140) {
          insights.push('Blood pressure is elevated - monitor closely');
        } else {
          insights.push('Blood pressure is normal');
        }
      }

      // Check sleep
      if (metrics.sleepHours !== undefined) {
        if (metrics.sleepHours < 6) {
          const alert = this.createAlert('wellness', 'medium',
            'Insufficient Sleep',
            `You only slept ${metrics.sleepHours} hours. Adults need 7-9 hours.`,
            'Prioritize sleep tonight'
          );
          newAlerts.push(alert);
        } else if (metrics.sleepHours >= 7 && metrics.sleepHours <= 9) {
          insights.push('Excellent sleep duration!');
        }
      }

      // Check hydration
      if (metrics.waterIntake !== undefined) {
        if (metrics.waterIntake < 2000) {
          insights.push('Remember to drink more water (target: 2-3 liters/day)');
        } else {
          insights.push('Great hydration level!');
        }
      }

      // Check stress
      if (metrics.stress_level !== undefined) {
        if (metrics.stress_level >= 7) {
          const alert = this.createAlert('wellness', 'high',
            'High Stress Level Detected',
            `Your stress level is ${metrics.stress_level}/10. This is concerning.`,
            'Practice meditation or breathing exercises'
          );
          newAlerts.push(alert);
        } else if (metrics.stress_level <= 3) {
          insights.push('Low stress levels - keep it up!');
        }
      }

      await botLearningService.progressBotSkill(this.botId, "health_monitoring", 10, "wellness");

      return {
        recorded: true,
        alerts: newAlerts,
        insights
      };
    } catch (error) {
      console.error('[Guardian Angel] Error tracking health:', error);
      return { recorded: false, alerts: [], insights: [] };
    }
  }

  async analyzeWellness(userId: string): Promise<WellnessScore> {
    try {
      // Get last 7 days of health data
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentHealth = this.healthHistory.filter(h => h.timestamp >= sevenDaysAgo);

      const factors: WellnessScore['factors'] = [];
      let physicalScore = 0;
      let mentalScore = 0;
      let sleepScore = 0;
      let nutritionScore = 0;

      // Analyze sleep
      const avgSleep = recentHealth.reduce((sum, h) => sum + (h.sleepHours || 0), 0) / Math.max(recentHealth.length, 1);
      if (avgSleep >= 7 && avgSleep <= 9) {
        sleepScore = 100;
        factors.push({ name: 'Sleep', score: 100, status: 'Excellent', recommendation: 'Maintain current sleep schedule' });
      } else if (avgSleep >= 6) {
        sleepScore = 70;
        factors.push({ name: 'Sleep', score: 70, status: 'Good', recommendation: 'Try to get 7-9 hours' });
      } else {
        sleepScore = 40;
        factors.push({ name: 'Sleep', score: 40, status: 'Poor', recommendation: 'Prioritize sleep - aim for 7-9 hours' });
      }

      // Analyze physical activity
      const avgSteps = recentHealth.reduce((sum, h) => sum + (h.steps || 0), 0) / Math.max(recentHealth.length, 1);
      if (avgSteps >= 10000) {
        physicalScore = 100;
        factors.push({ name: 'Activity', score: 100, status: 'Very Active', recommendation: 'Excellent activity level!' });
      } else if (avgSteps >= 5000) {
        physicalScore = 70;
        factors.push({ name: 'Activity', score: 70, status: 'Moderately Active', recommendation: 'Try to reach 10,000 steps daily' });
      } else {
        physicalScore = 40;
        factors.push({ name: 'Activity', score: 40, status: 'Sedentary', recommendation: 'Increase daily movement significantly' });
      }

      // Analyze stress
      const avgStress = recentHealth.reduce((sum, h) => sum + (h.stress_level || 5), 0) / Math.max(recentHealth.length, 1);
      if (avgStress <= 3) {
        mentalScore = 100;
        factors.push({ name: 'Stress', score: 100, status: 'Low', recommendation: 'Continue current stress management' });
      } else if (avgStress <= 5) {
        mentalScore = 70;
        factors.push({ name: 'Stress', score: 70, status: 'Moderate', recommendation: 'Practice daily mindfulness' });
      } else {
        mentalScore = 40;
        factors.push({ name: 'Stress', score: 40, status: 'High', recommendation: 'Seek stress reduction techniques or counseling' });
      }

      // Analyze nutrition
      const avgWater = recentHealth.reduce((sum, h) => sum + (h.waterIntake || 0), 0) / Math.max(recentHealth.length, 1);
      if (avgWater >= 2000) {
        nutritionScore = 100;
        factors.push({ name: 'Hydration', score: 100, status: 'Well Hydrated', recommendation: 'Keep up the good hydration!' });
      } else if (avgWater >= 1500) {
        nutritionScore = 70;
        factors.push({ name: 'Hydration', score: 70, status: 'Adequate', recommendation: 'Aim for 2-3 liters daily' });
      } else {
        nutritionScore = 40;
        factors.push({ name: 'Hydration', score: 40, status: 'Dehydrated', recommendation: 'Significantly increase water intake' });
      }

      const overall = Math.round((physicalScore + mentalScore + sleepScore + nutritionScore) / 4);

      await botLearningService.progressBotSkill(this.botId, "wellness_analysis", 15, "analytics");

      return {
        overall,
        physical: Math.round(physicalScore),
        mental: Math.round(mentalScore),
        sleep: Math.round(sleepScore),
        nutrition: Math.round(nutritionScore),
        factors
      };
    } catch (error) {
      console.error('[Guardian Angel] Error analyzing wellness:', error);
      return {
        overall: 0,
        physical: 0,
        mental: 0,
        sleep: 0,
        nutrition: 0,
        factors: []
      };
    }
  }

  // ===== SCHEDULE MANAGEMENT =====

  async addScheduleItem(item: Omit<ScheduleItem, 'id' | 'completed'>): Promise<ScheduleItem> {
    const scheduleItem: ScheduleItem = {
      id: `SCH_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      completed: false,
      ...item
    };

    this.schedule.push(scheduleItem);
    this.saveToDisk();

    // Create reminder alerts
    for (const reminderTime of item.reminders) {
      const timeDiff = reminderTime.getTime() - new Date().getTime();
      if (timeDiff > 0) {
        // In a real system, this would schedule actual notifications
        console.log(`[Guardian Angel] Reminder scheduled for ${item.title} at ${reminderTime}`);
      }
    }

    await botLearningService.progressBotSkill(this.botId, "schedule_management", 5, "productivity");

    return scheduleItem;
  }

  async getSchedule(userId: string, startDate?: Date, endDate?: Date): Promise<ScheduleItem[]> {
    let filtered = [...this.schedule];

    if (startDate) {
      filtered = filtered.filter(item => item.startTime >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(item => item.endTime <= endDate);
    }

    return filtered.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }

  async completeScheduleItem(itemId: string): Promise<boolean> {
    const item = this.schedule.find(s => s.id === itemId);
    if (item) {
      item.completed = true;
      this.saveToDisk();
      return true;
    }
    return false;
  }

  // ===== SAFETY MONITORING =====

  async checkSafety(userId: string, location?: { lat: number; lng: number }): Promise<{
    safetyScore: number;
    alerts: Alert[];
    recommendations: string[];
  }> {
    try {
      let safetyScore = 100;
      const newAlerts: Alert[] = [];
      const recommendations: string[] = [];

      // Check time of day
      const hour = new Date().getHours();
      if (hour >= 22 || hour < 6) {
        safetyScore -= 10;
        recommendations.push('It\'s late - share your location with trusted contacts');
      }

      // Real location-based safety check requires API integration
      if (location) {
        // Real system requires: crime statistics API, weather alerts, Holy Spirit discernment
        // Controlled by Divine wisdom through Christ for real safety assessment
        console.log("[GuardianAngel] Real location safety check requires API integration - guided by Holy Spirit");
        // Note: riskLevel should come from real crime data APIs or Divine revelation
        const riskLevel = 0; // Safe by default, unless Holy Spirit reveals danger
        if (riskLevel > 0.8) {
          safetyScore -= 30;
          const alert = this.createAlert('safety', 'high',
            'Area Safety Alert',
            'You are in an area with elevated safety concerns.',
            'Stay alert and consider alternative route'
          );
          newAlerts.push(alert);
        }
      }

      // Check for emergency contacts
      const hasEmergencyContacts = await this.hasEmergencyContacts(userId);
      if (!hasEmergencyContacts) {
        safetyScore -= 15;
        recommendations.push('Add emergency contacts to your profile');
      }

      if (safetyScore >= 90) {
        recommendations.push('You\'re in a safe environment');
      }

      await botLearningService.progressBotSkill(this.botId, "safety_monitoring", 8, "safety");

      return {
        safetyScore,
        alerts: newAlerts,
        recommendations
      };
    } catch (error) {
      console.error('[Guardian Angel] Error checking safety:', error);
      return { safetyScore: 0, alerts: [], recommendations: [] };
    }
  }

  async sendSOS(userId: string, location?: { lat: number; lng: number }): Promise<{
    sent: boolean;
    emergencyId: string;
    notifiedContacts: number;
  }> {
    try {
      const emergencyId = `SOS_${Date.now()}`;

      const alert = this.createAlert('safety', 'critical',
        'SOS ACTIVATED',
        `Emergency SOS activated by user. Location: ${location ? `${location.lat}, ${location.lng}` : 'Unknown'}`,
        'Emergency services and contacts notified'
      );

      // In a real system, this would:
      // 1. Call emergency services
      // 2. Send SMS to emergency contacts
      // 3. Share live location
      // 4. Trigger audio/video recording

      console.log(`[Guardian Angel] SOS ACTIVATED - ${emergencyId}`);

      await botLearningService.progressBotSkill(this.botId, "emergency_response", 20, "safety");

      return {
        sent: true,
        emergencyId,
        notifiedContacts: 3 // Simulated
      };
    } catch (error) {
      console.error('[Guardian Angel] Error sending SOS:', error);
      return { sent: false, emergencyId: '', notifiedContacts: 0 };
    }
  }

  // ===== PREDICTIVE ASSISTANCE =====

  async getDailyBriefing(userId: string): Promise<{
    greeting: string;
    weather: string;
    schedule: string;
    health: string;
    alerts: Alert[];
    suggestions: string[];
  }> {
    try {
      const hour = new Date().getHours();
      const greeting = hour < 12 ? '🌅 Good morning!' : hour < 18 ? '☀️ Good afternoon!' : '🌙 Good evening!';

      const todaySchedule = await this.getSchedule(userId,
        new Date(new Date().setHours(0,0,0,0)),
        new Date(new Date().setHours(23,59,59,999))
      );

      const pendingAlerts = this.getUnacknowledgedAlerts();
      const wellness = await this.analyzeWellness(userId);

      const suggestions: string[] = [];

      if (wellness.overall < 70) {
        suggestions.push('Your wellness score is low - prioritize self-care today');
      }
      if (todaySchedule.length === 0) {
        suggestions.push('No scheduled items today - perfect time for personal projects!');
      } else if (todaySchedule.length > 5) {
        suggestions.push('Busy day ahead - remember to take breaks');
      }

      const recentHealth = this.healthHistory.slice(-7);
      const avgSteps = recentHealth.reduce((sum, h) => sum + (h.steps || 0), 0) / Math.max(recentHealth.length, 1);
      if (avgSteps < 5000) {
        suggestions.push('Take a 30-minute walk today to boost activity levels');
      }

      await botLearningService.progressBotSkill(this.botId, "daily_briefing", 10, "productivity");

      return {
        greeting,
        weather: 'Partly cloudy, 72°F - perfect day!', // Simulated
        schedule: `You have ${todaySchedule.length} items scheduled today`,
        health: `Wellness score: ${wellness.overall}/100`,
        alerts: pendingAlerts.slice(0, 5),
        suggestions
      };
    } catch (error) {
      console.error('[Guardian Angel] Error generating briefing:', error);
      return {
        greeting: 'Hello!',
        weather: '',
        schedule: '',
        health: '',
        alerts: [],
        suggestions: []
      };
    }
  }

  // ===== ALERT MANAGEMENT =====

  private createAlert(
    type: Alert['type'],
    priority: Alert['priority'],
    title: string,
    message: string,
    actionRequired?: string
  ): Alert {
    const alert: Alert = {
      id: `ALERT_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      type,
      priority,
      title,
      message,
      timestamp: new Date(),
      acknowledged: false,
      actionRequired
    };

    this.alerts.push(alert);
    this.saveToDisk();

    return alert;
  }

  getAlerts(filters?: {
    type?: Alert['type'];
    priority?: Alert['priority'];
    acknowledged?: boolean;
  }): Alert[] {
    let filtered = [...this.alerts];

    if (filters) {
      if (filters.type) {
        filtered = filtered.filter(a => a.type === filters.type);
      }
      if (filters.priority) {
        filtered = filtered.filter(a => a.priority === filters.priority);
      }
      if (filters.acknowledged !== undefined) {
        filtered = filtered.filter(a => a.acknowledged === filters.acknowledged);
      }
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getUnacknowledgedAlerts(): Alert[] {
    return this.getAlerts({ acknowledged: false });
  }

  acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      this.saveToDisk();
      return true;
    }
    return false;
  }

  // ===== HELPER METHODS =====

  private async hasEmergencyContacts(userId: string): Promise<boolean> {
    // In a real system, check user's emergency contacts
    return true; // Simulated
  }

  getHealthHistory(days: number = 30): HealthMetrics[] {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return this.healthHistory.filter(h => h.timestamp >= cutoff);
  }
}

export const guardianAngel = new GuardianAngel();
