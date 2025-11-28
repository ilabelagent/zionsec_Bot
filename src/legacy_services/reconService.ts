import * as dns from 'dns';
import * as https from 'https';
import * as http from 'http';
import { Socket } from 'net';
import { promisify } from 'util';
import { authorizationService } from './authorizationService';
import { botLearningService } from './botLearningService';

/**
 * GodBrainAI Advanced Reconnaissance & OSINT Service
 * MODULE 1: Intelligence Gathering for Authorized Engagements
 * MODULE 2: B2B Lead Generation & Email Intelligence
 *
 * "Test all things; hold fast what is good." - 1 Thessalonians 5:21
 */

const BOT_ID = 'offensive_recon';
const resolveMx = promisify(dns.resolveMx);

export interface EmailPattern {
  pattern: string;
  confidence: number;
  examples: string[];
}

export interface EmployeeInfo {
  name: string;
  title: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  department?: string;
}

export interface SubdomainResult {
  subdomain: string;
  ip?: string;
  status: 'active' | 'inactive' | 'unknown';
  serverInfo?: string;
  technologies?: string[];
}

export interface CloudAsset {
  provider: 'aws' | 'azure' | 'gcp' | 'unknown';
  resourceType: string;
  url: string;
  accessible: boolean;
  findings?: string[];
}

export interface APIEndpoint {
  url: string;
  method: string;
  authenticated: boolean;
  parameters?: string[];
  vulnerabilities?: string[];
}

export interface InfrastructureMap {
  domain: string;
  ipAddresses: string[];
  cloudProvider?: string;
  cdn?: string;
  waf?: string;
  loadBalancer?: string;
  technologies: string[];
  exposedServices: Array<{
    port: number;
    service: string;
    version?: string;
  }>;
}

export interface ReconReport {
  target: string;
  engagementId: string;
  timestamp: string;
  emailIntelligence?: {
    patterns: EmailPattern[];
    employees: EmployeeInfo[];
  };
  infrastructure?: InfrastructureMap;
  subdomains?: SubdomainResult[];
  cloudAssets?: CloudAsset[];
  apiEndpoints?: APIEndpoint[];
  exposedFiles?: string[];
  gitLeaks?: Array<{
    repository: string;
    secrets: string[];
  }>;
  adminPanels?: string[];
  attackSurface: {
    severity: 'low' | 'medium' | 'high' | 'critical';
    findings: string[];
  };
}

// ============================================================================
// LEAD GENERATION INTERFACES
// ============================================================================

export interface EmailContact {
  email: string;
  type: 'contact' | 'info' | 'sales' | 'support' | 'generic' | 'personal';
  verified: boolean;
  validFormat: boolean;
  mxRecordExists: boolean;
  smtpValid?: boolean;
  confidence: number; // 0-100
  firstName?: string;
  lastName?: string;
  title?: string;
  department?: string;
  pattern?: string;
}

export interface BusinessLead {
  id: string;
  companyName: string;
  industry?: string;
  website?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country: string;
  emails: EmailContact[];
  socialMedia?: {
    linkedin?: string;
    facebook?: string;
    twitter?: string;
  };
  employeeCount?: string;
  revenue?: string;
  verificationStatus: 'unverified' | 'verified' | 'invalid';
  leadScore: number;
  source: string;
  scrapedAt: Date;
  metadata?: Record<string, any>;
}

export interface LeadGenerationCampaign {
  id: string;
  name: string;
  targetIndustries: string[];
  targetStates: string[];
  targetCities?: string[];
  minEmployees?: number;
  maxEmployees?: number;
  keywords?: string[];
  sources: string[];
  status: 'active' | 'paused' | 'completed';
  leadsCollected: number;
  emailsVerified: number;
  createdAt: Date;
  completedAt?: Date;
}

export interface EmailVerificationResult {
  email: string;
  valid: boolean;
  formatValid: boolean;
  mxRecordExists: boolean;
  smtpValid: boolean;
  disposable: boolean;
  freeProvider: boolean;
  confidence: number;
  verifiedAt: Date;
}

// ============================================================================
// EMAIL GENERATION & VALIDATION HELPERS
// ============================================================================

const COMMON_EMAIL_PATTERNS = [
  '{first}.{last}@{domain}',
  '{first}{last}@{domain}',
  '{f}{last}@{domain}',
  '{first}@{domain}',
  '{last}@{domain}',
  '{first}_{last}@{domain}',
  '{first}-{last}@{domain}',
  '{last}.{first}@{domain}',
];

const GENERIC_EMAILS = [
  'info', 'contact', 'ventas', 'contacto', 'hola',
  'sales', 'soporte', 'support', 'admin', 'administracion',
  'servicios', 'atencion', 'recepcion', 'informes', 'comercial'
];

