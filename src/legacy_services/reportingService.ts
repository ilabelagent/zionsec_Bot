import * as fs from 'fs';
import * as path from 'path';
import { authorizationService, Engagement } from './authorizationService';
import { ReconReport } from './reconService';
import { WebExploitReport } from './webExploitService';
import { NetworkPentestReport } from './networkPentestService';
import { CloudSecurityReport } from './cloudSecurityService';
import { MobileSecurityReport } from './mobileSecurityService';

/**
 * GodBrainAI Professional Reporting Service
 * MODULE 9: Client-Ready Security Assessment Reports
 *
 * "Whatever you do, work at it with all your heart, as working for the Lord."
 * - Colossians 3:23
 *
 * We deliver reports with excellence, as unto the Lord.
 */

export interface ExecutiveReport {
  engagementId: string;
  clientName: string;
  reportDate: string;
  executiveSummary: string;
  overallRiskRating: 'low' | 'medium' | 'high' | 'critical';
  criticalFindings: number;
  highFindings: number;
  mediumFindings: number;
  lowFindings: number;
  businessImpact: string[];
  recommendations: string[];
  timeToRemediate: string;
  complianceStatus: string[];
}

export interface TechnicalReport {
  engagementId: string;
  methodology: string;
  toolsUsed: string[];
  scope: string[];
  findings: Finding[];
  attackPaths: AttackPath[];
  evidenceFiles: string[];
}

export interface Finding {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'informational';
  cvss?: number;
  cve?: string;
  category: string;
  description: string;
  impact: string;
  affectedAssets: string[];
  proofOfConcept?: string;
  remediation: string;
  references: string[];
  timeline: string;
}

export interface AttackPath {
  id: string;
  name: string;
  steps: string[];
  severity: 'critical' | 'high' | 'medium' | 'low';
  likelihood: 'high' | 'medium' | 'low';
  impact: string;
  mitigation: string;
}

export interface ComplianceMapping {
  framework: 'PCI-DSS' | 'HIPAA' | 'SOC2' | 'ISO27001' | 'NIST' | 'GDPR';
  requirements: Array<{
    id: string;
    description: string;
    status: 'compliant' | 'non-compliant' | 'partial';
    findings: string[];
  }>;
}

export interface RemediationRoadmap {
  phases: Array<{
    phase: number;
    name: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    duration: string;
    tasks: Array<{
      task: string;
      owner: string;
      deadline: string;
      dependencies: string[];
    }>;
  }>;
}

class ReportingService {
  private reportsDir: string;

  constructor() {
    this.reportsDir = path.join(__dirname, '../../reports');
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  /**
   * Generate executive summary report
   */
  generateExecutiveReport(params: {
    engagementId: string;
    allFindings: Finding[];
  }): ExecutiveReport {
    const engagement = authorizationService.getEngagement(params.engagementId);
    if (!engagement) {
      throw new Error(`Engagement not found: ${params.engagementId}`);
    }

    console.log(`📊 Generating executive report for ${engagement.clientName}`);

    const criticalFindings = params.allFindings.filter(f => f.severity === 'critical').length;
    const highFindings = params.allFindings.filter(f => f.severity === 'high').length;
    const mediumFindings = params.allFindings.filter(f => f.severity === 'medium').length;
    const lowFindings = params.allFindings.filter(f => f.severity === 'low').length;

    const overallRiskRating = this.calculateOverallRisk(
      criticalFindings,
      highFindings,
      mediumFindings
    );

    const executiveSummary = this.generateExecutiveSummary(
      engagement,
      criticalFindings,
      highFindings,
      overallRiskRating
    );

    const businessImpact = this.identifyBusinessImpact(params.allFindings);
    const recommendations = this.generateTopRecommendations(params.allFindings);
    const timeToRemediate = this.estimateRemediationTime(criticalFindings, highFindings);
    const complianceStatus = this.assessComplianceStatus(params.allFindings);

    const report: ExecutiveReport = {
      engagementId: params.engagementId,
      clientName: engagement.clientName,
      reportDate: new Date().toISOString(),
      executiveSummary,
      overallRiskRating,
      criticalFindings,
      highFindings,
      mediumFindings,
      lowFindings,
      businessImpact,
      recommendations,
      timeToRemediate,
      complianceStatus,
    };

    // Save report to file
    const reportPath = path.join(
      this.reportsDir,
      `${params.engagementId}_executive_report.json`
    );
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`✅ Executive report generated: ${reportPath}`);
    return report;
  }

