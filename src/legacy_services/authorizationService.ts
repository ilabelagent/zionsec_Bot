import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

/**
 * GodBrainAI Authorization Service
 *
 * CRITICAL: This service enforces legal authorization for all offensive security operations.
 * NO OPERATION MAY PROCEED without proper authorization documents and engagement tracking.
 *
 * "Render unto Caesar the things that are Caesar's" - Matthew 22:21
 * We operate within the law, honoring earthly authorities while serving divine purpose.
 */

export interface Engagement {
  id: string;
  name: string;
  clientName: string;
  clientContact: string;
  clientEmail: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  authorizationDocPath: string; // Path to signed authorization document
  rulesOfEngagement: RulesOfEngagement;
  scope: EngagementScope;
  authorizedBy: string;
  authorizedAt: string;
  createdAt: string;
  updatedAt: string;
  evidenceChainId: string; // For forensic integrity
}

export interface RulesOfEngagement {
  allowedAttackTypes: string[];
  restrictedActions: string[];
  allowedTimeWindows: TimeWindow[];
  allowedSourceIPs: string[];
  emergencyStopProcedure: string;
  escalationContacts: Contact[];
  dataHandlingRequirements: string[];
  reportingRequirements: string[];
}

export interface TimeWindow {
  dayOfWeek: string[];
  startTime: string; // HH:MM format
  endTime: string;
  timezone: string;
}

export interface Contact {
  name: string;
  role: string;
  email: string;
  phone: string;
}

export interface EngagementScope {
  targetDomains: string[];
  targetIPs: string[];
  targetSubnets: string[];
  targetApplications: string[];
  excludedAssets: string[];
  targetDescription: string;
  complianceFrameworks: string[]; // PCI-DSS, HIPAA, ISO 27001, etc.
}

export interface AuthorizationCheck {
  authorized: boolean;
  engagementId?: string;
  reason?: string;
  restrictions?: string[];
}

export interface AuditLog {
  id: string;
  engagementId: string;
  timestamp: string;
  action: string;
  target: string;
  operator: string;
  result: 'success' | 'failure' | 'blocked';
  details: any;
  evidenceHash: string; // SHA-256 of evidence
}

class AuthorizationService {
  private dataDir: string;
  private engagementsFile: string;
  private auditLogFile: string;
  private engagements: Map<string, Engagement>;
  private auditLogs: AuditLog[];

  constructor() {
    this.dataDir = path.join(__dirname, '../../database');
    this.engagementsFile = path.join(this.dataDir, 'engagements.json');
    this.auditLogFile = path.join(this.dataDir, 'authorization-audit.json');
    this.engagements = new Map();
    this.auditLogs = [];
    this.loadData();
  }

  private loadData(): void {
    try {
      if (fs.existsSync(this.engagementsFile)) {
        const data = JSON.parse(fs.readFileSync(this.engagementsFile, 'utf-8'));
        this.engagements = new Map(Object.entries(data));
      }
      if (fs.existsSync(this.auditLogFile)) {
        this.auditLogs = JSON.parse(fs.readFileSync(this.auditLogFile, 'utf-8'));
      }
    } catch (error) {
      console.error('⚠️ Failed to load authorization data:', error);
    }
  }

  private saveData(): void {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }

      const engagementsObj = Object.fromEntries(this.engagements);
      fs.writeFileSync(this.engagementsFile, JSON.stringify(engagementsObj, null, 2));
      fs.writeFileSync(this.auditLogFile, JSON.stringify(this.auditLogs, null, 2));
    } catch (error) {
      console.error('⚠️ Failed to save authorization data:', error);
    }
  }

  /**
   * Create a new penetration testing engagement with legal authorization
   */
  createEngagement(params: {
    name: string;
    clientName: string;
    clientContact: string;
    clientEmail: string;
    startDate: string;
    endDate: string;
    authorizationDocPath: string;
    rulesOfEngagement: RulesOfEngagement;
    scope: EngagementScope;
    authorizedBy: string;
  }): Engagement {
    const engagementId = `ENG-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const evidenceChainId = crypto.randomBytes(16).toString('hex');

    const engagement: Engagement = {
      id: engagementId,
      ...params,
      status: 'pending',
      authorizedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      evidenceChainId,
    };

    this.engagements.set(engagementId, engagement);
    this.saveData();

    this.logAudit({
      engagementId,
      action: 'CREATE_ENGAGEMENT',
      target: params.clientName,
      operator: params.authorizedBy,
      result: 'success',
      details: { scope: params.scope },
    });

    console.log(`✅ Engagement created: ${engagementId}`);
    console.log(`📋 Client: ${params.clientName}`);
    console.log(`⚖️ Authorized by: ${params.authorizedBy}`);

    return engagement;
  }

  /**
   * Activate an engagement after all prerequisites are met
   */
  activateEngagement(engagementId: string, operator: string): boolean {
    const engagement = this.engagements.get(engagementId);
    if (!engagement) {
      console.error(`❌ Engagement not found: ${engagementId}`);
      return false;
    }

    if (engagement.status === 'active') {
      console.warn(`⚠️ Engagement already active: ${engagementId}`);
      return true;
    }

    // Verify authorization document exists
    if (!fs.existsSync(engagement.authorizationDocPath)) {
      console.error(`❌ Authorization document not found: ${engagement.authorizationDocPath}`);
      return false;
    }

    engagement.status = 'active';
    engagement.updatedAt = new Date().toISOString();
    this.engagements.set(engagementId, engagement);
    this.saveData();

    this.logAudit({
      engagementId,
      action: 'ACTIVATE_ENGAGEMENT',
      target: engagement.clientName,
      operator,
      result: 'success',
      details: { startDate: engagement.startDate },
    });

    console.log(`✅ Engagement activated: ${engagementId}`);
    return true;
  }

  /**
   * Check if a specific operation is authorized
   * CRITICAL: This is called before EVERY offensive operation
   */
  checkAuthorization(params: {
    target: string;
    operation: string;
    operator: string;
  }): AuthorizationCheck {
    const { target, operation, operator } = params;

    // Find active engagements that cover this target
    const activeEngagements = Array.from(this.engagements.values()).filter(
      eng => eng.status === 'active'
    );

    if (activeEngagements.length === 0) {
      this.logAudit({
        engagementId: 'NONE',
        action: operation,
        target,
        operator,
        result: 'blocked',
        details: { reason: 'No active engagements' },
      });

      return {
        authorized: false,
        reason: 'No active engagements found. All offensive operations require authorized engagement.',
      };
    }

    // Check each active engagement for authorization
    for (const engagement of activeEngagements) {
      const authCheck = this.isTargetInScope(target, engagement);
      if (!authCheck.authorized) continue;

      // Check if operation is allowed
      if (!engagement.rulesOfEngagement.allowedAttackTypes.includes(operation)) {
        return {
          authorized: false,
          engagementId: engagement.id,
          reason: `Operation '${operation}' not authorized in engagement rules`,
          restrictions: engagement.rulesOfEngagement.restrictedActions,
        };
      }

      // Check time window
      if (!this.isWithinTimeWindow(engagement.rulesOfEngagement.allowedTimeWindows)) {
        return {
          authorized: false,
          engagementId: engagement.id,
          reason: 'Current time outside authorized testing windows',
        };
      }

      // Check if engagement is still valid
      const now = new Date();
      const endDate = new Date(engagement.endDate);
      if (now > endDate) {
        return {
          authorized: false,
          engagementId: engagement.id,
          reason: 'Engagement has expired',
        };
      }

      // All checks passed
      this.logAudit({
        engagementId: engagement.id,
        action: operation,
        target,
        operator,
        result: 'success',
        details: { authorized: true },
      });

      return {
        authorized: true,
        engagementId: engagement.id,
      };
    }

    // No engagement covers this target
    this.logAudit({
      engagementId: 'NONE',
      action: operation,
      target,
      operator,
      result: 'blocked',
      details: { reason: 'Target not in scope' },
    });

    return {
      authorized: false,
      reason: 'Target not covered by any active engagement scope',
    };
  }

  /**
   * Check if target is within engagement scope
   */
  private isTargetInScope(target: string, engagement: Engagement): AuthorizationCheck {
    const { scope } = engagement;

    // Check excluded assets first
    if (scope.excludedAssets.some(excluded => target.includes(excluded))) {
      return {
        authorized: false,
        reason: 'Target is in excluded assets list',
      };
    }

    // Check if target matches any authorized domain
    if (scope.targetDomains.some(domain => target.includes(domain))) {
      return { authorized: true, engagementId: engagement.id };
    }

    // Check if target matches any authorized IP
    if (scope.targetIPs.some(ip => target === ip)) {
      return { authorized: true, engagementId: engagement.id };
    }

    // Check if target is in any authorized subnet
    // Note: This is simplified; production should use proper CIDR matching
    if (scope.targetSubnets.some(subnet => target.startsWith(subnet.split('/')[0]))) {
      return { authorized: true, engagementId: engagement.id };
    }

    return {
      authorized: false,
      reason: 'Target does not match any authorized scope',
    };
  }

  /**
   * Check if current time is within authorized testing windows
   */
  private isWithinTimeWindow(timeWindows: TimeWindow[]): boolean {
    if (timeWindows.length === 0) return true; // No restrictions

    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM

    return timeWindows.some(window => {
      const isDayAllowed = window.dayOfWeek.includes(currentDay);
      const isTimeAllowed = currentTime >= window.startTime && currentTime <= window.endTime;
      return isDayAllowed && isTimeAllowed;
    });
  }

  /**
   * Log audit trail for forensic integrity
   */
  private logAudit(params: {
    engagementId: string;
    action: string;
    target: string;
    operator: string;
    result: 'success' | 'failure' | 'blocked';
    details: any;
  }): void {
    const auditLog: AuditLog = {
      id: `AUDIT-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      timestamp: new Date().toISOString(),
      evidenceHash: crypto.createHash('sha256')
        .update(JSON.stringify(params))
        .digest('hex'),
      ...params,
    };

    this.auditLogs.push(auditLog);
    this.saveData();

    // Log to console for real-time monitoring
    const icon = params.result === 'success' ? '✅' : params.result === 'blocked' ? '🚫' : '❌';
    console.log(`${icon} [AUDIT] ${params.action} on ${params.target} by ${params.operator}`);
  }

  /**
   * Complete an engagement and generate final report metadata
   */
  completeEngagement(engagementId: string, operator: string): boolean {
    const engagement = this.engagements.get(engagementId);
    if (!engagement) return false;

    engagement.status = 'completed';
    engagement.updatedAt = new Date().toISOString();
    this.engagements.set(engagementId, engagement);
    this.saveData();

    this.logAudit({
      engagementId,
      action: 'COMPLETE_ENGAGEMENT',
      target: engagement.clientName,
      operator,
      result: 'success',
      details: { completedAt: engagement.updatedAt },
    });

    return true;
  }

  /**
   * Get all engagements (optionally filtered by status)
   */
  getEngagements(status?: 'pending' | 'active' | 'completed' | 'cancelled'): Engagement[] {
    const engagements = Array.from(this.engagements.values());
    if (status) {
      return engagements.filter(eng => eng.status === status);
    }
    return engagements;
  }

  /**
   * Get specific engagement by ID
   */
  getEngagement(engagementId: string): Engagement | undefined {
    return this.engagements.get(engagementId);
  }

  /**
   * Get audit logs for an engagement
   */
  getAuditLogs(engagementId?: string, limit: number = 100): AuditLog[] {
    let logs = this.auditLogs;
    if (engagementId) {
      logs = logs.filter(log => log.engagementId === engagementId);
    }
    return logs.slice(-limit);
  }

  /**
   * Emergency stop - immediately halt all operations for an engagement
   */
  emergencyStop(engagementId: string, operator: string, reason: string): boolean {
    const engagement = this.engagements.get(engagementId);
    if (!engagement) return false;

    engagement.status = 'cancelled';
    engagement.updatedAt = new Date().toISOString();
    this.engagements.set(engagementId, engagement);
    this.saveData();

    this.logAudit({
      engagementId,
      action: 'EMERGENCY_STOP',
      target: engagement.clientName,
      operator,
      result: 'success',
      details: { reason, stoppedAt: engagement.updatedAt },
    });

    console.log(`🚨 EMERGENCY STOP: Engagement ${engagementId} halted by ${operator}`);
    console.log(`🚨 Reason: ${reason}`);

    return true;
  }
}

export const authorizationService = new AuthorizationService();