const FREE_EMAIL_PROVIDERS = [
  'gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com',
  'live.com', 'icloud.com', 'protonmail.com', 'aol.com'
];

const DISPOSABLE_DOMAINS = [
  'tempmail.com', 'guerrillamail.com', '10minutemail.com',
  'mailinator.com', 'throwaway.email'
];

/**
 * Generate possible email addresses based on name and domain
 */
export function generateEmailPatterns(
  firstName: string,
  lastName: string,
  domain: string
): string[] {
  const first = firstName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const last = lastName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const f = first.charAt(0);

  const emails: string[] = [];

  for (const pattern of COMMON_EMAIL_PATTERNS) {
    const email = pattern
      .replace('{first}', first)
      .replace('{last}', last)
      .replace('{f}', f)
      .replace('{domain}', domain);
    emails.push(email);
  }

  return [...new Set(emails)];
}

/**
 * Generate generic business emails
 */
export function generateGenericEmails(domain: string): string[] {
  return GENERIC_EMAILS.map(prefix => `${prefix}@${domain}`);
}

/**
 * Extract domain from URL or email
 */
export function extractDomain(input: string): string | null {
  try {
    if (input.includes('@')) {
      return input.split('@')[1];
    }
    const url = new URL(input.startsWith('http') ? input : `https://${input}`);
    return url.hostname.replace('www.', '');
  } catch {
    return null;
  }
}

/**
 * Validate email format using RFC 5322 regex
 */
export function validateEmailFormat(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
}

/**
 * Check if domain has valid MX records
 */
export async function checkMxRecords(domain: string): Promise<boolean> {
  try {
    const mxRecords = await resolveMx(domain);
    return mxRecords && mxRecords.length > 0;
  } catch {
    return false;
  }
}

/**
 * Verify SMTP server accepts the email (without sending)
 */
export async function verifySMTP(email: string): Promise<boolean> {
  const domain = email.split('@')[1];

  try {
    const mxRecords = await resolveMx(domain);
    if (!mxRecords || mxRecords.length === 0) return false;

    mxRecords.sort((a, b) => a.priority - b.priority);
    const mxHost = mxRecords[0].exchange;

    return new Promise((resolve) => {
      const socket = new Socket();
      let commandSent = false;

      socket.setTimeout(5000);

      socket.connect(25, mxHost, () => {
        // Wait for server greeting
      });

      socket.on('data', (data) => {
        const response = data.toString();

        if (response.startsWith('220') && !commandSent) {
          socket.write('HELO leadgen.cyberlabpro.com\r\n');
          commandSent = true;
        } else if (response.startsWith('250') && commandSent) {
          socket.write(`MAIL FROM:<verify@cyberlabpro.com>\r\n`);
        } else if (response.includes('MAIL FROM')) {
          socket.write(`RCPT TO:<${email}>\r\n`);
        } else if (response.startsWith('250') && response.toLowerCase().includes('ok')) {
          socket.end();
          resolve(true);
        } else if (response.startsWith('550') || response.startsWith('551') || response.startsWith('553')) {
          socket.end();
          resolve(false);
        }
      });

      socket.on('error', () => resolve(false));
      socket.on('timeout', () => {
        socket.destroy();
        resolve(false);
      });
    });
  } catch {
    return false;
  }
}

/**
 * Comprehensive email verification
 */
export async function verifyEmail(email: string): Promise<EmailVerificationResult> {
  const formatValid = validateEmailFormat(email);
  const domain = email.split('@')[1];
  const freeProvider = FREE_EMAIL_PROVIDERS.includes(domain);
  const disposable = DISPOSABLE_DOMAINS.includes(domain);

  let mxRecordExists = false;
  let smtpValid = false;

  if (formatValid && !disposable) {
    mxRecordExists = await checkMxRecords(domain);
    if (mxRecordExists) {
      smtpValid = await verifySMTP(email);
    }
  }

  let confidence = 0;
  if (formatValid) confidence += 20;
  if (mxRecordExists) confidence += 30;
  if (smtpValid) confidence += 40;
  if (!disposable) confidence += 5;
  if (!freeProvider) confidence += 5;

  const valid = formatValid && mxRecordExists && !disposable;

  return {
    email,
    valid,
    formatValid,
    mxRecordExists,
    smtpValid,
    disposable,
    freeProvider,
    confidence,
    verifiedAt: new Date()
  };
}

/**
 * Calculate lead score (0-100) based on data quality
 */
export function calculateLeadScore(lead: BusinessLead): number {
  let score = 0;

  const verifiedEmails = lead.emails.filter(e => e.verified);
  if (verifiedEmails.length > 0) score += 30;
  if (lead.website) score += 15;
  if (lead.phone) score += 10;
  if (lead.address) score += 10;
  if (lead.socialMedia && Object.keys(lead.socialMedia).length > 0) score += 10;
  if (lead.industry) score += 5;
  if (lead.employeeCount || lead.revenue) score += 10;
  if (verifiedEmails.length > 2) score += 10;

  return Math.min(score, 100);
}