  /**
   * Generate technical report
   */
  generateTechnicalReport(params: {
    engagementId: string;
    reconReport?: ReconReport;
    webExploitReport?: WebExploitReport;
    networkReport?: NetworkPentestReport;
    cloudReport?: CloudSecurityReport;
    mobileReport?: MobileSecurityReport;
  }): TechnicalReport {
    const engagement = authorizationService.getEngagement(params.engagementId);
    if (!engagement) {
      throw new Error(`Engagement not found: ${params.engagementId}`);
    }

    console.log(`🔬 Generating technical report for ${engagement.clientName}`);

    const findings = this.aggregateFindings(params);
    const attackPaths = this.identifyAttackPaths(params);

    const report: TechnicalReport = {
      engagementId: params.engagementId,
      methodology: this.describeMethodology(engagement),
      toolsUsed: this.listToolsUsed(),
      scope: engagement.scope.targetDomains,
      findings,
      attackPaths,
      evidenceFiles: [],
    };

    // Save report to file
    const reportPath = path.join(
      this.reportsDir,
      `${params.engagementId}_technical_report.json`
    );
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`✅ Technical report generated: ${reportPath}`);
    return report;
  }

  /**
   * Generate compliance mapping report
   */
  generateComplianceReport(params: {
    engagementId: string;
    findings: Finding[];
    frameworks: Array<'PCI-DSS' | 'HIPAA' | 'SOC2' | 'ISO27001' | 'NIST' | 'GDPR'>;
  }): ComplianceMapping[] {
    console.log(`📋 Generating compliance mapping report`);

    const mappings: ComplianceMapping[] = [];

    for (const framework of params.frameworks) {
      const mapping = this.mapToComplianceFramework(framework, params.findings);
      mappings.push(mapping);
    }

    // Save report to file
    const reportPath = path.join(
      this.reportsDir,
      `${params.engagementId}_compliance_report.json`
    );
    fs.writeFileSync(reportPath, JSON.stringify(mappings, null, 2));

    console.log(`✅ Compliance report generated: ${reportPath}`);
    return mappings;
  }

  /**
   * Generate remediation roadmap
   */
  generateRemediationRoadmap(params: {
    engagementId: string;
    findings: Finding[];
  }): RemediationRoadmap {
    console.log(`🗺️ Generating remediation roadmap`);

    const criticalFindings = params.findings.filter(f => f.severity === 'critical');
    const highFindings = params.findings.filter(f => f.severity === 'high');
    const mediumFindings = params.findings.filter(f => f.severity === 'medium');
    const lowFindings = params.findings.filter(f => f.severity === 'low');

    const roadmap: RemediationRoadmap = {
      phases: [
        {
          phase: 1,
          name: 'Critical Risk Mitigation',
          priority: 'critical',
          duration: '1-2 weeks',
          tasks: criticalFindings.map(f => ({
            task: f.remediation,
            owner: 'Security Team',
            deadline: this.calculateDeadline(7),
            dependencies: [],
          })),
        },
        {
          phase: 2,
          name: 'High Risk Remediation',
          priority: 'high',
          duration: '2-4 weeks',
          tasks: highFindings.map(f => ({
            task: f.remediation,
            owner: 'Development Team',
            deadline: this.calculateDeadline(30),
            dependencies: [],
          })),
        },
        {
          phase: 3,
          name: 'Medium Risk Remediation',
          priority: 'medium',
          duration: '1-2 months',
          tasks: mediumFindings.map(f => ({
            task: f.remediation,
            owner: 'Development Team',
            deadline: this.calculateDeadline(60),
            dependencies: [],
          })),
        },
        {
          phase: 4,
          name: 'Low Risk & Hardening',
          priority: 'low',
          duration: '2-3 months',
          tasks: lowFindings.map(f => ({
            task: f.remediation,
            owner: 'Development Team',
            deadline: this.calculateDeadline(90),
            dependencies: [],
          })),
        },
      ],
    };

    // Save roadmap to file
    const reportPath = path.join(
      this.reportsDir,
      `${params.engagementId}_remediation_roadmap.json`
    );
    fs.writeFileSync(reportPath, JSON.stringify(roadmap, null, 2));

    console.log(`✅ Remediation roadmap generated: ${reportPath}`);
    return roadmap;
  }

  /**
   * Generate comprehensive final report (all sections)
   */
  generateFinalReport(params: {
    engagementId: string;
    reconReport?: ReconReport;
    webExploitReport?: WebExploitReport;
    networkReport?: NetworkPentestReport;
    cloudReport?: CloudSecurityReport;
    mobileReport?: MobileSecurityReport;
  }): {
    executive: ExecutiveReport;
    technical: TechnicalReport;
    compliance: ComplianceMapping[];
    roadmap: RemediationRoadmap;
  } {
    console.log(`📚 Generating comprehensive final report`);

    const technicalReport = this.generateTechnicalReport(params);
    const executiveReport = this.generateExecutiveReport({
      engagementId: params.engagementId,
      allFindings: technicalReport.findings,
    });

    const engagement = authorizationService.getEngagement(params.engagementId);
    const frameworks = engagement?.scope.complianceFrameworks as Array<'PCI-DSS' | 'HIPAA' | 'SOC2' | 'ISO27001' | 'NIST' | 'GDPR'> || [];

    const complianceReport = this.generateComplianceReport({
      engagementId: params.engagementId,
      findings: technicalReport.findings,
      frameworks,
    });

    const remediationRoadmap = this.generateRemediationRoadmap({
      engagementId: params.engagementId,
      findings: technicalReport.findings,
    });

    // Save comprehensive report
    const finalReport = {
      executive: executiveReport,
      technical: technicalReport,
      compliance: complianceReport,
      roadmap: remediationRoadmap,
    };

    const reportPath = path.join(
      this.reportsDir,
      `${params.engagementId}_final_report.json`
    );
    fs.writeFileSync(reportPath, JSON.stringify(finalReport, null, 2));

    console.log(`✅ Final comprehensive report generated: ${reportPath}`);
    return finalReport;
  }

  // ============ PRIVATE HELPER METHODS ============

  private calculateOverallRisk(
    critical: number,
    high: number,
    medium: number
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (critical > 0) return 'critical';
    if (high >= 5) return 'high';
    if (high > 0 || medium >= 10) return 'medium';
    return 'low';
  }

  private generateExecutiveSummary(
    engagement: Engagement,
    critical: number,
    high: number,
    risk: string
  ): string {
    return `GodBrainAI conducted a comprehensive security assessment of ${engagement.clientName}'s infrastructure from ${engagement.startDate} to ${engagement.endDate}. The assessment identified ${critical} critical and ${high} high-severity vulnerabilities, resulting in an overall risk rating of ${risk.toUpperCase()}. Immediate remediation is recommended for critical findings to prevent potential security breaches.`;
  }

  private identifyBusinessImpact(findings: Finding[]): string[] {
    const impacts: string[] = [];

    if (findings.some(f => f.category === 'authentication' && f.severity === 'critical')) {
      impacts.push('Unauthorized access to sensitive systems and data');
    }
    if (findings.some(f => f.category === 'injection' && f.severity === 'critical')) {
      impacts.push('Complete compromise of database and backend systems');
    }
    if (findings.some(f => f.category === 'cloud' && f.severity === 'high')) {
      impacts.push('Potential data breaches in cloud infrastructure');
    }

    return impacts;
  }

  private generateTopRecommendations(findings: Finding[]): string[] {
    const recommendations: string[] = [
      'Implement multi-factor authentication across all systems',
      'Conduct regular security awareness training for all employees',
      'Establish a formal vulnerability management program',
      'Deploy Web Application Firewall (WAF) for critical applications',
      'Implement continuous security monitoring and incident response',
    ];

    return recommendations;
  }

  private estimateRemediationTime(critical: number, high: number): string {
    if (critical > 0) return '1-2 weeks for critical findings';
    if (high > 5) return '4-6 weeks for high findings';
    return '2-3 months for all findings';
  }

  private assessComplianceStatus(findings: Finding[]): string[] {
    const status: string[] = [];

    if (findings.some(f => f.category === 'encryption' && f.severity === 'high')) {
      status.push('PCI-DSS: Non-compliant (encryption requirements)');
      status.push('HIPAA: Non-compliant (data protection requirements)');
    }

    return status;
  }

  private aggregateFindings(reports: {
    reconReport?: ReconReport;
    webExploitReport?: WebExploitReport;
    networkReport?: NetworkPentestReport;
    cloudReport?: CloudSecurityReport;
    mobileReport?: MobileSecurityReport;
  }): Finding[] {
    const findings: Finding[] = [];

    // Convert recon findings
    if (reports.reconReport) {
      reports.reconReport.attackSurface.findings.forEach((finding, idx) => {
        findings.push({
          id: `RECON-${idx + 1}`,
          title: finding,
          severity: 'informational',
          category: 'reconnaissance',
          description: finding,
          impact: 'Information disclosure',
          affectedAssets: [reports.reconReport!.target],
          remediation: 'Review exposed information and implement access controls',
          references: [],
          timeline: reports.reconReport!.timestamp,
        });
      });
    }

    // Add more conversions for other report types...

    return findings;
  }

  private identifyAttackPaths(reports: any): AttackPath[] {
    const paths: AttackPath[] = [];

    // Example attack path
    paths.push({
      id: 'PATH-1',
      name: 'External to Internal Compromise',
      steps: [
        'Reconnaissance: Enumerate subdomains and exposed services',
        'Initial Access: Exploit web application vulnerability',
        'Privilege Escalation: Exploit weak IAM permissions',
        'Lateral Movement: Access sensitive data stores',
      ],
      severity: 'critical',
      likelihood: 'high',
      impact: 'Complete compromise of internal network and data',
      mitigation: 'Implement defense-in-depth strategy with multiple security layers',
    });

    return paths;
  }

  private describeMethodology(engagement: Engagement): string {
    return `Industry-standard penetration testing methodology including OWASP, PTES, and NIST guidelines. Testing was conducted in accordance with the Rules of Engagement and within authorized time windows.`;
  }

  private listToolsUsed(): string[] {
    return [
      'Nmap - Network scanning',
      'Burp Suite - Web application testing',
      'Metasploit - Exploitation framework',
      'BloodHound - Active Directory analysis',
      'AWS CLI - Cloud security auditing',
      'MobSF - Mobile app analysis',
      'Custom GodBrainAI security tools',
    ];
  }

  private mapToComplianceFramework(
    framework: string,
    findings: Finding[]
  ): ComplianceMapping {
    // Simplified compliance mapping
    return {
      framework: framework as any,
      requirements: [
        {
          id: '1.1',
          description: 'Sample requirement',
          status: 'compliant',
          findings: [],
        },
      ],
    };
  }

  private calculateDeadline(daysFromNow: number): string {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + daysFromNow);
    return deadline.toISOString().split('T')[0];
  }
}

export const reportingService = new ReportingService();
