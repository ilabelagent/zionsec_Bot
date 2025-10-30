// Attack Log Service - Persistent real-time attack tracking
import * as fs from 'fs';
import * as path from 'path';

export interface AttackLog {
  id: string;
  timestamp: Date;
  attackType: string;
  target: string;
  sourceIp?: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'detected' | 'blocked' | 'mitigated' | 'investigating';
  details: {
    method?: string;
    payload?: string;
    impactedSystems?: string[];
    mitigationApplied?: string[];
  };
  metadata: {
    detectionEngine: string;
    confidence: number;
    falsePositive: boolean;
  };
}

export interface VulnerabilityReport {
  id: string;
  timestamp: Date;
  targetType: 'contract' | 'wallet' | 'url' | 'system';
  target: string;
  vulnerabilities: Array<{
    type: string;
    severity: string;
    cveId?: string;
    description: string;
    remediation: string;
  }>;
  riskScore: number;
  scanDuration: number;
}

export interface ThreatIntelligence {
  id: string;
  timestamp: Date;
  threatType: string;
  indicators: string[];
  source: string;
  confidence: number;
  activeThreats: number;
}

class AttackLogService {
  private attackLogs: AttackLog[] = [];
  private vulnerabilityReports: VulnerabilityReport[] = [];
  private threatIntel: ThreatIntelligence[] = [];
  private readonly logFile = path.join(__dirname, '../../database/attack-logs.json');
  private readonly vulnFile = path.join(__dirname, '../../database/vulnerability-reports.json');
  private readonly threatFile = path.join(__dirname, '../../database/threat-intel.json');

  constructor() {
    this.loadFromDisk();
  }