/**
 * Export leads to CSV format for CRM import
 */
export function exportToCSV(leads: BusinessLead[]): string {
  const headers = [
    'Company Name', 'Industry', 'Website', 'Phone', 'Address',
    'City', 'State', 'Country', 'Email', 'Email Type', 'Email Verified',
    'Lead Score', 'Source', 'LinkedIn', 'Scraped Date'
  ];

  const rows = leads.flatMap(lead => {
    if (lead.emails.length === 0) {
      return [[
        lead.companyName, lead.industry || '', lead.website || '',
        lead.phone || '', lead.address || '', lead.city || '',
        lead.state || '', lead.country, '', '', '',
        lead.leadScore, lead.source,
        lead.socialMedia?.linkedin || '', lead.scrapedAt.toISOString()
      ]];
    }

    return lead.emails.map(email => [
      lead.companyName, lead.industry || '', lead.website || '',
      lead.phone || '', lead.address || '', lead.city || '',
      lead.state || '', lead.country, email.email, email.type,
      email.verified ? 'Yes' : 'No', lead.leadScore, lead.source,
      lead.socialMedia?.linkedin || '', lead.scrapedAt.toISOString()
    ]);
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csvContent;
}

class ReconService {
  private leads: Map<string, BusinessLead> = new Map();
  private campaigns: Map<string, LeadGenerationCampaign> = new Map();

  /**
   * Perform comprehensive reconnaissance on target domain
   */
  async performRecon(params: {
    target: string;
    operator: string;
    depth: 'quick' | 'standard' | 'deep';
  }): Promise<ReconReport> {
    const { target, operator, depth } = params;

    // AUTHORIZATION CHECK - CRITICAL
    const authCheck = authorizationService.checkAuthorization({
      target,
      operation: 'RECONNAISSANCE',
      operator,
    });

    if (!authCheck.authorized) {
      console.error(`🚫 Reconnaissance blocked: ${authCheck.reason}`);
      throw new Error(`Unauthorized: ${authCheck.reason}`);
    }

    console.log(`🔍 Starting ${depth} reconnaissance on ${target}`);
    console.log(`📋 Engagement: ${authCheck.engagementId}`);
    console.log(`👤 Operator: ${operator}`);

    const report: ReconReport = {
      target,
      engagementId: authCheck.engagementId!,
      timestamp: new Date().toISOString(),
      attackSurface: {
        severity: 'low',
        findings: [],
      },
    };

    try {
      // Phase 1: Email Intelligence
      if (depth === 'standard' || depth === 'deep') {
        report.emailIntelligence = await this.gatherEmailIntelligence(target);
      }

      // Phase 2: Infrastructure Mapping
      report.infrastructure = await this.mapInfrastructure(target);

      // Phase 3: Subdomain Enumeration
      if (depth === 'standard' || depth === 'deep') {
        report.subdomains = await this.enumerateSubdomains(target);
      }

      // Phase 4: Cloud Asset Discovery
      if (depth === 'deep') {
        report.cloudAssets = await this.discoverCloudAssets(target);
      }

      // Phase 5: API Endpoint Discovery
      report.apiEndpoints = await this.discoverAPIEndpoints(target);

      // Phase 6: Exposed Files
      report.exposedFiles = await this.findExposedFiles(target);

      // Phase 7: Git Repository Leaks
      if (depth === 'deep') {
        report.gitLeaks = await this.searchGitLeaks(target);
      }

      // Phase 8: Admin Panel Discovery
      report.adminPanels = await this.discoverAdminPanels(target);

      // Calculate attack surface severity
      report.attackSurface = this.calculateAttackSurface(report);

      // Log to learning system
      await botLearningService.learnFromExecution(
        BOT_ID,
        'reconnaissance',
        true,
        { target, depth, findingsCount: report.attackSurface.findings.length }
      );

      await botLearningService.progressBotSkill(BOT_ID, 'reconnaissance', 50);

      console.log(`✅ Reconnaissance complete: ${report.attackSurface.findings.length} findings`);
      return report;

    } catch (error: any) {
      await botLearningService.learnFromExecution(
        BOT_ID,
        'reconnaissance',
        false,
        { target, error: error.message }
      );
      throw error;
    }
  }

  /**
   * Gather email intelligence (patterns, employees, breach data)
   */
  private async gatherEmailIntelligence(domain: string): Promise<{
    patterns: EmailPattern[];
    employees: EmployeeInfo[];
  }> {
    console.log(`📧 Gathering email intelligence for ${domain}...`);

    // Common email patterns
    const patterns: EmailPattern[] = [
      {
        pattern: 'firstname.lastname@' + domain,
        confidence: 85,
        examples: ['john.doe@' + domain, 'jane.smith@' + domain],
      },
      {
        pattern: 'firstnamelastname@' + domain,
        confidence: 70,
        examples: ['johndoe@' + domain, 'janesmith@' + domain],
      },
      {
        pattern: 'firstinitiallastname@' + domain,
        confidence: 60,
        examples: ['jdoe@' + domain, 'jsmith@' + domain],
      },
      {
        pattern: 'firstname@' + domain,
        confidence: 40,
        examples: ['john@' + domain, 'jane@' + domain],
      },
    ];

    // Note: Production would integrate with:
    // - LinkedIn scraper (with authorization)
    // - Hunter.io API
    // - Have I Been Pwned API
    // - Corporate directory enumeration

    const employees: EmployeeInfo[] = [];

    console.log(`✅ Identified ${patterns.length} email patterns`);

    return { patterns, employees };
  }

  /**
   * Map infrastructure (cloud provider, CDN, WAF, load balancer)
   */
  private async mapInfrastructure(domain: string): Promise<InfrastructureMap> {
    console.log(`🗺️ Mapping infrastructure for ${domain}...`);

    const infrastructure: InfrastructureMap = {
      domain,
      ipAddresses: [],
      technologies: [],
      exposedServices: [],
    };

    try {
      // DNS resolution
      const addresses = await this.resolveDNS(domain);
      infrastructure.ipAddresses = addresses;

      // Detect cloud provider from IP ranges
      infrastructure.cloudProvider = this.detectCloudProvider(addresses[0]);

      // HTTP headers analysis
      const headers = await this.fetchHeaders(`https://${domain}`);

      // Detect CDN
      infrastructure.cdn = this.detectCDN(headers);

      // Detect WAF
      infrastructure.waf = this.detectWAF(headers);

      // Technology fingerprinting
      infrastructure.technologies = this.fingerprintTechnologies(headers);

      console.log(`✅ Infrastructure mapped: ${infrastructure.cloudProvider || 'Unknown provider'}`);

    } catch (error: any) {
      console.error(`❌ Infrastructure mapping failed: ${error.message}`);
    }

    return infrastructure;
  }

  /**
   * Enumerate subdomains
   */
  private async enumerateSubdomains(domain: string): Promise<SubdomainResult[]> {
    console.log(`🔍 Enumerating subdomains for ${domain}...`);

    // Common subdomain wordlist
    const commonSubdomains = [
      'www', 'mail', 'smtp', 'pop', 'imap', 'ftp', 'admin', 'webmail',
      'portal', 'api', 'dev', 'staging', 'test', 'qa', 'uat', 'demo',
      'blog', 'shop', 'store', 'mobile', 'vpn', 'remote', 'secure',
      'login', 'dashboard', 'panel', 'cpanel', 'phpmyadmin', 'mysql',
      'db', 'database', 'backup', 'old', 'new', 'beta', 'alpha',
    ];

    const results: SubdomainResult[] = [];

    for (const sub of commonSubdomains) {
      const subdomain = `${sub}.${domain}`;
      try {
        const addresses = await this.resolveDNS(subdomain);
        if (addresses.length > 0) {
          results.push({
            subdomain,
            ip: addresses[0],
            status: 'active',
          });
        }
      } catch (error) {
        // Subdomain doesn't exist
      }
    }

    console.log(`✅ Found ${results.length} active subdomains`);
    return results;
  }

  /**
   * Discover cloud assets (S3 buckets, Azure blobs, GCP buckets)
   */
  private async discoverCloudAssets(domain: string): Promise<CloudAsset[]> {
    console.log(`☁️ Discovering cloud assets for ${domain}...`);

    const assets: CloudAsset[] = [];
    const companyName = domain.split('.')[0];

    // Common S3 bucket naming patterns
    const s3Patterns = [
      `${companyName}`,
      `${companyName}-backups`,
      `${companyName}-data`,
      `${companyName}-prod`,
      `${companyName}-dev`,
      `${companyName}-staging`,
      `${companyName}-assets`,
      `${companyName}-uploads`,
      `${companyName}-images`,
    ];

    for (const bucket of s3Patterns) {
      const url = `https://${bucket}.s3.amazonaws.com`;
      const accessible = await this.checkURLAccessible(url);
      if (accessible) {
        assets.push({
          provider: 'aws',
          resourceType: 's3-bucket',
          url,
          accessible: true,
          findings: ['Publicly accessible S3 bucket'],
        });
      }
    }

    console.log(`✅ Found ${assets.length} cloud assets`);
    return assets;
  }

  /**
   * Discover API endpoints
   */
  private async discoverAPIEndpoints(domain: string): Promise<APIEndpoint[]> {
    console.log(`🔌 Discovering API endpoints for ${domain}...`);

    const endpoints: APIEndpoint[] = [];

    // Common API paths
    const apiPaths = [
      '/api',
      '/api/v1',
      '/api/v2',
      '/v1',
      '/v2',
      '/rest',
      '/graphql',
      '/swagger',
      '/api-docs',
      '/openapi.json',
    ];

    for (const path of apiPaths) {
      const url = `https://${domain}${path}`;
      const accessible = await this.checkURLAccessible(url);
      if (accessible) {
        endpoints.push({
          url,
          method: 'GET',
          authenticated: false, // Would need to test
        });
      }
    }

    console.log(`✅ Found ${endpoints.length} API endpoints`);
    return endpoints;
  }

  /**
   * Find exposed files (.env, config files, backups)
   */
  private async findExposedFiles(domain: string): Promise<string[]> {
    console.log(`📁 Searching for exposed files on ${domain}...`);

    const exposedFiles: string[] = [];

    // Common exposed file paths
    const filePaths = [
      '/.env',
      '/.env.production',
      '/.env.local',
      '/config.php',
      '/config.json',
      '/web.config',
      '/phpinfo.php',
      '/.git/config',
      '/.git/HEAD',
      '/backup.zip',
      '/backup.sql',
      '/database.sql',
      '/.htaccess',
      '/.htpasswd',
      '/robots.txt',
      '/sitemap.xml',
    ];

    for (const path of filePaths) {
      const url = `https://${domain}${path}`;
      const accessible = await this.checkURLAccessible(url);
      if (accessible) {
        exposedFiles.push(path);
      }
    }

    console.log(`✅ Found ${exposedFiles.length} exposed files`);
    return exposedFiles;
  }

  /**
   * Search for git repository leaks
   */
  private async searchGitLeaks(domain: string): Promise<Array<{
    repository: string;
    secrets: string[];
  }>> {
    console.log(`🔐 Searching for git leaks related to ${domain}...`);

    // Note: Production would integrate with:
    // - GitHub API search
    // - GitLab API search
    // - TruffleHog for secret scanning
    // - GitGuardian API

    const leaks: Array<{ repository: string; secrets: string[] }> = [];

    console.log(`✅ Git leak scan complete`);
    return leaks;
  }

  /**
   * Discover admin panels
   */
  private async discoverAdminPanels(domain: string): Promise<string[]> {
    console.log(`🚪 Discovering admin panels on ${domain}...`);

    const adminPanels: string[] = [];

    // Common admin panel paths
    const adminPaths = [
      '/admin',
      '/administrator',
      '/admin.php',
      '/wp-admin',
      '/cpanel',
      '/phpmyadmin',
      '/adminer',
      '/admin/login',
      '/backend',
      '/dashboard',
      '/portal',
      '/console',
      '/manage',
      '/control',
    ];

    for (const path of adminPaths) {
      const url = `https://${domain}${path}`;
      const accessible = await this.checkURLAccessible(url);
      if (accessible) {
        adminPanels.push(path);
      }
    }

    console.log(`✅ Found ${adminPanels.length} admin panels`);
    return adminPanels;
  }

  /**
   * Helper: Resolve DNS
   */
  private resolveDNS(hostname: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      dns.resolve4(hostname, (err, addresses) => {
        if (err) reject(err);
        else resolve(addresses);
      });
    });
  }

  /**
   * Helper: Fetch HTTP headers
   */
  private async fetchHeaders(url: string): Promise<http.IncomingHttpHeaders> {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const client = urlObj.protocol === 'https:' ? https : http;

      const req = client.request(url, { method: 'HEAD' }, (res) => {
        resolve(res.headers);
      });

      req.on('error', reject);
      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('Timeout'));
      });
      req.end();
    });
  }

  /**
   * Helper: Check if URL is accessible
   */
  private async checkURLAccessible(url: string): Promise<boolean> {
    try {
      const urlObj = new URL(url);
      const client = urlObj.protocol === 'https:' ? https : http;

      return await new Promise((resolve) => {
        const req = client.request(url, { method: 'HEAD' }, (res) => {
          resolve(res.statusCode !== undefined && res.statusCode < 500);
        });

        req.on('error', () => resolve(false));
        req.setTimeout(3000, () => {
          req.destroy();
          resolve(false);
        });
        req.end();
      });
    } catch (error) {
      return false;
    }
  }

  /**
   * Helper: Detect cloud provider from IP
   */
  private detectCloudProvider(ip: string): string | undefined {
    // Note: Production would use proper IP range databases
    // This is simplified for demonstration
    return undefined;
  }

  /**
   * Helper: Detect CDN from headers
   */
  private detectCDN(headers: http.IncomingHttpHeaders): string | undefined {
    if (headers['cf-ray']) return 'Cloudflare';
    if (headers['x-amz-cf-id']) return 'CloudFront';
    if (headers['x-cdn']) return headers['x-cdn'] as string;
    return undefined;
  }

  /**
   * Helper: Detect WAF from headers
   */
  private detectWAF(headers: http.IncomingHttpHeaders): string | undefined {
    if (headers['server']?.includes('cloudflare')) return 'Cloudflare WAF';
    if (headers['x-sucuri-id']) return 'Sucuri WAF';
    if (headers['x-akamai-transformed']) return 'Akamai';
    return undefined;
  }

  /**
   * Helper: Fingerprint technologies from headers
   */
  private fingerprintTechnologies(headers: http.IncomingHttpHeaders): string[] {
    const technologies: string[] = [];

    if (headers['server']) technologies.push(headers['server'] as string);
    if (headers['x-powered-by']) technologies.push(headers['x-powered-by'] as string);
    if (headers['x-aspnet-version']) technologies.push('ASP.NET');

    return technologies;
  }

  /**
   * Calculate overall attack surface severity
   */
  private calculateAttackSurface(report: ReconReport): {
    severity: 'low' | 'medium' | 'high' | 'critical';
    findings: string[];
  } {
    const findings: string[] = [];
    let riskScore = 0;

    // Exposed files
    if (report.exposedFiles && report.exposedFiles.length > 0) {
      findings.push(`${report.exposedFiles.length} exposed files discovered`);
      riskScore += report.exposedFiles.length * 10;
    }

    // Cloud assets
    if (report.cloudAssets && report.cloudAssets.length > 0) {
      findings.push(`${report.cloudAssets.length} cloud assets exposed`);
      riskScore += report.cloudAssets.length * 20;
    }

    // Admin panels
    if (report.adminPanels && report.adminPanels.length > 0) {
      findings.push(`${report.adminPanels.length} admin panels discovered`);
      riskScore += report.adminPanels.length * 15;
    }

    // Git leaks
    if (report.gitLeaks && report.gitLeaks.length > 0) {
      findings.push(`${report.gitLeaks.length} git repositories with potential leaks`);
      riskScore += report.gitLeaks.length * 30;
    }

    // Subdomains
    if (report.subdomains && report.subdomains.length > 20) {
      findings.push(`Large attack surface: ${report.subdomains.length} subdomains`);
      riskScore += 20;
    }

    let severity: 'low' | 'medium' | 'high' | 'critical';
    if (riskScore >= 100) severity = 'critical';
    else if (riskScore >= 50) severity = 'high';
    else if (riskScore >= 20) severity = 'medium';
    else severity = 'low';

    return { severity, findings };
  }

  // ============================================================================
  // LEAD GENERATION METHODS
  // ============================================================================

  /**
   * Start a new lead generation campaign
   */
  async startLeadCampaign(params: {
    name: string;
    targetIndustries: string[];
    targetStates: string[];
    targetCities?: string[];
    keywords: string[];
  }): Promise<LeadGenerationCampaign> {
    const campaign: LeadGenerationCampaign = {
      id: `campaign_${Date.now()}`,
      name: params.name,
      targetIndustries: params.targetIndustries,
      targetStates: params.targetStates,
      targetCities: params.targetCities,
      keywords: params.keywords,
      sources: ['manual', 'website'],
      status: 'active',
      leadsCollected: 0,
      emailsVerified: 0,
      createdAt: new Date()
    };

    this.campaigns.set(campaign.id, campaign);

    await botLearningService.progressBotSkill(BOT_ID, 'campaign_management', 20);

    console.log(`🎯 Campaign "${campaign.name}" started (${campaign.id})`);
    return campaign;
  }

  /**
   * Find and collect leads for a company
   */
  async collectLeads(params: {
    companyName: string;
    website?: string;
    industry?: string;
    location?: string;
    campaignId?: string;
  }): Promise<BusinessLead> {
    console.log(`📊 Collecting leads for ${params.companyName}...`);

    const leadId = `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const lead: BusinessLead = {
      id: leadId,
      companyName: params.companyName,
      industry: params.industry,
      website: params.website,
      country: 'Mexico',
      city: params.location,
      emails: [],
      verificationStatus: 'unverified',
      leadScore: 0,
      source: 'manual',
      scrapedAt: new Date()
    };

    // Enrich with website data if available
    if (params.website) {
      const domain = extractDomain(params.website);
      if (domain) {
        // Fetch website to extract emails
        const extractedData = await this.extractEmailsFromWebsite(params.website);
        lead.emails.push(...extractedData.emails);
        lead.phone = extractedData.phone;
        lead.address = extractedData.address;

        // Generate generic business emails
        const genericEmails = generateGenericEmails(domain);
        for (const email of genericEmails) {
          if (!lead.emails.some(e => e.email === email)) {
            lead.emails.push({
              email,
              type: 'generic',
              verified: false,
              validFormat: true,
              mxRecordExists: false,
              confidence: 40
            });
          }
        }

        // Extract social media links
        lead.socialMedia = await this.extractSocialMedia(params.website);
      }
    }

    // Calculate lead score
    lead.leadScore = calculateLeadScore(lead);

    this.leads.set(leadId, lead);

    // Update campaign stats
    if (params.campaignId) {
      const campaign = this.campaigns.get(params.campaignId);
      if (campaign) {
        campaign.leadsCollected++;
      }
    }

    await botLearningService.learnFromExecution(
      BOT_ID,
      'lead_collection',
      true,
      { company: params.companyName, emailsFound: lead.emails.length }
    );

    await botLearningService.progressBotSkill(BOT_ID, 'lead_generation', 30);

    console.log(`✅ Lead collected: ${lead.emails.length} emails found`);
    return lead;
  }

  /**
   * Extract emails from website content
   */
  private async extractEmailsFromWebsite(website: string): Promise<{
    emails: EmailContact[];
    phone?: string;
    address?: string;
  }> {
    const emails: EmailContact[] = [];
    let phone: string | undefined;
    let address: string | undefined;

    try {
      const url = website.startsWith('http') ? website : `https://${website}`;
      const response = await new Promise<string>((resolve, reject) => {
        const urlObj = new URL(url);
        const client = urlObj.protocol === 'https:' ? https : http;

        client.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; LeadGenBot/1.0; +https://cyberlabpro.com/bot)'
          },
          timeout: 10000
        }, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => resolve(data));
        }).on('error', reject);
      });

      // Extract emails
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const foundEmails = response.match(emailRegex) || [];
      const domain = extractDomain(website);

      for (const email of [...new Set(foundEmails)]) {
        if (validateEmailFormat(email) && domain && email.includes(domain)) {
          const emailType = this.determineEmailType(email);
          emails.push({
            email,
            type: emailType,
            verified: false,
            validFormat: true,
            mxRecordExists: false,
            confidence: 60
          });
        }
      }

      // Extract Mexican phone numbers
      const phoneRegex = /(\+52|52)?\s?(\d{2,3})\s?\d{3,4}\s?\d{4}/g;
      const phones = response.match(phoneRegex);
      if (phones && phones.length > 0) {
        phone = phones[0];
      }

      console.log(`📧 Extracted ${emails.length} emails from ${website}`);

    } catch (error: any) {
      console.log(`⚠️  Could not fetch ${website}: ${error.message}`);
    }

    return { emails, phone, address };
  }

  /**
   * Extract social media links from website
   */
  private async extractSocialMedia(website: string): Promise<{
    linkedin?: string;
    facebook?: string;
    twitter?: string;
  }> {
    try {
      const url = website.startsWith('http') ? website : `https://${website}`;
      const response = await new Promise<string>((resolve, reject) => {
        const urlObj = new URL(url);
        const client = urlObj.protocol === 'https:' ? https : http;

        client.get(url, { timeout: 10000 }, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => resolve(data));
        }).on('error', reject);
      });

      const linkedinMatch = response.match(/linkedin\.com\/company\/([a-zA-Z0-9-]+)/);
      const facebookMatch = response.match(/facebook\.com\/([a-zA-Z0-9.]+)/);
      const twitterMatch = response.match(/twitter\.com\/([a-zA-Z0-9_]+)/);

      return {
        linkedin: linkedinMatch ? `https://linkedin.com/company/${linkedinMatch[1]}` : undefined,
        facebook: facebookMatch ? `https://facebook.com/${facebookMatch[1]}` : undefined,
        twitter: twitterMatch ? `https://twitter.com/${twitterMatch[1]}` : undefined
      };
    } catch {
      return {};
    }
  }

  /**
   * Determine email type based on prefix
   */
  private determineEmailType(email: string): EmailContact['type'] {
    const prefix = email.split('@')[0].toLowerCase();

    if (prefix.includes('info') || prefix.includes('contact') || prefix.includes('contacto')) {
      return 'contact';
    }
    if (prefix.includes('sales') || prefix.includes('ventas')) {
      return 'sales';
    }
    if (prefix.includes('support') || prefix.includes('soporte') || prefix.includes('ayuda')) {
      return 'support';
    }
    if (GENERIC_EMAILS.some(g => prefix === g)) {
      return 'generic';
    }

    return 'info';
  }

  /**
   * Verify all emails for a lead
   */
  async verifyLeadEmails(leadId: string): Promise<BusinessLead | null> {
    const lead = this.leads.get(leadId);
    if (!lead) return null;

    console.log(`🔍 Verifying ${lead.emails.length} emails for ${lead.companyName}...`);

    let verifiedCount = 0;

    for (const emailContact of lead.emails) {
      try {
        const verification = await verifyEmail(emailContact.email);
        emailContact.verified = verification.valid;
        emailContact.mxRecordExists = verification.mxRecordExists;
        emailContact.smtpValid = verification.smtpValid;
        emailContact.confidence = verification.confidence;

        if (verification.valid) verifiedCount++;

        // Rate limit to be respectful
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error: any) {
        console.log(`⚠️  Error verifying ${emailContact.email}: ${error.message}`);
      }
    }

    // Update verification status
    lead.verificationStatus = verifiedCount > 0 ? 'verified' : 'invalid';

    // Recalculate lead score
    lead.leadScore = calculateLeadScore(lead);

    await botLearningService.progressBotSkill(BOT_ID, 'email_verification', 40);

    console.log(`✅ Verified ${verifiedCount}/${lead.emails.length} emails`);

    return lead;
  }

  /**
   * Generate email addresses based on employee names
   */
  async generateEmployeeEmails(params: {
    leadId: string;
    employees: Array<{ firstName: string; lastName: string; title?: string }>;
  }): Promise<BusinessLead | null> {
    const lead = this.leads.get(params.leadId);
    if (!lead || !lead.website) return null;

    const domain = extractDomain(lead.website);
    if (!domain) return null;

    console.log(`📧 Generating employee emails for ${lead.companyName}...`);

    for (const employee of params.employees) {
      const patterns = generateEmailPatterns(employee.firstName, employee.lastName, domain);

      for (const email of patterns) {
        if (!lead.emails.some(e => e.email === email)) {
          lead.emails.push({
            email,
            type: 'personal',
            verified: false,
            validFormat: true,
            mxRecordExists: false,
            confidence: 50,
            firstName: employee.firstName,
            lastName: employee.lastName,
            title: employee.title
          });
        }
      }
    }

    lead.leadScore = calculateLeadScore(lead);

    await botLearningService.progressBotSkill(BOT_ID, 'email_pattern_generation', 25);

    console.log(`✅ Generated ${params.employees.length * 8} email patterns`);

    return lead;
  }

  /**
   * Get all leads with optional filters
   */
  getLeads(filters?: {
    minScore?: number;
    verified?: boolean;
    industry?: string;
    campaignId?: string;
  }): BusinessLead[] {
    let leads = Array.from(this.leads.values());

    if (filters?.minScore) {
      leads = leads.filter(l => l.leadScore >= filters.minScore!);
    }

    if (filters?.verified !== undefined) {
      leads = leads.filter(l =>
        filters.verified ? l.verificationStatus === 'verified' : l.verificationStatus !== 'verified'
      );
    }

    if (filters?.industry) {
      leads = leads.filter(l => l.industry === filters.industry);
    }

    return leads;
  }

  /**
   * Get campaign details
   */
  getCampaign(campaignId: string): LeadGenerationCampaign | null {
    return this.campaigns.get(campaignId) || null;
  }

  /**
   * Get all campaigns
   */
  getCampaigns(): LeadGenerationCampaign[] {
    return Array.from(this.campaigns.values());
  }

  /**
   * Export leads to CSV or JSON
   */
  exportLeads(format: 'csv' | 'json', leadIds?: string[]): string {
    const leadsToExport = leadIds
      ? leadIds.map(id => this.leads.get(id)).filter(Boolean) as BusinessLead[]
      : Array.from(this.leads.values());

    if (format === 'csv') {
      return exportToCSV(leadsToExport);
    } else {
      return JSON.stringify(leadsToExport, null, 2);
    }
  }

  /**
   * Qualify lead for outreach readiness
   */
  qualifyLead(leadId: string): {
    qualified: boolean;
    score: number;
    reasons: string[];
    recommendations: string[];
  } | null {
    const lead = this.leads.get(leadId);
    if (!lead) return null;

    const reasons: string[] = [];
    const recommendations: string[] = [];

    const verifiedEmails = lead.emails.filter(e => e.verified);

    if (verifiedEmails.length > 0) {
      reasons.push(`${verifiedEmails.length} verified email(s)`);
    } else {
      recommendations.push('Verify email addresses before outreach');
    }

    if (lead.website) {
      reasons.push('Active website available');
    } else {
      recommendations.push('Find company website for better context');
    }

    if (lead.phone) {
      reasons.push('Phone number available for follow-up');
    }

    if (lead.socialMedia && Object.keys(lead.socialMedia).length > 0) {
      reasons.push('Social media presence confirmed');
    }

    const qualified = lead.leadScore >= 50;

    if (!qualified) {
      recommendations.push('Enrich data to improve lead quality (target: 50+ score)');
    }

    return {
      qualified,
      score: lead.leadScore,
      reasons,
      recommendations
    };
  }
}

export const reconService = new ReconService();