  private loadFromDisk(): void {
    try {
      // Load attack logs
      if (fs.existsSync(this.logFile)) {
        const data = fs.readFileSync(this.logFile, 'utf-8');
        this.attackLogs = JSON.parse(data).map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp)
        }));
        console.log(`[AttackLog] Loaded ${this.attackLogs.length} attack logs from disk`);
      }

      // Load vulnerability reports
      if (fs.existsSync(this.vulnFile)) {
        const data = fs.readFileSync(this.vulnFile, 'utf-8');
        this.vulnerabilityReports = JSON.parse(data).map((report: any) => ({
          ...report,
          timestamp: new Date(report.timestamp)
        }));
        console.log(`[AttackLog] Loaded ${this.vulnerabilityReports.length} vulnerability reports from disk`);
      }

      // Load threat intelligence
      if (fs.existsSync(this.threatFile)) {
        const data = fs.readFileSync(this.threatFile, 'utf-8');
        this.threatIntel = JSON.parse(data).map((intel: any) => ({
          ...intel,
          timestamp: new Date(intel.timestamp)
        }));
        console.log(`[AttackLog] Loaded ${this.threatIntel.length} threat intelligence entries from disk`);
      }
    } catch (error) {
      console.error('[AttackLog] Error loading from disk:', error);
    }
  }

  private saveToDisk(): void {
    try {
      const dbDir = path.dirname(this.logFile);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      fs.writeFileSync(this.logFile, JSON.stringify(this.attackLogs, null, 2));
      fs.writeFileSync(this.vulnFile, JSON.stringify(this.vulnerabilityReports, null, 2));
      fs.writeFileSync(this.threatFile, JSON.stringify(this.threatIntel, null, 2));
    } catch (error) {
      console.error('[AttackLog] Error saving to disk:', error);
    }
  }

  logAttack(attack: Omit<AttackLog, 'id' | 'timestamp'>): AttackLog {
    const log: AttackLog = {
      id: `ATK_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      timestamp: new Date(),
      ...attack
    };

    this.attackLogs.push(log);
    this.saveToDisk();

    console.log(`[AttackLog] Logged ${attack.attackType} attack on ${attack.target} - Status: ${attack.status}`);
    return log;
  }

  logVulnerability(report: Omit<VulnerabilityReport, 'id' | 'timestamp'>): VulnerabilityReport {
    const vuln: VulnerabilityReport = {
      id: `VULN_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      timestamp: new Date(),
      ...report
    };

    this.vulnerabilityReports.push(vuln);
    this.saveToDisk();

    console.log(`[AttackLog] Logged vulnerability report for ${report.target} - Risk: ${report.riskScore}/100`);
    return vuln;
  }

  logThreatIntelligence(intel: Omit<ThreatIntelligence, 'id' | 'timestamp'>): ThreatIntelligence {
    const threat: ThreatIntelligence = {
      id: `THREAT_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      timestamp: new Date(),
      ...intel
    };

    this.threatIntel.push(threat);
    this.saveToDisk();

    console.log(`[AttackLog] Logged threat intelligence: ${intel.threatType} from ${intel.source}`);
    return threat;
  }

  getAttackLogs(filters?: {
    startDate?: Date;
    endDate?: Date;
    severity?: string;
    status?: string;
    attackType?: string;
    limit?: number;
  }): AttackLog[] {
    let logs = [...this.attackLogs];

    if (filters) {
      if (filters.startDate) {
        logs = logs.filter(log => log.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        logs = logs.filter(log => log.timestamp <= filters.endDate!);
      }
      if (filters.severity) {
        logs = logs.filter(log => log.severity === filters.severity);
      }
      if (filters.status) {
        logs = logs.filter(log => log.status === filters.status);
      }
      if (filters.attackType) {
        logs = logs.filter(log => log.attackType.toLowerCase().includes(filters.attackType!.toLowerCase()));
      }
      if (filters.limit) {
        logs = logs.slice(-filters.limit);
      }
    }

    return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getVulnerabilityReports(filters?: {
    target?: string;
    targetType?: string;
    minRiskScore?: number;
    limit?: number;
  }): VulnerabilityReport[] {
    let reports = [...this.vulnerabilityReports];

    if (filters) {
      if (filters.target) {
        reports = reports.filter(r => r.target.toLowerCase().includes(filters.target!.toLowerCase()));
      }
      if (filters.targetType) {
        reports = reports.filter(r => r.targetType === filters.targetType);
      }
      if (filters.minRiskScore) {
        reports = reports.filter(r => r.riskScore >= filters.minRiskScore!);
      }
      if (filters.limit) {
        reports = reports.slice(-filters.limit);
      }
    }

    return reports.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getThreatIntelligence(filters?: {
    threatType?: string;
    minConfidence?: number;
    limit?: number;
  }): ThreatIntelligence[] {
    let intel = [...this.threatIntel];

    if (filters) {
      if (filters.threatType) {
        intel = intel.filter(t => t.threatType.toLowerCase().includes(filters.threatType!.toLowerCase()));
      }
      if (filters.minConfidence) {
        intel = intel.filter(t => t.confidence >= filters.minConfidence!);
      }
      if (filters.limit) {
        intel = intel.slice(-filters.limit);
      }
    }

    return intel.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getStatistics() {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const attacks24h = this.attackLogs.filter(log => log.timestamp >= last24h);
    const attacks7d = this.attackLogs.filter(log => log.timestamp >= last7d);

    const severityCounts = {
      critical: this.attackLogs.filter(log => log.severity === 'critical').length,
      high: this.attackLogs.filter(log => log.severity === 'high').length,
      medium: this.attackLogs.filter(log => log.severity === 'medium').length,
      low: this.attackLogs.filter(log => log.severity === 'low').length,
    };

    const statusCounts = {
      detected: this.attackLogs.filter(log => log.status === 'detected').length,
      blocked: this.attackLogs.filter(log => log.status === 'blocked').length,
      mitigated: this.attackLogs.filter(log => log.status === 'mitigated').length,
      investigating: this.attackLogs.filter(log => log.status === 'investigating').length,
    };

    return {
      totalAttacks: this.attackLogs.length,
      attacks24h: attacks24h.length,
      attacks7d: attacks7d.length,
      totalVulnerabilities: this.vulnerabilityReports.length,
      totalThreats: this.threatIntel.length,
      severityCounts,
      statusCounts,
      averageRiskScore: this.vulnerabilityReports.length > 0
        ? this.vulnerabilityReports.reduce((sum, r) => sum + r.riskScore, 0) / this.vulnerabilityReports.length
        : 0,
      activeThreats: this.threatIntel.reduce((sum, t) => sum + t.activeThreats, 0),
    };
  }

  clearLogs(olderThan?: Date): number {
    const originalLength = this.attackLogs.length;

    if (olderThan) {
      this.attackLogs = this.attackLogs.filter(log => log.timestamp >= olderThan);
      this.vulnerabilityReports = this.vulnerabilityReports.filter(r => r.timestamp >= olderThan);
      this.threatIntel = this.threatIntel.filter(t => t.timestamp >= olderThan);
    } else {
      this.attackLogs = [];
      this.vulnerabilityReports = [];
      this.threatIntel = [];
    }

    this.saveToDisk();
    const removed = originalLength - this.attackLogs.length;
    console.log(`[AttackLog] Cleared ${removed} logs`);
    return removed;
  }
}

export const attackLogService = new AttackLogService();
